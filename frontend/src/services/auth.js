// DEMO accounts, stored in this browser's localStorage.
//
// This stands in for a real backend so the whole app works today with no server.
// It is NOT secure (anyone with access to the browser can read it), so before real
// use, replace the functions in this file with Firebase Authentication or your
// Flask API. Keep the same function names and the pages will keep working:
//
//   getCurrentUser()                      -> user | null   (sync)
//   signUp({ name, email, password, referralCode })       -> user
//   signIn({ email, password })                           -> user
//   signOut()
//   updateProfile(userId, fields)                         -> user
//   updateCredentials(userId, { currentPassword, newEmail, newPassword, confirmPassword })
//   toggleFollow(userId, teacherId)                       -> true if now following
//
// Every function that fails throws an Error whose message is safe to show.

import { CATEGORIES, REFERRAL_CODES } from '../config.js'
import { read, write } from '../lib/storage.js'

const USERS_KEY = 'users'
const SESSION_KEY = 'session'
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CATEGORY_VALUES = CATEGORIES.map((category) => category.value)

/* ---------- helpers ---------- */

function toHex(bytes) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function makeSalt() {
  return toHex(crypto.getRandomValues(new Uint8Array(16)))
}

function makeId() {
  return crypto.randomUUID?.() ?? `u-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

async function hashPassword(password, salt) {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Secure sign-in needs http://localhost or https. Open the app from there.')
  }
  const data = new TextEncoder().encode(`${salt}:${password}`)
  return toHex(new Uint8Array(await crypto.subtle.digest('SHA-256', data)))
}

const clean = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '')

function allUsers() {
  return read(USERS_KEY, [])
}

function saveUser(updated) {
  write(
    USERS_KEY,
    allUsers().map((user) => (user.id === updated.id ? updated : user)),
  )
}

/** Never hand the password hash to the UI. */
function toPublic(user) {
  const { passwordHash, salt, ...rest } = user
  return rest
}

function requireUser(userId) {
  const user = allUsers().find((candidate) => candidate.id === userId)
  if (!user) throw new Error('Please sign in again.')
  return user
}

async function startSession(user) {
  write(SESSION_KEY, user.id)
  return toPublic(user)
}

/* ---------- public API ---------- */

export function getCurrentUser() {
  const id = read(SESSION_KEY, null)
  if (!id) return null
  const user = allUsers().find((candidate) => candidate.id === id)
  return user ? toPublic(user) : null
}

export async function signUp({ name, email, password, referralCode }) {
  name = clean(name, 80)
  email = clean(email, 200).toLowerCase()
  password = clean(password, 200)
  referralCode = clean(referralCode, 40).toUpperCase()

  if (name.length < 2) throw new Error('Enter your full name.')
  if (!EMAIL_PATTERN.test(email)) throw new Error('Enter a valid email address.')
  if (password.length < 8) throw new Error('Your password must be at least 8 characters.')
  if (!REFERRAL_CODES.includes(referralCode)) throw new Error('That referral code is not valid.')
  if (allUsers().some((user) => user.email === email)) {
    throw new Error('An account with this email already exists.')
  }

  const salt = makeSalt()
  const user = {
    id: makeId(),
    name,
    email,
    salt,
    passwordHash: await hashPassword(password, salt),
    bio: '',
    location: '',
    learningGoals: '',
    interests: [],
    following: [],
    preferences: { classReminders: true, emailDigest: true, privateQuestionReceipts: true },
    createdAt: Date.now(),
  }
  write(USERS_KEY, [...allUsers(), user])
  return startSession(user)
}

export async function signIn({ email, password }) {
  email = clean(email, 200).toLowerCase()
  password = clean(password, 200)
  if (!email || !password) throw new Error('Enter your email and password.')

  const user = allUsers().find((candidate) => candidate.email === email)
  const fail = () => new Error('We could not sign you in. Check your email and password.')
  if (!user) throw fail()
  if ((await hashPassword(password, user.salt)) !== user.passwordHash) throw fail()
  return startSession(user)
}

export function signOut() {
  write(SESSION_KEY, null)
}

export function updateProfile(userId, fields) {
  const user = requireUser(userId)
  const name = clean(fields.name, 80)
  if (name.length < 2) throw new Error('Your name is required.')

  const updated = {
    ...user,
    name,
    bio: clean(fields.bio, 280),
    location: clean(fields.location, 80),
    learningGoals: clean(fields.learningGoals, 500),
    // Only keep known topics.
    interests: (fields.interests || []).filter((value) => CATEGORY_VALUES.includes(value)),
    preferences: {
      classReminders: Boolean(fields.preferences?.classReminders),
      emailDigest: Boolean(fields.preferences?.emailDigest),
      privateQuestionReceipts: Boolean(fields.preferences?.privateQuestionReceipts),
    },
  }
  saveUser(updated)
  return toPublic(updated)
}

export async function updateCredentials(userId, input) {
  const user = requireUser(userId)
  const currentPassword = clean(input.currentPassword, 200)
  const newEmail = clean(input.newEmail, 200).toLowerCase()
  const newPassword = clean(input.newPassword, 200)
  const confirmPassword = clean(input.confirmPassword, 200)

  const emailChanged = Boolean(newEmail) && newEmail !== user.email
  const passwordChanged = Boolean(newPassword)

  if (!currentPassword) throw new Error('Enter your current password to make changes.')
  if (!emailChanged && !passwordChanged) {
    throw new Error('Enter a new email address or a new password.')
  }
  if (emailChanged && !EMAIL_PATTERN.test(newEmail)) throw new Error('Enter a valid email address.')
  if (passwordChanged) {
    if (newPassword.length < 8) throw new Error('Your new password must be at least 8 characters.')
    if (newPassword !== confirmPassword) throw new Error('The new passwords do not match.')
    if (newPassword === currentPassword) {
      throw new Error('Choose a password different from your current one.')
    }
  }

  if ((await hashPassword(currentPassword, user.salt)) !== user.passwordHash) {
    throw new Error('Your current password is incorrect.')
  }
  if (emailChanged && allUsers().some((other) => other.id !== user.id && other.email === newEmail)) {
    throw new Error('That email address is already in use.')
  }

  const updated = { ...user }
  if (emailChanged) updated.email = newEmail
  if (passwordChanged) {
    updated.salt = makeSalt()
    updated.passwordHash = await hashPassword(newPassword, updated.salt)
  }
  saveUser(updated)

  if (emailChanged && passwordChanged) return 'Your email and password have been updated.'
  return emailChanged ? 'Your email address has been updated.' : 'Your password has been updated.'
}

export function toggleFollow(userId, teacherId) {
  const user = requireUser(userId)
  const following = user.following.includes(teacherId)
    ? user.following.filter((id) => id !== teacherId)
    : [...user.following, teacherId]
  saveUser({ ...user, following })
  return following.includes(teacherId)
}