// Everything about "when is this circle happening?". Pure functions, no React.
//
// A stream looks like: { startTime: <ms since epoch>, durationMinutes: <number>, ... }
// Its state is worked out from the clock, so a circle that is "starting soon"
// turns into "live" on its own as time passes.

const MINUTE = 60_000

/**
 * Buckets:
 *   live  - started and not finished yet
 *   soon  - starts within 30 minutes
 *   hour  - starts in more than 30 and up to 60 minutes
 *   later - starts more than an hour from now
 *   past  - finished (a recording)
 */
export function bucketFor(stream, now = Date.now()) {
  const minutesUntilStart = (stream.startTime - now) / MINUTE
  if (minutesUntilStart > 60) return 'later'
  if (minutesUntilStart > 30) return 'hour'
  if (minutesUntilStart > 0) return 'soon'
  return -minutesUntilStart < stream.durationMinutes ? 'live' : 'past'
}

export function whenLabel(stream, now = Date.now()) {
  const bucket = bucketFor(stream, now)
  if (bucket === 'live') return 'Live now'
  if (bucket === 'past') return 'Recording'

  const minutes = Math.round((stream.startTime - now) / MINUTE)
  if (minutes <= 0) return 'Starting now'
  if (minutes < 60) return `Starts in ${minutes} min`
  if (minutes < 24 * 60) {
    const hours = Math.floor(minutes / 60)
    const rest = minutes % 60
    return rest ? `Starts in ${hours}h ${rest}m` : `Starts in ${hours}h`
  }
  const days = Math.round(minutes / (24 * 60))
  return days === 1 ? 'Starts tomorrow' : `Starts in ${days} days`
}

/** Adds `bucket` and `whenLabel` to a stream for the current time. */
export function describe(stream, now = Date.now()) {
  return { ...stream, bucket: bucketFor(stream, now), whenLabel: whenLabel(stream, now) }
}

/** Sort order for showing buckets: live first, recordings last. */
export const BUCKET_ORDER = { live: 0, soon: 1, hour: 2, later: 3, past: 4 }