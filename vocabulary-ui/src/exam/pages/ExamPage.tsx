/**
 * ExamPage.tsx
 * The main examination page. Route: /exam/:examSlug
 *
 * State managed here:
 *  - Exam attempt metadata
 *  - Prepared questions list (from server)
 *  - Current question index
 *  - Selected answers map (questionId → selectedOptionId)
 *  - Submission status
 *  - Final result (after submission)
 *  - Loading and error states
 *
 * Individual question components are stateless display components.
 * All business logic (correct answer, scoring) lives on the backend.
 *
 * Development mode: When USE_MOCK is true, uses mock data instead of
 * real API calls. Set to false before deploying to production.
 */

import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/Header'
import type { ExamAttempt, ExamResult, PreparedQuestion } from '../types/exam'
import ExamNavigation from '../components/ExamNavigation'
import ExamProgress from '../components/ExamProgress'
import ExamResultComponent from '../components/ExamResult'
import ExamWorksheet from '../components/ExamWorksheet'
import MultipleChoiceQuestion from '../components/MultipleChoiceQuestion'
import {
  startAttempt,
  submitAnswer,
  submitExam,
} from '../services/examApi'
import { MOCK_ATTEMPT } from '../services/examMock'

// ── Development toggle ────────────────────────────────────────
// Set USE_MOCK=true to bypass real API calls during local development.
const USE_MOCK = import.meta.env.VITE_EXAM_USE_MOCK === 'true'

// ── State ─────────────────────────────────────────────────────

type ExamPhase = 'loading' | 'intro' | 'question' | 'submitting' | 'result' | 'error'

interface ExamState {
  phase: ExamPhase
  attempt: ExamAttempt | null
  questions: PreparedQuestion[]
  currentIndex: number
  /** questionId → selectedOptionId */
  answers: Record<string, string>
  result: ExamResult | null
  error: string | null
  submitting: boolean
  isMock: boolean
}

type ExamAction =
  | { type: 'LOAD_START' }
  | { type: 'LOADED'; attempt: ExamAttempt; isMock?: boolean }
  | { type: 'START_EXAM' }
  | { type: 'SELECT_ANSWER'; questionId: string; optionId: string }
  | { type: 'NAVIGATE'; index: number }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_DONE'; result: ExamResult }
  | { type: 'ERROR'; message: string }

function initialState(): ExamState {
  return {
    phase: 'loading',
    attempt: null,
    questions: [],
    currentIndex: 0,
    answers: {},
    result: null,
    error: null,
    submitting: false,
    isMock: false,
  }
}

function reducer(state: ExamState, action: ExamAction): ExamState {
  switch (action.type) {
    case 'LOAD_START':
      return {
        ...state,
        phase: 'loading',
        error: null,
      }
    case 'LOADED': {
      if (!action.attempt) return state
      const questions = action.attempt.questions || []
      // Restore previously saved answers from backend
      const answers: Record<string, string> = {}
      for (const q of questions) {
        if (q.selected_option_id) answers[q.question_id] = q.selected_option_id
      }
      return {
        ...state,
        phase: 'intro',
        attempt: action.attempt,
        questions,
        answers,
        error: null,
        isMock: action.isMock ?? false,
      }
    }
    case 'START_EXAM':
      return { ...state, phase: 'question', currentIndex: 0 }
    case 'SELECT_ANSWER':
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.optionId },
      }
    case 'NAVIGATE':
      return { ...state, currentIndex: action.index }
    case 'SUBMIT_START':
      return { ...state, phase: 'submitting', submitting: true }
    case 'SUBMIT_DONE':
      return { ...state, phase: 'result', result: action.result, submitting: false }
    case 'ERROR':
      return { ...state, phase: 'error', error: action.message, submitting: false }
    default:
      return state
  }
}

// ── Component ─────────────────────────────────────────────────

export default function ExamPage() {
  const { examSlug } = useParams<{ examSlug: string }>()
  const navigate = useNavigate()
  const [state, dispatch] = useReducer(reducer, undefined, initialState)
  const [showWorksheet, setShowWorksheet] = useState(false)
  const pendingAnswerRef = useRef<AbortController | null>(null)

  // ── Load attempt on mount ────────────────────────────────────

  const loadExam = useCallback(async (forceMock = false) => {
    if (!examSlug) return
    dispatch({ type: 'LOAD_START' })
    try {
      let attempt: ExamAttempt
      if (USE_MOCK || forceMock) {
        await new Promise((r) => setTimeout(r, 300))
        attempt = MOCK_ATTEMPT
        dispatch({ type: 'LOADED', attempt, isMock: true })
      } else {
        attempt = await startAttempt(examSlug!)
        dispatch({ type: 'LOADED', attempt, isMock: false })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load exam.'
      dispatch({ type: 'ERROR', message: msg })
    }
  }, [examSlug])

  useEffect(() => {
    loadExam()
  }, [loadExam])

  // ── Answer selection ─────────────────────────────────────────

  const handleAnswerChange = useCallback(
    (questionId: string, optionId: string) => {
      dispatch({ type: 'SELECT_ANSWER', questionId, optionId })

      // Fire-and-forget save to backend — errors are non-blocking
      if (!USE_MOCK && !state.isMock && state.attempt) {
        if (pendingAnswerRef.current) pendingAnswerRef.current.abort()
        const ctrl = new AbortController()
        pendingAnswerRef.current = ctrl

        submitAnswer(state.attempt.id, {
          question_id: questionId,
          selected_option_id: optionId,
        }).catch((err) => {
          if (!ctrl.signal.aborted) {
            console.warn('Answer save failed (answer kept locally):', err)
          }
        })
      }
    },
    [state.attempt, state.isMock],
  )

  // ── Navigation ───────────────────────────────────────────────

  const handlePrevious = useCallback(() => {
    dispatch({ type: 'NAVIGATE', index: Math.max(0, state.currentIndex - 1) })
  }, [state.currentIndex])

  const handleNext = useCallback(() => {
    dispatch({
      type: 'NAVIGATE',
      index: Math.min(state.questions.length - 1, state.currentIndex + 1),
    })
  }, [state.currentIndex, state.questions.length])

  // ── Submission ───────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    if (!state.attempt) return
    dispatch({ type: 'SUBMIT_START' })

    try {
      let result: ExamResult
      if (USE_MOCK || state.isMock) {
        await new Promise((r) => setTimeout(r, 600))
        // Synthetic mock result — backend would return real data
        result = {
          id: state.attempt.id,
          status: 'submitted',
          started_at: state.attempt.started_at,
          submitted_at: new Date().toISOString(),
          paper_title_en: state.attempt.paper_title_en,
          paper_title_te: state.attempt.paper_title_te,
          total_marks: state.questions.length,
          marks_awarded: 0,
          feedback_policy: 'after_submit',
          questions: state.questions.map((q) => ({
            question_id: q.question_id,
            question_text_en: q.question_text_en,
            question_text_te: q.question_text_te,
            selected_option_id: state.answers[q.question_id] ?? '',
            is_correct: false,
            marks_awarded: 0,
            prepared_options: q.prepared_options,
          })),
        }
      } else {
        result = await submitExam(state.attempt.id)
      }
      dispatch({ type: 'SUBMIT_DONE', result })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed. Please try again.'
      dispatch({ type: 'ERROR', message: msg })
    }
  }, [state.attempt, state.questions, state.answers, state.isMock])

  // ── Render helpers ───────────────────────────────────────────

  const currentQuestion: PreparedQuestion | null =
    state.questions[state.currentIndex] ?? null

  const answeredCount = Object.keys(state.answers).filter(
    (qid) => !!state.answers[qid],
  ).length

  // ── Render ───────────────────────────────────────────────────

  if (showWorksheet && state.attempt) {
    return (
      <div className="page-shell exam-page">
        <Header />
        <main className="exam-main">
          <ExamWorksheet
            attempt={state.attempt}
            onClose={() => setShowWorksheet(false)}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="page-shell exam-page">
      <Header />

      <main className="exam-main">
        {/* Loading */}
        {state.phase === 'loading' && (
          <div className="exam-loading" role="status" aria-live="polite">
            <span className="exam-spinner" aria-hidden="true" />
            <p>Loading exam…</p>
          </div>
        )}

        {/* Error */}
        {state.phase === 'error' && (
          <div className="exam-error" role="alert">
            <h2>Something went wrong</h2>
            <p>{state.error}</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '16px' }}>
              <button
                type="button"
                className="home-btn"
                onClick={() => loadExam(false)}
              >
                Retry Server
              </button>
              <button
                type="button"
                className="home-btn secondary"
                onClick={() => loadExam(true)}
              >
                Practice Demo Mode
              </button>
              <button
                type="button"
                className="home-btn secondary"
                onClick={() => navigate('/')}
              >
                Go home
              </button>
            </div>
          </div>
        )}

        {/* Introduction screen */}
        {state.phase === 'intro' && state.attempt && (
          <div className="exam-intro">
            <div className="exam-intro-card">
              <span className="exam-intro-icon" aria-hidden="true">📝</span>
              <h1 className="exam-intro-title">{state.attempt.paper_title_en}</h1>
              {state.attempt.paper_title_te && (
                <p className="exam-intro-title-te script-telugu">
                  {state.attempt.paper_title_te}
                </p>
              )}

              <div className="exam-intro-meta">
                <span>
                  <strong>{state.questions.length}</strong> question
                  {state.questions.length !== 1 ? 's' : ''}
                </span>
                {state.attempt.paper_time_limit_minutes && (
                  <span>⏱ {state.attempt.paper_time_limit_minutes} minutes</span>
                )}
              </div>

              {state.attempt.paper_instructions_en && (
                <div className="exam-intro-instructions">
                  <h2 className="exam-intro-section-label">Instructions</h2>
                  <p>{state.attempt.paper_instructions_en}</p>
                  {state.attempt.paper_instructions_te && (
                    <p className="script-telugu">{state.attempt.paper_instructions_te}</p>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px' }}>
                <button
                  type="button"
                  className="home-btn exam-start-btn"
                  onClick={() => dispatch({ type: 'START_EXAM' })}
                >
                  Begin Exam →
                </button>
                <button
                  type="button"
                  className="home-btn secondary"
                  onClick={() => setShowWorksheet(true)}
                >
                  🖨️ Printable Worksheet
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active exam */}
        {(state.phase === 'question' || state.phase === 'submitting') &&
          currentQuestion && (
            <div className="exam-body">
              {/* Header band */}
              <div className="exam-top-band">
                <h1 className="exam-title">{state.attempt?.paper_title_en}</h1>
                <ExamProgress
                  current={state.currentIndex + 1}
                  total={state.questions.length}
                  answeredCount={answeredCount}
                />
              </div>

              {/* Question */}
              <div className="exam-question-wrap">
                <MultipleChoiceQuestion
                  questionId={currentQuestion.question_id}
                  questionNumber={currentQuestion.question_number}
                  totalQuestions={currentQuestion.total_questions}
                  questionTextEn={currentQuestion.question_text_en}
                  questionTextTe={currentQuestion.question_text_te}
                  imageUrl={currentQuestion.image_url || null}
                  audioUrl={currentQuestion.audio_url || null}
                  wordToPronounce={currentQuestion.word_to_pronounce || null}
                  options={currentQuestion.prepared_options}
                  selectedOptionId={state.answers[currentQuestion.question_id] ?? null}
                  onAnswerChange={handleAnswerChange}
                  disabled={state.phase === 'submitting'}
                />
              </div>

              {/* Navigation */}
              <ExamNavigation
                currentIndex={state.currentIndex}
                total={state.questions.length}
                answeredCount={answeredCount}
                submitting={state.phase === 'submitting'}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onSubmit={handleSubmit}
              />

              {/* Question number dots */}
              <nav
                className="exam-dot-nav"
                aria-label="Jump to question"
              >
                {state.questions.map((q, idx) => {
                  const answered = !!state.answers[q.question_id]
                  const isCurrent = idx === state.currentIndex
                  return (
                    <button
                      key={q.question_id}
                      type="button"
                      className={`exam-dot${isCurrent ? ' current' : ''}${answered ? ' answered' : ''}`}
                      onClick={() => dispatch({ type: 'NAVIGATE', index: idx })}
                      aria-label={`Question ${idx + 1}${answered ? ' (answered)' : ''}`}
                      aria-current={isCurrent ? 'true' : undefined}
                      disabled={state.phase === 'submitting'}
                    >
                      {idx + 1}
                    </button>
                  )
                })}
              </nav>
            </div>
          )}

        {/* Result */}
        {state.phase === 'result' && state.result && (
          <div className="exam-result-wrap">
            <ExamResultComponent
              result={state.result}
              onReturnToList={() => navigate('/')}
            />
          </div>
        )}
      </main>
    </div>
  )
}
