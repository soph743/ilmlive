import { useMemo } from 'react'
import { Icon } from '../components/Icons.jsx'
import { StreamCard } from '../components/StreamCard.jsx'
import { useUser } from '../hooks/useAuth.jsx'
import { useNow } from '../hooks/useNow.js'
import { buildHomeFeed } from '../lib/feed.js'
import { Link } from '../router.jsx'
import { listStreams } from '../services/streams.js'

export function HomePage() {
  const user = useUser()
  const now = useNow(30_000)
  const { live, followed, recommended } = useMemo(
    () => buildHomeFeed(listStreams(), user, now),
    [user, now],
  )
  const firstName = user.name.split(' ')[0]
  const featured = live[0]

  return (
    <div className="page">
      <header className="page__head page__head--row">
        <div>
          <p className="eyebrow">Your learning space</p>
          <h1 className="page__title">As-salamu alaykum, {firstName}</h1>
          <p className="page__sub">What would you like to learn today?</p>
        </div>
        <Link to="/discover" className="btn btn--outline">
          <Icon name="search" className="icon icon--sm" /> Find a live circle
        </Link>
      </header>

      {featured && (
        <section className="hero">
          <div className="hero__dots" />
          <div className="hero__ring" />
          <div className="hero__inner">
            <span className="pill pill--live">
              <span className="pill__dot" /> Happening now
            </span>
            <h2 className="hero__title">{featured.title}</h2>
            <p className="hero__text">{featured.summary}</p>
            <div className="hero__actions">
              <Link to={`/live/${featured.slug}`} className="btn btn--gold btn--lg">
                <Icon name="play" filled className="icon icon--sm" /> Join the live room
              </Link>
              <span className="hero__meta">
                <Icon name="users" className="icon icon--sm" /> {featured.viewerCount} learners present
              </span>
            </div>
          </div>
        </section>
      )}

      <SectionHeading
        title="From teachers you follow"
        subtitle="New, live, and recent videos from the people you follow"
        to="/discover"
        linkLabel="Find teachers"
      />
      {followed.length ? (
        <div className="grid">
          {followed.map((stream) => (
            <StreamCard key={stream.id} stream={stream} />
          ))}
        </div>
      ) : (
        <p className="empty">
          You aren’t following anyone yet. Open any circle and tap <strong>Follow</strong> on the
          teacher to see their videos here.
        </p>
      )}

      <SectionHeading
        title="Recommended for you"
        subtitle="Picked from your interests and learning goals"
        to="/account"
        linkLabel="Edit interests"
      />
      {recommended.length ? (
        <div className="grid">
          {recommended.map((stream) => (
            <StreamCard key={stream.id} stream={stream} />
          ))}
        </div>
      ) : (
        <p className="empty">New recommendations will appear here as more circles are added.</p>
      )}
    </div>
  )
}

function SectionHeading({ title, subtitle, to, linkLabel }) {
  return (
    <div className="section-head">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <Link to={to} className="link">
        {linkLabel}
      </Link>
    </div>
  )
}