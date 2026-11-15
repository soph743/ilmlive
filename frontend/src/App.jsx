import { useEffect } from 'react'
import { AppLayout } from './components/AppLayout.jsx'
import { AuthProvider, useUser } from './hooks/useAuth.jsx'
import { AccountPage } from './pages/AccountPage.jsx'
import { AuthPage } from './pages/AuthPage.jsx'
import { DiscoverPage } from './pages/DiscoverPage.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { LivePage } from './pages/LivePage.jsx'
import { Link, matchRoute, useHashPath } from './router.jsx'

export default function App() {
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  )
}

function Routes() {
  const user = useUser()
  const path = useHashPath()

  // Start each page at the top.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [path])

  // Signed out: everything shows the sign-in / sign-up screen.
  if (!user) return <AuthPage />

  // Signed in: pick the page for the current URL.
  let page
  const live = matchRoute('/live/:slug', path)
  if (matchRoute('/', path) || matchRoute('/home', path)) page = <HomePage />
  else if (matchRoute('/discover', path)) page = <DiscoverPage />
  else if (matchRoute('/account', path)) page = <AccountPage />
  else if (live) page = <LivePage key={live.slug} slug={live.slug} />
  else
    page = (
      <div className="page">
        <p className="empty">
          That page doesn’t exist. <Link to="/home" className="link">Go home</Link>
        </p>
      </div>
    )

  return <AppLayout path={path}>{page}</AppLayout>
}
