# Ingesting Instagram / YouTube / video links into a program

_Kevin's question (Session 81): "Can we make it so someone can send an Instagram or video link to
Glide and use it to improve or complement their program?"_

**Short answer: yes — and the pragmatic version is very close to what we already shipped** (Paste-from-AI
import + the AI's `add_custom_exercise` / `propose_workout` / `log_meal` tools). The link → AI → "extract
what's in it → add it to your program" pipeline reuses our existing plumbing. The only genuinely hard part
is *automatically* pulling text out of Instagram/TikTok, which platform rules make unreliable — so the
robust design leans on text we can legally get (YouTube transcripts, or the user pasting the caption).

This is squarely on-strategy: it's the "works with your AI / bring outside content home to Glide" thesis
(`docs/AI-INTEROP-VISION.md`).

---

## What "improve/complement their program" means here

A user finds a workout reel, a technique video, or a recipe and wants Glide to *use* it — e.g.:
- "Add these exercises to my Monday workout." → `add_custom_exercise` + `propose_workout`
- "Log this meal / add this recipe." → `log_meal` / `propose_meal`
- "Is this a good movement for my goal? Where does it fit my week?" → coaching answer
- (Trainer) "Turn this into a block for Casey." → the plan-structure builder

All of those tools already exist. The new work is only **getting the content out of the link and into the AI.**

## Feasibility by source (the honest part)

| Source | Can we auto-extract text? | How |
|---|---|---|
| **YouTube** (incl. Shorts) | **Yes — clean.** | YouTube Data API v3 (title + description) + captions/transcript. Cheap, official, stable. Best first target. |
| **Instagram** (Reels/posts) | **Partly / fragile.** | No open API for arbitrary public posts. oEmbed can return a caption/thumbnail but now needs a Facebook app token and is rate-limited & flaky. Scraping violates ToS and breaks constantly. |
| **TikTok** | **Partly / fragile.** | oEmbed gives title/author/thumbnail but not the spoken content. Same ToS caveats as IG. |
| **Any platform** | **Yes — always.** | The **caption/description is text.** If the user pastes it (or we get it via oEmbed), the AI parses it perfectly. This is the universal fallback and it's already how Paste-from-AI works. |

Key point: **the workout is almost always in the caption** ("3×10 goblet squats, 3×12 RDLs…"), not only
in the pixels. So we rarely need to "watch" the video — we need its **text**. That makes this far more
tractable (and cheaper) than it first sounds.

**Deep video/vision analysis** (download the clip, run vision on frames to read form) is possible but
expensive, ToS-risky (downloading from IG/TikTok), and usually unnecessary. Park it as a premium
"analyze my form" feature for much later — not the MVP.

## Recommended build (phased, reuses what we have)

**Phase 1 — Link-or-paste in the chat (small, mostly done).** Extend the existing Paste-from-AI box to
accept a URL *or* pasted caption. If it's a YouTube URL, a new Cloud Function `ingestLink` fetches
title + description + transcript and hands the text to the AI; otherwise the user pastes the caption.
The AI then extracts exercises/meals and offers to add them via the existing tools (custom-exercise +
propose_workout / propose_meal confirm cards). **Works day-one for every platform** because the floor is
"paste the text," and YouTube gets the nice auto-fetch. Needs: Blaze (have it) + a YouTube Data API key
in Secret Manager. ~1 session.

**Phase 2 — oEmbed caption fetch for IG/TikTok.** Best-effort: `ingestLink` calls the platform oEmbed
endpoint to auto-pull the caption so the user doesn't have to copy/paste. Degrades gracefully to "paste
the caption" when the platform blocks it. Needs a Facebook app token for IG oEmbed. Medium effort, medium
reliability — set expectations accordingly.

**Phase 3 (premium, later) — actual video understanding.** Transcribe audio (we already have Whisper via
`transcribeAudio`, S79) for talk-through videos, and/or sample frames to Claude vision for form cues.
Expensive + ToS-sensitive on IG/TikTok; only worth it as a paid "form analysis" tier.

## Risks / constraints to flag to Kevin

- **Platform ToS:** scraping IG/TikTok is out. We stick to official APIs (YouTube), oEmbed, or
  user-pasted text. This is a *product* constraint, not a bug — same honesty as the interop vision doc.
- **Cost:** trivial for text (a few extra tokens through the already-budgeted chat). Only video/vision
  (Phase 3) is a real cost, hence premium-gated.
- **Reliability:** YouTube = solid; IG/TikTok auto-fetch = "usually," with paste as the guaranteed path.

**Recommendation:** ship **Phase 1** when we pick this up — it delivers ~90% of the value (paste a link
or caption, AI turns it into program changes) with minimal new infra, and it strengthens the "works with
your AI" positioning.
