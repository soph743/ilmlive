import { recommend } from './recommend.js'
import { BUCKET_ORDER, describe } from './schedule.js'

/** Live first, then soonest upcoming, then newest recordings. */
function byFeedOrder(a, b) {
  const bucket = BUCKET_ORDER[a.bucket] - BUCKET_ORDER[b.bucket]
  if (bucket !== 0) return bucket
  const delta = a.startTime - b.startTime
  return a.bucket === 'past' ? -delta : delta
}

/** Data for the Home page. `user` needs { following, interests, learningGoals }. */
export function buildHomeFeed(streams, user, now = Date.now()) {
  const all = streams.map((stream) => describe(stream, now))
  const following = user.following || []

  const followed = all.filter((stream) => following.includes(stream.teacherId)).sort(byFeedOrder)

  const recommended = recommend(
    all,
    { interests: user.interests, goals: user.learningGoals, following },
    { limit: 6, excludeIds: new Set(followed.map((stream) => stream.id)) },
  )

  return { live: all.filter((stream) => stream.bucket === 'live'), followed, recommended }
}

/** Data for the Discover page: what is live now, and what starts within the hour. */
export function buildDiscoverGroups(streams, now = Date.now()) {
  const all = streams.map((stream) => describe(stream, now)).sort((a, b) => a.startTime - b.startTime)
  return {
    live: all.filter((stream) => stream.bucket === 'live'),
    soon: all.filter((stream) => stream.bucket === 'soon'),
    hour: all.filter((stream) => stream.bucket === 'hour'),
  }
}