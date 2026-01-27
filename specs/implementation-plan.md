# Implementation Plan

Checkboxes track progress. References point to specs or source files.

---

## Phase 1: Frontend Infrastructure

### 1.1 Install Dependencies
- [x] Add PrimeVue dependencies to `frontend/package.json`
  - `primevue`, `@primevue/themes`, `primeicons`
  - **Ref:** [frontend.md#dependencies-to-add](./frontend.md#dependencies-to-add)

- [x] Run `npm install` in frontend directory

### 1.2 Environment Configuration
- [x] Create `frontend/.env` with `VITE_API_URL=http://localhost:3000`
  - **Ref:** [frontend.md#environment-variables](./frontend.md#environment-variables)

- [x] Update `frontend/src/vite-env.d.ts` with `ImportMetaEnv` type

### 1.3 PrimeVue Setup
- [x] Update `frontend/src/main.ts` with PrimeVue configuration
  - Import PrimeVue, Aura theme, ToastService
  - Register plugins
  - **Ref:** [frontend.md#primevue-setup](./frontend.md#primevue-setup)
  - **Source:** `frontend/src/main.ts`

---

## Phase 2: Frontend Types & API Client

### 2.1 TypeScript Types
- [x] Create `frontend/src/types/api.ts`
  - `ApiError`, `ApiResponse<T>`, `PaginationMeta`
  - **Ref:** [frontend.md#api-types](./frontend.md#typescript-types)

- [x] Create `frontend/src/types/auth.ts`
  - `User`, `AuthTokens`, `RegisterData`, `LoginData`
  - **Ref:** [frontend.md#auth-types](./frontend.md#typescript-types)

### 2.2 API Client
- [ ] Create `frontend/src/api/client.ts`
  - Fetch wrapper with auth header injection
  - 401 handling (clear token, redirect)
  - **Ref:** [frontend.md#api-client](./frontend.md#api-client)

- [ ] Create `frontend/src/api/auth.api.ts`
  - `register()`, `login()`, `getMe()`
  - **Ref:** [frontend.md#api-client](./frontend.md#api-client)

- [ ] Create `frontend/src/api/users.api.ts`
  - `list()` with pagination params
  - **Ref:** [frontend.md#api-client](./frontend.md#api-client)

---

## Phase 3: Frontend State Management

### 3.1 Auth Store
- [ ] Create `frontend/src/stores/auth.ts`
  - State: `user`, `token`, `loading`, `error`
  - Getters: `isAuthenticated`, `userFullName`
  - Actions: `login`, `register`, `logout`, `fetchUser`, `init`
  - **Ref:** [frontend.md#auth-store](./frontend.md#pinia-stores)
  - **Pattern:** `frontend/src/stores/counter.ts`

### 3.2 Users Store
- [ ] Create `frontend/src/stores/users.ts`
  - State: `users`, `loading`, `error`, `pagination`, `searchQuery`
  - Actions: `fetchUsers`, `setPage`, `setSearch`
  - **Ref:** [frontend.md#users-store](./frontend.md#pinia-stores)

---

## Phase 4: Frontend Router

### 4.1 Route Configuration
- [ ] Update `frontend/src/router/index.ts`
  - Add routes: `/login`, `/register`, `/profile`, `/users`, `404`
  - **Ref:** [frontend.md#routes](./frontend.md#router-configuration)
  - **Source:** `frontend/src/router/index.ts`

### 4.2 Navigation Guards
- [ ] Add `beforeEach` guard to router
  - Check auth state, redirect logic
  - **Ref:** [frontend.md#navigation-guards](./frontend.md#router-configuration)

---

## Phase 5: Frontend Views

### 5.1 Login View
- [ ] Create `frontend/src/views/LoginView.vue`
  - Email/password inputs (PrimeVue)
  - Submit with loading state
  - Error display
  - Link to register
  - **Ref:** [frontend.md#loginview](./frontend.md#views-specification)

### 5.2 Register View
- [ ] Create `frontend/src/views/RegisterView.vue`
  - Email, password, firstName, lastName inputs
  - Password strength indicator
  - Error display
  - Link to login
  - **Ref:** [frontend.md#registerview](./frontend.md#views-specification)

### 5.3 Profile View
- [ ] Create `frontend/src/views/ProfileView.vue`
  - Display user info from auth store
  - Card layout with Tag for role
  - **Ref:** [frontend.md#profileview](./frontend.md#views-specification)

### 5.4 Users View
- [ ] Create `frontend/src/views/UsersView.vue`
  - DataTable with columns
  - Search input with debounce
  - Paginator component
  - Loading/error states
  - **Ref:** [frontend.md#usersview](./frontend.md#views-specification)

### 5.5 Not Found View
- [ ] Create `frontend/src/views/NotFoundView.vue`
  - 404 message
  - Link to home
  - **Ref:** [frontend.md#notfoundview](./frontend.md#views-specification)

---

## Phase 6: Frontend Layout

### 6.1 App Component
- [ ] Update `frontend/src/App.vue`
  - Add Toast component
  - Add Menubar (conditional on auth)
  - Add RouterView
  - Logout handler
  - **Ref:** [frontend.md#app-layout](./frontend.md#app-layout)
  - **Source:** `frontend/src/App.vue`

### 6.2 Initialize Auth
- [ ] Call `authStore.init()` in `main.ts` before mount
  - **Source:** `frontend/src/main.ts`

---

## Phase 7: Frontend Testing & Polish

### 7.1 Store Tests
- [ ] Create `frontend/src/__tests__/stores/auth.spec.ts`
  - Test login, logout, init behaviors
  - **Ref:** [frontend.md#store-tests](./frontend.md#testing-requirements)

### 7.2 View Tests
- [ ] Create `frontend/src/__tests__/views/LoginView.spec.ts`
  - Test form rendering, error display
  - **Ref:** [frontend.md#component-tests](./frontend.md#testing-requirements)

### 7.3 Type Check & Lint
- [ ] Run `npm run type-check` - fix any errors
- [ ] Run `npm run lint` - fix any errors

---

## Phase 8: Backend Schema

### 8.1 Prisma Enums
- [ ] Add enums to `backend/prisma/schema.prisma`
  - `ProjectStatus`, `ProjectRole`, `TaskStatus`, `TaskPriority`
  - **Ref:** [backend.md#new-enums](./backend.md#database-schema)
  - **Source:** `backend/prisma/schema.prisma`

### 8.2 Prisma Models
- [ ] Add `Project` model to schema
  - **Ref:** [backend.md#project](./backend.md#database-schema)

- [ ] Add `ProjectMember` model with composite unique key
  - `@@unique([projectId, userId])`
  - **Ref:** [backend.md#projectmember-join-table](./backend.md#database-schema)

- [ ] Add `Task` model with composite unique key
  - `@@unique([projectId, title])`
  - **Ref:** [backend.md#task](./backend.md#database-schema)

### 8.3 User Model Relations
- [ ] Add relations to `User` model
  - `ownedProjects`, `projectMembers`, `assignedTasks`
  - **Ref:** [backend.md#user-model-updates](./backend.md#database-schema)

### 8.4 Run Migration
- [ ] Run `npx prisma migrate dev --name add_projects`
- [ ] Verify tables created in database

---

## Phase 9: Backend Project Types & Validation

### 9.1 Types
- [ ] Create `backend/src/modules/projects/project.types.ts`
  - `CreateProjectInput`, `UpdateProjectInput`
  - `ListProjectsParams`, `PaginatedProjectsResult`
  - **Ref:** [backend.md#api-endpoints](./backend.md#api-endpoints)
  - **Pattern:** `backend/src/modules/users/user.types.ts`

### 9.2 Validation Schemas
- [ ] Create `backend/src/modules/projects/project.validation.ts`
  - `createProjectSchema`, `updateProjectSchema`
  - `listProjectsQuerySchema`
  - **Ref:** [backend.md#create-project](./backend.md#api-endpoints)
  - **Pattern:** `backend/src/modules/auth/auth.validation.ts`

---

## Phase 10: Backend Project Repository & Service

### 10.1 Repository
- [ ] Create `backend/src/modules/projects/project.repo.ts`
  - `findPaginated()` - list user's projects with counts
  - `findById()` - get with owner, members, task count
  - `create()` - create project + owner member in transaction
  - `update()`, `delete()`
  - `getUserRole()` - get user's role in project
  - **Ref:** [backend.md#list-projects](./backend.md#api-endpoints)
  - **Pattern:** `backend/src/modules/users/user.repo.ts`

### 10.2 Service
- [ ] Create `backend/src/modules/projects/project.service.ts`
  - `listProjects()` - normalize params, call repo
  - `getProject()` - verify access, return details
  - `createProject()` - create with owner
  - `updateProject()` - verify OWNER/ADMIN role
  - `deleteProject()` - verify OWNER role
  - **Ref:** [backend.md#projects-crud](./backend.md#api-endpoints)
  - **Pattern:** `backend/src/modules/users/user.service.ts`

---

## Phase 11: Backend Project Controller & Router

### 11.1 Controller
- [ ] Create `backend/src/modules/projects/project.controller.ts`
  - `list`, `create`, `get`, `update`, `delete` handlers
  - **Ref:** [backend.md#projects-crud](./backend.md#api-endpoints)
  - **Pattern:** `backend/src/modules/users/user.controller.ts`

### 11.2 Router
- [ ] Create `backend/src/modules/projects/project.router.ts`
  - Apply `requireAuth` to all routes
  - Apply validation middleware
  - **Ref:** [backend.md#projects-crud](./backend.md#api-endpoints)
  - **Pattern:** `backend/src/modules/auth/auth.router.ts`

### 11.3 Register Router
- [ ] Update `backend/src/app.ts`
  - Add `app.use("/projects", projectRouter)`
  - **Source:** `backend/src/app.ts`

---

## Phase 12: Backend Project Authorization Middleware

### 12.1 Project Auth Middleware
- [ ] Create `backend/src/middlewares/projectAuth.ts`
  - `requireProjectMember` - verify user is member
  - `requireProjectRole(roles)` - verify user has allowed role
  - **Ref:** [backend.md#authorization](./backend.md#api-endpoints)
  - **Pattern:** `backend/src/middlewares/authGuard.ts`

---

## Phase 13: Backend Member Management

### 13.1 Member Service
- [ ] Create `backend/src/modules/projects/member.service.ts`
  - `listMembers()`, `addMember()`, `updateMemberRole()`, `removeMember()`
  - **Ref:** [backend.md#project-members](./backend.md#api-endpoints)

### 13.2 Member Controller
- [ ] Create `backend/src/modules/projects/member.controller.ts`
  - HTTP handlers for member operations
  - **Ref:** [backend.md#project-members](./backend.md#api-endpoints)

### 13.3 Member Routes
- [ ] Add member routes to `project.router.ts`
  - Nested under `/projects/:id/members`
  - **Ref:** [backend.md#project-members](./backend.md#api-endpoints)

---

## Phase 14: Backend Task Management

### 14.1 Task Types & Validation
- [ ] Create `backend/src/modules/projects/task.types.ts`
  - `CreateTaskInput`, `UpdateTaskInput`, `ListTasksParams`

- [ ] Create `backend/src/modules/projects/task.validation.ts`
  - `createTaskSchema`, `updateTaskSchema`, `listTasksQuerySchema`
  - **Ref:** [backend.md#tasks](./backend.md#api-endpoints)

### 14.2 Task Repository
- [ ] Create `backend/src/modules/projects/task.repo.ts`
  - `findPaginated()`, `findById()`, `create()`, `update()`, `delete()`
  - **Ref:** [backend.md#tasks](./backend.md#api-endpoints)

### 14.3 Task Service
- [ ] Create `backend/src/modules/projects/task.service.ts`
  - Business logic with assignee validation
  - **Ref:** [backend.md#create-task](./backend.md#api-endpoints)

### 14.4 Task Controller
- [ ] Create `backend/src/modules/projects/task.controller.ts`
  - HTTP handlers for task CRUD
  - **Ref:** [backend.md#tasks](./backend.md#api-endpoints)

### 14.5 Task Router
- [ ] Create `backend/src/modules/projects/task.router.ts`
  - Nested under `/projects/:id/tasks`
  - **Ref:** [backend.md#tasks](./backend.md#api-endpoints)

### 14.6 Wire Task Routes
- [ ] Import and use task router in `project.router.ts`

---

## Phase 15: Backend Testing

### 15.1 Unit Tests
- [ ] Create `backend/src/tests/unit/projectService.test.ts`
  - Test pagination normalization
  - Test authorization checks
  - **Ref:** [backend.md#unit-tests](./backend.md#test-requirements)
  - **Pattern:** `backend/src/tests/unit/userService.test.ts`

- [ ] Create `backend/src/tests/unit/taskService.test.ts`
  - Test assignee validation
  - Test duplicate title handling
  - **Ref:** [backend.md#unit-tests](./backend.md#test-requirements)

### 15.2 Integration Tests
- [ ] Create `backend/src/tests/integration/projectApi.test.ts`
  - Test CRUD operations
  - Test duplicate member constraint (409)
  - Test cascade delete (project → tasks, members)
  - **Ref:** [backend.md#integration-tests](./backend.md#test-requirements)
  - **Pattern:** `backend/src/tests/integration/authApi.test.ts`

- [ ] Create `backend/src/tests/integration/taskApi.test.ts`
  - Test duplicate title constraint (409)
  - Test same title in different projects (allowed)
  - Test SetNull on user delete
  - **Ref:** [backend.md#integration-tests](./backend.md#test-requirements)

---

## Phase 16: Backend Documentation

### 16.1 Swagger Updates
- [ ] Update `backend/src/docs/swagger.ts`
  - Add Project, ProjectMember, Task schemas
  - Add all `/projects/*` paths
  - **Source:** `backend/src/docs/swagger.ts`

---

## Phase 17: Final Verification

### 17.1 Backend Verification
- [ ] Start backend: `npm run dev`
- [ ] Open Swagger: `http://localhost:3000/docs`
- [ ] Test all project endpoints manually
- [ ] Run tests: `npm run test`

### 17.2 Frontend Verification
- [ ] Start frontend: `npm run dev`
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test profile page
- [ ] Test users list with search
- [ ] Test logout
- [ ] Run tests: `npm run test:unit`
- [ ] Run type check: `npm run type-check`

### 17.3 Integration Verification
- [ ] Full flow: Register → Login → View Profile → View Users → Logout
- [ ] Refresh page while logged in (token persists)
- [ ] Access protected route without login (redirects)

---

## Progress Tracking

| Phase | Focus        | Tasks    | Completed | Progress (%) |
| ----- | ------------ | -------- | --------- | ------------ |
| 1-7   | Frontend     | 25 tasks | 7         | 28%          |
| 8-16  | Backend      | 28 tasks | 0         | 0%           |
| 17    | Verification | 10 tasks | 0         | 0%           |
| Total |              | 63 tasks | 7         | 11%          |
