/**
 * examApi.ts
 * Exam module API service — all backend calls for the examination feature.
 *
 * Responsibilities (frontend only):
 *  - Fetch exam papers, start/resume attempts, navigate questions,
 *    save answers, submit exam, retrieve results.
 *
 * Security: This module never sends the correct answer to the browser
 *  before the backend authorises it. The backend is the sole authority
 *  for scoring and answer validation.
 *
 * In development, if real endpoints are unavailable, import MOCK_ATTEMPT
 * from '../services/examMock' and return it instead of calling the API.
 */

import { api } from '../../api/client'
import type {
  AnswerResponse,
  AnswerSubmitPayload,
  ExamAttempt,
  ExamPaper,
  ExamResult,
} from '../types/exam'

const BASE = '/api/exam'

// ── Exam Papers ──────────────────────────────────────────────

/**
 * Retrieve the list of active exam papers.
 */
export async function listExamPapers(): Promise<ExamPaper[]> {
  const { data } = await api.get<ExamPaper[]>(`${BASE}/papers/`)
  return data
}

/**
 * Retrieve a single exam paper's metadata by slug.
 */
export async function getExamPaper(slug: string): Promise<ExamPaper> {
  const { data } = await api.get<ExamPaper>(`${BASE}/papers/${slug}/`)
  return data
}

// ── Attempts ─────────────────────────────────────────────────

/**
 * Start a new attempt for the given paper slug.
 * If an in-progress attempt already exists the backend returns it.
 *
 * @returns ExamAttempt with questions prepared by the backend (no answer key).
 */
export async function startAttempt(paperSlug: string): Promise<ExamAttempt> {
  const { data } = await api.post<ExamAttempt>(`${BASE}/papers/${paperSlug}/start/`)
  return data
}

/**
 * Resume an existing attempt by attempt id.
 */
export async function getAttempt(attemptId: number): Promise<ExamAttempt> {
  const { data } = await api.get<ExamAttempt>(`${BASE}/attempts/${attemptId}/`)
  return data
}

// ── Answer Submission ─────────────────────────────────────────

/**
 * Save a single answer during the exam.
 * The backend validates and records the answer.
 * Correctness is only revealed if the exam's feedback_policy allows it.
 */
export async function submitAnswer(
  attemptId: number,
  payload: AnswerSubmitPayload,
): Promise<AnswerResponse> {
  const { data } = await api.post<AnswerResponse>(
    `${BASE}/attempts/${attemptId}/answer/`,
    payload,
  )
  return data
}

// ── Exam Submission ───────────────────────────────────────────

/**
 * Submit the complete examination.
 * Returns the final result (score and feedback where permitted).
 */
export async function submitExam(attemptId: number): Promise<ExamResult> {
  const { data } = await api.post<ExamResult>(
    `${BASE}/attempts/${attemptId}/submit/`,
  )
  return data
}

/**
 * Retrieve the final result for a submitted attempt.
 */
export async function getExamResult(attemptId: number): Promise<ExamResult> {
  const { data } = await api.get<ExamResult>(
    `${BASE}/attempts/${attemptId}/result/`,
  )
  return data
}
