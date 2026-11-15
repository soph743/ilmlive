// DEMO DATA for teachers and circles ("streams").
//
// When you have a real backend, replace listStreams() / getStreamBySlug() with
// calls to it (for example fetch('/api/streams')) and keep returning objects with
// the same fields. Nothing else in the app needs to change.
//
// Start times are set relative to the moment the page loads, so the demo always
// has circles that are live, starting within 30 minutes, and starting within an
// hour, no matter when you open it. Reloading resets the clock.

import { CATEGORY_LABELS } from '../config.js'

export const TEACHERS = [
  { id: 't-yusuf', name: 'Ustadh Yusuf Rahman' },
  { id: 't-amina', name: 'Ustadha Amina Siddiqui' },
  { id: 't-ibrahim', name: 'Sheikh Ibrahim Karim' },
  { id: 't-layla', name: 'Dr. Layla Haddad' },
]

const DAY = 24 * 60
const APP_START = Date.now()

// startOffset is in minutes from page load (negative = already started).
const DEFINITIONS = [
  // ---- live now
  {
    slug: 'surah-al-kahf-lessons',
    title: 'Surah Al-Kahf: Lessons for Every Friday',
    summary:
      'A guided reflection on the four stories of Al-Kahf and what they teach about faith, knowledge, wealth, and power.',
    category: 'quran',
    tags: ['Tafsir', 'Surah Al-Kahf', 'Reflection'],
    teacherId: 't-yusuf',
    startOffset: -20,
    durationMinutes: 75,
    viewerCount: 128,
    featured: true,
  },
  {
    slug: 'arabic-alphabet-vowels',
    title: 'Arabic from Zero: The Alphabet and Short Vowels',
    summary:
      'Learn to recognise and pronounce every letter, then read your first simple words with fatha, kasra, and damma.',
    category: 'arabic',
    tags: ['Beginner', 'Alphabet', 'Reading'],
    teacherId: 't-amina',
    startOffset: -45,
    durationMinutes: 90,
    viewerCount: 74,
  },
  // ---- starting within 30 minutes
  {
    slug: 'forty-hadith-nawawi-1-3',
    title: 'Forty Hadith of Imam al-Nawawi: Hadith 1–3',
    summary:
      'Begin the classic collection with the hadith of intentions and the foundations of Islam, iman, and ihsan.',
    category: 'hadith',
    tags: ['Hadith', 'Intentions', 'Beginner'],
    teacherId: 't-ibrahim',
    startOffset: 12,
    durationMinutes: 60,
    viewerCount: 0,
    featured: true,
  },
  {
    slug: 'fiqh-of-salah-corrections',
    title: 'Fiqh of Salah: Common Mistakes and Corrections',
    summary:
      'A practical walk through the prayer, with time for your questions about posture, recitation, and missed rak‘ahs.',
    category: 'fiqh',
    tags: ['Salah', 'Practical', 'Q&A'],
    teacherId: 't-layla',
    startOffset: 25,
    durationMinutes: 60,
    viewerCount: 0,
  },
  // ---- starting in 30-60 minutes
  {
    slug: 'stories-of-the-prophets-nuh',
    title: 'Stories of the Prophets: Nuh and the Ark',
    summary:
      'A family-friendly telling of Prophet Nuh’s patience, with the lessons we can carry into daily life.',
    category: 'history',
    tags: ['Prophets', 'Family', 'Patience'],
    teacherId: 't-yusuf',
    startOffset: 42,
    durationMinutes: 45,
    viewerCount: 0,
  },
  {
    slug: 'gentle-hearts-tazkiyah',
    title: 'Gentle Hearts: Purification of the Soul',
    summary:
      'Simple, steady habits for softening the heart: sincerity, gratitude, and remembrance in a busy day.',
    category: 'spirituality',
    tags: ['Tazkiyah', 'Character', 'Dhikr'],
    teacherId: 't-amina',
    startOffset: 55,
    durationMinutes: 60,
    viewerCount: 0,
  },
  // ---- later
  {
    slug: 'tajweed-noon-sakinah',
    title: 'Tajweed Tuesday: Rules of Noon Sakinah',
    summary:
      'Idhhar, idgham, iqlab, and ikhfa explained with clear examples you can practise along with.',
    category: 'quran',
    tags: ['Tajweed', 'Recitation', 'Beginner'],
    teacherId: 't-ibrahim',
    startOffset: 5 * 60,
    durationMinutes: 60,
    viewerCount: 0,
  },
  {
    slug: 'life-of-the-prophet-makkah',
    title: 'The Life of the Prophet: The Makkah Years',
    summary:
      'From the first revelation to the migration: a chronological study of the Prophet’s early mission.',
    category: 'history',
    tags: ['Seerah', 'Biography', 'Makkah'],
    teacherId: 't-layla',
    startOffset: DAY + 120,
    durationMinutes: 90,
    viewerCount: 0,
  },
  // ---- recordings
  {
    slug: 'daily-quran-habit',
    title: 'Building a Daily Qur’an Habit',
    summary: 'Realistic routines for reading, reviewing, and reflecting, even on your busiest days.',
    category: 'quran',
    tags: ['Habits', 'Reflection', 'Beginner'],
    teacherId: 't-yusuf',
    startOffset: -2 * DAY,
    durationMinutes: 55,
    viewerCount: 212,
  },
  {
    slug: 'arabic-sentence-types',
    title: 'Arabic Grammar Foundations: The Sentence Types',
    summary:
      'Nominal and verbal sentences, and how recognising them unlocks the meaning of Qur’anic verses.',
    category: 'arabic',
    tags: ['Grammar', 'Nahw', 'Intermediate'],
    teacherId: 't-amina',
    startOffset: -3 * DAY,
    durationMinutes: 70,
    viewerCount: 156,
  },
  {
    slug: 'understanding-zakat',
    title: 'Understanding Zakat: A Clear Guide',
    summary:
      'Who it is due on, how to calculate it, and who it can be given to, with worked examples.',
    category: 'fiqh',
    tags: ['Zakat', 'Finance', 'Practical'],
    teacherId: 't-layla',
    startOffset: -4 * DAY,
    durationMinutes: 65,
    viewerCount: 189,
  },
  {
    slug: 'sunnah-of-sleep-adhkar',
    title: 'The Sunnah of Sleep and Waking: Daily Adhkar',
    summary: 'The morning and evening remembrances, with their meanings, for a more mindful day.',
    category: 'hadith',
    tags: ['Adhkar', 'Daily Life', 'Sunnah'],
    teacherId: 't-ibrahim',
    startOffset: -5 * DAY,
    durationMinutes: 40,
    viewerCount: 143,
  },
]

const teacherName = new Map(TEACHERS.map((teacher) => [teacher.id, teacher.name]))

const STREAMS = DEFINITIONS.map((definition) => {
  const { startOffset, ...rest } = definition
  return {
    ...rest,
    id: definition.slug,
    categoryLabel: CATEGORY_LABELS[definition.category],
    hostName: teacherName.get(definition.teacherId),
    featured: Boolean(definition.featured),
    startTime: APP_START + startOffset * 60_000,
  }
})

export function listStreams() {
  return STREAMS
}

export function getStreamBySlug(slug) {
  return STREAMS.find((stream) => stream.slug === slug) ?? null
}

export function getTeacher(id) {
  return TEACHERS.find((teacher) => teacher.id === id) ?? null
}