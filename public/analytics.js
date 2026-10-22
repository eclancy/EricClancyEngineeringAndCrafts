// Google Analytics (GA4) for ecec.dev, and the cookie question that goes with it. Every page
// loads this one file - the home page and game pages through index.html, the standalone pages
// (download pages, the fighter form and guide, the privacy and 404 pages) by a script tag of
// their own, and DrawPets in the browser through deploy.yml - so the measurement ID lives only
// here. nginx serves it uncached, so a change reaches visitors at once.
//
// Many visitors are kids, so Google signals and ad personalisation are off: the data is used
// only to see how the site is used, never to profile anyone for ads.
//
// Cookies: Google's consent mode keeps analytics cookies off until a yes in the EU, EEA, UK and
// Switzerland, where the law asks for one first, and on elsewhere. Google tells those regions
// apart (from the visitor's IP, on its side), so that's what keeps the site within the rules.
// The banner asking is shown to visitors whose clock is set to a European time zone, the
// people it's for; anyone can change their answer from /privacy.
;(function () {
  var id = '' // the ecec.dev property's web stream, G-XXXXXXXXXX; empty turns analytics off
  if (!id) return
  // The tag only loads on the live site. The banner also works on the dev server, to test it.
  var live = location.hostname === 'ecec.dev'

  var KEY = 'ecec-analytics-consent'
  // prettier-ignore
  var ASKS_FIRST = [
    // EU, with its outermost regions that have country codes of their own
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT',
    'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
    'GF', 'GP', 'MQ', 'RE', 'YT', 'MF',
    // the rest of the EEA, the UK and Switzerland
    'IS', 'LI', 'NO', 'GB', 'CH',
  ]

  // Browser storage can throw (private windows, blocked site data). Then the question comes
  // back on each page, which is the safe way round.
  function stored() {
    try {
      var choice = localStorage.getItem(KEY)
      return choice === 'granted' || choice === 'denied' ? choice : null
    } catch (e) {
      return null
    }
  }
  function store(choice) {
    try {
      localStorage.setItem(KEY, choice)
    } catch (e) {
      // Not remembered; asked again next time.
    }
  }

  window.dataLayer = window.dataLayer || []
  function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag = gtag
  // No ads here, ever. Analytics on by default, except where the law wants a yes first.
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'granted',
  })
  gtag('consent', 'default', { analytics_storage: 'denied', region: ASKS_FIRST })
  var choice = stored()
  if (choice) gtag('consent', 'update', { analytics_storage: choice })

  if (live) {
    var tag = document.createElement('script')
    tag.async = true
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + id
    document.head.appendChild(tag)
    gtag('js', new Date())
    gtag('config', id, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    })
  }

  function decide(answer) {
    store(answer)
    gtag('consent', 'update', { analytics_storage: answer })
    // A no also clears the cookies a yes (or the default) already set: _ga and _ga_<stream>.
    if (answer === 'denied') {
      document.cookie.split(';').forEach(function (pair) {
        var name = pair.split('=')[0].trim()
        if (name !== '_ga' && name.indexOf('_ga_') !== 0) return
        var gone = name + '=; Max-Age=0; path=/'
        document.cookie = gone
        document.cookie = gone + '; domain=.' + location.hostname
      })
    }
    close()
  }

  function inEurope() {
    try {
      var zone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
      return (
        /^Europe\//.test(zone) ||
        /^Atlantic\/(Reykjavik|Canary|Madeira|Azores|Faroe)$/.test(zone)
      )
    } catch (e) {
      return true // can't tell, so ask
    }
  }

  var banner = null

  function close() {
    if (banner) banner.remove()
    banner = null
  }

  function open() {
    if (banner) return
    if (!document.getElementById('ecec-consent-style')) {
      var style = document.createElement('style')
      style.id = 'ecec-consent-style'
      style.textContent =
        '.ecec-consent{position:fixed;z-index:2147483000;left:16px;right:16px;bottom:16px;' +
        'max-width:26rem;margin-left:auto;box-sizing:border-box;padding:16px 18px;' +
        'border:1px solid #334155;border-radius:14px;background:#0f172a;color:#e2e8f0;' +
        'box-shadow:0 10px 30px rgb(0 0 0/.35);font:15px/1.45 ui-sans-serif,system-ui,sans-serif;' +
        'text-align:left}' +
        '.ecec-consent p{margin:0}' +
        '.ecec-consent a{color:#c4b4ff}' +
        '.ecec-consent__buttons{display:flex;gap:10px;margin-top:12px}' +
        '.ecec-consent button{flex:1;padding:9px 12px;border:1px solid #8e51ff;border-radius:999px;' +
        'background:#1e1b4b;color:#fff;font:inherit;font-weight:700;cursor:pointer}' +
        '.ecec-consent button:hover{background:#312e81}' +
        '.ecec-consent button:focus-visible,.ecec-consent a:focus-visible{outline:2px solid #c4b4ff;' +
        'outline-offset:2px}'
      document.head.appendChild(style)
    }
    banner = document.createElement('section')
    banner.className = 'ecec-consent'
    banner.setAttribute('aria-label', 'Cookies')
    banner.innerHTML =
      '<p>Can ecec.dev use Google Analytics cookies? They count visits and show which pages ' +
      'get used. Nothing is used for ads. <a href="/privacy">More about this</a></p>' +
      '<div class="ecec-consent__buttons">' +
      '<button type="button" data-answer="denied">No thanks</button>' +
      '<button type="button" data-answer="granted">Yes, that’s OK</button>' +
      '</div>'
    banner.addEventListener('click', function (e) {
      var answer = e.target.getAttribute && e.target.getAttribute('data-answer')
      if (answer) decide(answer)
    })
    document.body.appendChild(banner)
  }

  // Anything marked data-cookie-settings (the button on /privacy) asks again.
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest && e.target.closest('[data-cookie-settings]')
    if (!trigger) return
    e.preventDefault()
    close()
    open()
  })

  if (!choice && inEurope()) {
    if (document.body) open()
    else document.addEventListener('DOMContentLoaded', open)
  }
})()
