import { BUCKET_ORDER } from './schedule.js'

/**
 * A small, explainable content-based recommender.
 *
 * Points are added for: a matching interest topic, a tag mentioned in the
 * person's learning goals, a followed teacher, a featured circle, and being live
 * or starting soon. Each pick carries a human-readable `reason` for the UI.
 *
 * Pure function: no browser or database access, so it is easy to test.
 *
 * @param {Array}  streams  streams already passed through describe() (need `bucket`)
 * @param {{interests: string[], goals: string, following: string[]}} profile
 * @param {{limit?: number, excludeIds?: Set<string>}} options
 */
export function recommend(streams, profile, options = {}) {
  const { limit = 6, excludeIds = new Set() } = options
  const goals = (profile.goals || '').toLowerCase()
  const interests = profile.interests || []
  const following = profile.following || []

  const scored = streams
    .filter((stream) => !excludeIds.has(stream.id))
    .map((stream) => {
      let score = 0
      let reason

      if (interests.includes(stream.category)) {
        score += 4
        reason = `Because you’re interested in ${stream.categoryLabel}`
      }

      const matchedTag = stream.tags.find((tag) => goals.includes(tag.toLowerCase()))
      if (matchedTag) {
        score += 2
        reason ??= `Matches your goal: ${matchedTag}`
      }

      if (following.includes(stream.teacherId)) score += 3

      if (stream.featured) {
        score += 1
        reason ??= 'Featured this week'
      }

      if (stream.bucket === 'live') {
        score += 1.5
        reason ??= 'Live right now'
      } else if (stream.bucket === 'soon' || stream.bucket === 'hour') {
        score += 1
        reason ??= 'Starting soon'
      }

      return { stream, score, reason }
    })

  scored.sort(
    (a, b) =>
      b.score - a.score ||
      BUCKET_ORDER[a.stream.bucket] - BUCKET_ORDER[b.stream.bucket] ||
      a.stream.title.localeCompare(b.stream.title),
  )

  return scored.slice(0, limit).map(({ stream, reason }) => ({ ...stream, reason }))
}