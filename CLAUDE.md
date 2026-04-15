# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (React + CRACO)
```bash
cd frontend
yarn start              # Development server at localhost:3000
yarn build              # Production build
yarn test               # Run Jest tests
```

**Critical**: Uses `yarn` as the package manager (configured in `packageManager` field of package.json). Yarn is **required**, not optional — do not use npm or pnpm.

### Backend (FastAPI + MongoDB)
```bash
cd backend
python -m uvicorn server:app --reload --port 8000    # Development server
pytest                                              # Run tests (if present)
pytest tests/unit/test_specific.py -v               # Run specific test file
black .                                              # Format code
isort .                                              # Sort imports
flake8 .                                             # Lint code
mypy .                                               # Type checking
```

### Full Stack Development
Start both servers concurrently:
- Frontend: `localhost:3000`
- Backend API: `localhost:8000/api`
- API Docs: `localhost:8000/docs` (FastAPI auto-generated)

## Architecture Overview

This is a full-stack Learning Management System (LMS) with:

- **Frontend**: React 19 SPA using Create React App + CRACO configuration override
- **Backend**: FastAPI with MongoDB (Motor async driver)  
- **Routing**: React Router v7 for client-side routing
- **Admin Panel**: Full admin dashboard with user/course management (`/admin/*`)
- **3D Graphics**: Three.js with GLTFLoader on the home page only
- **UI Framework**: TailwindCSS + Radix UI primitives (dependencies installed but components not yet implemented)

### Development Mode Notes
- The admin panel currently uses **mock data** for demonstration — MongoDB integration is structured but commented out
- Frontend works independently for UI development; backend required for admin features
- Hot-module reload available via CRACO dev server

### Key Architectural Quirks

**CRACO Configuration**: 
- Frontend uses `@craco/craco` for custom webpack configuration
- Custom config in `frontend/craco.config.js`
- Includes optional health check plugin (disabled by default)
- Previously used `@emergentbase/visual-edits` for hot-module reload (currently commented out in craco.config.js lines 85-98)

**UI Components**:
- Radix UI dependencies are installed but component files are not currently present
- Core components (Navbar, Footer, SplashScreen) are located in `frontend/src/components/core/`
- If UI components are needed, they can be implemented using Radix UI primitives directly

**Environment Variables**:
Backend requires `backend/.env` with:
- `MONGO_URL` — MongoDB connection string
- `DB_NAME` — Database name
- `CORS_ORIGINS` — Comma-separated list of allowed origins (defaults to `*`)

## Project Structure

```
sashainfinity_emergent/
├── frontend/           # React 19 SPA with CRACO
│   ├── src/
│   │   ├── components/   # Shared components and UI components
│   │   ├── pages/        # Route page components
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utility functions
│   ├── craco.config.js   # CRACO webpack configuration
│   └── package.json
├── backend/            # FastAPI + MongoDB
│   ├── server.py        # Main FastAPI application
│   └── requirements.txt
├── docs/               # Documentation
│   ├── README.md        # Detailed setup guide
│   ├── AGENTS.md        # AI agent instructions
│   └── test_results.md  # Test execution reports
├── tests/              # Test files and fixtures
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   ├── fixtures/       # Test data and fixtures
│   └── reports/        # Test execution reports
├── scripts/            # Utility and automation scripts
├── deployment/         # Deployment configurations
│   ├── docker/         # Docker configurations
│   └── k8s/            # Kubernetes manifests
├── archive/            # Archived files and backups
│   └── backups/        # Database and file backups
├── logs/               # Application logs
├── temp/               # Temporary files
├── memory/             # Claude Code memory system
├── skills/             # Custom skill definitions
├── .github/            # GitHub configurations
├── README.md           # Project overview
├── CLAUDE.md           # This file - Claude Code guidelines
└── .gitignore          # Git ignore patterns
```

### Frontend Entry Points
- `src/index.js` → `src/App.js` → pages in `src/pages/`
- Path aliases: `@/` maps to `src/` directory (configured in both `jsconfig.json` and `craco.config.js`)
- Main router configured in `App.js` with the following routes:
  - `/` — HomePage (with Three.js 3D scene)
  - `/courses` — CoursesPage
  - `/courses/:id` — CourseDetailPage  
  - `/blog` — BlogPage
  - `/blog/:slug` — BlogDetailPage
  - `/contact` — ContactPage
  - `/meiporul-ar` — MeiporulPage (AR features)
  - `/login` — LoginPage
  - `/get-started` — GetStartedPage
  - `/admin` — AdminDashboard (nested under AdminLayout)
  - `/admin/courses` — AdminCourses (nested under AdminLayout)
  - `/admin/users` — AdminUsers (nested under AdminLayout)

### Backend Structure
- Single-file application: `server.py`
- FastAPI app with `/api` prefix for all routes (via `APIRouter`)
- MongoDB connection via Motor (async driver)
- Pydantic models for request/response validation with `ConfigDict(extra="ignore")` for MongoDB compatibility

**API Router Pattern**: All routes use `@api_router` decorator (not `@app` directly), which automatically applies `/api` prefix. Include new routes under the `api_router` instance.

**DateTime Serialization**: MongoDB stores datetimes as ISO strings; the API handles conversion:
- Incoming: `datetime.isoformat()` before MongoDB insert
- Outgoing: `datetime.fromisoformat()` when returning from database

**Mock vs Real Data**: Admin endpoints (`/admin/*`) currently return mock data for demonstration. Database operations are commented out but structured for easy activation.

### Component Organization
- `src/components/core/` — Core shared components (Navbar, Footer, SplashScreen)
- `src/pages/` — Page components for routes
- `src/pages/admin/` — Admin panel specific pages
- `src/hooks/` — Custom React hooks
- `src/lib/utils.js` — Utility functions (includes `cn()` for className merging)

## Testing

- Frontend: Jest tests via `yarn test` (standard CRA setup)
- Backend: pytest if needed (no dedicated test script in requirements.txt)
- No test files currently present in the codebase

## Admin Panel Development

The admin panel is a significant feature with its own development workflow:

**Admin Routes Structure**: Nested under `AdminLayout` component at `/admin/*`
- Dashboard: Statistics cards, charts, recent activity
- Courses: Full CRUD operations with status management (draft/published)
- Users: User management with role-based access (admin/instructor/student)

**Frontend Admin Components**: Located in `src/pages/admin/`
- `AdminLayout.js` — Layout wrapper with navigation
- `AdminDashboard.js` — Main dashboard with stats
- `AdminCourses.js` — Course management interface
- `AdminUsers.js` — User management interface

**Backend Admin API**: All admin endpoints use `/api/admin/*` prefix:
- `GET /api/admin/dashboard` — Dashboard statistics
- `GET /api/admin/users` — List all users
- `POST /api/admin/users` — Create new user
- `DELETE /api/admin/users/{id}` — Delete user
- `GET /api/admin/courses` — List all courses
- `POST /api/admin/courses` — Create new course
- `PUT /api/admin/courses/{id}` — Update course

**Admin Development Workflow**:
1. Start backend server: Backend provides mock data for immediate frontend testing
2. Start frontend server: Navigate to `localhost:3000/admin`
3. Frontend can be developed independently with the mock API responses
4. When ready for production, uncomment MongoDB operations in `server.py`

## Build Configuration

The frontend uses several non-standard configurations:
1. **CRACO** — Custom webpack config override
2. **Path aliases** — `@` maps to `src` directory (configured in craco.config.js)
3. **Visual Edits** — Previously integrated for dev-time hot reload (currently disabled)
4. **Health Check** — Optional webpack health monitoring (disabled by default, enable via `ENABLE_HEALTH_CHECK=true`)

When modifying frontend build configuration, always edit `craco.config.js`, not webpack config directly.

## Important Development Patterns

**Import Statements**: Use path aliases consistently — `import Component from '@/components/Component'` rather than relative paths.

**Error Handling**: Backend uses FastAPI's `HTTPException` for API errors. Frontend should implement proper error boundaries and user-friendly error messages.

**State Management**: Currently using React's built-in state management. No global state library (Redux, Zustand) is implemented.

**Authentication**: Login pages exist but authentication system is not fully implemented. Plan for JWT-based auth using backend dependencies (`pyjwt`, `python-jose`, `passlib`, `bcrypt`).
