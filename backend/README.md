# Evaluation API - Backend

Node.js + TypeScript REST API for the Evaluation API project.

> For full project documentation, see the [root README](../README.md).

## Tech Stack

- **Runtime:** Node.js 22 + TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT + bcrypt
- **Validation:** Zod
- **Docs:** Swagger/OpenAPI
- **Testing:** Jest + Supertest

## Project Structure

```
src/
├── config/        # Environment, logger
├── db/            # Prisma client
├── docs/          # Swagger spec
├── middlewares/   # Auth, validation, errors
├── modules/
│   ├── auth/      # Register, login, me
│   ├── users/     # User listing
│   └── projects/  # Projects, members, tasks
├── tests/         # Unit & integration tests
├── app.ts         # Express app setup
└── server.ts      # Server entry point

prisma/
├── schema.prisma  # Database schema
└── migrations/    # Migration files
```

## Architecture

```
Router → Controller → Service → Repository → Prisma
```

- **Router:** Route definitions, validation middleware
- **Controller:** HTTP request/response handling
- **Service:** Business logic
- **Repository:** Database queries

## Setup

```bash
npm install
npm run prisma:generate
```

## Development

```bash
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Compile TypeScript
npm run start            # Run compiled server

# Testing
npm run test             # Run all tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only

# Prisma
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio GUI
```

## Environment Variables

Create a `.env` file:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://app_user:app_password@localhost:5432/evaluation_db
JWT_SECRET=your-secret-key-min-10-chars
JWT_EXPIRES_IN=1h
```

## API Documentation

Swagger UI available at http://localhost:3000/docs when the server is running.
