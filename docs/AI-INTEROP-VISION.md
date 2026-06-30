# Glide — "Works With Your AI" Vision

> Captured from the Session-80 conversation (Kevin loved this direction and wants all of it built
> over time). Glide should be a great **standalone** product AND an **amazing collaborator** with
> outside AI tools. The thesis: **collaborate, don't compete.** Users keep their favorite AI
> (Claude, ChatGPT, Gemini, Pi, whatever) but bring its output home to Glide as their organized
> fitness hub — and eventually let that AI plug straight into Glide. Nobody in fitness is doing this.

## Glide as the hub every AI feeds into (the full vision — keep & utilize)

**The constraint, and the opportunity in it.** Claude/ChatGPT/Gemini don't let outside apps silently
read a user's chat history — there's no "log into your ChatGPT and pull your conversations" API. So
true auto-sync of their chat logs isn't on the table. *But that doesn't matter*, because the winning
move isn't reading their chats — it's making **user-initiated transfer effortless** and making Glide
the place that AI plugs *into*. Three layers, easy → powerful:

**1. Paste-to-import (do this first — it's almost free for us).** A "Paste from any AI" box in Glide:
the user copies whatever their ChatGPT/Claude said ("here's your day: chicken, rice, ~600 cal…") and
pastes it in. **Glide's own AI parses it and logs it** — meals, macros, weights, workouts — using the
exact tools it already has. Works with *every* AI on day one because they all output text. This is the
thesis exactly: use your favorite AI, then bring it home to Glide. Low effort, high leverage.

**2. A two-way "Glide format."** We hand users a tiny prompt to drop into their AI's custom
instructions ("when I log food, end with a clean macro list"), so the external AI always formats
fitness data Glide can import cleanly — and the reverse: Glide exports a tidy summary of their week
they can paste *into* Claude for deeper analysis. Glide = the organized memory; their AI = the
reasoning surface. Both directions.

**3. Glide as a connector (the endgame).** Claude and ChatGPT both support **connectors / MCP** now —
a user can plug an external tool into their AI. If Glide exposes itself as one, a user tells *their own
Claude* "log my lunch to Glide" and it writes straight into their Glide hub, with their permission.
That's "integrated part of their life," and it's exactly where the ecosystem is heading. It needs an
OAuth'd hosted endpoint — real work, but we're already on Blaze/Cloud Functions, so the foundation
exists.

**Recommendation / build order.** Ship **#1 (paste-import)** soon — it's small and demos the whole
vision. Keep **#2 (Glide format)** as a light add-on. Put **#3 (Glide as an MCP connector)** on the
roadmap as the flagship "Glide works with your AI" feature — a genuine differentiator.

## Why this is technically achievable

Glide already has (a) a **structured data model** (meals/macros/weights/workouts keyed by date) and
(b) an **AI with read/write tools** over that data (`log_meal`, `get_nutrition_log`, `set_workout_schedule`,
etc., in `functions/aitools.js`). Paste-import is just that same machinery pointed at *pasted text*
instead of *typed text*: "parse everything fitness-related in this and log it." The MCP connector is
the same tools exposed over an authenticated endpoint to an *external* AI instead of Glide's own chat.

## Brainstorm — more ways a separate AI chat can assist a Glide user

> Seeds for the brainstorm Kevin wants. Add freely.

- **"Send to my AI" export** — one tap turns the user's week (meals, trend, weigh-ins, adherence) into
  a clean text block + a ready-made question ("Based on this, what should I change?") to paste into any
  AI. Glide is the data; their AI is the second opinion.
- **Shareable read-only summary** — a link or text block a user (or their human trainer) can hand to an
  AI for analysis without exposing the account.
- **Prompt packs / a "Glide" custom GPT or Claude Project** — pre-configured so the external AI always
  asks the right questions and formats answers Glide can re-import.
- **Recipe / meal-idea loop** — brainstorm meals in the external AI, then import the chosen day into
  Glide in one paste (macros auto-parsed).
- **"Bring your trainer's PDF/program"** — AI parses an outside program (PDF, screenshot, email) into a
  Glide workout schedule (reuses the existing program builder).
- **Voice/photo bridge** — a voice note or photo handled by an external AI, result pasted/imported to
  Glide (Glide already has voice + vision in-house too).
- **Two-way MCP sync** — external AI logs into Glide; Glide surfaces trends/targets back to that AI as
  context so the outside chat is always grounded in the user's real numbers.

## Honest caveats to remember

- We cannot read a user's external chat history automatically (no third-party API). Everything is
  **user-initiated** (paste / file / connect-as-tool) or **AI-pushes-to-Glide** (MCP), never silent pull.
- The MCP connector needs OAuth + a hosted endpoint + careful scoping (a user's AI can only touch *their*
  data) — same server-side access model already enforced in `aitools.js` (`resolveTargetUid`).
- Paste-import should confirm before writing (show the parsed items as a card, like the meal Accept card)
  so a messy paste doesn't dump bad data into the log.
