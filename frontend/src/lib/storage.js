// A tiny wrapper around localStorage used by the demo "backend" in src/services.
//
// - Values are stored as JSON under an "ilmlive:" prefix.
// - If localStorage is blocked (private window, etc.) it falls back to memory,
//   so the app still works for the current session.
// - Every write fires an event, so React components can re-render. The browser's
//   own "storage" event also fires for other tabs, which is what makes chat and
//   follows update across two open tabs.

const PREFIX = 'ilmlive:'
const CHANGE_EVENT = 'ilmlive:change'
const memory = new Map()

export function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key)
    if (raw !== null) return JSON.parse(raw)
  } catch {
    // blocked or corrupted: fall through to memory / fallback
  }
  return memory.has(key) ? memory.get(key) : fallback
}

export function write(key, value) {
  memory.set(key, value)
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // keep the in-memory copy
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

/** Subscribe to any change. Returns an unsubscribe function. */
export function onChange(callback) {
  window.addEventListener(CHANGE_EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}