# SmartSeason Field Monitoring System

A full-stack web application for tracking crop progress across multiple fields during a growing season.

**Live demo:** https://smartseason-two.vercel.app  
**API:** https://backend-production-74ab.up.railway.app/health

## Demo credentials

| Role  | Email                      | Password  |
|-------|----------------------------|-----------|
| Admin | admin@smartseason.com      | admin123  |
| Agent | jane@smartseason.com       | agent123  |
| Agent | peter@smartseason.com      | agent123  |

---

## Tech stack

| Layer    | Choice                  |
|----------|-------------------------|
| Backend  | Node.js + Express       |
| ORM      | Prisma                  |
| Database | PostgreSQL              |
| Frontend | Vue 3 + Vite            |
| Styling  | Tailwind CSS            |
| Auth     | JWT (jsonwebtoken)      |
| Deploy   | Railway + Vercel        |

---

## Local setup

### Prerequisites
- Node.js v18+
- PostgreSQL running locally

### 1. Clone the repository
```bash
git clone https://github.com/ddhadho/smartseason.git
cd smartseason
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file:
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/smartseason"
JWT_SECRET="supersecretkey123"
PORT=3000
```

Run migrations and seed demo data:
```bash
npx prisma migrate dev
npx prisma db seed
```

Start the server:
```bash
npm run dev
```

API runs at `http://localhost:3000`

### 3. Frontend setup
```bash
cd ../frontend
npm install
```

Create a `.env` file:
```env
VITE_API_BASE=http://localhost:3000
```

Start the dev server:
```bash
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## Design decisions

### Stack choice
Vue 3 was chosen for the frontend over React — it is the framework I work with most fluently, and the brief allows for "React or similar." Using a familiar tool meant cleaner, more readable code over a tight deadline.

Node.js + Express was chosen for the backend for its simplicity and speed of development. Prisma was chosen as the ORM for its clean schema definition, type safety, and straightforward migration workflow.

### Authentication
JWT-based authentication with a 7-day expiry. Tokens are stored in localStorage and attached to every API request via an Axios request interceptor. Role is encoded in the token payload and enforced on both the frontend (route guards) and backend (middleware).

### Role separation
Two roles — Admin and Agent — with strict separation:

- Admins can create, edit, delete and assign fields. They see all fields and all agents.
- Agents can only see their assigned fields, log stage updates and add observations.
- Route guards on the frontend redirect users away from views they are not authorised to access.
- Middleware on the backend enforces the same rules at the API level, so frontend guards alone are never relied upon.

### Data model
Four models — User, Field, FieldAssignment, FieldUpdate.

FieldAssignment is a separate join table rather than a direct foreign key on Field. This allows a field to be reassigned cleanly over time without losing history, and makes it straightforward to extend to multiple agents per field in the future.

FieldUpdate is an append-only log. Every stage change creates a new record rather than overwriting. This preserves a full audit trail of who changed what and when, which is useful in an agricultural context where traceability matters.

### Field status logic
Each field has a computed status derived from its data at query time. No status is stored in the database — it is always calculated fresh. The logic is a pure function `computeStatus(field)` in `src/lib/computeStatus.js`:

| Condition | Status |
|---|---|
| Stage is HARVESTED | Completed |
| Stage is READY and last update was 7+ days ago | At Risk |
| Planting date was 120+ days ago and stage is still PLANTED or GROWING | At Risk |
| Everything else | Active |

The 120-day threshold is a reasonable general estimate for a stalled crop — in practice this would be configurable per crop type. The logic is intentionally simple and easy to extend.

### Monorepo structure
Frontend and backend live in the same repository under `/frontend` and `/backend`. This simplifies submission, keeps the git history unified, and reflects how a small team would realistically structure a project at this scale.

---

## Assumptions made

- A field is assigned to one agent at a time. Reassigning removes the previous assignment.
- The 120-day "at risk" threshold applies uniformly across crop types. A production system would make this configurable per crop.
- No email verification or password reset flow — out of scope for this assessment.
- Agents cannot self-register. Accounts are created by seeding or directly in the database. An admin user management UI was considered out of scope.

---

## Project structure

```
smartseason/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── src/
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── fieldController.js
│       │   ├── updateController.js
│       │   └── dashboardController.js
│       ├── middleware/
│       │   └── auth.js
│       ├── routes/
│       │   ├── auth.js
│       │   ├── fields.js
│       │   └── dashboard.js
│       ├── lib/
│       │   └── computeStatus.js
│       └── index.js
└── frontend/
    └── src/
        ├── components/
        │   ├── NavBar.vue
        │   ├── StatusBadge.vue
        │   └── StageBadge.vue
        ├── lib/
        │   └── axios.js
        ├── router/
        │   └── index.js
        ├── stores/
        │   └── auth.js
        └── views/
            ├── LoginView.vue
            ├── admin/
            │   ├── AdminDashboard.vue
            │   └── FieldsView.vue
            └── agent/
                ├── AgentDashboard.vue
                └── MyFieldsView.vue
```