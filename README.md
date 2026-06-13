# Aisel Patient Management

A time-boxed full-stack patient management application built as part of the Aisel Senior Full-Stack Engineer assessment.

The project demonstrates a complete end-to-end workflow with authentication, role-based authorization, patient management, server-side search, sorting, pagination, validation, structured error handling, logging, and a responsive user interface.

## Tech Stack

### Frontend

- Next.js
- TypeScript
- React
- Tailwind CSS
- shadcn/ui
- Radix UI
- React Hook Form
- Zod

### Backend

- NestJS
- TypeScript
- PostgreSQL
- Prisma
- JWT authentication
- class-validator
- Jest
- Supertest

## Repository Structure

```text
aisel-patient-management/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── auth/
│   │   ├── common/
│   │   ├── patients/
│   │   ├── prisma/
│   │   ├── users/
│   │   ├── app.module.ts
│   │   ├── configure-app.ts
│   │   └── main.ts
│   └── test/
├── frontend/
│   └── src/
│       ├── app/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       ├── schemas/
│       ├── services/
│       └── types/
├── docker-compose.yml
└── README.md
```

## Features

### Authentication and authorization

- Email/password login
- JWT-based authentication
- Two roles:
  - `admin`
  - `user`
- Backend-enforced role-based access control
- Admin users can create, update, and delete patients
- Regular users have read-only access
- Protected frontend routes
- Logout support

### Patient management

- List patients
- View patient details
- Create a patient
- Replace a patient record using `PUT`
- Delete a patient
- Server-side search
- Server-side sorting
- Server-side pagination
- Configurable page size

### Validation and error handling

- Backend validation with `class-validator`
- Frontend validation with Zod and React Hook Form
- Structured backend error responses
- Accessible validation messages
- Loading, empty, error, and success states
- Confirmation dialog before deletion
- Toast notifications for mutations

### Developer experience

- Strict TypeScript
- ESLint
- Modular NestJS structure
- Centralized frontend API client
- Request logging with method, path, status code, and duration
- Seed data for immediate local testing
- Backend unit tests
- API integration/e2e tests

## Prerequisites

Install the following before running the project:

- Node.js 20 or newer
- npm
- Git
- PostgreSQL 15 or newer

Docker is optional. The application only requires a reachable PostgreSQL database configured through `DATABASE_URL`.

## Clone the Repository

```bash
git clone https://github.com/borisr89/aisel-patient-management.git
cd aisel-patient-management
```

## Backend Setup

### 1. Create a PostgreSQL database

Create a local PostgreSQL database named:

```text
aisel_patients
```

For example, using pgAdmin or SQL:

```sql
CREATE DATABASE aisel_patients;
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure environment variables

Create `backend/.env` from the example file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Update the values in `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/aisel_patients?schema=public

JWT_SECRET=replace-with-a-long-random-local-secret
JWT_EXPIRES_IN_SECONDS=900

PORT=3001
FRONTEND_URL=http://localhost:3000
```

Replace `YOUR_PASSWORD` with the password for your local PostgreSQL user.

### 4. Generate the Prisma client

```bash
npm run prisma:generate
```

If the project does not expose that script, run:

```bash
npx prisma generate
```

### 5. Run database migrations

```bash
npm run db:migrate
```

If needed, run the equivalent Prisma command:

```bash
npx prisma migrate dev
```

### 6. Seed the database

```bash
npm run db:seed
```

The seed creates:

- one admin account
- one regular user account
- sample patient records

### 7. Start the backend

```bash
npm run start:dev
```

The API will be available at:

```text
http://localhost:3001
```

## Frontend Setup

Open a second terminal from the repository root.

### 1. Install frontend dependencies

```bash
cd frontend
npm install
```

### 2. Configure environment variables

Create `frontend/.env.local` from the example file:

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

The file should contain:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Start the frontend

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

Open:

```text
http://localhost:3000/login
```

## Demo Accounts

### Admin

```text
Email: admin@aisel.local
Password: Admin123!
```

### Regular user

```text
Email: user@aisel.local
Password: User123!
```

## Running the Full Application

Use two terminal windows.

### Terminal 1 — backend

```bash
cd backend
npm run start:dev
```

### Terminal 2 — frontend

```bash
cd frontend
npm run dev
```

Then open:

```text
http://localhost:3000/login
```

## Optional PostgreSQL Setup with Docker Compose

A Docker Compose file is included as an optional way to run PostgreSQL.

```bash
docker compose up -d
```

Then use:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/aisel_patients?schema=public
```

The frontend and backend do not need to run inside Docker. They can run locally while PostgreSQL runs in the container.

To stop the database:

```bash
docker compose down
```

To remove the database volume as well:

```bash
docker compose down -v
```

## API Endpoints

### Authentication

```http
POST /auth/login
```

Request:

```json
{
  "email": "admin@aisel.local",
  "password": "Admin123!"
}
```

Response:

```json
{
  "token": "jwt-token",
  "user": {
    "email": "admin@aisel.local",
    "role": "admin"
  }
}
```

### Patients

```http
GET /patients
GET /patients/:id
POST /patients
PUT /patients/:id
DELETE /patients/:id
```

List query parameters:

```text
search
page
limit
sortBy
sortOrder
```

Example:

```http
GET /patients?page=1&limit=10&search=anna&sortBy=lastName&sortOrder=asc
```

Paginated response:

```json
{
  "data": [],
  "page": 1,
  "limit": 10,
  "total": 0
}
```

Admin access is required for:

```http
POST /patients
PUT /patients/:id
DELETE /patients/:id
```

## Running Tests

### Backend unit tests

```bash
cd backend
npm run test
```

The service test coverage includes:

- paginated patient retrieval
- total-count handling
- not-found behavior

### Backend API integration/e2e tests

```bash
npm run test:e2e
```

The API test coverage includes:

- unauthenticated requests returning `401`
- regular users receiving `403` for write operations
- administrators being allowed to create patients

The e2e tests exercise the NestJS HTTP stack, authentication service, JWT validation, DTO validation, and role guards. `PrismaService` is mocked to keep the tests deterministic and independent of external infrastructure.

### Lint and build

Backend:

```bash
cd backend
npm run lint
npm run build
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

## Architecture

### Backend

The backend is implemented as a modular NestJS monolith.

Each feature is organized into a dedicated module:

- `auth`
- `users`
- `patients`
- `prisma`
- `common`

Responsibilities are separated as follows:

- Controllers handle HTTP concerns
- Services contain business logic
- DTOs perform validation
- Guards enforce authentication and authorization
- Prisma provides typed persistence access
- A global exception filter produces structured errors
- A logging interceptor records request metadata

A custom repository abstraction was intentionally not introduced. Prisma already provides a strongly typed persistence API, and this project uses one database with straightforward CRUD requirements. Adding repository wrappers would have increased boilerplate without providing meaningful isolation within the assessment scope.

### Frontend

The frontend uses the Next.js App Router.

Interactive application features are implemented as Client Components because they rely on:

- form state
- browser storage
- event handlers
- client-side API requests

The frontend separates:

- route components
- feature components
- API services
- validation schemas
- shared types
- generic infrastructure

Authentication state is managed through a small React context backed by `localStorage`.

Patient search, sorting, and pagination are performed by the backend rather than by loading the complete dataset into the browser.

## Accessibility

The interface includes:

- semantic labels for form controls
- keyboard-accessible dialogs
- visible focus states
- semantic table markup
- `aria-invalid` for invalid fields
- accessible validation messages
- `aria-label` values for icon-only buttons
- status and alert semantics
- confirmation before destructive actions
- textual role indicators rather than color-only indicators
- horizontal scrolling for narrow screens

shadcn/ui and Radix UI primitives are used for accessible dialogs, alerts, controls, and focus management.

## Security Considerations

Implemented:

- hashed passwords
- JWT validation
- backend role enforcement
- strict DTO validation
- restricted CORS origin
- no logging of passwords, tokens, request bodies, or patient data
- generic handling of unexpected server errors

For the time-boxed assessment, the JWT is stored in `localStorage`, and frontend route protection is client-side. This is not the preferred production model for a healthcare application.

A production implementation should use:

- secure `httpOnly` and `SameSite` cookies, or a backend-for-frontend session model
- refresh-token rotation
- token revocation
- stronger session controls
- CSRF protection where applicable
- audit trails for access and changes
- encryption and key-management policies
- comprehensive privacy and retention controls

## Deliberate Omissions

The following items were intentionally left out to keep the solution focused and within the assessment time box:

- custom repository layer
- CQRS
- domain events
- microservices
- user registration
- password reset
- refresh tokens
- API documentation with Swagger
- soft deletion
- patient audit history
- caching
- rate limiting
- production observability platform
- frontend automated tests
- database-backed integration test environment
- optimistic updates and rollback handling
- TanStack Query
- Redux
- dark mode
- Next.js middleware authentication
- server-side session validation
- complete frontend and backend Docker images
- cloud deployment

These omissions were deliberate prioritization decisions rather than recommended production defaults.

## Potential Improvements

With additional time, the next improvements would be:

1. Replace `localStorage` authentication with secure cookie-based sessions.
2. Add refresh-token rotation and revocation.
3. Add database-backed integration tests using an isolated PostgreSQL test database.
4. Add frontend tests with React Testing Library.
5. Add Playwright end-to-end coverage for login and patient CRUD workflows.
6. Introduce audit logging for patient access and mutations.
7. Replace hard deletion with policy-driven soft deletion where appropriate.
8. Add rate limiting and brute-force protection to login.
9. Add Swagger/OpenAPI documentation.
10. Add structured production logging with request correlation IDs.
11. Add health and readiness endpoints.
12. Add query caching and mutation invalidation with TanStack Query if the application grows.
13. Add server-side session validation and stronger route protection.
14. Add CI checks for linting, tests, and builds.
15. Add production Docker images and deployment configuration.
16. Add stronger patient-data governance, retention, encryption, and compliance controls.

## Time-Boxing and Trade-offs

The implementation prioritized a complete vertical slice:

- authentication
- authorization
- patient CRUD
- validation
- pagination
- search
- sorting
- accessible UI states
- backend tests
- clear local setup

The objective was to deliver a small, working, maintainable application rather than introduce abstractions or infrastructure that would not provide immediate value for the current scope.

## Notes

- Patient email is not enforced as unique because multiple patients may share a household or contact email address.
- Date of birth is stored as a PostgreSQL `DATE` value.
- `PUT /patients/:id` performs a complete replacement of the editable patient fields.
- Backend authorization remains authoritative even though the frontend hides admin-only actions from regular users.
- The Docker Compose configuration is optional; a valid PostgreSQL connection is sufficient to run the application.
