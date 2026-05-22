# PlaySetu

**Agentic sports infrastructure discovery & booking for Lucknow**

A single conversational interface that maps, recommends, and books any sports facility in the city — courts, turfs, pools, akharas — using a Gemini-powered agent that handles the full booking flow end-to-end.

---

## TL;DR

> Tell PlaySetu *"book badminton near Gomti Nagar tonight under ₹500"* — the agent searches live inventory, checks availability, books your slot, and confirms in one turn. No tab-hopping, no phone calls, no copy-pasting addresses into Maps.

---

## The pitch

### Problem (PS-25)

Lucknow has **hundreds** of badminton courts, football turfs, swimming pools, and kabaddi akharas scattered across Gomti Nagar, Chinhat, SAI Lucknow, Lohia Park, and dozens of other localities. There is **no unified discovery or booking layer**.

Today a player who wants to play badminton at 7pm has to:

1. Search Justdial / Google / Facebook groups individually
2. Cross-check prices on each venue's flaky website
3. Phone the venue to ask if a slot is free
4. Negotiate price and confirm verbally
5. Travel only to find the court already taken

Meanwhile **venue owners lose 30–40% of potential bookings** to discovery friction, missed calls, and inability to advertise live availability. There is no Playo-equivalent built for the realities of Tier-2 cities like Lucknow — bilingual users, pay-at-venue norms, irregular operating hours, and constantly-changing infrastructure.

### Our proposition

**One agentic interface that handles the entire booking journey.**

- **Discover** — Type or speak ("Hindi mein bhi"). The Gemini agent calls `search_venues` with whatever info it has (sport, area, your live GPS, budget, skill) and shows matched options on a map.
- **Decide** — Each venue card surfaces price, distance, rating, and a one-tap "View on Google Maps" link. The agent narrates trade-offs in plain language.
- **Book** — Confirm the slot in chat. The agent invokes `book_slot`, locks the slot in Redis, commits in Postgres, and returns a confirmation — all without leaving the conversation.
- **Cancel** — Same agent, `cancel_booking` tool. Refund eligibility is handled by policy.
- **Stay current** — A background `scrape-venues` script uses Gemini's Google Search grounding to discover newly-opened venues directly from the web and upsert them into the catalog. The map is never stale.

### Differentiators

| | PlaySetu | Playo / generic listings |
|---|---|---|
| **Agentic flow** | Single chat handles discover → book → cancel | Static list + manual booking form |
| **Self-mapping catalog** | Gemini grounding scrapes new venues automatically | Manual ops team adds venues one-by-one |
| **Skill-matched recommendations** | Filters by Beginner / Intermediate / Advanced suitability | Same listings for everyone |
| **Geo-aware** | Uses browser geolocation as search center, haversine radius | Address-based, no distance ranking |
| **Bilingual-ready** | Prompt accepts Hindi & English; INR pricing | English-first |
| **India-native commercials** | Pay-at-venue model — no payment gateway required to launch | Online payment mandatory |
| **Map-first UX** | Leaflet pins + popups on every result | List-only |
| **Persistent context** | Postgres-backed chat memory; conversations survive restarts and devices | Session-only |

---

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 (Vite), Tailwind, Zustand, Axios, Leaflet + OpenStreetMap |
| Backend | Node.js 20+, Express (modular monolith) |
| Database | **PostgreSQL** + Prisma |
| Cache / locks | Redis (slot locks, search cache) |
| Realtime | Socket.IO |
| AI | Google Gemini (`gemini-3.5-flash` default) with function calling + Google Search grounding |
| Auth | JWT (access + refresh) |

No Docker required — Postgres and Redis run locally or via any managed service.

---

## Project structure

```text
PlaySetu/
├── client/                       # React (Vite)
│   └── src/
│       ├── components/           # VenueCard, VenueMap, …
│       ├── pages/                # AiChatPage, FacilitiesPage, …
│       └── lib/geolocation.js    # navigator.geolocation helper
├── server/
│   ├── prisma/schema.prisma      # User, Facility, Court, Slot, Booking, ChatMessage, …
│   ├── scripts/scrape-venues.js  # Gemini-grounding real-time venue importer
│   └── src/
│       ├── config/
│       ├── modules/
│       │   ├── ai-agent/         # orchestrator, tools, prompts
│       │   ├── auth, users, facilities, bookings,
│       │   ├── recommendations, reviews, notifications, admin
│       ├── shared/
│       ├── jobs/
│       └── socket/
└── package.json                  # npm workspaces
```

---

## Quick start

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- Redis 7+ (for slot locks & search cache)
- A Gemini API key — https://aistudio.google.com/apikey

### 1. Install

```bash
npm install
cp server/.env.example server/.env
# Edit DATABASE_URL, JWT secrets, GEMINI_API_KEY
```

### 2. Database

```bash
cd server
npx prisma migrate dev
npm run db:seed
```

### 3. Seed live venues (optional, uses Gemini)

```bash
node scripts/scrape-venues.js
# or scoped:
node scripts/scrape-venues.js --sport=badminton --area="Gomti Nagar"
```

### 4. Run

```bash
cd ..
npm run dev
```

- API: http://localhost:4000
- Web: http://localhost:5173

### Demo accounts (after seed)

| Role | Email | Password |
|------|-------|----------|
| User | user@playsetu.in | Password123! |
| Owner / venue manager | owner@playsetu.in | Password123! → `/owner` dashboard |
| Admin | admin@playsetu.in | Password123! |

**Seed venues:** 18 Lucknow facilities across all app areas (Gomti Nagar, Chinhat, Aliganj, Indira Nagar, Hazratganj, SAI Lucknow, Lohia Park, Jankipuram, Vikas Nagar), including **Colvin Cricket Academy** (cricket nets on University Rd, Aliganj). Re-run `npm run db:seed` to refresh demo slots and owner venues.

---

## API overview

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh token |
| GET | `/api/facilities` | Search facilities |
| GET | `/api/facilities/:id` | Facility detail |
| GET | `/api/facilities/slots` | Slots by court + date |
| POST | `/api/bookings` | Book slot — body: `{ slotId, playerCount }` (validated per sport, e.g. badminton 2–4) |
| GET | `/api/bookings/my` | User bookings |
<<<<<<< HEAD
| GET | `/api/owner/summary` | Venue manager stats (OWNER) |
| GET | `/api/owner/slots` | Slot schedule for owner's venues |
| GET | `/api/owner/bookings` | Bookings on owner's venues |
| POST | `/api/owner/facilities` | Create venue (ACTIVE) |
| PATCH | `/api/owner/facilities/:id` | Update venue |
| PATCH | `/api/owner/facilities/:id/status` | Enable (`ACTIVE`) / disable (`INACTIVE`) |
| DELETE | `/api/owner/facilities/:id` | Delete venue (blocked if active bookings) |
| DELETE | `/api/bookings/:id` | Cancel |
| POST | `/api/ai/chat` | Conversational AI |
| POST | `/api/ai/recommend` | AI recommendations |
| POST | `/api/ai/book` | Agent auto-book |
=======
| DELETE | `/api/bookings/:id` | Cancel booking |
| POST | `/api/ai/chat` | Conversational agent (accepts `{ message, location: { lat, lng }? }`) |
| GET | `/api/ai/history` | Persistent chat history for the user |
| DELETE | `/api/ai/history` | Clear chat history |
| POST | `/api/ai/recommend` | Direct recommendations |
| POST | `/api/ai/book` | Agent auto-book by slot id |
>>>>>>> 970398fa208871d4884c4a6a05ea29190a2ae3e4
| GET | `/api/admin/stats` | Admin stats (ADMIN role) |

---

## Booking engine

1. **Redis lock** — `lock:slot:{id}` during the transaction
2. **Postgres transaction** — `SELECT … FOR UPDATE` on the slot row
3. Slot → `BOOKED`, booking → `CONFIRMED` (no online payment by default)
4. User pays at the venue; `paymentStatus` stays `PENDING` until a gateway is added

---

## AI agent

Orchestrator in `server/src/modules/ai-agent/`:

- **Tools (function-calling):**
  - `search_venues` — sport / area / budget / skill / radiusKm; uses session lat/lng
  - `check_availability` — venueId + date + optional timeSlot
  - `book_slot` — venueId + date + timeSlot (userId always from session)
  - `cancel_booking` — bookingId
  - `web_search` — Gemini Google Search grounding in a separate request (grounding can't combine with function declarations in one call, so we hop)
- **Loop:** up to 8 tool-call iterations + forced-text final pass
- **Persistence:** every user + assistant turn is written to `ChatMessage` table; `/api/ai/history` lets the client restore conversations on reload
- **Model:** `gemini-3.5-flash` (set `GEMINI_MODEL=` in `server/.env`); fallbacks to `gemini-2.5-flash` then `gemini-2.0-flash` on recoverable errors (incl. 429)

Example:

```text
Book a football turf near Chinhat tomorrow evening for 10 players under ₹2500
```

---

## Real-time venue mapping

The `scrape-venues` script uses Gemini's Google Search grounding to discover live venue data and upsert it into Postgres. Run it on a cron, or live during a demo to show the catalog grow:

```bash
# Pull badminton venues across all configured Lucknow areas
node server/scripts/scrape-venues.js --sport=badminton
```

The script auto-creates a `system@playsetu.local` owner user, attaches a default court per venue, and skips venues without valid coordinates.

---

## Deployment (no Docker)

- **API:** PM2 + Nginx reverse proxy on Ubuntu
- **DB:** AWS RDS / DigitalOcean Managed Postgres
- **Redis:** ElastiCache or managed Redis
- **Client:** `npm run build` → static host (S3 + CloudFront, Vercel, etc.)

---

## Roadmap

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Auth, facility CRUD, search | Done |
| 2 | Booking engine (pay at venue) | Done |
| 3 | AI agent + tools + Gemini grounding | Done |
| 4 | Persistent chat, map UI, skill filter, scrape script | Done |
| 5 | Push notifications + PWA offline cache | Next |
| 6 | Owner dashboard (live bookings, revenue, calendar) | Next |
| 7 | Production hardening (tests, monitoring, deploy) | Next |

---

## License

Proprietary — PlaySetu / Lucknow sports ecosystem.
