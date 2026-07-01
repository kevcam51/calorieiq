# Your data is safe with Glide

_A plain-language explanation of how Glide protects your information — written to share with
trainers and clients who want peace of mind before connecting their accounts. (This is customer-facing
copy; it can become an in-app "Security & Privacy" page or a help article.)_

## The short version
Your data is private to you and the people you choose to work with. We protect it with the same
infrastructure and practices used by major apps, and we never sell it or expose your passwords or
connected-account keys to anyone — including other trainers on Glide.

## How we protect your account and data
- **Secure sign-in.** Accounts are protected by Google Firebase Authentication. We never see or store
  your raw password.
- **Encrypted in transit.** Everything between your device and Glide travels over HTTPS (TLS) — the same
  encryption used for online banking.
- **You only see what's yours.** Access is strictly scoped: a client's data is visible only to that
  client, their own trainer, and (where applicable) that trainer's head coach. **One client can never
  see another client's information, and one trainer can never see another trainer's clients.** These
  rules are enforced on our servers — not just hidden in the app — and are covered by an automated test
  suite.
- **Built on Google Cloud.** Glide runs on Google's Firebase/Cloud platform, so your data sits on
  enterprise-grade, physically secured infrastructure.

## Connecting another app (like Trainerize) — how your API key stays safe
Some trainers connect an outside account (for example, Trainerize) so Glide can import their clients and
history. We handle those credentials with extra care:

- **You enter it yourself, over a secure connection.** You paste your key into a "Connect" screen inside
  Glide; it goes straight to our secure server over encrypted HTTPS. You never email it or send it in a
  message to anyone.
- **It's encrypted and stored on our server only.** Your key is kept in an encrypted secret store that
  **only our server code can unlock** — to make the connection you asked for, and nothing else.
- **No one can read it back — not even you.** After you save it, it's shown only as hidden dots
  (`••••••1234`). It is never displayed, never sent back to any web browser, never written into our
  code, and never logged.
- **It only accesses your own clients.** Your key can only ever reach the clients on *your* account —
  it has no visibility into anyone else's.
- **You're always in control.** You can disconnect and delete the connection at any time, which removes
  your stored key immediately.

## What we will never do
- We will **never sell or share** your personal data.
- We will **never store your passwords or connected-account keys in plain text.**
- We will **never let one trainer or client access another's data.**
- We will **never expose your credentials** in the app, in our code, or in logs.

## You're in control
You can review your connections, disconnect any outside account, and request deletion of your data at any
time. If you ever have a security question, reach out and we'll walk you through exactly how your
information is handled.

_Glide is committed to keeping your — and your clients' — information private and secure._
