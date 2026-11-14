// A tiny router that uses the part of the URL after "#" (e.g. /#/discover).
// Hash URLs need no server setup, so the site works on any static host and
// refreshing a page never gives a 404.
import { useEffect, useState } from 'react'

function currentPath() {
  const hash = window.location.hash.replace(/^#/, '')
  return hash.startsWith('/') ? hash : '/'
}

export function useHashPath() {
  const [path, setPath] = useState(currentPath)
  useEffect(() => {
    const update = () => setPath(currentPath())
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])
  return path
}

export function navigate(to) {
  window.location.hash = to
}

export function Link({ to, ...props }) {
  return <a href={`#${to}`} {...props} />
}

/** matchRoute('/live/:slug', '/live/abc') -> { slug: 'abc' } ; no match -> null */
export function matchRoute(pattern, path) {
  const wanted = pattern.split('/').filter(Boolean)
  const actual = path.split('?')[0].split('/').filter(Boolean)
  if (wanted.length !== actual.length) return null

  const params = {}
  for (let i = 0; i < wanted.length; i++) {
    if (wanted[i].startsWith(':')) params[wanted[i].slice(1)] = decodeURIComponent(actual[i])
    else if (wanted[i] !== actual[i]) return null
  }
  return params
}