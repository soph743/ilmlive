import { useMemo, useState } from 'react'
import { Icon } from '../components/Icons.jsx'
import { StreamCard } from '../components/StreamCard.jsx'
import { useNow } from '../hooks/useNow.js'
import { buildDiscoverGroups } from '../lib/feed.js'
import { listStreams } from '../services/streams.js'

const SECTIONS = [
  {
    key: 'live',
    title: 'Live now',
    subtitle: 'Circles happening right now. Join anytime.',
    empty: 'Nothing is live at the moment. Check what starts soon below.',
  },
  {
    key: 'soon',
    title: 'Starting within 30 minutes',
    subtitle: 'Get settled and be there when it begins.',
    empty: 'No circles start in the next 30 minutes.',
  },
  {
    key: 'hour',
    title: 'Starting in 30–60 minutes',
    subtitle: 'Coming up within the hour.',
    empty: 'No circles start in the next hour.',
  },
]

export function DiscoverPage() {
  const now = useNow(15_000)
  const groups = useMemo(() => buildDiscoverGroups(listStreams(), now), [now])
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState('All')

  const tags = useMemo(() => {
    const all = [...groups.live, ...groups.soon, ...groups.hour].flatMap((stream) => stream.tags)
    return ['All', ...new Set(all)].sort((a, b) => (a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b)))
  }, [groups])

  const normalized = query.trim().toLowerCase()
  const matches = (stream) => {
    const tagOk = activeTag === 'All' || stream.tags.includes(activeTag)
    const text = `${stream.title} ${stream.summary} ${stream.categoryLabel} ${stream.hostName} ${stream.tags.join(' ')}`
    return tagOk && text.toLowerCase().includes(normalized)
  }
  const filtering = normalized !== '' || activeTag !== 'All'

  return (
    <div className="page">
      <header className="page__head">
        <p className="eyebrow">Explore IlmLive</p>
        <h1 className="page__title">Discover live knowledge</h1>
        <p className="page__sub page__sub--wide">
          What is live right now, and what begins within the next hour. Search by subject or narrow
          the list with topic tags.
        </p>
      </header>

      <div className="search">
        <Icon name="search" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by topic, title, teacher, or tag…"
          aria-label="Search live circles"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')}>
            Clear
          </button>
        )}
      </div>

      <div className="chips" role="group" aria-label="Filter by tag">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            className={`chip ${activeTag === tag ? 'is-active' : ''}`}
            aria-pressed={activeTag === tag}
            onClick={() => setActiveTag(tag)}
          >
            {tag === 'All' ? 'All topics' : `#${tag}`}
          </button>
        ))}
      </div>

      {SECTIONS.map((section) => {
        const items = groups[section.key].filter(matches)
        return (
          <section key={section.key} className="block">
            <div className="section-head">
              <div>
                <h2>
                  {section.key === 'live' && <span className="live-dot" />}
                  {section.title}
                </h2>
                <p>{section.subtitle}</p>
              </div>
              <span className="count">{items.length}</span>
            </div>
            {items.length ? (
              <div className="grid">
                {items.map((stream) => (
                  <StreamCard key={stream.id} stream={stream} />
                ))}
              </div>
            ) : (
              <p className="empty">
                {filtering ? 'No circles here match your search.' : section.empty}
              </p>
            )}
          </section>
        )
      })}
    </div>
  )
}
