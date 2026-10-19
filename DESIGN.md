# Tajleed — تجليد: design guidelines

This file is the design reference for agents developing the book-cover tool. Read `AGENTS.md` for project-local skills and implementation workflow.

## 1. Direction and authority

Build an Arabic-first creative workspace with warm editorial character, clear controls, and a prominent cover preview. The artwork being designed should remain the focus of the editor.

Approved identity decisions:

- Name: **Tajleed — تجليد**.
- Typography: locally hosted **Thmanyah / خط ثمانية**.
- Palette: coral, butter yellow, soft white, and deep cocoa sampled from the user's reference image.
- Symbol: book-cover panels with Bézier anchors and a selection cursor; a simplified version serves as the favicon.
- Approved assets are in `static/brand`.

The layout, component measurements, and motion values below are starting defaults for implementation. They are not evidence of an already implemented product. Preserve existing working behavior and adjust these defaults when real content or usability requires it.

## 2. Color system

| Token in `static/brand/tokens.css` | Value | Intended role |
| --- | --- | --- |
| `--tajleed-coral` | `#D97B7E` | Brand areas, restrained accents, selected backgrounds |
| `--tajleed-butter` | `#FCF19F` | Highlights, large brand lettering, gentle emphasis |
| `--tajleed-white` | `#FDFDFD` | Main surfaces and light foregrounds |
| `--tajleed-cocoa` | `#573E41` | Primary text, strong controls, dark brand areas |

Use semantic aliases for UI roles: background, surface, text, muted text, border, action, selection, and focus. Derive quiet neutral surfaces and borders from this palette and centralize them. New semantic success/error/warning colors are allowed when needed; define and verify them rather than forcing every status into a brand color.

- Default reading surfaces: cocoa text on soft white.
- Primary action: cocoa background with soft-white text; butter can highlight a special brand treatment.
- Use coral and butter selectively in the editor so controls do not compete with the cover.
- Butter-on-coral is an approved large-logo treatment. Do not assume it works for interface text or controls.
- Verify actual foreground/background contrast: 4.5:1 for normal text, 3:1 for large text and required control boundaries/focus indicators. Do not communicate state through color alone.
- Generated raster symbols contain slight tonal variation. The hex values above govern CSS and new UI assets.

The workspace now supports light and dark themes. The light theme uses warm ivory surfaces, cocoa text, and restrained coral selection and focus accents. The dark theme uses deep cocoa surfaces, warm light text, and lighter coral actions with butter focus accents. Both map the same semantic UI roles; neither changes the cover template's paper colors or exported document. The theme follows the operating system until the user selects a mode, then stores that choice on the device. The identity colors above remain the approved source palette; these surface colors are implementation choices.

## 3. Local typography

Use the existing WOFF2 files for web delivery. OTF copies are also present, but do not load both formats unnecessarily. Do not fetch replacement fonts from a CDN.

| Family | File under `static/fonts` | CSS weight | Use |
| --- | --- | --- | --- |
| Thmanyah Sans | `thmanyahsans-Regular.woff2` | 400 | Body text, controls, navigation, captions, fields |
| Thmanyah Serif Display | `thmanyahserifdisplay-Bold.woff2` | 700 | Page titles and editorial headings |
| Thmanyah Serif Display | `thmanyahserifdisplay-Black.woff2` | 900 | Occasional large brand statements |

Example declarations to place in the project's shared stylesheet:

```css
@font-face {
  font-family: 'Thmanyah Sans';
  src: url('/fonts/thmanyahsans-Regular.woff2') format('woff2');
  font-style: normal;
  font-weight: 400;
  font-display: swap;
}

@font-face {
  font-family: 'Thmanyah Serif Display';
  src: url('/fonts/thmanyahserifdisplay-Bold.woff2') format('woff2');
  font-style: normal;
  font-weight: 700;
  font-display: swap;
}

@font-face {
  font-family: 'Thmanyah Serif Display';
  src: url('/fonts/thmanyahserifdisplay-Black.woff2') format('woff2');
  font-style: normal;
  font-weight: 900;
  font-display: swap;
}

:root {
  --font-body: 'Thmanyah Sans', system-ui, sans-serif;
  --font-display: 'Thmanyah Serif Display', serif;
}

body {
  font-family: var(--font-body);
  font-weight: 400;
  font-synthesis: none;
}

button, input, select, textarea { font: inherit; }
h1, h2 { font-family: var(--font-display); font-weight: 700; }
```

These paths assume deployment at the site root; respect SvelteKit's configured base path if deploying under a subdirectory.

Do not declare a variable weight range for these static fonts. Sans has only Regular locally: use size, color, spacing, or a suitable display heading for emphasis rather than pretending a Sans Bold file exists. Serif Display Regular is not installed in this project; the approved logo already contains its own outlined lettering and requires no font file.

Starting scale: body 16px with 1.6–1.8 line height; controls 14–16px; captions 12–14px; display headings fluidly sized for their context. Check Arabic ascenders, dots, and diacritics for clipping. Avoid letter spacing on connected Arabic text.

Swashes and extended letters belong to selected display treatments, not every label. Preserve the supplied wordmark as artwork. Its extension is between ج and ل; `swsh` and `salt` were enabled during shaping but do not substitute eligible letters in this connected word. Do not add arbitrary kashidas to normal content or force unsupported alternates.

## 4. Brand assets and icons

- Primary signature: `/brand/tajleed-logo.svg` or `/brand/tajleed-logo.png`.
- Arabic-only vector wordmarks: `/brand/tajleed-wordmark-cocoa.svg`, `tajleed-wordmark-butter.svg`, and `tajleed-wordmark-white.svg`.
- Detailed symbol: `/brand/tajleed-symbol.png`.
- Browser/app assets: `/brand/favicon.ico`, favicon PNGs, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, and `site.webmanifest`.

The primary logo SVG embeds a raster symbol alongside outlined type; it is not fully vector. The Arabic-only wordmark SVGs are vector paths. Keep aspect ratios, connections, dots, and clear space intact. Use a compact wordmark or app icon where the detailed lockup becomes unreadable; approximately 240 CSS px is the minimum starting width for the full signature.

Use consistent, simple UI icons with matching stroke weight and optical size. Bézier nodes and cursor shapes can express cover design. Do not imply an Adobe integration or add official Adobe product badges unless that functionality is actually requested and implemented. Give icon-only controls accessible names and visible tooltips when helpful.

## 5. Layout and components

- Editor surfaces prioritize completing a task: cover preview, relevant controls, clear export action, and visible feedback.
- Marketing surfaces may use stronger editorial composition and larger brand color fields. Use the landing-page skill for those surfaces.
- Start with a 4px spacing unit and a coherent 4/8/12/16/24/32/48/64 scale.
- Default controls should have comfortable padding and about 44px touch height. Dense desktop tools may be smaller when accessible alternatives and sufficient separation exist.
- Prefer modest 8–12px component radii. Use pills for tags or compact status treatments, not all containers.
- Use borders and subtle tonal differences for grouping; reserve shadows for genuine elevation such as popovers.
- Keep primary, secondary, destructive, disabled, selected, loading, and focus states distinct and consistent.
- Show labels for dimensions and units. Keep entered values stable when switching panels. Preserve user work and make destructive actions explicit.
- For a cover editor, distinguish zoom from actual document dimensions. Surface bleed, trim, spine, and safe-area concepts clearly. First-release templates include guides and measurements by default, with explicit controls to exclude them; screen visibility does not change export settings.
- Empty, loading, validation, error, and success states are part of the feature. Use concise Arabic copy and actionable recovery steps. Do not invent product claims or unsupported functionality.

## 6. Arabic, RTL, and responsive behavior

- Arabic pages use `lang="ar"` and `dir="rtl"` at the appropriate document root. English surfaces use their own language and direction.
- Prefer CSS logical properties (`margin-inline`, `padding-inline`, `inset-inline-start`) and logical alignment.
- Isolate Latin filenames, ISBNs, URLs, and mixed-direction values with `bdi` or an appropriate LTR field. Do not reverse strings manually.
- Mirror directional navigation where meaningful. Keep artwork, logos, media controls, and document coordinates semantically correct rather than mirroring everything.
- Keep the cover's document geometry independent of UI direction.
- On narrow screens, make tool panels collapsible or sheet-based, keep the active preview usable, and prevent page-wide horizontal overflow. Allow intentional canvas pan/zoom within its own viewport.
- Test real Arabic content, long labels, mixed Arabic/Latin text, 200% zoom, and a narrow mobile viewport.

## 7. Interaction, motion, and accessibility

- Use semantic HTML, visible field labels, keyboard-operable controls, and strong focus indicators.
- Dialogs and menus need correct focus management, Escape behavior, and return focus. Provide alternatives to drag-only actions.
- Start with 120–180ms feedback transitions and 180–240ms panel transitions. Animate only properties that support understanding; use transform/opacity where suitable.
- Keep frequent editor actions immediate. Avoid perpetual decorative movement and blanket `transition: all`.
- Honor `prefers-reduced-motion`. Motion must not be required to understand a result.
- Announce important asynchronous results accessibly. Retain entered values on validation failure.

## 8. Review before delivery

For UI code changes, run relevant project checks and inspect the affected flow in the browser. Check desktop/mobile layout, RTL, typography loading, keyboard focus, text contrast, and relevant state transitions. Confirm that fonts resolve from `/fonts/` and assets from `/brand/` under the configured deployment path.

Follow the applicable local skill's bounded review process. Fix concrete defects and report verification honestly. Keep this document current with newly approved decisions; do not silently replace the established identity.

## 9. Approved first-release workspace decisions

The user approved an Arabic-first task workspace at the root route. Its compact header contains the Tajleed wordmark, project name, local save status, **مشاريعي**, and **تصدير القالب**. Settings sit on the right of a prominent cover preview on desktop; the preview sits above expandable settings on mobile. Book opening direction is a separate control from interface language. Preview zoom, pan, fit, and guide visibility affect only the screen, not document dimensions or export options.

The exact sidebar width, field spacing, surface tint, and control measurements in the implementation are provisional defaults that can be adjusted after usability evidence. The approved logo, font families and weights, palette, Arabic priority, and template workflow remain durable rules.

The workspace header uses the supplied square Tajleed icon beside the Arabic wordmark. This compact pairing keeps both parts of the logo readable in the editor header at desktop and mobile sizes.

The approved workspace now offers an Arabic/English interface switch and an explicit Save project action. Changing interface language switches document root language, reading direction, messages, dates, and displayed numbers, while book opening direction remains a separate project setting. The supplied Arabic wordmark stays intact in both languages. The header shows unsaved, saving, saved, and failed states, and warns before discarding edits. The dimensions panel exposes four physical safe margins and an optional printer slug area with text; their visual treatment follows the existing semantic tokens.
