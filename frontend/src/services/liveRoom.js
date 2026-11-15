// DEMO chat and notes, stored in this browser's localStorage.
// Swap these for your backend (Firestore, Flask API, ...) later; keep the names.
//
//   getMessages(streamId, userId)            -> messages this person may see
//   sendMessage({ streamId, user, text, channel })
//   getNote(userId, streamId)                -> string
//   saveNote(userId, streamId, body)
//
// Public messages are visible to everyone. "private-question" messages are only
// visible to the person who sent them (and, once teachers have accounts, to the
// teacher of that circle).

import { read, write } from '../lib/storage.js'

const CHAT_KEY = 'chat'
const NOTES_KEY = 'notes'
const NOW = Date.now()

// A few starter messages so a live chat isn't empty in the demo.
const SEED_MESSAGES = [
  {
    id: 'seed-1',
    streamId: 'surah-al-kahf-lessons',
    authorId: 'seed',
    authorName: 'Maryam',
    text: 'Assalamu alaykum everyone, so glad to join today.',
    channel: 'public',
    createdAt: NOW - 14 * 60_000,
  },
  {
    id: 'seed-2',
    streamId: 'surah-al-kahf-lessons',
    authorId: 'seed',
    authorName: 'Omar',
    text: 'Could we revisit the story of Musa and Khidr after this part?',
    channel: 'public',
    createdAt: NOW - 9 * 60_000,
  },
  {
    id: 'seed-3',
    streamId: 'arabic-alphabet-vowels',
    authorId: 'seed',
    authorName: 'Fatima',
    text: 'The way the letters connect finally makes sense, thank you!',
    channel: 'public',
    createdAt: NOW - 6 * 60_000,
  },
]

export function getMessages(streamId, userId) {
  const stored = read(CHAT_KEY, [])
  return [...SEED_MESSAGES, ...stored]
    .filter((message) => message.streamId === streamId)
    .filter((message) => message.channel === 'public' || message.authorId === userId)
    .sort((a, b) => a.createdAt - b.createdAt)
}

export function sendMessage({ streamId, user, text, channel }) {
  const body = typeof text === 'string' ? text.trim().slice(0, 1000) : ''
  if (!body) throw new Error('Write a message first.')
  if (channel !== 'public' && channel !== 'private-question') {
    throw new Error('Choose a valid message type.')
  }

  write(CHAT_KEY, [
    ...read(CHAT_KEY, []),
    {
      id: `m-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      streamId,
      authorId: user.id,
      authorName: user.name,
      text: body,
      channel,
      createdAt: Date.now(),
    },
  ])
  return channel === 'private-question'
    ? 'Your private question was sent to the teacher.'
    : 'Message sent.'
}

const noteKey = (userId, streamId) => `${userId}:${streamId}`

export function getNote(userId, streamId) {
  return read(NOTES_KEY, {})[noteKey(userId, streamId)]?.body ?? ''
}

export function saveNote(userId, streamId, body) {
  const text = typeof body === 'string' ? body.trim().slice(0, 12000) : ''
  if (!text) throw new Error('Write a note before saving.')
  write(NOTES_KEY, {
    ...read(NOTES_KEY, {}),
    [noteKey(userId, streamId)]: { body: text, updatedAt: Date.now() },
  })
}