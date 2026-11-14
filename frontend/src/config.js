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

// IlmLive is invitation-only (see the sign-up screen). These codes are checked
// IN THE BROWSER, so anyone can read them. That's fine for a demo; for real use,
// check the code on your server (Flask) instead.
export const REFERRAL_CODES = ['1STTEACHERS', 'CREATOR']