import assert from 'node:assert/strict'
import { test } from 'node:test'
import { bucketFor, describe, whenLabel } from './schedule.js'

const NOW = Date.UTC(2026, 10, 13, 12, 0, 0)
const MIN = 60_000
// A stream that starts `minutes` from NOW (negative = already started).
const stream = (minutes, durationMinutes = 60) => ({
  startTime: NOW + minutes * MIN,
  durationMinutes,
})

test('bucketFor: live, soon, hour, later, past', () => {
  assert.equal(bucketFor(stream(-20), NOW), 'live')
  assert.equal(bucketFor(stream(12), NOW), 'soon')
  assert.equal(bucketFor(stream(45), NOW), 'hour')
  assert.equal(bucketFor(stream(180), NOW), 'later')
  assert.equal(bucketFor(stream(-200), NOW), 'past')
})

test('bucketFor: boundaries at 30 and 60 minutes', () => {
  assert.equal(bucketFor(stream(30), NOW), 'soon')
  assert.equal(bucketFor(stream(31), NOW), 'hour')
  assert.equal(bucketFor(stream(60), NOW), 'hour')
  assert.equal(bucketFor(stream(61), NOW), 'later')
})

test('bucketFor: a circle turns live at its start time and ends after its duration', () => {
  assert.equal(bucketFor(stream(0), NOW), 'live')
  assert.equal(bucketFor(stream(-59, 60), NOW), 'live')
  assert.equal(bucketFor(stream(-60, 60), NOW), 'past')
})

test('whenLabel wording', () => {
  assert.equal(whenLabel(stream(-5), NOW), 'Live now')
  assert.equal(whenLabel(stream(-500), NOW), 'Recording')
  assert.equal(whenLabel(stream(12), NOW), 'Starts in 12 min')
  assert.equal(whenLabel(stream(150), NOW), 'Starts in 2h 30m')
  assert.equal(whenLabel(stream(300), NOW), 'Starts in 5h')
  assert.equal(whenLabel(stream(24 * 60 + 120), NOW), 'Starts tomorrow')
  assert.equal(whenLabel(stream(3 * 24 * 60), NOW), 'Starts in 3 days')
})

test('describe adds bucket and whenLabel without changing the original', () => {
  const original = stream(12)
  const result = describe(original, NOW)
  assert.equal(result.bucket, 'soon')
  assert.equal(result.whenLabel, 'Starts in 12 min')
  assert.equal('bucket' in original, false)
})