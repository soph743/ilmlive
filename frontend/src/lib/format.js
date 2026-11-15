/** "Ustadha Amina Siddiqui" -> "AS" ; "Maryam Ali" -> "MA" */
export function initialsOf(name = '') {
  return name
    .replace(/^(ustadh|ustadha|sheikh|dr\.?)\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
