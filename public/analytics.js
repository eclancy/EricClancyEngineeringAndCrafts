// Google Analytics (GA4) for ecec.dev. Every page loads this one file - the home page and game
// pages through index.html, the standalone pages (download pages, the fighter form and guide,
// the 404 page) by a script tag of their own, and DrawPets in the browser through deploy.yml -
// so the measurement ID lives only here. nginx serves it uncached, so a change reaches visitors
// at once.
//
// Many visitors are kids, so Google signals and ad personalisation are off: the data is used
// only to see how the site is used, never to profile anyone for ads.
;(function () {
  var id = '' // the ecec.dev property's web stream, G-XXXXXXXXXX; empty turns analytics off
  // Only the live site: not the dev server, previews or a copy saved to disk.
  if (!id || location.hostname !== 'ecec.dev') return

  var tag = document.createElement('script')
  tag.async = true
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + id
  document.head.appendChild(tag)

  window.dataLayer = window.dataLayer || []
  window.gtag = function () {
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', id, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  })
})()
