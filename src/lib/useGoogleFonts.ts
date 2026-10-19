import { useEffect } from 'react'

// Each game page brings its own typefaces. Adds the Google Fonts stylesheet for `families`
// (e.g. ['Permanent Marker', 'Patrick Hand:wght@400']) to <head> once, and leaves it there:
// fonts are cached, and a page switch reloads the document anyway.
export function useGoogleFonts(families: string[]) {
  const key = families.join('|')
  useEffect(() => {
    const query = key
      .split('|')
      .map((f) => `family=${f.trim().replace(/ /g, '+')}`)
      .join('&')
    const href = `https://fonts.googleapis.com/css2?${query}&display=swap`
    if (document.querySelector(`link[href="${href}"]`)) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    document.head.appendChild(link)
  }, [key])
}
