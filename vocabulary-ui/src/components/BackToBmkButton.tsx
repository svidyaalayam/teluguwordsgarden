import { goToBalamukundam } from '../utils/bmkNav'
import { useAuth } from '../auth/AuthContext'

/** Shown for BMK SSO users — returns to their school dashboard. */
export default function BackToBmkButton({ className = 'btn-back-bmk' }: { className?: string }) {
  const { user } = useAuth()
  if (!user || user.auth_source !== 'bmk') return null

  return (
    <button
      type="button"
      className={className}
      onClick={() => goToBalamukundam(user.bmk_school_slug)}
      title="Return to Balamukundam School Portal"
    >
      ⬅ Back to Balamukundam
    </button>
  )
}
