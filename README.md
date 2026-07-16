# brielos-northstar

## Purpose
A self-hosted tracker for running a goal against its supporting structure — one North Star, the factors that hold it up, and daily execution against them — without an external SaaS tool holding the data.

## Key Takeaway
Three views, one database. **Atrium** holds the North Star (goal, purpose, target date). **Gallery** holds supporting Factors as milestones you can add, reorder, and mark complete. **Corridor** is the daily log — focus for the day, routines checked off, friction notes — one entry per date. Everything persists to a local SQLite database through Prisma; there's no external service in the loop.

## Setup
Stack: Next.js 16, React 19, Tailwind, shadcn/ui, Prisma + SQLite.

\`\`\`bash
bun install
cp .env.example .env        # set DATABASE_URL, e.g. file:./db/custom.db
bun run db:generate
bun run db:push
bun run dev                 # http://localhost:3000
\`\`\`

## Verification
- App loads at \`localhost:3000\` with three tabs: Atrium, Gallery, Corridor.
- Edit the manifesto in Atrium, refresh — the goal/purpose/date persist.
- Add a Factor in Gallery, mark it complete — it survives a refresh.
- Log a Corridor entry for today, navigate away and back — it's still there.
- Inspect \`db/custom.db\` directly (\`sqlite3 db/custom.db ".tables"\`) to see \`Manifesto\`, \`Milestone\`, and \`DailyPulse\` rows if you want to confirm persistence at the data layer, not just in the UI.

## Common Mistakes
- Running \`bun run dev\` before \`db:push\` — the tables won't exist yet and API calls will fail silently in the UI.
- Assuming this syncs anywhere. It doesn't write to git, and it isn't a CLI tool — it's a local web app. If you want the data portable, that's a manual export you'd add, not a built-in feature yet.

## Outcome
A working, three-part goal tracker you can run locally and hold state in without a third-party dashboard. It's a first build, not a finished product — the deliberate next decision is what (if anything) gets added, not what gets described that isn't there yet.
