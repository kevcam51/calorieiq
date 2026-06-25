# Glide — AI Meal Logging & Conversational AI Layer

## Overview

This document defines the architecture, behavior, cost controls, data flow, and role-based permissions for the AI layer in Glide. It is intended to guide Claude Code implementation and should be read alongside `CLAUDE.md`.

The AI layer is powered by the Anthropic API via Firebase Cloud Functions. It serves two primary purposes:

1. **Conversational meal logging** — clients describe meals in natural language; the AI parses, estimates macros, and writes structured data to Firestore
2. **Data-aware coaching assistant** — clients and trainers query their own logged data through natural language; the AI calls Firestore via function calling and returns real numbers

---

## 1. Conversational Meal Logging

### How It Works

The client types or speaks a meal in plain language. Examples:

- *"I had 1 cup of basmati rice cooked with butter, refrigerated overnight, and 12oz of 85/15 organ blend beef"*
- *"Breakfast was 4 eggs, 2 slices whole wheat toast, and 2 tablespoons of olive oil"*
- *"Bowl of beef broth with one short rib, 10 cremini mushrooms, a quarter head of cabbage, and fresh ginger"*

The AI:
1. Parses the meal into components
2. Estimates calories, protein, carbs, and fat per component
3. Applies context (cooking method, fat added, cooling — all affect GI and effective calorie utilization)
4. Returns a structured summary for client confirmation
5. Writes confirmed data to Firestore as a structured meal log entry

### Iterative Correction Support

Because each API call includes full conversation history, the AI supports mid-session corrections without re-entering data:

- *"Actually make that one rib, not three"*
- *"Change the beef to 85/15 not 90/10"*
- *"Add a quarter head of cabbage to that"*

The AI updates the running totals and re-outputs the corrected breakdown. This is a core UX feature — clients should never feel like they are filling out a form.

### Meal Categories

Every logged meal must be tagged:
- `breakfast`
- `lunch`
- `dinner`
- `snack`

The AI asks for clarification if the meal type is ambiguous.

### Firestore Meal Log Schema

```json
{
  "uid": "string",
  "trainerId": "string | null",
  "date": "ISO 8601 date string",
  "mealType": "breakfast | lunch | dinner | snack",
  "description": "string (raw client input)",
  "components": [
    {
      "name": "string",
      "quantity": "string",
      "calories": "number",
      "protein": "number",
      "carbs": "number",
      "fat": "number"
    }
  ],
  "totals": {
    "calories": "number",
    "protein": "number",
    "carbs": "number",
    "fat": "number"
  },
  "giEstimate": "number | null",
  "notes": "string | null",
  "loggedAt": "Firestore timestamp",
  "loggedBy": "client | trainer | ai"
}
```

---

## 2. Nutritional Context the AI Must Apply

The AI should understand and apply the following when estimating meals. These affect GI estimates and coaching context — not just raw calorie math.

### Resistant Starch & GI Modifiers

When a client logs a starchy carb (rice, potatoes, pasta), the AI should factor in preparation method:

| Preparation | GI modifier |
|---|---|
| Freshly cooked, no fat | Baseline (high) |
| Fat cooked in | Moderate reduction |
| Cooked, refrigerated overnight | Significant reduction (RS3 formation) |
| Fat cooked in + refrigerated | Maximum reduction |

### Mixed Meal GI Blunting

When protein and fat are consumed alongside a carb, the AI applies a blunting modifier. More protein and fat = lower effective GI.

### Reference GI Ranges by Rice Type

| Rice Type | GI plain | GI w/ fat | GI w/ fat + cooled | GI w/ beef + fat + cooled |
|---|---|---|---|---|
| Jasmine | 72–80 | 55–65 | 40–50 | 25–35 |
| Lundberg sushi (short grain) | 70–78 | 53–63 | 38–48 | 23–33 |
| Basmati (recommended for lower GI) | 50–58 | 40–48 | 30–40 | 20–28 |

The AI does not need to display GI by default but should apply this context when a client or trainer asks about blood sugar impact or meal optimization.

---

## 3. Data-Aware Coaching Assistant (Function Calling)

The AI is not just a chatbot — it can read real client data from Firestore and return actual numbers. This is implemented via Anthropic function calling in the Cloud Function.

### Example Client Queries

- *"What did I eat yesterday?"*
- *"How much protein did I hit this week?"*
- *"Which days did I go over my calorie target?"*
- *"Compare my intake Monday vs Friday"*

### Example Trainer Queries

- *"Which of my clients hasn't logged in 3 days?"*
- *"Who is furthest from their calorie goal this week?"*
- *"Show me a summary of Sarah's meals this week"*

### Firestore Functions Available to AI

Define these as callable tools in the Cloud Function:

```javascript
tools: [
  {
    name: "get_meal_logs",
    description: "Retrieve meal logs for a specific user within a date range",
    input_schema: {
      type: "object",
      properties: {
        uid: { type: "string" },
        startDate: { type: "string", description: "ISO 8601 date" },
        endDate: { type: "string", description: "ISO 8601 date" }
      },
      required: ["uid", "startDate", "endDate"]
    }
  },
  {
    name: "get_calorie_targets",
    description: "Retrieve the calorie and macro targets for a specific user",
    input_schema: {
      type: "object",
      properties: {
        uid: { type: "string" }
      },
      required: ["uid"]
    }
  },
  {
    name: "get_trainer_clients",
    description: "Retrieve a list of active clients for a trainer",
    input_schema: {
      type: "object",
      properties: {
        trainerId: { type: "string" }
      },
      required: ["trainerId"]
    }
  },
  {
    name: "get_client_last_log",
    description: "Get the date of last meal log for each client under a trainer",
    input_schema: {
      type: "object",
      properties: {
        trainerId: { type: "string" }
      },
      required: ["trainerId"]
    }
  }
]
```

---

## 4. Topic Restriction (Health & Fitness Only)

The AI must only respond to health and fitness related questions. This is enforced via the system prompt sent with every API call.

### System Prompt Template (Client)

```
You are a nutrition and fitness assistant for Glide, a personal training platform.

Your role is to:
- Help clients log meals through natural conversation
- Estimate calories, protein, carbs, and fat for logged meals
- Answer questions about nutrition, food, exercise, body composition, and health
- Query and summarize the client's own logged data when asked
- Provide coaching context (GI, macros, meal timing, food quality) when relevant

You must NOT:
- Answer questions unrelated to health, fitness, nutrition, or the client's data
- Provide medical diagnoses or prescribe medications
- Discuss topics outside of health and wellness

If a user asks something outside your scope, respond:
"I'm focused on helping you with nutrition and fitness. Try asking me about your meals, macros, or training."

Always be encouraging, clear, and concise. Avoid jargon unless the client has demonstrated familiarity.
```

### System Prompt Template (Trainer)

```
You are a fitness coaching assistant for Glide, a personal training platform.

You assist trainers by:
- Summarizing client meal logs and progress data
- Identifying clients who are off track (missed logs, missed targets)
- Answering nutrition and exercise science questions
- Helping trainers make data-driven decisions for their clients

You must NOT:
- Answer questions unrelated to health, fitness, or client management
- Access or discuss data for clients not assigned to this trainer
- Make medical recommendations

If asked something outside scope, redirect: "I can help you with client nutrition data, progress tracking, and fitness questions."
```

---

## 5. Role-Based AI Permissions

| Role | Data Access | Topic Scope | Can Query Other Users? |
|---|---|---|---|
| Client | Own meal logs + targets only | Health & fitness only | No |
| Sub-trainer | Assigned clients only | Health, fitness, client management | Assigned clients only |
| Head trainer | All clients in their org | Full coaching + analytics | All assigned clients |
| Admin | All data | Unrestricted | Yes |

Role is passed into the Cloud Function from the authenticated user's Firestore role field. The system prompt and available tools are selected based on role server-side — clients cannot override this.

---

## 6. Cost Controls

### Token Budget Per User

Implement daily token limits per user in the Cloud Function to prevent runaway costs.

| User tier | Daily token budget (input + output) |
|---|---|
| Free / trial | 10,000 tokens (~5–8 exchanges) |
| Paid client (self-serve) | 25,000 tokens |
| Trainer-assisted client | 40,000 tokens |
| Trainer account | 60,000 tokens |

Store daily usage in Firestore at `users/{uid}/aiUsage/{date}`. Increment on each API call. Return a soft warning at 80% and block at 100% with a user-friendly message.

### Conversation Context Window Management

Do not send unlimited conversation history. Cap context at last **10 exchanges** (20 messages) per session. For meal logging specifically, summarize confirmed meals into a compact JSON block rather than retaining the full conversation thread.

### Estimated Cost at Scale

| Usage pattern | Est. tokens/month | Est. cost/user/month |
|---|---|---|
| Light (few logs, occasional questions) | ~50,000 | ~$1–2 |
| Moderate (daily logging + questions) | ~150,000 | ~$3–5 |
| Heavy (multiple sessions/day, long threads) | ~400,000 | ~$8–12 |

Target average: **$3–4/client/month** at moderate usage with token caps in place.

---

## 7. Cloud Function Architecture

### Endpoint

`POST /api/ai/chat`

### Request Body

```json
{
  "uid": "string",
  "role": "client | sub_trainer | head_trainer | admin",
  "trainerId": "string | null",
  "messages": [
    { "role": "user", "content": "string" }
  ],
  "sessionId": "string"
}
```

### Cloud Function Responsibilities

1. Verify Firebase Auth token
2. Look up user role from Firestore
3. Select appropriate system prompt based on role
4. Check and increment daily token usage
5. Inject available Firestore tools based on role
6. Call Anthropic API (`claude-sonnet-4-6`)
7. If AI invokes a tool, execute Firestore read, return result to AI
8. Return final AI response to client
9. If meal confirmed, write structured log to Firestore

### Model

Always use `claude-sonnet-4-6`. Do not use Opus for this use case — cost is 5x with no meaningful quality gain for meal logging and coaching queries.

---

## 8. Photo Meal Logging

When a client uploads a photo of a meal:

1. Image is base64 encoded client-side
2. Sent to Cloud Function alongside any text context
3. Cloud Function passes image to Anthropic API as a vision input
4. AI identifies food items, estimates portions, returns macro breakdown
5. Client confirms or corrects conversationally
6. Confirmed meal is written to Firestore

This is the premium tier feature. Gate it behind paid subscription status.

---

## 9. UI Integration Notes

- The chat component is a **custom React component** — not a third-party widget
- Messages stream via SSE (Server-Sent Events) from the Cloud Function for real-time feel
- Meal confirmation is a UI card rendered below the AI message with an **Accept** / **Edit** button
- Accepted meals are written to Firestore and appear in the meal log dashboard immediately
- The AI chat panel is collapsible — clients can dismiss it and access it via a floating button
- Trainers access client AI summaries from the trainer dashboard, not the client chat interface

---

## 10. Future Enhancements (Post-MVP)

- **Voice input** — Web Speech API for hands-free meal logging
- **Weekly AI reports** — auto-generated Sunday summary of client intake vs targets
- **AI accountability nudges** — push notifications triggered by missed logging streaks
- **Wearable integration overlay** — AI references actual workout burn from Apple Health / Google Health Connect when calculating net calories
- **Trainer AI briefing** — daily digest for trainers summarizing which clients need attention
