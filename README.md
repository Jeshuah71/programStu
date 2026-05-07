# SUU Student Programmer Onboarding Hub

SUU Student Programmer Onboarding Hub is a polished demo application for onboarding student developers inside Southern Utah University IT. It combines a guided student checklist, mentor support tools, blocker handling, and a manager dashboard into one demo-ready interface styled around SUU red, black, white, and gray.

## SUU Theme

- SUU-inspired UI palette using:
  - `#DB0000` SUU Red
  - `#C41425` Alternate Red
  - `#000000` Black
  - `#575351` Dark Gray
  - `#E7E7E7` Light Gray
  - `#FFFFFF` White
- Internal university dashboard look rather than a generic SaaS style
- Text-based SUU badge and “Thunderbird Ready” readiness language for the demo

## Features

- Student view with:
  - onboarding profile card
  - mentor assignment and `mailto:` action
  - readiness score and Thunderbird Ready badge
  - onboarding phase timeline
  - grouped task checklist
  - onboarding reflection form
  - recommended documentation
  - recommended starter issue
- Manager dashboard with:
  - summary stats
  - weekly manager report
  - copy report action
  - active blocker center
  - starter issue overview
  - student search, filtering, sorting, and detail modal
- Graceful fallback demo mode:
  - if the backend is unavailable, the frontend loads polished local demo data
  - the app stays presentable and interactive instead of breaking on `Failed to fetch`
- Mock SUU Onboarding Assistant:
  - explain this task
  - blocker help
  - mentor message draft
  - manager summary support

## AI Assistant Note

The SUU Onboarding Assistant is mocked for demo purposes and can later be connected to a real LLM API such as OpenAI.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, lucide-react
- Backend: Node.js, Express, CORS
- Storage: JSON file storage in `backend/data/students.json`
- Tooling: nodemon, concurrently

## Run The App

From the project root:

```bash
npm install
npm run install:all
npm run dev
```

Default ports:

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

## Run Backend Only

```bash
npm run dev --prefix backend
```

Production-style backend start:

```bash
npm run start --prefix backend
```

## Run Frontend Only

```bash
npm run dev --prefix frontend
```

## Run Both Manually

```bash
npm install --prefix backend
npm install --prefix frontend
npm run dev --prefix backend
npm run dev --prefix frontend
```

## Troubleshooting “Failed to fetch”

This app now handles the original fetch issue in two ways:

1. The frontend uses `/api` by default in development, and Vite proxies requests to `http://localhost:5000`.
2. If `GET /api/students` fails, the frontend automatically switches to demo mode and loads sample student onboarding data.

If you still want the live backend:

- Confirm the backend is running on `http://localhost:5000`
- Confirm `backend/data/students.json` exists and is valid JSON
- Confirm no other process is blocking the backend port

If port `5000` is already in use:

```bash
PORT=5050 npm run dev --prefix backend
VITE_API_BASE_URL=http://localhost:5050/api npm run dev --prefix frontend
```

## API Endpoints

- `GET /api/health`
- `GET /api/students`
- `GET /api/students/:id`
- `POST /api/students`
- `PATCH /api/students/:id`
- `PATCH /api/students/:id/tasks/:taskId`
- `DELETE /api/students/:id`
- `POST /api/ai/blocker-help`
- `POST /api/ai/manager-summary`

## Demo Notes

- No login is required for the demo
- The backend keeps JSON prototype storage
- The frontend remains usable even when the backend is offline
- The seeded experience includes realistic SUU-style student programmers, mentors, blockers, and reflections

## Future Improvements

- Real authentication and role-based permissions
- Real database instead of JSON storage
- GitHub integration for starter issues and PR status
- Real OpenAI or LLM integration for assistant features
- SUU SSO
- Mentor notifications
- Slack or Microsoft Teams integration
