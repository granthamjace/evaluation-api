# Evaluation API

A full-stack application with a Node.js/Express backend API and Vue 3 SPA frontend.

## Tech Stack

### Backend
- **Runtime:** Node.js 22 + TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT + bcrypt
- **Validation:** Zod
- **Testing:** Jest
- **Docs:** Swagger/OpenAPI

### Frontend
- **Framework:** Vue 3 + TypeScript
- **Build:** Vite
- **State:** Pinia
- **Router:** Vue Router
- **UI:** PrimeVue
- **Testing:** Vitest

---

## Quick Start

### Prerequisites
- Node.js 22+
- Docker & Docker Compose

### 1. Start Database, API, and Frontend

```bash
docker-compose up -d
```

This starts:
- PostgreSQL on port `5432`
- Backend API on port `3000`
- Frontend runs on port `5173`

---

## URLs

| Service | URL |
|---------|-----|
| API | http://localhost:3000 |
| Swagger Docs | http://localhost:3000/docs |
| Frontend | http://localhost:5173 |

---

## Project Structure

```
evaluation-api/
├── backend/
│   ├── src/
│   │   ├── config/         # Environment, logger
│   │   ├── db/             # Prisma client
│   │   ├── docs/           # Swagger spec
│   │   ├── middlewares/    # Auth, validation, errors
│   │   ├── modules/
│   │   │   ├── auth/       # Register, login, me
│   │   │   ├── users/      # User listing
│   │   │   └── projects/   # Projects, members, tasks
│   │   ├── tests/          # Unit & integration tests
│   │   ├── app.ts
│   │   └── server.ts
│   └── prisma/
│       ├── schema.prisma
│       └── migrations/
├── frontend/
│   └── src/
│       ├── api/            # HTTP client
│       ├── stores/         # Pinia stores
│       ├── views/          # Page components
│       ├── types/          # TypeScript types
│       └── router/
└── docker-compose.yml
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login, returns JWT |
| GET | `/auth/me` | Get current user (auth required) |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List users (paginated) |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects` | List user's projects |
| POST | `/projects` | Create project |
| GET | `/projects/:id` | Get project details |
| PATCH | `/projects/:id` | Update project |
| DELETE | `/projects/:id` | Delete project |

### Project Members
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/:id/members` | List members |
| POST | `/projects/:id/members` | Add member |
| PATCH | `/projects/:id/members/:userId` | Update role |
| DELETE | `/projects/:id/members/:userId` | Remove member |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/:id/tasks` | List tasks |
| POST | `/projects/:id/tasks` | Create task |
| GET | `/projects/:id/tasks/:taskId` | Get task |
| PATCH | `/projects/:id/tasks/:taskId` | Update task |
| DELETE | `/projects/:id/tasks/:taskId` | Delete task |

See full API documentation at `/docs` when the server is running.

---

## Development Commands

### Backend

```bash
cd backend

npm run dev              # Start dev server
npm run build            # Compile TypeScript
npm run test             # Run all tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only

# Prisma
npm run prisma:generate  # Generate client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio
```

### Frontend

```bash
cd frontend

npm run dev              # Start dev server
npm run build            # Build for production
npm run test:unit        # Run tests
npm run lint             # Lint code
npm run format           # Format code
npm run type-check       # TypeScript check
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://app_user:app_password@localhost:5432/evaluation_db
JWT_SECRET=your-secret-key-min-10-chars
JWT_EXPIRES_IN=1h
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3000
```

---

## Database Schema

### Models
- **User** - Authentication and profile
- **Project** - Container for tasks with team members
- **ProjectMember** - Many-to-many join with roles (OWNER, ADMIN, MEMBER, VIEWER)
- **Task** - Work items within projects

### Key Constraints
- Composite unique: `(projectId, userId)` on ProjectMember
- Composite unique: `(projectId, title)` on Task
- Cascade delete: Project → Tasks, Members
- SetNull on delete: User deletion → Task.assigneeId

---

## Specifications

Detailed specifications are in the `specs/` directory:

- [specs/README.md](./specs/README.md) - Overview
- [specs/backend.md](./specs/backend.md) - Backend API specification
- [specs/frontend.md](./specs/frontend.md) - Frontend SPA specification
- [specs/implementation-plan.md](./specs/implementation-plan.md) - Task checklist

---

## Architecture

### Backend Pattern
```
Router → Controller → Service → Repository → Prisma
```

- **Router**: Route definitions, validation middleware
- **Controller**: HTTP request/response handling
- **Service**: Business logic
- **Repository**: Database queries

### Frontend Pattern
```
View → Store → API Client → Backend
```

- **Views**: Page components
- **Stores**: Pinia state management
- **API Client**: HTTP wrapper with auth

---

## License

Private
