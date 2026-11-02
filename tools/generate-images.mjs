// Génère les visuels de DÉMONSTRATION (SVG) : 3 vues par produit et par couleur + visuels flottants du hero.
// Usage : npm run images — remplacez-les par vos vraies photos dans public/img/ (mêmes noms).
import { mkdirSync, writeFileSync } from 'node:fs'
import { products } from '../src/data/products.js'

const OUT = new URL('../public/img/', import.meta.url)
mkdirSync(OUT, { recursive: true })

const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const shade = (h, a) =>
  '#' + rgb(h).map((v) => Math.round(a >= 0 ? v + (255 - v) * a : v * (1 + a)))
    .map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('')
const S = (d, w = 4) => `stroke="${d}" stroke-width="${w}" stroke-linejoin="round"`

const BODY = {
  crew: 'M270 190 L180 240 L130 340 L200 380 L250 330 L250 600 L550 600 L550 330 L600 380 L670 340 L620 240 L530 190',
  wide: 'M265 195 L170 250 L105 390 L190 420 L235 355 L235 610 L565 610 L565 355 L610 420 L695 390 L630 250 L535 195',
  long: 'M270 190 L175 232 L100 520 L172 545 L245 345 L250 600 L550 600 L555 345 L628 545 L700 520 L625 232 L530 190'
}
const LEGS = 'M280 150 H520 L565 625 H440 L400 310 L360 625 H235 Z'

const shapes = {
  tshirt(c, style) {
    const d = shade(c, -0.25), l = shade(c, 0.15)
    if (style === 'tank') {
      return `<path d="M310 180 L350 180 Q400 290 450 180 L490 180 Q505 285 560 312 L545 620 L255 620 L240 312 Q295 285 310 180 Z" fill="${c}" ${S(d)}/><path d="M255 595 H545" stroke="${d}" stroke-width="3"/>`
    }
    const body = BODY[style === 'wide' ? 'wide' : style === 'long' ? 'long' : 'crew']
    const v = style === 'v'
    const neck = v ? 'L400 320 L270 190 Z' : 'Q400 270 270 190 Z'
    let extra = v
      ? `<path d="M270 190 L400 320 L530 190" fill="none" stroke="${d}" stroke-width="14" stroke-linejoin="round"/>`
      : `<path d="M270 190 Q400 270 530 190" fill="none" stroke="${d}" stroke-width="14"/>`
    if (style === 'polo') {
      extra = `<path d="M270 190 L355 172 L400 255 L445 172 L530 190 L470 238 L400 292 L330 238 Z" fill="${l}" ${S(d, 3)}/><path d="M400 255 V410" stroke="${d}" stroke-width="4"/><circle cx="400" cy="320" r="7" fill="${d}"/><circle cx="400" cy="375" r="7" fill="${d}"/>`
    }
    if (style === 'pocket') extra += `<rect x="440" y="320" width="70" height="80" rx="6" fill="${l}" ${S(d, 3)}/>`
    const seams = style === 'long' ? 'M245 345 L270 190 M555 345 L530 190' : 'M250 330 L270 190 M550 330 L530 190'
    return `<path d="${body} ${neck}" fill="${c}" ${S(d)}/>${extra}<path d="${seams} M250 575 H550" stroke="${d}" stroke-width="3" fill="none"/>
      <path d="M300 340 Q330 460 310 590" stroke="${l}" stroke-width="10" fill="none" opacity=".45" stroke-linecap="round"/>`
  },
  hoodie(c, style) {
    const d = shade(c, -0.28), l = shade(c, 0.15)
    const body = 'M290 215 L190 262 L118 545 L190 565 L255 365 L255 612 L545 612 L545 365 L610 565 L682 545 L610 262 L510 215 Q400 275 290 215 Z'
    const hood = style === 'crew'
      ? `<path d="M290 215 Q400 285 510 215" fill="none" stroke="${d}" stroke-width="16"/>`
      : `<path d="M295 205 Q300 80 400 78 Q500 80 505 205 Q400 272 295 205 Z" fill="${shade(c, -0.12)}" ${S(d)}/><path d="M335 218 Q400 300 465 218" fill="none" stroke="${d}" stroke-width="3"/>`
    const front = style === 'zip'
      ? `<path d="M400 268 V612" stroke="#dcdcdc" stroke-width="6" stroke-dasharray="3 3"/>`
      : `<path d="M300 470 H500 L525 565 H275 Z" fill="${l}" ${S(d, 3)}/>`
    const strings = style === 'hood' ? `<path d="M372 268 V352 M428 268 V352" stroke="#e9e9e9" stroke-width="5" stroke-linecap="round"/>` : ''
    return `<path d="${body}" fill="${c}" ${S(d)}/>${hood}${front}${strings}<path d="M255 365 L290 215 M545 365 L510 215 M255 590 H545" stroke="${d}" stroke-width="3" fill="none"/>`
  },
  pants(c, style) {
    const d = shade(c, -0.25), l = shade(c, 0.15)
    if (style === 'short') {
      return `<path d="M280 160 H520 L560 430 H430 L400 290 L370 430 H240 Z" fill="${c}" ${S(d)}/><rect x="280" y="160" width="240" height="40" fill="${d}"/><path d="M400 200 V290" stroke="${d}" stroke-width="3"/>`
    }
    if (style === 'jogger') {
      return `<path d="M280 150 H520 L542 560 L470 610 L440 555 L400 320 L360 555 L330 610 L258 560 Z" fill="${c}" ${S(d)}/><rect x="280" y="150" width="240" height="44" fill="${d}"/><path d="M385 172 v44 M415 172 v44" stroke="#e7e7e7" stroke-width="5" stroke-linecap="round"/><path d="M258 560 L330 610 M542 560 L470 610" stroke="${d}" stroke-width="16"/>`
    }
    let extra = `<path d="M300 200 Q330 250 352 212 M500 200 Q470 250 448 212" fill="none" stroke="${d}" stroke-width="3"/>`
    if (style === 'cargo') extra = `<rect x="268" y="410" width="92" height="110" rx="8" fill="${l}" ${S(d, 3)}/><rect x="440" y="410" width="92" height="110" rx="8" fill="${l}" ${S(d, 3)}/>`
    if (style === 'jean') extra = `<path d="M300 200 Q335 255 355 210 M500 200 Q465 255 445 210 M400 194 V310 M262 560 H345 M455 560 H538" fill="none" stroke="#e8c27a" stroke-width="3" stroke-dasharray="8 6"/>`
    if (style === 'suit') extra = `<path d="M318 200 L298 620 M482 200 L502 620" stroke="${d}" stroke-width="3" opacity=".6"/><path d="M300 150 v-14 M400 150 v-14 M500 150 v-14" stroke="${d}" stroke-width="8"/>`
    return `<path d="${LEGS}" fill="${c}" ${S(d)}/><rect x="280" y="150" width="240" height="44" fill="${d}"/><circle cx="400" cy="172" r="7" fill="${l}"/><path d="M400 194 V310" stroke="${d}" stroke-width="3"/>${extra}`
  },
  sneaker(c, style) {
    const d = shade(c, -0.3), l = shade(c, 0.35)
    const sole = style === 'run' ? shade(c, 0.7) : '#f3f0ea'
    const high = style === 'high' ? `<path d="M160 480 C155 330 175 222 255 212 L345 222 L352 335 L240 338 Z" fill="${c}" ${S(d)}/><circle cx="230" cy="300" r="9" fill="${l}"/>` : ''
    return `${high}<path d="M155 500 C150 420 170 340 240 330 L330 340 C360 300 400 270 440 290 C500 380 560 400 640 430 C690 450 700 480 690 505 Z" fill="${c}" ${S(d)}/>
      <path d="M150 495 H695 Q705 565 640 568 H200 Q150 568 150 495 Z" fill="${sole}" ${S(d)}/>
      <path d="M240 468 Q380 418 560 448" stroke="${l}" stroke-width="16" fill="none" stroke-linecap="round"/>
      <path d="M350 330 l35 -25 M385 350 l35 -25 M420 370 l35 -25 M455 390 l35 -25" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
      <path d="M600 440 Q660 455 685 497" stroke="${d}" stroke-width="3" fill="none"/>`
  },
  shoe(c, style) {
    const d = shade(c, -0.35), l = shade(c, 0.2)
    const boot = style === 'boot' ? `<path d="M185 500 C180 330 190 215 262 205 L352 205 C362 262 352 332 362 352 L255 348 Z" fill="${c}" ${S(d)}/><path d="M200 300 H350" stroke="${d}" stroke-width="3"/>` : ''
    const detail = style === 'loafer'
      ? `<rect x="330" y="352" width="120" height="28" rx="10" fill="${l}" ${S(d, 3)}/>`
      : style === 'boot' ? '' : `<path d="M350 350 l30 -14 M385 358 l30 -14 M420 366 l30 -14" stroke="${l}" stroke-width="7" stroke-linecap="round"/>`
    return `${boot}<path d="M165 495 C165 410 185 350 255 345 L345 350 C390 335 430 325 470 350 C540 395 620 405 670 465 C695 495 690 512 690 512 L165 512 Z" fill="${c}" ${S(d)}/>
      <path d="M160 505 H695 V535 Q695 548 680 548 H175 Q160 548 160 532 Z" fill="#2a2018"/><path d="M190 548 H330 V572 H190 Z" fill="#2a2018"/>
      <path d="M520 385 Q565 430 565 510" stroke="${d}" stroke-width="3" fill="none"/>${detail}`
  },
  watch(c, style) {
    const d = shade(c, -0.3), strap = shade(c, style === 'sport' || style === 'digital' ? -0.1 : -0.3)
    const dark = style === 'sport' || style === 'digital'
    const dial = dark ? '#14181d' : '#f7f3ea', ink = dark ? '#f0f0f0' : '#222'
    let marks = ''
    const n = style === 'minimal' ? 4 : 12
    for (let i = 0; i < 12; i += 12 / n) {
      const a = (i * Math.PI) / 6
      marks += `<line x1="${400 + Math.sin(a) * 100}" y1="${400 - Math.cos(a) * 100}" x2="${400 + Math.sin(a) * 114}" y2="${400 - Math.cos(a) * 114}" stroke="${ink}" stroke-width="${style === 'minimal' ? 3 : i % 3 ? 4 : 8}"/>`
    }
    let face = `${marks}<line x1="400" y1="400" x2="400" y2="332" stroke="${ink}" stroke-width="${style === 'minimal' ? 6 : 10}" stroke-linecap="round"/>
      <line x1="400" y1="400" x2="452" y2="362" stroke="${ink}" stroke-width="${style === 'minimal' ? 4 : 7}" stroke-linecap="round"/>
      <line x1="400" y1="420" x2="372" y2="468" stroke="#e8481c" stroke-width="3"/><circle cx="400" cy="400" r="9" fill="${d}"/>`
    if (style === 'digital') face = `<rect x="325" y="365" width="150" height="72" rx="8" fill="#0d1b12"/><text x="400" y="420" text-anchor="middle" font-family="monospace" font-size="46" fill="#7dffb2">10:08</text>`
    if (style === 'chrono') face += `<circle cx="345" cy="400" r="26" fill="none" stroke="${ink}" stroke-width="3"/><circle cx="455" cy="400" r="26" fill="none" stroke="${ink}" stroke-width="3"/><circle cx="400" cy="458" r="26" fill="none" stroke="${ink}" stroke-width="3"/>`
    return `<path d="M335 120 H465 L480 270 H320 Z" fill="${strap}" ${S(d, 3)}/><path d="M320 530 H480 L465 680 H335 Z" fill="${strap}" ${S(d, 3)}/>
      <circle cx="400" cy="590" r="7" fill="${d}"/><circle cx="400" cy="630" r="7" fill="${d}"/><rect x="555" y="385" width="34" height="30" rx="6" fill="${d}"/>
      <circle cx="400" cy="400" r="165" fill="${c}" stroke="${d}" stroke-width="6"/><circle cx="400" cy="400" r="138" fill="${shade(c, 0.25)}"/><circle cx="400" cy="400" r="122" fill="${dial}"/>${face}`
  },
  bag(c, style) {
    const d = shade(c, -0.3), l = shade(c, 0.15)
    if (style === 'messenger') {
      return `<path d="M225 300 Q400 20 575 300" fill="none" stroke="${d}" stroke-width="22" stroke-linecap="round"/><rect x="190" y="300" width="420" height="290" rx="30" fill="${c}" ${S(d)}/>
        <path d="M190 330 Q190 300 220 300 H580 Q610 300 610 330 V420 Q400 490 190 420 Z" fill="${l}" ${S(d)}/><rect x="375" y="440" width="50" height="40" rx="6" fill="#c9a227" stroke="#8a6d10" stroke-width="3"/>`
    }
    if (style === 'tote') return `<path d="M330 310 Q330 170 400 170 Q470 170 470 310" fill="none" stroke="${d}" stroke-width="16"/><path d="M255 310 H545 L580 620 H220 Z" fill="${c}" ${S(d)}/><path d="M255 350 H545" stroke="${d}" stroke-width="3"/>`
    if (style === 'pouch') return `<path d="M570 400 Q660 380 645 480" fill="none" stroke="${d}" stroke-width="14"/><rect x="230" y="330" width="340" height="230" rx="40" fill="${c}" ${S(d)}/><path d="M252 385 H548" stroke="${d}" stroke-width="4" stroke-dasharray="12 8"/><rect x="385" y="376" width="30" height="26" rx="6" fill="#c9a227"/>`
    return `<path d="M345 205 Q345 130 400 130 Q455 130 455 205" fill="none" stroke="${d}" stroke-width="16"/><rect x="250" y="200" width="300" height="400" rx="80" fill="${c}" ${S(d)}/>
      <path d="M270 300 H530" stroke="${d}" stroke-width="3" stroke-dasharray="10 7"/><rect x="285" y="400" width="230" height="160" rx="32" fill="${l}" ${S(d, 3)}/>
      <path d="M305 432 H495" stroke="${d}" stroke-width="4" stroke-linecap="round"/><path d="M250 300 Q212 420 250 540 M550 300 Q588 420 550 540" fill="none" stroke="${d}" stroke-width="12" stroke-linecap="round"/>`
  },
  glasses(c, style) {
    const lens = '#26323d'
    const hi = `<path d="M205 365 Q235 350 275 352 M470 365 Q500 350 540 352" stroke="#fff" stroke-width="8" opacity=".3" stroke-linecap="round" fill="none"/>`
    if (style === 'round') return `<path d="M200 380 L120 352 M600 380 L680 352" stroke="${c}" stroke-width="14" stroke-linecap="round"/><circle cx="290" cy="400" r="92" fill="${lens}" stroke="${c}" stroke-width="14"/><circle cx="510" cy="400" r="92" fill="${lens}" stroke="${c}" stroke-width="14"/><path d="M382 390 Q400 372 418 390" fill="none" stroke="${c}" stroke-width="12"/>${hi}`
    if (style === 'sport') return `<path d="M140 385 L100 365 M660 385 L700 365" stroke="${c}" stroke-width="14" stroke-linecap="round"/><path d="M140 380 Q400 325 660 380 Q668 470 592 486 Q520 496 480 440 Q400 410 320 440 Q280 496 208 486 Q132 470 140 380 Z" fill="${lens}" stroke="${c}" stroke-width="14" stroke-linejoin="round"/><path d="M200 395 Q300 365 380 385" stroke="#fff" stroke-width="8" opacity=".3" stroke-linecap="round" fill="none"/>`
    return `<path d="M170 372 L112 350 M630 372 L688 350" stroke="${c}" stroke-width="16" stroke-linecap="round"/><rect x="165" y="325" width="205" height="150" rx="62" fill="${lens}" stroke="${c}" stroke-width="18"/><rect x="430" y="325" width="205" height="150" rx="62" fill="${lens}" stroke="${c}" stroke-width="18"/><path d="M370 385 Q400 358 430 385" fill="none" stroke="${c}" stroke-width="14"/>${hi}`
  },
  cap(c, style) {
    const d = shade(c, -0.3), b = shade(c, -0.15)
    const brim = style === 'snapback'
      ? `<path d="M190 455 H650 L710 505 H200 Z" fill="${b}" ${S(d)}/>`
      : `<path d="M190 450 Q400 428 660 478 Q700 510 625 530 Q400 488 190 480 Z" fill="${b}" ${S(d)}/>`
    return `<path d="M200 455 C200 270 330 205 430 215 C540 225 610 320 610 455 Z" fill="${c}" ${S(d)}/>
      <path d="M430 215 C400 285 400 365 410 455 M430 215 C500 275 540 355 545 455" fill="none" stroke="${d}" stroke-width="3"/><circle cx="430" cy="215" r="12" fill="${d}"/>${brim}`
  },
  beanie(c) {
    const d = shade(c, -0.3), b = shade(c, -0.12)
    let ribs = ''
    for (let x = 262; x < 550; x += 32) ribs += `<path d="M${x} 458 V532" stroke="${d}" stroke-width="3"/>`
    return `<path d="M240 470 C240 270 350 200 400 200 C450 200 560 270 560 470 Z" fill="${c}" ${S(d)}/><rect x="225" y="448" width="350" height="92" rx="24" fill="${b}" ${S(d)}/>${ribs}`
  }
}

const BG = [['#f6f3ee', '#d8d3ca'], ['#efeafd', '#c9bff0'], ['#fff0e6', '#f3bd9e']]
function art(shape, style, hex, view, transparent = false) {
  const tf = view === 1 ? '' : view === 2 ? 'transform="rotate(-7 400 400) translate(10 15)"' : 'transform="translate(400 380) scale(1.55) translate(-400 -330)"'
  const shadow = view === 3 || transparent ? '' : '<ellipse cx="400" cy="700" rx="230" ry="18" fill="#000" opacity=".14"/>'
  const [a, b] = BG[view - 1]
  const bg = transparent ? '' : `<defs><radialGradient id="g" cx="50%" cy="40%" r="80%"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient></defs><rect width="800" height="800" fill="url(#g)"/>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" role="img">${bg}${shadow}<g ${tf}>${shapes[shape](hex, style)}</g></svg>`
}

let n = 0
for (const p of products) {
  for (const c of p.colors) {
    for (let v = 1; v <= 3; v++) {
      writeFileSync(new URL(`${p.slug}-${c.id}-${v}.svg`, OUT), art(p.illustration.shape, p.illustration.style, c.hex, v))
      n++
    }
  }
}

// Visuels détourés (fond transparent) pour le hero flottant
const floats = { sneaker: ['sneaker', 'urban', '#ff5a1f'], hoodie: ['hoodie', 'hood', '#ece9ff'], watch: ['watch', 'classic', '#e0b23a'], glasses: ['glasses', 'classic', '#ff2d95'], cap: ['cap', 'snapback', '#8b5cf6'], bag: ['bag', 'messenger', '#f1ece2'] }
for (const [name, [shape, style, hex]] of Object.entries(floats)) writeFileSync(new URL(`float-${name}.svg`, OUT), art(shape, style, hex, 1, true))

writeFileSync(new URL('../logo.svg', OUT), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff5a1f"/><stop offset="1" stop-color="#ff2d95"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="#07070b"/><path d="M14 48 L32 14 L50 48 H40 L32 31 L24 48 Z" fill="url(#a)"/></svg>`)
writeFileSync(new URL('placeholder.svg', OUT), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" role="img"><rect width="800" height="800" fill="#1a1a24"/><text x="400" y="410" text-anchor="middle" font-family="sans-serif" font-size="30" fill="#8d8aa5">Image indisponible</text></svg>`)
console.log(`✓ ${n} visuels + ${Object.keys(floats).length} visuels flottants générés dans public/img/`)
