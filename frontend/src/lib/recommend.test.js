import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildDiscoverGroups, buildHomeFeed } from './feed.js'
import { recommend } from './recommend.js'

const NOW = Date.UTC(2026, 10, 13, 12, 0, 0)
const MIN = 60_000

const make = (id, overrides = {}) => ({
  id,
  title: id,
  category: 'quran',
  categoryLabel: 'Qur’an',
  tags: [],
  teacherId: 't-none',
  featured: false,
  bucket: 'later',
  startTime: NOW + 300 * MIN,
  durationMinutes: 60,
  ...overrides,
})

const streams = [
  make('quran-plain'),
  make('hadith-plain', { category: 'hadith', categoryLabel: 'Hadith' }),
  make('fiqh-live', { category: 'fiqh', categoryLabel: 'Fiqh', bucket: 'live' }),
  make('arabic-goal', { category: 'arabic', categoryLabel: 'Arabic', tags: ['Grammar'] }),
  make('followed-history', { category: 'history', categoryLabel: 'History', teacherId: 't-1' }),
]

const noProfile = { interests: [], goals: '', following: [] }

test('an interest outranks everything else and explains itself', () => {
  const result = recommend(streams, { ...noProfile, interests: ['hadith'] })
  assert.equal(result[0].id, 'hadith-plain')
  assert.match(result[0].reason, /interested in Hadith/)
})

test('with no profile, live circles come first', () => {
  const result = recommend(streams, noProfile)
  assert.equal(result[0].id, 'fiqh-live')
  assert.equal(result[0].reason, 'Live right now')
})

test('a tag mentioned in the learning goals is matched', () => {
  const result = recommend(streams, { ...noProfile, goals: 'I want to improve my grammar' }, { limit: 2 })
  const match = result.find((stream) => stream.id === 'arabic-goal')
  assert.ok(match)
  assert.equal(match.reason, 'Matches your goal: Grammar')
})

test('followed teachers get a boost', () => {
  const result = recommend(streams, { ...noProfile, following: ['t-1'] })
  const ids = result.map((stream) => stream.id)
  assert.ok(ids.indexOf('followed-history') < ids.indexOf('quran-plain'))
})

test('limit and excludeIds are respected, and the input is not mutated', () => {
  const copy = [...streams]
  const result = recommend(
    streams,
    { ...noProfile, interests: ['hadith'] },
    { limit: 2, excludeIds: new Set(['hadith-plain']) },
  )
  assert.equal(result.length, 2)
  assert.ok(!result.some((stream) => stream.id === 'hadith-plain'))
  assert.deepEqual(streams, copy)
})

// ---- feed.js ------------------------------------------------------------

const raw = (id, minutes, extra = {}) => ({
  id,
  title: id,
  category: 'quran',
  categoryLabel: 'Qur’an',
  tags: [],
  teacherId: 't-a',
  featured: false,
  startTime: NOW + minutes * MIN,
  durationMinutes: 60,
  ...extra,
})

test('buildDiscoverGroups splits live / within 30 min / 30-60 min and ignores the rest', () => {
  const groups = buildDiscoverGroups(
    [raw('live', -10), raw('s1', 25), raw('s2', 10), raw('h1', 45), raw('later', 200), raw('past', -500)],
    NOW,
  )
  assert.deepEqual(groups.live.map((s) => s.id), ['live'])
  assert.deepEqual(groups.soon.map((s) => s.id), ['s2', 's1']) // soonest first
  assert.deepEqual(groups.hour.map((s) => s.id), ['h1'])
})

test('buildHomeFeed: followed teachers feed one list, recommendations never repeat them', () => {
  const user = { following: ['t-b'], interests: ['quran'], learningGoals: '' }
  const feed = buildHomeFeed(
    [
      raw('a-live', -10, { teacherId: 't-a' }),
      raw('b-past', -500, { teacherId: 't-b' }),
      raw('b-soon', 15, { teacherId: 't-b' }),
      raw('c-later', 200, { teacherId: 't-c' }),
    ],
    user,
    NOW,
  )
  assert.deepEqual(feed.followed.map((s) => s.id), ['b-soon', 'b-past']) // upcoming before recordings
  assert.ok(feed.recommended.every((s) => !['b-soon', 'b-past'].includes(s.id)))
  assert.deepEqual(feed.live.map((s) => s.id), ['a-live'])
})