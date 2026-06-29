# Glide — Next-Session Handoff (start here)

_Created at the end of a long session (Sessions 77–79 + UI polish). Read this first,
then `CLAUDE.md` (the standing context, full session log) and `Glide-AI-Layer-Handoff.md`
(the AI layer). Everything below is pushed to `main` and live unless noted._

---

## ⏭️ TODO — two small UI fixes Kevin asked for (do these first)

1. **Meal-card "Edit" button is hard to read.** When the AI proposes a meal (the
   Accept/Edit confirmation card in `AIChatPanel`), the **Edit** button's text blends
   into its own background — "Edit" is barely legible. Bump its contrast (brighter
   text/border, or give it a subtle filled background distinct from the card).
   - Location: `src/App.jsx`, the meal proposal card render — grep for `setEditDraft({ ...proposal })`.
     The button is currently `className="rounded-lg border border-border px-3 py-2 text-[.88rem] text-fg disabled:opacity-60"`.
   - Same card also has **✓ Log it** (filled cyan) and **✕** — keep those; just fix Edit's legibility.

2. **Hamburger (≡) lines aren't vertically centered** in the menu button. The `≡`
   glyph sits off-center because it relies on the character's own metrics.
   - Location: `src/App.jsx`, the `chrome` element — grep for `aria-label="Open menu"`.
     It's an inline-styled 40×40 button rendering the `≡` character with `fontSize:"1.3rem", lineHeight:1`.
   - Fix: center the glyph with flexbox (`display:flex; alignItems:center; justifyContent:center`)
     instead of the line-height hack — or swap the `≡` text for a 3-line SVG icon (cleaner, like the
     camera/mic SVGs added this session). The SideMenu's own `.logo`/items are fine; only the launcher button.

Both are pure cosmetic, frontend-only, no Blaze. Verify in the preview (see the viewport gotcha below).

---

## What shipped in the recent sessions (all live)

- **S77 — AI polish + notifications:** Glide **knowledge base** (`functions/knowledge.js`, GI tables +
  Smooth Training methodology, in the cached prompt prefix = no per-call cost; keep growing it),
  **chat conversation persistence** (`caliq-ai-chat`), and **home notification nudges** (food / weigh-in /
  coaching-tip cards on `ClientHome`, gated by `notifPrefs`).
- **S77 — Notification Center:** side-menu "🔔 Notifications" with a master + per-type toggles, one unified
  `caliq-notif-prefs` lifted to App, synced with the inline home/dashboard toggles.
- **S78 — Custom exercises end-to-end:** `data.customExercises` now actually work — wired into every
  picker + burn calc (custom exercises burn by `calPerMin × minutes`, not MET); AI can create them via
  `add_custom_exercise` and use them in programs; the "Today's Workout" section has the inline creator too.
- **S79 — Voice input:** 🎤 mic button → `transcribeAudio` Cloud Function → Whisper → text in the composer.
  **Provider-agnostic** (`functions/transcribe.js`): OpenAI now (`VOICE_PRIMARY="openai"`), Groq wired as
  fallback / ready to promote when its paid tier reopens. Live **waveform** + **interim words** (browser
  SpeechRecognition; iOS Safari limited → waveform covers it); Whisper is the source of truth.
- **UI polish this session:** camera/mic emoji → bright **SVG icons** (the dark emoji were invisible);
  AI chat **bigger + full-screen toggle**; composer **font fixed** (was defaulting to monospace → now Sora);
  composer **auto-grows like Claude's**; **AI chat mounted in the in-plan view** (step 5) with
  `onDataChanged=reloadPlanLive` so plan changes show live; **fixed-nav scroll-clearance bug**
  (`.app` padding-bottom 96→120px, removed the desktop `padding-bottom:0` override — content was hidden
  behind the always-fixed bottom nav on ≥480px screens).

## Decided / answered (don't re-litigate)

- **Model: stay on Sonnet** (`claude-sonnet-4-6`). Cost ~2¢/tool-message, hard-capped daily. Haiku is 3×
  cheaper but (a) weaker on coaching nuance and (b) caching may break on Haiku (its min cacheable prefix is
  ~4096 tokens vs Sonnet's ~2048; our prefix is near that line) — would need a token-count check + padding
  the knowledge base first. Kevin chose Sonnet.
- **Voice provider strategy:** both OpenAI + Groq, switch via `VOICE_PRIMARY`. OpenAI is day-one (Groq's
  pay-per-token upgrade is gated by demand). Both keys are Secret Manager secrets.
- **Key handling:** Kevin pasted the OpenAI + Groq keys in chat → stored as secrets. If cautious, he can
  rotate them at platform.openai.com / console.groq.com (optional, not urgent).

## Key gotchas (carry forward)

- **⚠️ Deploy ALL FOUR AI functions when `functions/aitools.js` changes:**
  `firebase deploy --only functions:aiChat,functions:aiChatStream,functions:logMeal,functions:setWorkoutSchedule --project calorieiq-29762`.
  `aitools.js` is shared; deploying only some leaves an Accept callable on stale tool code (hit + fixed in S78).
- **Firebase CLI token expires** → `firebase login --reauth --no-localhost` (code-paste flow; Kevin runs it).
- **Preview viewport glitched to 2px wide** this session — screenshots came out as slivers, scroll/measure
  were bogus. Fix with `preview_resize` to e.g. 390×844 before visual/scroll testing.
- **Test accounts** (memory `test-trainer-account`): trainer `trainer.uitest@calorieiq-test.com` /
  `TestPass123` (has Casey linked); client `client.uitest@calorieiq-test.com` / `TestPass123` ("Casey Client",
  uid `qHLOrDsS0mhx79DOQF2ZfBh6Kem2`). Casey's daily AI budget may be exhausted from testing — use the trainer
  or wait for the UTC reset. Drive the preview as a signed-in user (callables need real Firebase Auth).
- **Verify writes through the app's OWN read path** (dashboard/Results), not just the AI's confirmation.
- **`src/App.jsx` is ~12.5k lines** — the `css` block is a JS template literal, so **no backticks in CSS
  comments** (broke the build once this session). Commit to `main` directly (project workflow; auto-deploys
  to Vercel). Run `npm run build` before committing.

## Remaining roadmap (optional, not blocking)

- Grow the AI knowledge base over time (it's a living system — `functions/knowledge.js`).
- Notification Center: add real per-type nudges as features grow; actual push delivery needs Blaze.
- Voice: promote Groq to primary when its paid tier reopens; optional voice OUTPUT (TTS).
- Trainer-viewing-a-client in the in-plan chat: AI defaults to the trainer's own plan — a nice follow-up is
  auto-targeting the open client so the trainer doesn't have to name them.
- AI: a trainer-targeting context pass; plan-structure deeper editing; etc. (see CLAUDE.md roadmap.)
