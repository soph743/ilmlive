import { useEffect, useRef, useState } from 'react'
import { FollowButton } from '../components/FollowButton.jsx'
import { Icon } from '../components/Icons.jsx'
import { useUser } from '../hooks/useAuth.jsx'
import { useNow } from '../hooks/useNow.js'
import { initialsOf } from '../lib/format.js'
import { describe } from '../lib/schedule.js'
import { onChange } from '../lib/storage.js'
import { getMessages, getNote, saveNote, sendMessage } from '../services/liveRoom.js'
import { getStreamBySlug } from '../services/streams.js'
import { Link } from '../router.jsx'

export function LivePage({ slug }) {
  const stream = getStreamBySlug(slug)
  if (!stream) {
    return (
      <div className="page">
        <p className="empty">
          We couldn’t find that circle. <Link to="/discover" className="link">Browse live circles</Link>
        </p>
      </div>
    )
  }
  return <LiveRoom stream={stream} />
}

function LiveRoom({ stream: rawStream }) {
  const user = useUser()
  const now = useNow(15_000)
  const stream = describe(rawStream, now)
  const isLive = stream.bucket === 'live'

  const [tab, setTab] = useState('chat')
  const [channel, setChannel] = useState('public')
  const [draft, setDraft] = useState('')
  const [chatFeedback, setChatFeedback] = useState('')
  const [messages, setMessages] = useState(() => getMessages(stream.id, user.id))

  const [savedNote, setSavedNote] = useState(() => getNote(user.id, stream.id))
  const [note, setNote] = useState(savedNote)
  const [noteFeedback, setNoteFeedback] = useState('')

  const scroller = useRef(null)

  // Re-read the chat whenever anything is saved (including from another open tab).
  useEffect(() => {
    const refresh = () => setMessages(getMessages(stream.id, user.id))
    refresh()
    return onChange(refresh)
  }, [stream.id, user.id])

  // Keep the newest message in view.
  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight
  }, [messages.length, tab])

  const handleSend = () => {
    try {
      const result = sendMessage({ streamId: stream.id, user, text: draft, channel })
      setDraft('')
      setChatFeedback(result)
    } catch (err) {
      setChatFeedback(err.message)
    }
  }

  const handleSave = () => {
    try {
      saveNote(user.id, stream.id, note)
      setSavedNote(note.trim())
      setNoteFeedback('Saved to your account.')
    } catch (err) {
      setNoteFeedback(err.message)
    }
  }

  const unsaved = note.trim() !== savedNote

  return (
    <div className="room">
      <section className="room__stage">
        <div className="room__video-wrap">
          {/* Blank block: the live video player goes here. */}
          <div className="room__video" role="img" aria-label="Live video area">
            <span className="room__video-dots" />
            <div className="room__video-center">
              <span className="room__play">
                <Icon name="play" filled className="icon icon--lg" />
              </span>
              <p>Live video appears here</p>
            </div>
            <div className="room__video-top">
              <span className={`badge ${isLive ? 'badge--live' : 'badge--ghost'}`}>
                {isLive ? '● Live' : stream.whenLabel}
              </span>
              <span className="badge badge--ghost">
                <Icon name="users" className="icon icon--xs" /> {stream.viewerCount} present
              </span>
            </div>
          </div>
        </div>

        <div className="room__info">
          <div className="tags tags--dark">
            <span className="tag tag--gold">{stream.categoryLabel}</span>
            {stream.tags.map((tag) => (
              <span key={tag} className="tag">
                #{tag}
              </span>
            ))}
          </div>
          <h1 className="room__title">{stream.title}</h1>
          <div className="room__host">
            <span className="avatar avatar--gold">{initialsOf(stream.hostName)}</span>
            <strong>{stream.hostName}</strong>
            <FollowButton teacherId={stream.teacherId} tone="dark" />
          </div>
          <p className="room__summary">{stream.summary}</p>
        </div>
      </section>

      <aside className="room__side">
        <div className="tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'chat'}
            className={tab === 'chat' ? 'is-active' : ''}
            onClick={() => setTab('chat')}
          >
            <Icon name="chat" className="icon icon--sm" /> Live chat
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'notes'}
            className={tab === 'notes' ? 'is-active' : ''}
            onClick={() => setTab('notes')}
          >
            <Icon name="notes" className="icon icon--sm" /> My notes
          </button>
        </div>

        {tab === 'chat' ? (
          <>
            <div className="chat__list" ref={scroller}>
              {messages.length ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`msg ${message.channel === 'private-question' ? 'msg--private' : ''}`}
                  >
                    <div className="msg__head">
                      <strong>{message.authorName}</strong>
                      <span>
                        {message.channel === 'private-question' && (
                          <Icon name="lock" className="icon icon--xs" />
                        )}
                        {message.channel === 'private-question' ? 'Private' : 'Public'}
                      </span>
                    </div>
                    <p>{message.text}</p>
                  </div>
                ))
              ) : (
                <div className="chat__empty">
                  <span className="chat__empty-icon">
                    <Icon name="chat" />
                  </span>
                  <strong>The conversation starts here</strong>
                  <small>Welcome others with a thoughtful message.</small>
                </div>
              )}
            </div>

            <div className="chat__compose">
              <div className="segmented segmented--small">
                <button
                  type="button"
                  className={channel === 'public' ? 'is-active' : ''}
                  onClick={() => setChannel('public')}
                >
                  Public chat
                </button>
                <button
                  type="button"
                  className={channel === 'private-question' ? 'is-active is-private' : ''}
                  onClick={() => setChannel('private-question')}
                >
                  <Icon name="lock" className="icon icon--xs" /> Ask privately
                </button>
              </div>
              {channel === 'private-question' && (
                <p className="chat__private-note">Only you and the teacher can see this question.</p>
              )}
              <div className="chat__row">
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      handleSend()
                    }
                  }}
                  rows={2}
                  maxLength={1000}
                  aria-label="Chat message"
                  placeholder={
                    channel === 'private-question' ? 'Ask the teacher privately…' : 'Join the conversation…'
                  }
                />
                <button
                  type="button"
                  className="send"
                  onClick={handleSend}
                  disabled={!draft.trim()}
                  aria-label="Send message"
                >
                  <Icon name="send" className="icon icon--sm" />
                </button>
              </div>
              {chatFeedback && <p className="feedback">{chatFeedback}</p>}
            </div>
          </>
        ) : (
          <div className="notes">
            <div className="notes__banner">
              <strong>Private learning notes</strong>
              These are saved to your account for this circle and are never shared in chat.
            </div>
            <textarea
              value={note}
              onChange={(event) => {
                setNote(event.target.value)
                setNoteFeedback('')
              }}
              aria-label="My notes"
              placeholder="Capture an ayah, reflection, question, or action point…"
            />
            <button type="button" className="btn btn--primary btn--block" onClick={handleSave} disabled={!note.trim() || !unsaved}>
              <Icon name="bookmark" className="icon icon--sm" /> Save my notes
            </button>
            <p className="feedback">
              {noteFeedback || (unsaved && note.trim() ? 'You have unsaved changes.' : savedNote ? 'All changes saved.' : '')}
            </p>
          </div>
        )}
      </aside>
    </div>
  )
}