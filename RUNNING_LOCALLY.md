# Running CalorieIQ on your own Mac (local testing)

A plain-English cheat sheet for previewing changes privately before they go live.
Nothing here touches the real website or your real users.

## The 3 commands

Open the **Terminal** app (press Cmd+Space, type "Terminal", hit Enter), then:

1. Go to the project folder:

   ```
   cd ~/Desktop/calorieiq
   ```

2. Start the app:

   ```
   npm run dev
   ```

3. It prints a line like `Local: http://localhost:5173/`.
   Hold **Cmd** and click that link (or paste it into your browser).

That's it — the app is now running on your Mac only.

## While it's running

- Leave that Terminal window **open**. The app updates itself automatically when
  files change (usually within a second), so you don't re-run anything for each edit.
- If your browser tab seems stale, just **refresh** it. If that doesn't work, use
  whatever link the Terminal currently shows — the address sometimes changes from
  `:5173` to `:5174`.

## When you're done

- Click back in the Terminal window and press **Ctrl + C** to stop the app.
- Or just close the Terminal window — that stops it too. Forgetting to stop it is
  harmless; it only runs while the window is open.

## Other commands you'll hear about

- `npm install` — only needed once, or after the project's building blocks change
  (not for everyday edits). Sets things up.
- `npm run build` — a "dress rehearsal" of the production version. If it ends with
  a line like `✓ built in ...`, the code is healthy and safe to publish. (A
  "chunks are larger than 500 kB" note is just advice, not an error.)

## Publishing (going live)

Pushing changes to the live website is a separate, deliberate step — ask for help
when you want to do it. Running the app locally (above) never publishes anything.
