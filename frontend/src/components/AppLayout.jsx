import { useUser } from '../hooks/useAuth.jsx'
import { initialsOf } from '../lib/format.js'
import { signOut } from '../services/auth.js'
import { Link, navigate } from '../router.jsx'
import { Brand } from './Brand.jsx'
import { Icon } from './Icons.jsx'

const NAV = [
  { to: '/home', label: 'Home', icon: 'home' },
  { to: '/discover', label: 'Discover', icon: 'compass' },
  { to: '/account', label: 'My account', icon: 'user' },
]

export function AppLayout({ path, children }) {
  const user = useUser()
  const isActive = (to) => path === to || (to === '/home' && path === '/')

  const handleSignOut = async () => {
    try {
      await signOut()
    } finally {
      navigate('/')
    }
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <Brand light />
        <nav className="sidebar__nav" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-link ${isActive(item.to) ? 'is-active' : ''}`}
              aria-current={isActive(item.to) ? 'page' : undefined}
            >
              <Icon name={item.icon} /> <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar__user">
          <span className="avatar">{initialsOf(user.name)}</span>
          <span className="sidebar__who">
            <strong>{user.name}</strong>
            <small>{user.email}</small>
          </span>
          <button type="button" className="icon-btn" onClick={handleSignOut} aria-label="Sign out" title="Sign out">
            <Icon name="logout" />
          </button>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  )
}