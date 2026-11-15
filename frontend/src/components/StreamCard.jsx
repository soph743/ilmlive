import { Link } from '../router.jsx'
import { Icon } from './Icons.jsx'

/**
 * A video card. The thumbnail is intentionally a blank block for now: put an
 * <img> inside `.card__thumb` when you have thumbnails.
 */
export function StreamCard({ stream }) {
  const isLive = stream.bucket === 'live'
  const showViewers = isLive || stream.bucket === 'past'

  return (
    <article className="card">
      <Link to={`/live/${stream.slug}`} className="card__thumb" aria-label={`Open ${stream.title}`}>
        <span className="card__dots" />
        <span className="card__bar" />
        <span className="card__badges">
          <span className={`badge ${isLive ? 'badge--live' : ''}`}>
            {isLive ? '● Live now' : stream.whenLabel}
          </span>
          {showViewers && (
            <span className="badge badge--dark">
              <Icon name="users" className="icon icon--xs" /> {stream.viewerCount}
            </span>
          )}
        </span>
        <span className="card__play">
          <Icon name="play" filled className="icon icon--md" />
        </span>
        <span className="card__duration">
          <Icon name="clock" className="icon icon--xs" /> {stream.durationMinutes} min
        </span>
      </Link>

      <div className="card__body">
        <p className="eyebrow">{stream.categoryLabel}</p>
        <Link to={`/live/${stream.slug}`} className="card__title">
          {stream.title}
        </Link>
        <p className="card__summary">{stream.summary}</p>
        <div className="tags">
          {stream.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag">
              #{tag}
            </span>
          ))}
        </div>
        <div className="card__foot">
          <strong>{stream.hostName}</strong>
          {stream.reason && <span className="card__reason">{stream.reason}</span>}
        </div>
      </div>
    </article>
  )
}