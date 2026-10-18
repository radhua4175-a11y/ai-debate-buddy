# AI Debate Buddy

A debate practice app for students in Grades 4-6, following the wireframes: pick a topic (or surprise me), choose I agree / I disagree, an opponent (Friendly Fiona, Tough Tom, Strict Sam) and a turn timer, then debate for 3 short rounds with on-demand hints and optional voice input. Afterwards get star ratings, your best idea, what went well and what to try next time, ask the coach about your mistakes, and track stars, streaks and badges on My Progress. English and Hindi.

Stack: Next.js 16 (App Router, Cache Components), React 19, Tailwind CSS 4, Supabase (Postgres + email/password Auth + RLS), Vercel AI SDK via the AI Gateway.

## Setup

1. `npm install`
2. Create a Supabase project and run `supabase/migrations/0001_init.sql` in the SQL editor. Under **Authentication**:
   - **Sign In / Providers → Email**: enabled, with "Confirm email" on (recommended). Optionally raise the minimum password length to 8.
   - **URL Configuration**: set the Site URL and add `http://localhost:3000/auth/callback` (and your production `/auth/callback`) to Redirect URLs.
3. `cp .env.example .env.local` and fill in the Supabase URL and publishable key, plus `AI_GATEWAY_API_KEY` (not needed when deployed on Vercel).
4. `npm run dev`

## Scripts

`npm run dev` · `npm run build` · `npm run lint` · `npm run typecheck` · `npm test`

## Security notes

- Students sign up and log in with Supabase Auth (email + password). Every table is owner-only via RLS and API routes query as the signed-in user (no service-role key). The proxy redirects signed-out visitors to `/login`; it only checks for a session cookie, while the API verifies the session on every request.
- Post-login redirects (`?next=`) only accept same-site paths, so they can't be used as an open redirect.
- The student's first name is stored in their Supabase Auth profile (`user_metadata.name`) and shown only to them; it is never sent to the AI.
- Voice input uses the browser's built-in speech recognition only when the child taps Talk; some browsers process audio with their vendor's service, and the app never records or stores audio.
- All input is validated with zod; writes require JSON and a same-origin `Origin`.
- AI calls are rate limited per user (`ai_requests`), debates have turn caps, and custom topics are screened by the model.
- AI and student text is rendered as plain text, never HTML.
- Hardening to consider before a public launch: enable Supabase CAPTCHA on sign-up (accounts are free to create, so per-user limits alone don't cap total AI spend); since users are children, collect a parent's or school email and check the privacy rules (e.g. COPPA, DPDP Act) that apply to you; and set a spend limit on the AI Gateway.
- Adding a language: add it to `lib/i18n/config.ts`, create a dictionary (TypeScript enforces the same keys), and add titles/sample points to `lib/topics.ts` and the DB `locale` check.
