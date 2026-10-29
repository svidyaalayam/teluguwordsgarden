/**
 * AnswerOption.tsx
 * A single selectable answer option for multiple-choice questions.
 *
 * Uses native radio semantics for accessibility.
 * Keyboard users can Tab to the group and use arrow keys to change selection.
 *
 * States:
 *  - Normal (unselected)
 *  - Selected (student has chosen this option)
 *  - Disabled (exam submitted / navigation locked)
 *
 * IMPORTANT: This component does NOT know which option is correct.
 *  The `correct` prop is only set when the backend authorises its release
 *  (e.g. after exam submission when feedback_policy === 'after_submit').
 */

import type { ExamOption } from '../types/exam'

interface AnswerOptionProps {
  option: ExamOption
  groupName: string
  isSelected: boolean
  disabled?: boolean
  /** Only set when backend has released the answer */
  correct?: boolean | null
  onChange: (optionId: string) => void
}

export default function AnswerOption({
  option,
  groupName,
  isSelected,
  disabled = false,
  correct = null,
  onChange,
}: AnswerOptionProps) {
  // Determine visual state class
  let stateClass = ''
  if (correct === true) stateClass = ' ao-correct'
  else if (correct === false && isSelected) stateClass = ' ao-incorrect'
  else if (isSelected) stateClass = ' ao-selected'

  return (
    <label
      className={`ao-label${stateClass}${disabled ? ' ao-disabled' : ''}`}
      htmlFor={`${groupName}-${option.id}`}
    >
      <input
        id={`${groupName}-${option.id}`}
        type="radio"
        name={groupName}
        value={option.id}
        checked={isSelected}
        disabled={disabled}
        onChange={() => onChange(option.id)}
        className="ao-radio"
        aria-label={option.text}
      />
      <span className="ao-indicator" aria-hidden="true" />
      <span className="ao-text script-telugu">{option.text}</span>
      {correct === true && (
        <span className="ao-badge ao-badge-correct" aria-label="Correct answer">
          ✓
        </span>
      )}
      {correct === false && isSelected && (
        <span className="ao-badge ao-badge-incorrect" aria-label="Incorrect">
          ✗
        </span>
      )}
    </label>
  )
}
