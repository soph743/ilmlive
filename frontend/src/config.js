// Topics a circle can belong to. Used for filters and the "interests" chips.
export const CATEGORIES = [
  { value: 'quran', label: 'Qur’an' },
  { value: 'arabic', label: 'Arabic' },
  { value: 'hadith', label: 'Hadith' },
  { value: 'fiqh', label: 'Fiqh' },
  { value: 'history', label: 'History' },
  { value: 'spirituality', label: 'Spirituality' },
]

export const CATEGORY_LABELS = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label]))

// Must match MIN_PASSWORD_LENGTH in backend/app/firebase.py, which enforces it.
export const MIN_PASSWORD_LENGTH = 8
