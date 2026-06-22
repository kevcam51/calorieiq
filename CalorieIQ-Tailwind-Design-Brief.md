# CalorieIQ — Tailwind Adoption + Design Exploration Brief

A working brief for Claude Code. Read alongside CLAUDE.md. The goal here is twofold:
(1) adopt Tailwind CSS the right way, and (2) let me (Kevin) **see and compare multiple
visual directions** for the app before committing to one — and then optimize the chosen look
using established web-design best practices.

---

## Part 1 — Adopt Tailwind CSS v4 (the careful way)

**Install (current v4 + Vite flow):**
- Install `tailwindcss` and `@tailwindcss/vite`.
- Add the `@tailwindcss/vite` plugin to `vite.config.js` (alongside the React plugin).
- Add `@import "tailwindcss";` to the main CSS file (e.g. `src/index.css`).
- v4 is CSS-first: no `tailwind.config.js` and no PostCSS config needed for the standard flow.
  Design tokens (colors, fonts, spacing) are configured in CSS via `@theme`.
- Verify with a throwaway utility class, then `npm run build` to confirm it compiles.

**Adoption strategy (IMPORTANT — do not rewrite everything):**
- The app's main UI is a ~7,500-line `src/App.jsx` with existing inline styles. **Do NOT do a
  wholesale rewrite into Tailwind.** That's risky and disruptive.
- Adopt Tailwind **for new components first** — especially the upcoming Trainer and Client
  dashboards. Tailwind coexists fine with the existing inline styles.
- Migrate older UI to Tailwind only gradually, piece by piece, and only when we're already
  touching that area for another reason. Never break working functionality to restyle it.

---

## Part 2 — Let me compare MULTIPLE looks (the main thing I want)

I want to *see variety* — several genuinely different visual directions for the app — and be
able to flip between them and judge for myself, not just get one design handed to me.

Please build the exploration in this layered way:

**A. A theme-token system.** Define the app's look as a set of design tokens in CSS via
Tailwind's `@theme` — color palette (primary/accent/background/surface/text), typography
(font family + a type scale), border radius, and a spacing rhythm. Centralizing these means a
whole "look" can be swapped by changing one token set.

**B. 3–4 distinct named themes to start.** Create several clearly different directions as
separate token sets so I can compare real options, for example:
  - **"Clean / Minimal"** — lots of whitespace, restrained palette, light and airy.
  - **"Bold / Energetic"** — strong accent color, high contrast, motivating (fits fitness).
  - **"Warm / Friendly"** — softer palette, rounded shapes, approachable.
  - **"Dark / Pro"** — dark surfaces, sharp data display, premium feel.
  (Propose your own variations too — these are starting points, not a fixed list.)

**C. A live theme switcher.** Add a simple control (dev-only is fine) that lets me switch the
active theme on the fly so I can see the *whole app* re-skin instantly and compare. This is the
fastest way for me to react to options.

**D. A "style showcase" page/route.** A single page that renders the key building blocks —
buttons, inputs, cards, a sample stat/progress widget, and a mini sample dashboard — rendered
under each candidate theme so I can compare them side by side without clicking through the app.

**E. (Optional, for bigger divergent concepts) branch + preview deploys.** For looks that
differ more than just tokens (e.g. a totally different dashboard layout), build each on its own
git branch. Vercel auto-creates a preview URL per branch, so I can open each full version live
and compare. Only do this when a direction is too different to express as a theme swap.

Always show me options and let me pick. Don't silently commit to one look.

---

## Part 3 — Optimize the look using design best practices / user research

Beyond "what I like," ground the design choices in what's known to work well on the web. When
proposing and refining looks, optimize toward these evidence-based principles, and briefly
explain the reasoning so I learn as we go:

- **Clear visual hierarchy** — the most important thing on each screen should be the most
  prominent; guide the eye with size, weight, and spacing.
- **Generous whitespace** — don't crowd; spacing improves comprehension and perceived quality.
- **Disciplined color** — a small palette (one primary, one accent, neutrals); use color to
  signal meaning (e.g. progress, warnings), not decoration.
- **Accessible contrast** — meet WCAG AA contrast for text; never rely on color alone to convey
  state.
- **Readable typography** — a sensible type scale, comfortable line length and line height,
  limited number of font sizes.
- **Consistent spacing/rhythm** — a 4px/8px spacing scale applied consistently.
- **Mobile-first / responsive** — many CalorieIQ users (clients) are on phones; layouts must
  look great and work well on small screens first, then scale up.
- **Progress & data clarity** — this is a fitness app; charts, rings, and progress indicators
  should be clean, glanceable, and motivating.
- **Tone** — professional and trustworthy, but warm and motivating (it's coaching, not a bank).

When you (Claude Code) or Kevin's chat assistant find relevant, current web-design guidance or
patterns worth applying, fold them in and note the source/rationale. Treat the design as
something we iterate and improve over time, not a one-shot.

---

## Working approach

- **Plan first.** Before building, outline your plan and which files you'll touch, and wait for
  my OK — especially for anything beyond adding new components.
- **Don't break what works.** Restyling must not regress existing functionality.
- **Show options, I choose.** Surface real alternatives with short rationale; let me decide.
- **Keep it reversible.** Prefer token swaps and new components over destructive rewrites.
- **Update CLAUDE.md** once we adopt Tailwind and settle on a direction, so the project guide
  reflects that the app uses Tailwind for new UI and which theme/design system we chose.

## Notes / out of scope

- This brief is about look & feel (Tailwind + theming). It is not about new backend features.
- The real AI coaching chat UI is a later (Blaze-phase) feature; design tokens built here should
  be reusable when that arrives.
- A future rebrand may change the app name and palette; building the look as swappable tokens
  makes that easy later.
