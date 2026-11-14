import { useState } from 'react'
import { useUser } from '../hooks/useAuth.jsx'
import { toggleFollow } from '../services/auth.js'

/** Follow / Following toggle for a teacher. tone: "light" (cream bg) or "dark" (green bg). */
export function FollowButton({ teacherId, tone = 'light' }) {
  const user = useUser()
  const [error, setError] = useState('')
  const following = Boolean(user?.following.includes(teacherId))

  const toggle = () => {
    try {
      toggleFollow(user.id, teacherId)
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <span className="follow">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={following}
        className={`follow__btn follow__btn--${tone} ${following ? 'is-following' : ''}`}
      >
        {following ? 'Following' : 'Follow'}
      </button>
      {error && (
        <span role="alert" className="follow__error">
          {error}
        </span>
      )}
    </span>
  )
}