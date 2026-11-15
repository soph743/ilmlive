import { useState } from 'react'
import { AuthArt } from '../components/AuthArt.jsx'
import { Brand } from '../components/Brand.jsx'
import { Icon } from '../components/Icons.jsx'
import { signIn, signUp } from '../services/auth.js'
import { navigate } from '../router.jsx'

const COPY = {
  signin: {
    title: 'Welcome back',
    subtitle: 'Continue your path of learning.',
    button: 'Enter your learning space',
  },
  signup: {
    title: 'Begin your journey',
    subtitle: 'Create your invitation-only learning space.',
    button: 'Create my account',
  },
}

export function AuthPage() {
  const [mode, setMode] = useState('signin')
  const [form, setForm] = useState({ name: '', email: '', password: '', referralCode: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const copy = COPY[mode]
  const setField = (field) => (event) => setForm({ ...form, [field]: event.target.value })

  const switchMode = (next) => {
    setMode(next)
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (mode === 'signin') await signIn(form)
      else await signUp(form)
      navigate('/home')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <section className="auth__hero">
        <AuthArt />
        <div className="auth__hero-inner">
          <Brand to="/" light />
          <div className="auth__hero-copy">
            <p className="auth__kicker">
              <span className="auth__dot" /> Knowledge, live &amp; growing
            </p>
            <h1 className="auth__headline">Learn in the shade of shared wisdom.</h1>
            <p className="auth__lede">
              Join live circles, ask meaningful questions, and grow in knowledge—wherever you are.
            </p>
            <div className="auth__note">
              <span className="auth__note-icon">
                <Icon name="users" />
              </span>
              <span>
                <strong>A new community is taking root</strong>
                <small>Be among the first to learn and teach.</small>
              </span>
            </div>
          </div>
          <div className="auth__dua">
            <p lang="ar" dir="rtl">
              رَبِّ زِدْنِي عِلْمًا
            </p>
            <small>“My Lord, increase me in knowledge.” · 20:114</small>
          </div>
        </div>
      </section>

      <section className="auth__panel">
        <div className="auth__form-wrap">
          <p className="auth__bismillah" lang="ar" dir="rtl">
            بِسْمِ ٱللَّهِ
          </p>
          <h2 className="auth__title">{copy.title}</h2>
          <p className="auth__subtitle">{copy.subtitle}</p>

          <div className="segmented" role="tablist" aria-label="Sign in or create account">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signin'}
              className={mode === 'signin' ? 'is-active' : ''}
              onClick={() => switchMode('signin')}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signup'}
              className={mode === 'signup' ? 'is-active' : ''}
              onClick={() => switchMode('signup')}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {mode === 'signup' && (
              <label className="field">
                <span>Full name</span>
                <input
                  value={form.name}
                  onChange={setField('name')}
                  placeholder="Your name"
                  autoComplete="name"
                  required
                />
              </label>
            )}

            <label className="field">
              <span>Email address</span>
              <input
                type="email"
                value={form.email}
                onChange={setField('email')}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <div className="field">
              <div className="field__row">
                <label htmlFor="auth-password">Password</label>
                {mode === 'signup' && <em id="auth-password-hint">8 characters minimum</em>}
              </div>
              <span className="field__password">
                <Icon name="lock" className="icon field__lock" />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={setField('password')}
                  placeholder="Enter your password"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  aria-describedby={mode === 'signup' ? 'auth-password-hint' : undefined}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </span>
            </div>

            {mode === 'signup' && (
              <label className="field">
                <span>Referral code</span>
                <input
                  value={form.referralCode}
                  onChange={setField('referralCode')}
                  placeholder="Enter your invitation code"
                  autoComplete="off"
                  required
                />
                <small className="field__hint">
                  IlmLive is currently invitation-only. A referral code is required.
                </small>
              </label>
            )}

            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}

            <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={busy}>
              {busy ? 'One moment…' : copy.button}
              {!busy && <Icon name="play" filled className="icon icon--xs" />}
            </button>
          </form>

          <p className="auth__switch">
            {mode === 'signin' ? 'New to IlmLive? ' : 'Already have an account? '}
            <button type="button" onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}>
              {mode === 'signin' ? 'Create an account' : 'Sign in'}
            </button>
          </p>
        </div>
      </section>
    </div>
  )
}