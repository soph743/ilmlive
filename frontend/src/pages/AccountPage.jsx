import { useEffect, useId, useState } from 'react'
import { FollowButton } from '../components/FollowButton.jsx'
import { Icon } from '../components/Icons.jsx'
import { CATEGORIES } from '../config.js'
import { useUser } from '../hooks/useAuth.jsx'
import { initialsOf } from '../lib/format.js'
import { updateCredentials, updateProfile } from '../services/auth.js'
import { TEACHERS } from '../services/streams.js'

export function AccountPage() {
  const user = useUser()
  const teachers = TEACHERS.filter((teacher) => user.following.includes(teacher.id))

  return (
    <div className="page page--narrow">
      <header className="account-head">
        <span className="avatar avatar--xl">{initialsOf(user.name)}</span>
        <div>
          <p className="eyebrow">Your IlmLive account</p>
          <h1 className="page__title">Salaam, {user.name}</h1>
          <p className="page__sub">Update your details, sign-in, interests, and who you follow.</p>
        </div>
      </header>

      <ProfileForm user={user} />

      <div className="two-col">
        <SecurityForm user={user} />
        <Card icon="users" tint="gold" title="Teachers you follow" subtitle="Their circles appear on your home page">
          {teachers.length ? (
            <ul className="follow-list">
              {teachers.map((teacher) => (
                <li key={teacher.id}>
                  <span className="avatar">{initialsOf(teacher.name)}</span>
                  <strong>{teacher.name}</strong>
                  <FollowButton teacherId={teacher.id} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty empty--small">
              You aren’t following any teachers yet. Open a circle and tap <strong>Follow</strong>.
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}

/* ---------------- Profile, interests, preferences ---------------- */

function ProfileForm({ user }) {
  const [form, setForm] = useState({
    name: user.name,
    location: user.location,
    bio: user.bio,
    learningGoals: user.learningGoals,
    interests: user.interests,
    preferences: user.preferences,
  })
  const [status, setStatus] = useState(null)
  const [busy, setBusy] = useState(false)

  const set = (field) => (event) => setForm({ ...form, [field]: event.target.value })
  const toggleInterest = (value) =>
    setForm({
      ...form,
      interests: form.interests.includes(value)
        ? form.interests.filter((item) => item !== value)
        : [...form.interests, value],
    })
  const setPreference = (key) => (event) =>
    setForm({ ...form, preferences: { ...form.preferences, [key]: event.target.checked } })

  const handleSubmit = async (event) => {
    event.preventDefault()
    setBusy(true)
    try {
      await updateProfile(user.id, form)
      setStatus({ ok: true, message: 'Your changes have been saved.' })
    } catch (err) {
      setStatus({ ok: false, message: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="account-grid">
      <div className="stack">
        <Card icon="user" tint="sage" title="Personal information" subtitle="How you appear across IlmLive">
          <div className="form-grid">
            <label className="field">
              <span>Full name</span>
              <input value={form.name} onChange={set('name')} required />
            </label>
            <label className="field">
              <span>Location</span>
              <input value={form.location} onChange={set('location')} placeholder="City, country" />
            </label>
            <label className="field form-grid__wide">
              <span>Short bio</span>
              <textarea
                rows={3}
                maxLength={280}
                value={form.bio}
                onChange={set('bio')}
                placeholder="Tell the community a little about yourself…"
              />
            </label>
            <label className="field form-grid__wide">
              <span>Learning goals</span>
              <textarea
                rows={3}
                maxLength={500}
                value={form.learningGoals}
                onChange={set('learningGoals')}
                placeholder="What knowledge are you hoping to grow in?"
              />
            </label>
          </div>
        </Card>

        <Card icon="bookmark" tint="maroon" title="Topics you’re interested in" subtitle="We use these to choose your recommendations">
          <div className="chips chips--wrap" role="group" aria-label="Interests">
            {CATEGORIES.map((category) => {
              const on = form.interests.includes(category.value)
              return (
                <button
                  key={category.value}
                  type="button"
                  className={`chip chip--lg ${on ? 'is-active' : ''}`}
                  aria-pressed={on}
                  onClick={() => toggleInterest(category.value)}
                >
                  {category.label}
                </button>
              )
            })}
          </div>
        </Card>
      </div>

      <section className="card-panel card-panel--sticky">
        <CardHeader icon="settings" tint="gold" title="Preferences" subtitle="Choose what reaches you" />
        <div className="stack stack--tight">
          <Toggle
            label="Class reminders"
            description="A reminder before followed circles begin"
            checked={form.preferences.classReminders}
            onChange={setPreference('classReminders')}
          />
          <Toggle
            label="Weekly learning digest"
            description="A thoughtful summary of new circles"
            checked={form.preferences.emailDigest}
            onChange={setPreference('emailDigest')}
          />
          <Toggle
            label="Private question receipts"
            description="Confirm when a teacher receives your question"
            checked={form.preferences.privateQuestionReceipts}
            onChange={setPreference('privateQuestionReceipts')}
          />
        </div>
        <div className="privacy">
          <strong>Privacy</strong>
          Your notes and private teacher questions are visible only to you and the intended recipient.
        </div>
        <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={busy}>
          {busy ? 'Saving…' : 'Save changes'}
        </button>
        <Status status={status} />
      </section>
    </form>
  )
}

/* ---------------- Email + password ---------------- */

function SecurityForm({ user }) {
  const [email, setEmail] = useState(user.email)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState(null)
  const [busy, setBusy] = useState(false)

  // After an email change, show the new address.
  useEffect(() => {
    setEmail(user.email)
  }, [user.email])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setBusy(true)
    try {
      const message = await updateCredentials(user.id, {
        currentPassword,
        newEmail: email,
        newPassword,
        confirmPassword,
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setStatus({ ok: true, message })
    } catch (err) {
      setStatus({ ok: false, message: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card icon="lock" tint="blue" title="Email and password" subtitle="Confirm with your current password to change either">
        <div className="stack">
          <label className="field">
            <span>Email address</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </label>
          <PasswordField
            label="Current password"
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
          />
          <div className="form-grid">
            <PasswordField
              label="New password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="8+ characters"
              autoComplete="new-password"
            />
            <PasswordField
              label="Confirm new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
            />
          </div>
          <p className="field__hint">Leave the new password blank to change only your email.</p>
        </div>
        <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={busy}>
          {busy ? 'Updating…' : 'Update sign-in details'}
        </button>
        <Status status={status} />
      </Card>
    </form>
  )
}

/* ---------------- small building blocks ---------------- */

function CardHeader({ icon, tint, title, subtitle }) {
  return (
    <div className="card-head">
      <span className={`card-head__icon card-head__icon--${tint}`}>
        <Icon name={icon} />
      </span>
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </div>
  )
}

function Card({ icon, tint, title, subtitle, children }) {
  return (
    <section className="card-panel">
      <CardHeader icon={icon} tint={tint} title={title} subtitle={subtitle} />
      {children}
    </section>
  )
}

function Status({ status }) {
  if (!status) return null
  return (
    <p role="status" className={`status ${status.ok ? 'status--ok' : 'status--error'}`}>
      {status.message}
    </p>
  )
}

function PasswordField({ label, value, onChange, ...props }) {
  const id = useId()
  const [show, setShow] = useState(false)
  // The Show/Hide button sits next to the label (not inside it) so screen
  // readers announce the field as just "Current password", not "Current password Show".
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <span className="field__password field__password--plain">
        <input
          {...props}
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button type="button" onClick={() => setShow((v) => !v)} aria-label={`${show ? 'Hide' : 'Show'} ${label.toLowerCase()}`}>
          {show ? 'Hide' : 'Show'}
        </button>
      </span>
    </div>
  )
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={Boolean(checked)} onChange={onChange} />
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
    </label>
  )
}