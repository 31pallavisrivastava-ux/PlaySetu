# PlaySetu

**Agentic sports infrastructure discovery & booking for Lucknow**

Unified platform to discover courts, turfs, pools, and arenas — book slots in real time, pay online, and use an AI assistant for conversational booking.

---

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, React Router, Tailwind CSS, Axios, Zustand |
| Backend | Node.js, Express (modular monolith) |
| Database | MySQL + Prisma |
| Cache / locks | Redis |
| Realtime | Socket.IO |
| AI | Google Gemini 3 Flash + function calling |
| Auth | JWT + refresh tokens |

No Docker — run MySQL and Redis locally (or managed services).

---

## Project structure

```text
PlaySetu/
├── client/                 # React (Vite)
├── server/
│   ├── prisma/
│   └── src/
│       ├── config/
│       ├── modules/        # auth, users, facilities, bookings,
│       │                   # recommendations, ai-agent, notifications, reviews,
│       │                   # analytics, admin
│       ├── shared/
│       ├── jobs/
│       └── socket/
└── package.json            # npm workspaces
```

---

## Quick start

### Prerequisites

- Node.js 20+
- MySQL 8+
- Redis 7+ (recommended for slot locks & search cache)

### 1. Install

```bash
npm install
cp server/.env.example server/.env
# Edit DATABASE_URL, JWT secrets, GEMINI_API_KEY (https://aistudio.google.com/apikey)
```

### 2. Database

```bash
npm run db:push
npm run db:seed
```

### 3. Run

```bash
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
| GET | `/api/admin/stats` | Admin stats (ADMIN role) |

---

## Booking engine

1. **Redis lock** — `lock:slot:{id}` during transaction  
2. **MySQL transaction** — `SELECT … FOR UPDATE` on slot row  
3. Slot → `BOOKED`, booking → `CONFIRMED` (no online payment)  
4. User pays at the venue; `paymentStatus` stays `PENDING` until you add a gateway later  

---

## AI agent

Orchestrator in `server/src/modules/ai-agent/`:

- **Tools:** `search_facility`, `get_slots`, `create_booking`, `send_notification`
- **Agent:** `booking.agent.js` (Gemini tools loop + keyword fallback without API key)
- **Model:** `gemini-3-flash-preview` (set `GEMINI_MODEL=gemini-3.5-flash` for stable 3.x Flash)
- **Prompt:** Lucknow sports assistant system prompt

Example:

```text
Book football turf near Chinhat tomorrow evening for 10 players under ₹2500
```

---

## Deployment (no Docker)

- **API:** PM2 + Nginx reverse proxy on Ubuntu  
- **DB:** AWS RDS or DigitalOcean Managed MySQL  
- **Redis:** ElastiCache or managed Redis  
- **Client:** `npm run build` → static host (S3 + CloudFront, Vercel, etc.)

---

## MVP roadmap

| Week | Focus |
|------|--------|
| 1 | Auth, facility CRUD, search ✅ |
| 2 | Booking engine ✅ (pay at venue, no gateway) |
| 3 | AI recommendations & chat ✅ |
| 4 | Notifications, admin panel (partial) |
| 5 | Scale, tests, production deploy |

---

## License

Proprietary — PlaySetu / Lucknow sports ecosystem.
