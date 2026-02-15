# YMovies v3 — Next Chapter Roadmap

> **Goal:** Transform YMovies from a movie browser into a fully-featured, production-grade streaming companion that users actively rely on.

---

## 🔴 P0 — Critical Fixes (Ship Blockers)

- [ ] **Fix Settings page auth** — Settings API calls don't send `Authorization` Bearer token; preferences silently fail to persist for logged-in users
- [ ] **Sync collections to server** — Custom user collections (created in MyList) only live in localStorage; they vanish on device switch or cache clear. Add a `collections` table and API endpoints
- [ ] **Fix broken notification toggles** — Settings page has notification preferences UI but zero backend; either remove the toggles or build the system
- [ ] **Implement the hybrid recommender** — `hybrid_recommender.py` is an empty file. Wire up the planned collaborative + content-based hybrid engine
- [ ] **Enable OnboardingTutorial** — Component exists but is commented out in the router. Polish and activate it for first-time users

---

## 🟠 P1 — Core Feature Gaps

### Playback & Watch Experience
- [ ] **Trailer auto-play on detail pages** — Embed YouTube/TMDB trailers inline with a full-width cinematic player (not just a link)
- [ ] **"Where to Watch" integration** — Use TMDB's `/watch/providers` endpoint to show streaming availability (Netflix, Hulu, Prime, etc.) per region with deep links
- [ ] **Watch progress tracking UI** — The DB stores `watchProgress` (0-100%) and `lastStoppedAt` but there's no UI for it. Add progress bars on cards and a "Continue Watching" row on Home
- [ ] **Episode tracking for TV shows** — Track per-episode watch status (watched/unwatched), show next unwatched episode, mark seasons as complete

### Rating & Review System
- [ ] **In-app star rating flow** — DB has `watch_history.rating` (1-5) but no UI to rate. Add a rating modal on detail pages and after marking as "watched"
- [ ] **User micro-reviews** — Let users write short reviews (280 chars) stored server-side, displayed alongside TMDB reviews
- [ ] **Rating-based recommendations** — Feed user ratings into the recommendation engine for better personalization

### Discovery & Browsing
- [ ] **Advanced Discover page** — Dedicated `/discover` page with multi-filter builder: combine genre + year range + rating range + language + runtime + keywords + cast/crew + streaming provider
- [ ] **"Surprise Me" random pick** — Button that picks a random movie/show matching user taste profile, with a fun reveal animation
- [ ] **Mood-based browsing** — "I want something funny and light" / "Dark and intense" / "Feel-good family" — map moods to genre+keyword combos
- [ ] **Collections/curated lists** — Staff-curated or AI-generated themed lists: "Best Sci-Fi of the 2010s", "Oscar Winners You Missed", "Under 90 Minutes", "Based on True Stories"
- [ ] **People pages** — `/person/:id` page for actors/directors with full filmography, bio, photos, and "more from this person" recommendations
- [ ] **Network/Studio pages** — Browse content by production company or TV network (HBO, A24, Marvel Studios, etc.)

---

## 🟡 P2 — User Experience & Polish

### Navigation & Search
- [ ] **Command palette (⌘K / Ctrl+K)** — Global quick-search overlay using the existing `cmdk` component (already in UI primitives but unused). Search movies, TV, people, genres, and app pages
- [ ] **Voice search** — Web Speech API integration for hands-free search
- [ ] **Search history & saved searches** — Remember recent searches, allow pinning frequent searches
- [ ] **Infinite scroll on browse pages** — Replace pagination with smooth infinite scroll + skeleton loading
- [ ] **Keyboard navigation** — Arrow keys to browse movie sliders, Enter to select, Escape to go back (accessibility win)

### Visual & Animation Upgrades
- [ ] **Parallax hero banners** — Subtle depth effect on hero images as user scrolls
- [ ] **Card hover previews** — On desktop, hovering a movie card expands it (Netflix-style) showing rating, year, genres, and a mini description
- [ ] **Smooth shared element transitions** — When clicking a movie card, animate the poster into the detail page position (View Transitions API or Framer Motion `layoutId`)
- [ ] **Skeleton loading v2** — Match exact card/banner dimensions for zero layout shift (CLS = 0)
- [ ] **Micro-interactions** — Subtle animations on favorite/watchlist toggle (heart burst, bookmark slide), rating stars (fill animation), and toast notifications

### Personalization
- [ ] **Genre preference onboarding** — On first sign-up, show a grid of genres with poster previews; user picks 3-5 favorites to bootstrap recommendations
- [ ] **"Not Interested" button** — Let users dismiss recommendations they don't want; feed this negative signal back into the engine
- [ ] **Taste profile visualization** — On Profile page, show a radar chart or genre wheel of the user's taste DNA based on their ratings and history
- [ ] **Time-aware recommendations** — Suggest shorter content on weeknights, longer on weekends. Suggest "morning vibes" or "late night" content based on time of day

---

## 🟢 P3 — Social & Community Features

- [ ] **Public user profiles** — Optional public profile showing favorites, reviews, and stats (with privacy controls)
- [ ] **Activity feed** — See what friends rated, added to watchlist, or reviewed
- [ ] **Follow system** — Follow other users to see their activity and lists
- [ ] **Shareable watchlists** — Generate a share link for any collection/watchlist; recipients see it read-only or can clone it
- [ ] **Watch parties (async)** — "Watch Together" lists where a group agrees on a movie and everyone marks when they've watched it
- [ ] **Discussion threads** — Per-movie/show discussion boards for spoiler-tagged conversations
- [ ] **Reactions on reviews** — Like, helpful, funny, etc. reactions on user reviews
- [ ] **Social sharing cards** — Beautiful Open Graph preview cards when sharing movies/shows on Twitter, Discord, etc.

---

## 🔵 P4 — Advanced & Power-User Features

### AI-Powered Features
- [ ] **Natural language search** — "Movies like Inception but more emotional" or "90s action movies with a female lead" — use an LLM to translate natural language into TMDB filter queries
- [ ] **AI movie summaries** — Generate spoiler-free, personalized "why you'll like this" blurbs based on user taste
- [ ] **Watch order assistant** — For franchises (MCU, Star Wars, LOTR), show recommended watch order (chronological vs. release) with visual timeline
- [ ] **Smart notifications** — "A sequel to a movie you loved is releasing next month" / "A new season of [show] just dropped"
- [ ] **Conversation-style recommendation chat** — Chat UI where users describe what they're in the mood for and get curated suggestions in real-time

### Analytics & Insights (Profile Dashboard)
- [ ] **Year in review / stats dashboard** — Total movies/shows watched, hours watched, top genres, most-watched decade, rating distribution, monthly activity heatmap
- [ ] **Genre diversity score** — Gamify exploration: "You've watched 80% action this month — try a documentary!"
- [ ] **Rating patterns** — Show the user how their ratings compare to TMDB averages (are they a generous or tough critic?)
- [ ] **Watchlist aging alerts** — "You added [movie] 6 months ago and still haven't watched it"
- [ ] **Personal milestones** — "You just watched your 100th movie!" with shareable achievement cards

### Content Calendar & Releases
- [ ] **Upcoming releases calendar** — Monthly calendar view of upcoming movies and TV seasons, filterable by genre
- [ ] **Release reminders** — Set a reminder for an upcoming movie; get notified (email or push) on release day
- [ ] **Box office tracker** — Show current box office numbers for movies in theaters
- [ ] **New on streaming** — "New on Netflix this week" / "Leaving Hulu soon" sections

### Multi-Device & Offline
- [ ] **PWA (Progressive Web App)** — Installable on mobile, offline-capable for browsing cached content, push notifications
- [ ] **Responsive redesign audit** — Ensure every page is pixel-perfect on mobile, tablet, and desktop
- [ ] **Offline watchlist** — Cache watchlist data so users can browse their list without internet

---

## 🟣 P5 — Infrastructure & Developer Experience

### Testing
- [ ] **Unit tests** — Jest + React Testing Library for components (currently `echo "No tests specified yet"`)
- [ ] **API integration tests** — Supertest for all Express endpoints
- [ ] **E2E tests** — Playwright or Cypress for critical user flows (sign up → browse → add to watchlist → rate)
- [ ] **Recommendation engine tests** — Validate recommendation quality with snapshot tests and diversity metrics
- [ ] **CI pipeline** — GitHub Actions: lint → typecheck → test → build on every PR

### Code Quality
- [ ] **ESLint + Prettier setup** — Currently `echo "Linting passed"`. Add real ESLint config with React, TypeScript, and accessibility rules
- [ ] **Strict TypeScript** — Enable `strict: true` in tsconfig and fix all resulting type errors
- [ ] **Error monitoring** — Sentry integration for both client and server
- [ ] **Structured logging** — Replace `console.log` with Winston/Pino structured JSON logs
- [ ] **API rate limiting** — Rate-limit public endpoints to prevent TMDB API key abuse
- [ ] **Input validation** — Zod validation on all API endpoints (some endpoints trust raw user input)

### Performance
- [ ] **Image optimization** — Lazy-load all TMDB poster/backdrop images with blur-up placeholders (use `loading="lazy"` + LQIP)
- [ ] **Bundle splitting** — Code-split each page route; current bundle likely ships everything
- [ ] **Server-side caching layer** — Redis or in-memory LRU cache for TMDB API responses (reduce latency + avoid rate limits). Current 30s TTL on recommendations is too aggressive
- [ ] **Database query optimization** — Add indexes on `watchlist_items(userId)`, `watch_history(userId)`, `favorite_items(userId)` if missing
- [ ] **Prefetch on hover** — When hovering a movie card, prefetch the detail page data so navigation feels instant
- [ ] **Service Worker caching** — Cache static assets and TMDB configuration data for faster repeat visits

### Admin & Moderation
- [ ] **Admin dashboard** — `requireAdmin` middleware exists but no admin UI. Build `/admin` with: user management, feature flags, recommendation tuning, system health
- [ ] **Feature flags** — LaunchDarkly or simple DB-based flags to toggle features without deploys
- [ ] **Content moderation** — Review queue for user-generated reviews before public display
- [ ] **Analytics dashboard** — Track popular searches, most-added movies, recommendation click-through rates

### Database & Schema
- [ ] **Collections table** — `user_collections(id, userId, name, description, isPublic, items JSONB, createdAt, updatedAt)`
- [ ] **User ratings table** — Separate from watch_history for cleaner queries: `ratings(userId, mediaId, mediaType, rating, createdAt)`
- [ ] **User reviews table** — `reviews(id, userId, mediaId, mediaType, content, spoiler, likes, createdAt)`
- [ ] **Follows table** — `follows(followerId, followingId, createdAt)`
- [ ] **Notifications table** — `notifications(id, userId, type, payload JSONB, read, createdAt)`
- [ ] **Migration system** — Switch from `drizzle-kit push` to proper versioned migrations

---

## 📋 Suggested Implementation Order

### Phase 1 — Foundation (Weeks 1-2)
1. Fix P0 bugs (settings auth, collection sync, notification toggles)
2. ESLint + Prettier + strict TypeScript
3. "Where to Watch" providers on detail pages
4. Star rating UI flow on detail pages
5. Continue Watching row on Home (use existing watch_history data)

### Phase 2 — Discovery (Weeks 3-4)
6. People pages (`/person/:id`)
7. Advanced Discover page with multi-filter builder
8. Command palette (⌘K) for global search
9. Card hover previews (Netflix-style expand)
10. Genre preference onboarding for new users

### Phase 3 — Engagement (Weeks 5-6)
11. User micro-reviews + display on detail pages
12. "Not Interested" dismissals + feedback loop
13. Taste profile visualization on Profile
14. Year-in-review stats dashboard
15. Upcoming releases calendar

### Phase 4 — Social (Weeks 7-8)
16. Public profiles + follow system
17. Shareable watchlists
18. Activity feed
19. Social sharing cards (Open Graph)
20. Mood-based browsing

### Phase 5 — AI & Intelligence (Weeks 9-10)
21. Complete the hybrid recommender (Python)
22. Natural language search
23. Smart notifications system
24. "Surprise Me" random pick
25. Watch order assistant for franchises

### Phase 6 — Production Hardening (Weeks 11-12)
26. Unit + integration + E2E test suite
27. CI/CD pipeline
28. Sentry error monitoring
29. Performance optimization pass (images, bundle split, caching)
30. PWA conversion

---

*Last updated: February 12, 2026*
