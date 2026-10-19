# Instructions for agents working on Tajleed

## Start here

- Read `DESIGN.md` before planning or changing any user-facing interface, styles, copy, icons, typography, or motion.
- Read `README.md` and the existing source before implementation. This project uses SvelteKit, Svelte, and TypeScript. Adapt framework-specific skill examples to this stack.
- Follow the user's current request and approved brand decisions. Do not redesign the identity or change frameworks as a side effect of feature work.

## Use the project-local design skills

For design work, read the relevant `SKILL.md` from this repository and follow its applicable workflow and references. Use these local copies rather than assuming a globally installed version matches them.

| Work | Local skill |
| --- | --- |
| Product UI, editor, forms, accessibility, responsive layout, design review | `.agents/skills/impeccable/SKILL.md` |
| Component polish, feedback, interaction behavior, purposeful motion | `.agents/skills/emil-design-eng/SKILL.md` |
| Landing pages, marketing, editorial composition, visual redesign | `.agents/skills/design-taste-frontend/SKILL.md` |

Use Impeccable as the starting skill for product interface work; add the other skills when their scope applies. Read only relevant references. The landing-page skill does not govern editor layouts or multi-step product workflows. Backend-only tasks do not require a design workflow.

Honor skill setup instructions, including Impeccable's context command when using that skill. On Windows, use its `.cmd` launcher as documented. If a skill or launcher is unavailable, report it and continue using the project context and available tools. Do not claim it ran.

The user's explicit instructions and approved project identity take precedence over generic aesthetic suggestions in skills. Preserve Thmanyah typography, the coral/butter/cocoa palette, and existing brand assets. Apply accessibility requirements when choosing their UI roles.

## Implementation and verification

- Font files live in `static/fonts`; brand files live in `static/brand`. Public URLs omit `static`, e.g. `/fonts/thmanyahsans-Regular.woff2` and `/brand/tajleed-logo.svg`.
- Keep reusable styles and semantic tokens centralized. Inspect existing conventions before creating a second system.
- For code changes, run the relevant checks; normally `npm run check` and `npm run build`. For visual changes, inspect the affected interface at desktop and mobile widths, including RTL and keyboard behavior.
- Report what changed, what was verified, and any actual limitations. Documentation-only changes need link/path review, not an application build.
- Update `DESIGN.md` when the user approves a durable design decision. Clearly distinguish approved identity rules from provisional implementation defaults.
