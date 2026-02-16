# Concert Ticket Assignment (Next.js + NestJS)

This repository contains a full-stack implementation of the concert reservation assignment:
- `frontend`: Next.js app (responsive admin/user interface)
- `backend`: NestJS REST API (concert CRUD + reservations + history)

## Features Implemented

### Task 1: Basic setup + landing
- Monorepo setup with `frontend` and `backend` workspaces.
- Next.js landing page with role switch between Admin and User views.

### Task 2: Responsive design
- Custom CSS layout inspired by the provided Figma:
  - Left sidebar navigation
  - Dashboard stat cards
  - Concert list cards
  - Create form + history tables
  - Delete confirmation modal
- Responsive behavior for desktop/tablet/mobile using media queries.

### Task 3: Free concert tickets CRUD
- Admin:
  - Create concert (`name`, `description`, `totalSeats`)
  - Delete concert
  - View all reservation history
- User:
  - View all concerts (including sold-out)
  - Reserve one seat per user per concert
  - Cancel own reservation
  - View own reservation history

### Task 4: Server-side validation + client error handling
- Backend uses NestJS `ValidationPipe` with DTO validation (`class-validator`).
- Invalid requests return structured HTTP errors.
- Frontend catches API errors and displays messages in UI alerts.

### Task 5: Unit tests
- Backend unit tests added for core CRUD/reservation logic:
  - Create/list
  - Reserve/cancel
  - Duplicate reservation prevention
  - Sold-out handling
  - Delete concert

## Architecture Overview

- Backend keeps in-memory state for this assignment:
  - `concerts[]`
  - `history[]`
- Main backend components:
  - `ConcertsController`: REST endpoints
  - `ConcertsService`: business rules and state transitions
  - DTOs for input validation
- Frontend:
  - `app/page.tsx`: role switch and entry point
  - `components/AdminView.tsx`: admin dashboard, create/delete/history
  - `components/UserView.tsx`: user concert list + reserve/cancel + own history
  - `lib/api.ts`: typed API client + error parsing

## API Endpoints

- `GET /concerts`
- `GET /concerts/metrics`
- `GET /concerts/history`
- `GET /concerts/history?userId=user-jane`
- `POST /concerts`
- `DELETE /concerts/:concertId`
- `POST /concerts/:concertId/reserve`
- `POST /concerts/:concertId/cancel`

## Libraries Used

### Backend
- `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`: NestJS framework
- `class-validator`, `class-transformer`: request validation
- `jest`, `ts-jest`: unit testing

### Frontend
- `next`, `react`, `react-dom`: web application framework

## Local Setup

### Requirements
- Node.js 18+
- npm 9+

### Install dependencies
```bash
npm install
```

### Run backend + frontend
```bash
npm run dev
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3002`

### Run tests
```bash
npm test
```

## Bonus: Scalability Opinions

### 1) Optimize performance under heavy data and high traffic
- Add database indexes on query-heavy fields.
- Introduce caching for read-heavy endpoints (`/concerts`, `/metrics`) with Redis.
- Use pagination/infinite scroll for history and concerts.
- Add CDN + HTTP caching for frontend assets.
- Horizontal scale API instances behind a load balancer.

### 2) Prevent overbooking during simultaneous reservations
- Move reservation logic into a transactional database operation.
- Use row-level locking (`SELECT ... FOR UPDATE`) or optimistic concurrency control.
- Enforce uniqueness constraints (e.g., user + concert reservation uniqueness).
- Make reservation endpoint idempotent and retry-safe.
- Optionally queue reservation attempts for extreme spikes.
