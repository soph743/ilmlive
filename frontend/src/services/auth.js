// Accounts, backed by Firebase Authentication through the Flask API (/api/auth/...).
//
// Flask + Firebase own: sign up / sign in / sign out, name, email, password, role.
// This browser still stores the rest of the profile (bio, location, goals,
// interests, preferences, follows) in localStorage, keyed by the Firebase uid,
// until there is a database for it.
//
//   loadSession()                                         -> user | null  (call once on start)
//   getCurrentUser()                                      -> user | null  (sync)
//   signUp({ name, email, password, role, inviteCode })   -> user
//   signIn({ email, password })                           -> user
//   signOut()
//   updateProfile(userId, fields)                         -> user
//   updateCredentials(userId, { currentPassword, newEmail, newPassword, confirmPassword })
//   toggleFollow(userId, teacherId)                       -> true if now following
//
// Every function that fails throws an Error whose message is safe to show.
// The server re-checks every rule; the checks here only give faster feedback.

import { CATEGORIES, MIN_PASSWORD_LENGTH } from '../config.js'
import { notifyChange, read, write } from '../lib/storage.js'
import { api } from './api.js'

const CATEGORY_VALUES = CATEGORIES.map((category) => category.value)

const DEFAULT_PROFILE = {
  bio: '',
  location: '',
  learningGoals: '',
  interests: [],
  following: [],
  preferences: { classReminders: true, emailDigest: true, privateQuestionReceipts: true },
}

/** The account as Flask returned it: { uid, email, name, role }, or null. */
let account = null

function setAccount(next) {
  account = next
  notifyChange()
}

const profileKey = (userId) => `profile:${userId}`
const clean = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '')

function readProfile(userId) {
  return { ...DEFAULT_PROFILE, ...read(profileKey(userId), {}) }
}

function requireUser(userId) {
  if (!account || account.uid !== userId) throw new Error('Please sign in again.')
}

function checkPasswordLength(password, label = 'Your password') {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`${label} must be at least ${MIN_PASSWORD_LENGTH} characters.`)
  }
}

/* ---------- public API ---------- */

export async function loadSession() {
  try {
    const { user } = await api('GET', '/auth/me')
    setAccount(user)
  } catch {
    setAccount(null)
  }
}

export function getCurrentUser() {
  if (!account) return null
  return {
    ...readProfile(account.uid),
    id: account.uid,
    name: account.name,
    email: account.email,
    role: account.role,
  }
}

export async function signUp({ name, email, password, role, inviteCode }) {
  checkPasswordLength(password)
  const { user } = await api('POST', '/auth/signup', {
    name,
    email,
    password,
    role,
    inviteCode: role === 'streamer' ? inviteCode : undefined,
  })
  setAccount(user)
  return getCurrentUser()
}

export async function signIn({ email, password }) {
  const { user } = await api('POST', '/auth/login', { email, password })
  setAccount(user)
  return getCurrentUser()
}

export async function signOut() {
  try {
    await api('POST', '/auth/logout')
  } finally {
    setAccount(null)
  }
}

export async function updateProfile(userId, fields) {
  requireUser(userId)
  const name = clean(fields.name, 80)
  if (name.length < 2) throw new Error('Your name is required.')

  if (name !== account.name) {
    const { user } = await api('PATCH', '/auth/me', { name })
    setAccount(user)
  }

  write(profileKey(userId), {
    ...readProfile(userId),
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
  })
  return getCurrentUser()
}

export async function updateCredentials(userId, input) {
  requireUser(userId)
  const newEmail = clean(input.newEmail, 200).toLowerCase()
  const newPassword = input.newPassword || ''
  const emailChanged = Boolean(newEmail) && newEmail !== account.email
  const passwordChanged = Boolean(newPassword)

  if (passwordChanged) {
    checkPasswordLength(newPassword, 'Your new password')
    if (newPassword !== input.confirmPassword) throw new Error('The new passwords do not match.')
  }

  const { user } = await api('POST', '/auth/credentials', {
    currentPassword: input.currentPassword,
    newEmail: emailChanged ? newEmail : undefined,
    newPassword: passwordChanged ? newPassword : undefined,
  })
  setAccount(user)

  if (emailChanged && passwordChanged) return 'Your email and password have been updated.'
  return emailChanged ? 'Your email address has been updated.' : 'Your password has been updated.'
}

export function toggleFollow(userId, teacherId) {
  requireUser(userId)
  const profile = readProfile(userId)
  const following = profile.following.includes(teacherId)
    ? profile.following.filter((id) => id !== teacherId)
    : [...profile.following, teacherId]
  write(profileKey(userId), { ...profile, following })
  return following.includes(teacherId)
}
