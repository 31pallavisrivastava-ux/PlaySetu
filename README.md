# PlaySetu

# accessibilty_warriors-gdg_hackathon


# PlayOS AI
## Agentic Sports Infrastructure Discovery & Booking Platform

AI-native sports infrastructure discovery, booking, and recommendation platform for cities like Lucknow.

---

# Overview

PlayOS AI is an intelligent sports infrastructure operating system that enables users to:

- Discover sports venues nearby
- Book slots in real time
- Get AI-powered recommendations
- Handle cancellations and rescheduling
- Use conversational booking
- Access dynamic pricing and availability

The platform supports:

- Badminton courts
- Football turfs
- Cricket nets
- Swimming pools
- Tennis courts
- Kabaddi akharas
- Indoor stadiums
- Coaching academies

Primary launch city:

- Lucknow, India

Key target areas:

- Gomti Nagar
- Chinhat
- SAI Lucknow Center
- Lohia Park

---

# Core Features

## User Features

- Facility discovery
- Real-time slot booking
- AI-assisted search
- Conversational booking
- Smart recommendations
- Nearby sports infrastructure
- Booking history
- Instant cancellations
- Matchmaking
- Notifications and reminders

---

## Facility Owner Features

- Facility onboarding
- Slot management
- Dynamic pricing
- Occupancy analytics
- Booking management
- Revenue dashboard
- Notification automation

---

# AI Features

## Agentic AI Workflows

The system uses autonomous AI agents for:

- Intent understanding
- Smart search
- Booking orchestration
- Dynamic pricing
- Support automation
- Recommendation systems

---

## Example

User input:

```text
Book a badminton court near Gomti Nagar tomorrow evening under ₹500
```

AI workflow:

```text
Intent Detection
↓
Location Resolution
↓
Facility Search
↓
Availability Check
↓
Price Filtering
↓
Slot Reservation
↓
Booking Confirmation
```

---

# Tech Stack

## Frontend

### Web

- js
- React
- TailwindCSS

### Mobile

- React Native

---

## Backend

- Node.js
- TypeScript
- NestJS

---

## Databases

### Primary Database

- PostgreSQL

### Cache

- Redis

### Search

- Elasticsearch

### Analytics

- ClickHouse

---

## Infrastructure

- AWS
- Kubernetes
- Docker
- Kafka

---

## AI Stack

### LLM

- OpenAI GPT models
- Anthropic Claude

### AI Frameworks

- LangGraph
- LangChain

---

# High-Level Architecture

```text
                ┌───────────────────┐
                │ Web/Mobile Apps   │
                └─────────┬─────────┘
                          │
                ┌─────────▼─────────┐
                │ API Gateway       │
                └─────────┬─────────┘
                          │
       ┌────────────────────────────────┐
       │        Core Services            │
       └────────────────────────────────┘

 ┌────────────┐ ┌────────────┐ ┌────────────┐
 │ User Svc   │ │ SearchSvc  │ │ BookingSvc │
 └────────────┘ └────────────┘ └────────────┘

  ┌────────────┐ ┌────────────┐
  │ NotifySvc  │ │ ReviewSvc  │
  └────────────┘ └────────────┘

 ┌────────────┐ ┌────────────┐ ┌────────────┐
 │ AI AgentSvc│ │ PricingSvc │ │ GeoSvc     │
 └────────────┘ └────────────┘ └────────────┘

     ┌────────────────────────────────────┐
     │ PostgreSQL + Redis 
     └────────────────────────────────────┘
```

---

# Repository Structure

```text
playos-ai/
│
├── apps/
│   ├── web/
│   ├── mobile/
│   └── admin/
│
├── services/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── booking-service/
│   ├── facility-service/
│   ├── search-service/
│   ├── payment-service/
│   ├── notification-service/
│   ├── ai-agent-service/
│   ├── pricing-service/
│   └── analytics-service/
│
├── packages/
│   ├── shared-types/
│   ├── ui-components/
│   ├── utils/
│   └── configs/
│
├── infrastructure/
│   ├── docker/
│   ├── kubernetes/
│   ├── terraform/
│   └── monitoring/
│
├── docs/
│
└── README.md
```

---

# Backend Structure (NestJS)

```text
src/
 ├── modules/
 │    ├── auth/
 │    ├── users/
 │    ├── facilities/
 │    ├── bookings/
 │    ├── payments/
 │    ├── notifications/
 │    ├── ai/
 │    ├── search/
 │    └── analytics/
 │
 ├── common/
 ├── config/
 ├── database/
 ├── kafka/
 ├── redis/
 └── main.ts
```

---

# Database Schema

## Users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name TEXT,
  phone TEXT,
  email TEXT,
  skill_level TEXT,
  created_at TIMESTAMP
);
```

---

## Facilities

```sql
CREATE TABLE facilities (
  id UUID PRIMARY KEY,
  name TEXT,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  rating NUMERIC,
  owner_id UUID
);
```

---

## Slots

```sql
CREATE TABLE slots (
  id UUID PRIMARY KEY,
  facility_id UUID,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  status TEXT,
  price NUMERIC
);
```

---

## Bookings

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  user_id UUID,
  slot_id UUID,
  payment_status TEXT,
  booking_status TEXT,
  created_at TIMESTAMP
);
```

---

# Booking Consistency

To avoid double bookings:

- Redis distributed locking
- Transactional DB updates
- Idempotent APIs
- Kafka event-driven workflows

---

## Booking Flow

```text
1. Acquire Redis lock
2. Validate slot
3. Initiate payment
4. Create booking
5. Update slot status
6. Send notifications
7. Release lock
```

---

# AI Agent Architecture

## AI Agents

### Search Agent

- Natural language understanding
- Facility search
- Semantic filtering

---

### Booking Agent

- Slot reservation
- Retry handling
- Alternative recommendations

---

### Pricing Agent

- Peak hour pricing
- Demand prediction
- Occupancy optimization

---

### Geo Agent

- Distance optimization
- ETA calculations

---

### Support Agent

- Refunds
- Rescheduling
- User support

---

# APIs

## Search Facilities

```http
GET /facilities/search
```

Example:

```text
/facilities/search?sport=badminton&lat=26.8467&lng=80.9462&radius=10
```

---

## Create Booking

```http
POST /bookings
```

Body:

```json
{
  "slotId": "uuid",
  "paymentMethod": "UPI"
}
```

---

## AI Chat Endpoint

```http
POST /ai/chat
```

Body:

```json
{
  "message": "Book football turf near Chinhat tomorrow evening"
}
```

---

# Scalability Goals

| Metric | Target |
|---|---|
| Users | 1M+ |
| Concurrent Users | 100K |
| Bookings/hour | 50K |
| API Latency | <200ms |

---

# Scalability Strategy

- Horizontal scaling
- Kubernetes autoscaling
- Redis caching
- Kafka event processing
- CDN optimization
- Read replicas

---

# Security

- JWT Authentication
- Refresh Tokens
- RBAC
- API Rate Limiting
- Audit Logs
- Secure Payments
- Webhook Signature Validation

---

# Notifications

Supported channels:

- Email

---

# Monitoring

- Prometheus
- Grafana
- ELK Stack
- OpenTelemetry

---

# Development Phases

---

## Phase 1 — MVP

Build:

- Authentication
- Facility onboarding
- Search
- Booking
- Payments
- Notifications

---

## Phase 2 — AI Layer

Build:

- Conversational booking
- AI recommendations
- AI search

---

## Phase 3 — Agentic Automation

Build:

- Autonomous rescheduling
- Smart recommendations
- Dynamic pricing
- AI workflows

---

---

# Local Development

## Prerequisites

- Node.js 20+
- PostgreSQL
- Redis

---

# Install

```bash
npm install
```

---

# Run Development Server

```bash
npm run dev
```

---
---

# Environment Variables

```env
PORT=3000

DATABASE_URL=
REDIS_URL=

JWT_SECRET=

OPENAI_API_KEY=

```

---

# Recommended Development Strategy

IMPORTANT:

Do NOT begin with microservices.

Start with:

- Modular monolith
- Clean architecture
- Domain-driven modules

Then gradually extract services.

---


> AI Operating System for Sports Infrastructure

Future expansion:

- Tournaments
- AI coaching
- Sports commerce
- Community matchmaking
- Wearable integrations
- Franchise analytics
- Smart stadium integrations

---

# License

MIT License

---

# Contributors

Core Engineering Team

- Backend Engineers
- AI Engineers
- DevOps Engineers
- Mobile Developers
- Product Designers