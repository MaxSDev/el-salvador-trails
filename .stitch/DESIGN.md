---
name: El Salvador Trails
colors:
  parchment: "#FBF8ED"
  aged-paper: "#F7EEDA"
  card-white: "#FFFFFF"
  deep-mahogany: "#1C1714"
  aged-oak: "#251E19"
  walnut-ink: "#3A2416"
  faded-sepia: "#6F5F4F"
  guanacaste-maroon: "#7E1500"
  maroon-hover: "#D12400"
  volcano-gold: "#E9C262"
  gold-deep: "#E6B300"
  gold-washed-paper: "#FFDF98"
  deep-ember: "#3D0800"
  coffee-leaf-lime: "#A9BF01"
  antique-parchment: "#E8DFD4"
  faded-ink: "#9C8B7A"
  heritage-gold-veil: "rgba(233, 194, 98, 0.12)"
  maroon-hairline: "rgba(126, 21, 0, 0.08)"
  maroon-hairline-strong: "rgba(126, 21, 0, 0.2)"
---

# Design System: El Salvador Trails

**Project ID:** el-salvador-trails
**Product:** El Salvador Trails — Senderos de El Salvador. Boutique tour operator founded 2024 by Mario Domínguez in San Salvador; the site ships in Español, English and Português.
**Source of truth:** `Mockups Diseño/` — `styles.css`, `carrousel.css`, `i18n.js`, `content/tours.json`, `content/reviews.json`, `index.html`, `tours.html`, `about.html`, and the Academia/Classical design system in `design-system.xml` at the repository root.

---

## 0. How This Document Relates to the Source

Every value below is read out of the source files. Nothing is invented; nothing is placeholder.

| Kind | Status |
|:---|:---|
| Colors, type, radii, shadows, spacing, motion | **Shipped** — literal values from `styles.css` / `carrousel.css` |
| Component structure and copy | **Shipped** — literal from `index.html`, `tours.html`, `about.html`, `i18n.js` |
| Heritage Field decorative system | **Designed but not wired** — fully tokenized in `styles.css`, zero call sites in any HTML page. Treat as pre-approved vocabulary, not as a current rendering. |
| `design-system.xml` "Bold Factor" motifs (arch-tops, Roman numerals, drop caps, sepia-to-color, wax seals, brass gradients) | **Aspiration, not implementation** — the root design system describes Academia/Classical; the built site adopts its *atmosphere* (warm woods, parchment, brass) but none of its signature CSS. Do not claim these as existing. |

> **Open items to resolve before generating new screens** — genuine contradictions in the current source, listed so they are not silently promoted into the design system:
> 1. The carousel slide keyed `slide2.title` reads **"Puerta del Diablo"** while `slide2.desc` describes **"Un majestuoso lago de origen volcánico ubicado en Santa Ana… aguas cristalinas… turquesa"** — a description of Lago de Coatepeque. Title and copy disagree (`i18n.js`, ES/EN/PT alike).
> 2. The first destination tab is **"El Tunco"** but the first slide it fronts is **"Playa El Sunzal"**; the tabs (El Tunco / Ruta de las Flores / Lago de Coatepeque / Volcán de Santa Ana) do not map 1:1 to the four slides (El Sunzal / Ruta de las Flores / Puerto del Diablo / Centro Histórico).
> 3. `about.html` uses `pattern-sun` / `pattern-coffee` / `pattern-crops` classes that are **defined nowhere in `styles.css`** (only inside the Google-Stitch export `code.html`, pointing at remote `lh3.googleusercontent.com` URLs). The decorative layer on those pages currently renders nothing; the tokenized **Heritage Field** (§7) is the intended local replacement.

---

## 1. Visual Theme & Atmosphere

**A warm, paper-and-wood travel office that happens to be a website.** The light theme is built on cream and parchment (`#FBF8ED`, `#F7EEDA`) with a deep guanacaste maroon (`#7E1500`) doing all the authority work and a single signature gold (`#E9C262`) carrying every call to action. Shadows are almost invisible — the default card shadow is `0 4px 20px rgba(0,0,0,0.02)`, which is a whisper, not a lift. Separation is done with hairlines and tinted parchment, never with darkness. The overall read is editorial and unhurried: it looks like a printed brochure from an operator that has been doing this since 1999, not like a startup landing page.

**The dark theme is not a filter — it is a second, older room.** `.dark` swaps the entire token set to deep mahogany (`#1C1714`) and aged oak (`#251E19`), inverts maroon to gold (the brand color literally becomes `#E9C262`), and *changes the typeface mix*: Fraunces and Work Sans give way to EB Garamond and Cinzel. This is the "library at night" register and it is worth protecting — it is a deliberate move, not an oversight. On top of both themes sits the **Heritage Field**: coffee-plant, coffee-cup, coffee-bag, sun and foliage SVGs at 3.5%–10% opacity, `mix-blend-mode: multiply` in light (ink on paper) and `filter: brightness(0) invert(1)` in dark (parchment silhouettes on wood). Density is deliberately **low** — the brief specifies international travellers 35+ and tour operators, and explicitly says "sin sobrecarga". This is not a cockpit.

---

## 2. Color Palette & Roles

### Primary Foundation
| Name | Value | Role |
|:---|:---|:---|
| **Parchment** | `#FBF8ED` | Page canvas, light mode. Also the nav background and the color of the `✶` glyph's knockout disc on the ornate divider. |
| **Aged Paper** | `#F7EEDA` | Surface tier: testimonial cards, language-switcher pill, footer, the pricing panel behind the quote form. One step darker than the canvas — this is how depth is expressed, not shadows. |
| **Card White** | `#FFFFFF` | Raised surface (`--surface-raised`) for tour cards and the tour-detail modal. The only pure-white value in the system. |
| **Deep Mahogany** | `#1C1714` | Dark-mode canvas (`--bg`). Explicitly *not* pure black — this is the Academia warm-dark rule being honoured. |
| **Aged Oak** | `#251E19` | Dark-mode surface and raised surface. |

### Accent & Interactive
| Name | Value | Role |
|:---|:---|:---|
| **Volcano Gold** | `#E9C262` | The one accent. Primary CTA fill, active destination tab, active thumbnail outline, testimonial stars, quote mark, `✶` bullet glyph, focus ring, brass hairline borders. In dark mode it *is* the brand color. |
| **Guanacaste Maroon** | `#7E1500` | Brand color in light mode: wordmark, `h2`/`h3` headings, nav active state, outline on secondary buttons, quote-historial border, scrollbar thumb. |
| **Deep Ember** | `#3D0800` | Text sitting on gold — buttons, active tabs. Near-black but warm, never `#000000`. |
| **Maroon Hover** | `#D12400` | Live accent used on nav hover and footer link hover. |
| **Gold Deep** | `#E6B300` | `:focus-visible` outline and nav underline accent. |
| **Coffee-Leaf Lime** | `#A9BF01` | Reserved for the nav byline under the wordmark (`.brand-subtext`, 10.5px, `letter-spacing: 0.16em`). Currently unpopulated — the span renders empty. Keep the slot; do not repurpose the color. This color is now deprecated |

### Typography & Text Hierarchy
| Name | Value | Role |
|:---|:---|:---|
| **Walnut Ink** | `#3A2416` | Primary body text and heading color in the carousel card (`--card-title`). Warm brown-black. |
| **Faded Sepia** | `#6F5F4F` | Secondary text: tour card descriptions, form helper labels, captions. |
| **Antique Parchment** | `#E8DFD4` | Dark-mode primary text. |
| **Faded Ink** | `#9C8B7A` | Dark-mode secondary text and tertiary labels. |
| **Maroon Hairline** | `rgba(126, 21, 0, 0.08)` | The default `--border` in light mode. Structural lines you feel more than see. |
| **Maroon Hairline Strong** | `rgba(126, 21, 0, 0.2)` | `--border-strong`: icon-ring outlines, theme-toggle ring, card hover border. |
| **Heritage Gold Veil** | `rgba(233, 194, 98, 0.12)` | `--brand-soft` in dark mode: tinted fills behind trust badges, photo badges, the TikTok/Instagram video strip. |

**Colour temperature is warm exclusively.** There is no cool grey anywhere in this system — every neutral carries red or yellow. Any new screen must not introduce a blue-grey; mixing temperature is the single fastest way to break this identity.

---

## 3. Typography Rules

Six families are in play. The mix is intentional and should be reproduced exactly, not consolidated.

**Shipped stack (light mode):**
- **Display / card headings** — `Fraunces` (variable, `opsz` 9–144), serif. Headings, tour-card `h2`, testimonial author names, the ornamental quote mark (rendered at 3.5rem in gold at 0.4 opacity).
- **Brand wordmark** — `Adlery Pro`, local WOFF2 (`assets/fonts/AdleryPro.woff2`, 79 KB, `font-display: swap`). Used *only* for the nav word (20px, uppercase, `letter-spacing: 0.01em`) and the footer wordmark (1.5rem, uppercase, `letter-spacing: -0.05em`). This is the client's official brand face — do not substitute it.
- **Body** — `Fira Sans`, sans-serif (300/400/500/600). All running copy, `.prose` at `line-height: 1.7`.
- **Labels & UI chrome** — `Cinzel`, serif, uppercase, `letter-spacing: 0.1em`–`0.3em`. Every button (`btn-accent`, `cta-btn`), the "Conecta con nosotros" overline (11px, `0.3em`), form section labels.
- **Navigation & small caps** — `Work Sans`, sans-serif. Nav links (14.5px / 500), help button (12px), lang pill (12px / 600), footer links (10px / `0.1em`), copyright (10px). Also the tab chrome in light mode.

**Shipped stack (dark mode) — a genuine typeface swap:**
- Card headings and slide titles → **`EB Garamond`** (serif, weight drops from 700 to 400).
- Destination tabs → **`Cinzel`** (serif, uppercase, `letter-spacing: 0.1em`, weight 400; active tab 700).
- `Fraunces` and `Work Sans` remain only where the light-mode token is not overridden.

**Hierarchy:**

| Step | Value | Treatment |
|:---|:---|:---|
| Brand title (carousel) | `2.25rem` | `Fira Sans` 900, `line-height: 0.95`, `letter-spacing: -0.04em`, uppercase, maroon |
| Catalog page title | `44px` → `56px` @md | `Fraunces`, `font-bold`, `tracking-tight`, `leading-none`, maroon |
| Card heading (`h1` in hero) | `1.7rem` | Fraunces 700, `letter-spacing: -0.02em`; max-width 600px on the paragraph below |
| Tour card `h2` | `1.875rem` | Fraunces 700, maroon, 1.25rem below |
| Tour card `h3` (in list) | `1.25rem` (text-xl) | Fraunces 700, maroon |
| Slide detail `h3` | `1.3rem` | Fraunces/EB Garamond 600 (400 in dark), `--card-title` |
| Body / prose | `1rem`, `line-height: 1.7` | Fira Sans, `--text-muted` in lists |
| Small / meta | `0.75rem`–`0.875rem` | Fira Sans, muted; 10–11px for overlines |

**Spacing principles:** headings run track-tight and negative (`-0.02em`, `-0.04em`, `-0.05em`) — display type is packed, never airy. Labels run track-loose and positive (`+0.1em` to `+0.3em`, always uppercase) — every piece of UI chrome is a small engraved plate. Body copy stays at a relaxed `1.6`–`1.7`. The carousel description column is capped at 600px to keep lines short for the 35+ audience.

---

## 4. Component Stylings

### Navigation
A fixed 92px bar (84px ≤1024px) in `Parchment` with an `rgba(126,21,0,0.08)` bottom border, `backdrop-filter: blur(10px)` and the near-invisible `0 4px 20px rgba(0,0,0,0.02)`. Left: 64×64 `logo.svg` mark beside the Adlery Pro wordmark. Centre: `Página Inicial · Catálogo de Tours · About Us · Bienes Raíces · Pago en Línea` at `Work Sans` 14.5px/500, `gap: 40px`, with a 2px bottom border that is transparent at rest, gold on hover and on `.active` (weight rises to 600). Right, `gap: 18px`: a pill-shaped outline help button, a 40×40 circular theme toggle (outline `--border-strong`, fills maroon and scales `1.06` on hover), and the language pill. **The language pill is a real component, not a dropdown** — a `Parchment` capsule with 3px padding holding `ES | EN | PT` at 12px/600; the active one is a solid maroon capsule with `Parchment` text, the others sit at `opacity: 0.55`. Below 1024px the link list is `display: none` — the hamburger is planned and not yet built.

### Buttons
- **Gold primary (`btn-accent` / `cta-btn`)** — `Volcano Gold` fill, `Deep Ember` text, `8px` radius, `Cinzel` 600 uppercase at `0.1em`. The tour CTA is `13px 26px`; the full-width card button adds `py-4`. Hover inverts to **maroon with white text** and translates `-1px` (`cta-btn` uses `-2px`). This inversion is the system's strongest interaction signal.
- **Outlined / ghost (`help-tutorial-btn`)** — fully pill (`999px`), transparent, `1.4px solid maroon`, `Work Sans` 12px/500. Hover fills with `--brand-soft`.
- **Circular controls (`theme-toggle-btn`, `testimonials-nav-btn`, `social-connect-icon`)** — 40–44px circles, `999px` radius, hairline border, fill with maroon (or `--brand-soft`) and scale `1.06`–`1.1` on hover.
- **Disabled state** (`Personalized Experience`) — `opacity: 0.5`, `cursor: not-allowed`, no colour change, and the label swaps to "Próximamente" / "Coming Soon" / "Em breve" with a `construction` icon.

### Cards & Containers
- **Destination card** — the hero. `24px` radius, `3rem` (2rem ≤900px) internal padding, `1px solid rgba(126,21,0,0.14)` border, and a genuinely deep colour-tinted shadow: `0 24px 60px rgba(126,21,0,0.25)` light / `0 40px 100px rgba(0,0,0,0.9)` dark. Inside it, two stacked `.bg-layer` divs cross-fade the active photograph over 1s at `filter: blur(0.5px) brightness(1.1) saturate(1.1)` (light) or `blur(0.3px) brightness(0.5) saturate(1.2)` (dark), under an overlay of `rgba(251,248,237,0.82)` or `rgba(28,23,20,0.7)`. This photograph-as-its-own-background treatment is the card's identity — the meeting notes record it as "validado y elogiado por el cliente".
- **Tour card** — `16px` radius, `Card White` on a hairline, shadow `0 4px 20px rgba(0,0,0,0.02)` rising to `0 20px 40px rgba(126,21,0,0.06)` on hover, with `translateY(-5px)` in the category grid and `-8px` in the tour list. Image on top at `aspect-[16/10]`, `object-cover`, scaling to `1.05` over 700ms on hover.
- **Testimonial card / feedback dialog** — `1.25rem` radius, `Aged Paper` fill, dashed top border separating the author block, `0 8px 24px rgba(0,0,0,0.04)`. Hover tints the border gold and lifts `-4px`. The feedback dialog is `max-width: 34rem`, `2rem` padding, scale-in from `0.95` over 300ms.
- **About card** — `1rem` radius, `--surface`, hover `translateY(-3px)` with a gold border.

### Inputs & Forms
`8px` radius, `1px` hairline border, `--surface-raised` fill, `0.875rem` text, `px-3 py-2`. The focus state is subtle and consistent: `border-color` moves to gold, **not** a heavy ring (the global `:focus-visible` supplies a 2px `#E6B300` outline at `2px` offset for keyboard users). Labels sit **above** the field — never floating — as `0.75rem` semibold uppercase with `tracking-wider`. The file input is bespoke: a fully-rounded gold-soft `file:` button reading "Adjuntar fotos (opcional, máx. 4 imágenes)", accepting `image/jpeg,image/png,image/webp`, multiple. Placeholders are written in Spanish and are real: `Ej. Sarah Jenkins`, `Ej. Canadá, Estados Unidos, etc.`, `Cuéntanos cómo fue tu experiencia...`.

### Domain-Specific Components

**Destination carousel (home hero).** A `1200px`-max container holds one `destination-card`. Order inside: card heading ("Top destinos más buscados del país") over a one-line subtitle, then a row of pill tabs (`El Tunco`, `Ruta de las Flores`, `Lago de Coatepeque`, `Volcán de Santa Ana`) at `7px 16px` padding, `0.8rem`, `Work Sans` light / `Cinzel` uppercase dark. Below, an asymmetric two-column grid at **`1fr 1.3fr`** with `50px` gap: left is the brand title "Descubre El Salvador" over a `border-left: 2px solid gold` quote block (title + description, `min-height: 110px` to stop the card resizing between slides) and the gold CTA "Explora el Catálogo de Tours"; right is a `16/9` main image with `16px` radius and `0 20px 40px` tinted shadow, above a 4-up thumbnail grid at `11px` gap where inactive thumbs sit at `opacity: 0.5` and the active one takes a 2px gold outline. Autoplay runs at **4000ms** (`AUTOPLAY_TIME`).

**Tour catalog — a three-view state machine, not a page of cards.** `tours.js` renders three mutually exclusive views: **categories** → **list** → **detail modal**. The category view is three `tour-card`s (Day Tours / Tour Packages / Personalized Experience), each with an image, an `h2`, four `✶`-bulleted capabilities pulled from `i18n.js`, and a full-width gold "Ver más" button. Clicking moves to a list grid — `lg:grid-cols-4` for Day Tours, `lg:grid-cols-2` for Packages — with a "Volver" back-link and the category name as heading. Cards carry an `aspect-[16/10]` image, title, 3-line-clamped `shortDescription`, the first two highlights, and a bottom meta row reading **"Precios y condiciones: contáctenos"** with a `price_check` icon above a divider. Every card is `tabindex="0" role="button"` with Enter/Space activation.

**Tour detail modal.** `max-w-4xl`, `rounded-2xl`, `max-h-[90vh]`, with a **sticky** header carrying the title and a circular close button. Body order: image gallery with `aspect-video`, prev/next chevrons at `bg-black/50` and white dot indicators → full description as `\n\n`-split paragraphs → *if package only:* itinerary as a vertical list of `border-l-4 border-brand` blocks headed `Día N: Título` → *if package only:* "Incluido" as a 2-column list with green `check_circle` icons → "Destacados" as a `✶` list → the TikTok/Instagram video strip (`--brand-soft` fill, gold play icon, gold outline button with the brand glyph and `open_in_new`) → the quotation panel. The modal traps focus and restores it to the originating card on close.

**Quotation panel — the commercial heart.** A gold-bordered panel on `--surface` headed "Precios y condiciones: contáctenos" with a `request_quote` icon and the notice *"Nuestras tarifas se adaptan al tamaño y necesidades específicas de su grupo (los niños menores de 12 años gozan de tarifa especial al 50%). Permítanos diseñar su cotización personalizada."* Below a divider: three inputs — **Adultos** (`number`, min 1, max 50, default 2), **Niños (<12 años - 50%)** (`number`, min 0, max 50, default 0), **Fecha estimada** (`date`) — then two equal-weight actions: a gold `btn-accent` "Cotizar por WhatsApp" and an outlined "Cotizar por Correo". Both pre-compose a real, formatted message naming the tour and the traveller's preferred language, then open `wa.me/50370000000` or `mailto:info@elsalvadortrails.com`. **There is no cart and no price anywhere in this system** — it is a quote-request surface by design.

**Testimonial carousel.** A `72rem` section with a centred `Fraunces` heading "Lo que dicen nuestros viajeros" and a `max-w-2xl` subtitle. Slides go 1-up → 2-up @768px → 3-up @1024px, translating on `transform` over `0.5s cubic-bezier(0.2, 0.8, 0.2, 1)`, autoplaying at **6000ms** and pausing on hover, focus and touch. Each card carries a 3.5rem gold `"` at 0.4 opacity, a `material-symbols` star row (`FILL` 1 for earned, `star_border` for not), the comment in `0.9375rem` italic at `1.65`, an optional `N foto(s)` pill badge, and an author block separated by a **dashed** top border: a 44px circular avatar — a real image if `avatarUrl` exists, otherwise a monogram in a gold-ringed `--brand-soft` circle using the first and last initials (`EST` when the name is missing). Controls are two 44px circular buttons flanking dots that scale `1.25` and turn gold when active. Below sits the gold-outlined `rate_review` prompt "¿Viajaste con nosotros? Comparte tu experiencia".

**The moderation contract is visible in the UI.** `testimonials.js` filters on `moderation.status === 'approved' && moderation.featured === true` and calls that filter "INVIOLABLE"; `reviews.json` ships one `pending` review purely to prove it does not render. The feedback form states the rule in copy — *"Nota: Toda reseña entra en estado pendiente y es moderada por nuestro equipo antes de publicarse."* — and the submit button reads "Enviar para revisión" / "Submit for review" / "Enviar para moderação". Any new screen that shows traveller content must carry the same pending state and the same disclosure.

**Ornate divider.** A 1px horizontal gradient — transparent → `rgba(126,21,0,0.15)` at 20% → solid maroon at 50% → back to transparent — with a gold `✶` glyph centred on a knockout disc filled with `--ornate-glyph-bg` (the page background) and `0 16px` padding. Used at `3rem` vertical margin (`my-16` on the home page). In dark mode the gradient becomes gold-on-mahogany. This is the site's primary section separator; it should be used instead of empty space or a plain rule.

**Heritage Field (designed, not wired).** A `position: absolute; inset: 0` decorative layer with a vignette `::after` (`radial-gradient(ellipse at center, transparent 52%, rgba(126,21,0,0.05) 135%)` light / `transparent 45%, rgba(0,0,0,0.28) 135%` dark). Eight placements with a documented hierarchy — hero sun (820px, `-14% / -9%`, strongest opacity) > corner foliage (360px top-right rotated `180deg`, 300px bottom-left) > narrative elements (coffee plant at `34% / 1.5%`, cup at `15% / 3.5%`, bag at bottom-right, sun seal centred at 360px). Opacities step `0.10 / 0.07 / 0.05` in light and `0.06 / 0.045 / 0.035` in dark. Responsive: at ≤767px everything hides except a 460px hero sun; at 768–1023px the cup and bag hide and the plant drops to 210px. If a new screen needs ambience, this is the approved vocabulary — but restore `pattern-*`/`brand-pattern-base` classes to *defined local SVGs* first, never to the remote `lh3.googleusercontent.com` URLs in `code.html`.

---

## 5. Layout Principles

**Grid & structure.** Two container widths, deliberately different: the destination carousel at **1200px** and the tour catalog at **1360px**, both centred, with card internals at `max-w-6xl` (1152px) and the testimonial section at `72rem` (1152px). The catalog page grid is `grid-cols-1 md:grid-cols-3 gap-10`. The hero content grid is the asymmetric **`1fr 1.3fr`** at `50px` gap — text left, gallery right. Desktop-first with min-width media queries throughout.

**Whitespace strategy.** An 8px-based rhythm with generous upper bounds: `3rem` / `2rem` card padding, `3rem` between header and tabs and between tabs and content, `1.75rem` under the brand title, `py-16` on the footer, `py-24` on the catalog's social section, `my-16` around ornate dividers. The source's own instruction — *"Don't pack content tightly"* and *"sin sobrecarga"* — is a client requirement, not a preference. When in doubt, add space rather than another section. The home page is intentionally thin: nav → carousel → divider → testimonials/feedback → divider → "Conecta con nosotros" → footer. **No "featured destinations" grid, no blog, no stats bar on the home page** — that omission is an explicit decision recorded in the meeting notes.

**Alignment & balance.** Text-left body copy, `max-w-3xl` centred subtitles, `max-w-6xl` centred sections. The carousel card is the one place that breaks the tiling with its 1:1.3 split. The gold `border-left: 2px` on `.slide-details` and `border-left-4 border-brand` on itinerary days give the layout a consistent left-hand spine.

**Responsive behaviour & touch.** Breakpoints: **1024px** (nav condenses, height 84px, links hidden), **900px** (carousel drops to one column, card padding 2rem, brand title ×0.8), **768px** (testimonials 2-up, tour list single column), **767px** (most heritage decoration hides). Interactive targets already clear 44px — thumbnails, testimonial nav buttons (44px), theme toggle (40px), social icons (42px). Carousel thumbnails keep `16/9`; tour card images are `16/10`; gallery mains are `16/9`.

---

## 6. Motion & Interaction

**The register is dignified and slow, matching the Academia brief ("nothing should feel snappy, bouncy, or playful") — there is no spring physics anywhere in this system, and adding one would be wrong.** Motion is entirely declared in CSS transitions.

| Motion | Duration / easing |
|:---|:---|
| Card hover lift | `transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)` |
| Testimonial track | `transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)`, `will-change: transform` |
| Carousel background cross-fade | `opacity 1s ease-in-out` |
| Main image swap | `opacity 0.4s ease-in-out` |
| Theme change (colour + shadow) | `0.35s ease` |
| Button press / hover | `0.2s`–`0.3s`, `translateY(-1px)` / `-2px` |
| Thumbnail and card-image reveal | `opacity 0.3s`, `scale 700ms` |
| Modal / dialog | `opacity 0.3s`, `transform: scale(0.95) → 1` |

Two perpetual loops exist and only two: the destination carousel at **4000ms** and the testimonial carousel at **6000ms**, both pause-on-hover/focus and swipe-enabled on touch (`|Δx| > 40px`). Animate `transform` and `opacity` only — the codebase already obeys this; keep it that way. **`prefers-reduced-motion: reduce` is a hard requirement, not a nicety**: a global block collapses all animation and transition durations to `0.01ms`, forces `animation-iteration-count: 1`, and disables smooth scrolling; `testimonials.js` additionally refuses to start autoplay at all under reduced motion. Any new animated component must join both mechanisms.

---

## 7. Accessibility Contract (non-negotiable in this codebase)

This project already carries an accessibility standard — match it rather than lowering it.

- **Focus is never removed.** Global `:focus-visible` is a 2px `#E6B300` outline at 2px offset; tour cards use a 2px maroon outline. Gold-on-parchment is the system's designated focus signal.
- **Modals trap focus.** `tours.js` cycles Tab within `[role="dialog"]`, closes on Escape, closes on overlay click, marks `aria-modal="true"` with `aria-labelledby`, and returns focus to the originating card. The feedback dialog does the same without the trap.
- **Every string is translated.** No UI text is hardcoded — all of it comes from `data-i18n` keys resolved against ES/EN/PT in `i18n.js`. Accessibility attributes have their own `data-i18n-aria` and `data-i18n-title` attributes. A new screen must add keys for all three languages or the language pill silently fails on it.
- **Language is announced.** `document.documentElement.lang` is set from `html.lang` on every switch.
- **Semantics are explicit.** `<nav>` for navigation, `<main>`, `<section>`, `<article>` per card, `<button>` for actions and `<a>` for navigation, `aria-label` on all icon-only controls, `role="button"` + `tabindex="0"` + Enter/Space handlers on clickable cards.

---

## 8. Content Rules (the copy is the product)

This is a real, client-owned business. Copy comes from `i18n.js`, `content/tours.json`, `content/reviews.json` and `about.html` — **never invented**.

**Real inventory — 6 tours in `tours.json`:**

| Category | Title (ES) | Key facts |
|:---|:---|:---|
| `day` | City Tour San Salvador | Centro Histórico, gastronomía salvadoreña. 4 highlights. |
| `day` | Cihuatán & Suchitoto: Historia, Cultura y Paisajes Inolvidables | Cihuatán (Posclásico 900–1200 d.C.), Suchitoto ("Pájaro Flor" en náhuat), Lago Suchitlán, Volcán de Guazapa. |
| `day` | Ruta Maya El Salvador: Un Viaje al Corazón de la Civilización Maya | Joya de Cerén ("Pompeya de América", Patrimonio Mundial UNESCO), Tazumal (pirámide más grande del país), Lago de Coatepeque. |
| `day` | Volcán de Santa Ana (Ilamatepec): Una Aventura hasta el Techo de El Salvador | Caminata moderada de ~3 horas, cráter con laguna turquesa, Complejo Los Volcanes. |
| `package` | El Salvador: La Joya del Pacífico | 5 días / 4 noches. 6-day itinerary, 7 inclusions. |
| `package` | Sol Ancestral: Naturaleza, Cultura y Playa en El Salvador | 5 días / 4 noches. 5-day itinerary, 6 inclusions. |

**Real voices — 5 approved + featured reviews** (a 6th `pending` review exists solely to prove moderation works): Sarah Jenkins (Canadá), Eduardo Moreira (Brasil, PT), Michael & Clara Vance (United States, EN), Valeria Montero (Costa Rica), David Lindner (Alemania). Testimonial content is genuinely multilingual — the English and Portuguese reviews are shown as written.

**Real identity.** Founder **Mario Domínguez**, *Fundador y Guía de Turismo de El Salvador Trails*. Four trust pillars, all sourced from `about.html`: "Más de 20 años de experiencia en turismo", "Guía certificado con credenciales oficiales", "Trayectoria reconocida (#1 en TripAdvisor)", "Acompañamiento seguro y personalizado". Three value pillars: **Nuestra Visión**, **Nuestra Misión**, **Nuestro Compromiso**. The blockquote welcome: *"Bienvenidos a El Salvador Trails, donde cada sendero cuenta una historia y cada experiencia se convierte en una aventura inolvidable."*

**Real contact.** `info@elsalvadortrails.com`, WhatsApp `+503 7000-0000`, TikTok & Instagram `@elsalvadortrails` / `@elsalvadortrails`, Facebook. Payment is a **deposit only, via Payment Links** — 25% for personalized clients, up to 50% for operators — never a checkout with a computed total.

---

## 9. Anti-Patterns (banned in this project)

**Banned by the source's own constraints:**
- **No prices, no cart, no totals, no "from $X".** The business model forbids it. The only price statement is "Precios y condiciones: contáctenos".
- **No invented metrics.** Mario's record is "más de 20 años", "#1 en TripAdvisor", founded 2024 — that is the complete list of real numbers. Never add uptime, response times, traveller counts, or satisfaction percentages. If a figure is needed and unknown, write `[dato]` / `[metric]`.
- **No content outside the six real tours.** Do not fabricate destinations, durations, or inclusions.
- **No emojis in the interface.** (The star ratings in the feedback `<select>` use `⭐` characters as option labels — that is the one shipped exception, and it is a form control, not decoration.)
- **No blue-grey, no cool neutrals, no pure black `#000000`, no pure white surfaces other than the `--surface-raised` token.** The palette is warm-only.
- **No second accent colour.** Gold is the singular accent; maroon is the brand; lime is reserved for the nav byline. Do not introduce teal, purple, or neon.
- **No spring or bounce easing, no playful rotation, no hover wobble.** The brief explicitly rejects "bouncing, elastic effects, whimsy" — this audience is 35+ and the register is dignified.
- **No heavy elevation.** If a shadow is clearly visible as darkness, it is too strong. Separation comes from `Aged Paper` vs `Parchment` and hairline borders.
- **No remote image dependencies.** `code.html`'s `lh3.googleusercontent.com` pattern URLs must never be reintroduced; decoration uses the local `assets/*.svg` set.
- **No unmoderated traveller content.** Never render a review without checking `moderation.status === 'approved' && moderation.featured === true`.
- **No English-only screens.** Every new surface needs ES, EN and PT keys.

**Generic-AI tells also to avoid:** no centred hero with a scroll-chevron affordance, no filler text ("Scroll to explore", "Swipe down"), no `LABEL // YEAR` overlines, no "Elevate / Seamless / Unleash / Next-Gen" copy, no placeholder names or brands, no emoji-in-heading, no equal-value three-card feature row *added to the home page* (the existing three-up grids are the catalog's Day/Packages/Personalized triad and the About pillars triad — both are real product structure, not decoration).

---

## 10. Notes for Stitch Generation

### Language to use
"Warm archival tourism brochure"; "parchment and mahogany"; "single brass-gold accent"; "hairline separation, whisper shadows"; "dignified, unhurried motion"; "editorial serif headings over humanist sans body"; "generous breathing room for an audience of 35+ international travellers and tour operators".

### Color references
Canvas `#FBF8ED` · Surface `#F7EEDA` · Raised `#FFFFFF` · Brand maroon `#7E1500` · Accent gold `#E9C262` · Ink `#3A2416` · Muted `#6F5F4F` · On-gold `#3D0800` · Hairline `rgba(126,21,0,0.08)` · Dark canvas `#1C1714` · Dark surface `#251E19` · Dark text `#E8DFD4` · Dark brand (= gold) `#E9C262`.

### Component prompts
1. *"A destination hero card on a cream `#FBF8ED` page, 24px radius, 1px `rgba(126,21,0,0.14)` border, deep warm shadow. Inside, the active travel photograph fills the card at 50% brightness behind a `rgba(28,23,20,0.7)` overlay. Top: a serif heading over a one-line subtitle, then four pill-shaped destination tabs where the active one is filled `#E9C262` with `#3D0800` text. Bottom: an asymmetric two-column grid, left column holding an uppercase 900-weight brand title over a `border-left: 2px solid #E9C262` quote block and one gold CTA button, right column holding a 16:9 rounded photograph above four 16:9 thumbnails where the active thumbnail takes a 2px gold outline."*

2. *"A tour detail modal on a cream page: 2xl rounded white panel, sticky header with a serif title and a circular close button, a 16:9 image gallery with chevron controls and small dot indicators, a paragraph description in humanist sans at 1.7 line-height, an itinerary rendered as a vertical list of blocks each with a 4px maroon left border and a `Día N:` heading, a two-column 'Incluido' list with small green check circles, then a gold-bordered quotation panel headed 'Precios y condiciones: contáctenos' with three stacked inputs (Adults, Children under 12 at 50%, Estimated date) and two equal buttons — a gold-filled 'Cotizar por WhatsApp' and an outlined 'Cotizar por Correo'."*

3. *"A testimonial carousel section, 1152px wide, centred. Serif heading 'Lo que dicen nuestros viajeros' over a max-w-2xl muted subtitle. Three cards per row, each on `#F7EEDA` with a 1.25rem radius, a large translucent gold quotation mark in the top-right, a row of five filled gold stars, an italic 15px comment, an optional pill badge reading '1 foto', and an author block separated by a dashed hairline containing a 44px gold-ringed circular monogram in the author's initials beside their name and country with a small globe icon. Beneath the row, two 44px circular arrow buttons flanking three dots, the active dot gold and scaled up. Below that, a gold-outlined pill button reading '¿Viajaste con nosotros? Comparte tu experiencia' with a small review icon."*

4. *"An ornate section divider: a 1px line whose gradient runs transparent → `rgba(126,21,0,0.15)` → solid `#7E1500` at the centre → back to transparent, with a single gold `✶` glyph sitting on the centre in a knockout disc filled with the page background and 16px horizontal padding."*

### Incremental iteration
- Keep the home page thin (nav → carousel → divider → testimonials → divider → social → footer). Adding sections to the home page contradicts a recorded client decision.
- Treat `tours.html` as a **three-state machine** (categories → list → modal), not as a static grid; the back-link, the per-category column counts (4 for Day Tours, 2 for Packages), and the disabled "Próximamente" state on Personalized Experience are all part of the design.
- Build both themes together where possible — the dark theme changes the *typefaces*, not just the colours, so a dark screen generated with the light stack will not match.
