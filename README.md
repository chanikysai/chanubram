# Chanubram Project

## Overview
Chanubram is a project aiming to build a platform for third-party sellers (vendors) to register their stores and list products. This project includes a React-based frontend and a Node.js/Express-based backend with a PostgreSQL database.

## Features
- **Feature 3.1: Vendor Registration and Onboarding**
  - Vendor registration form and initial dashboard setup.
  - Vendor application status tracking (pending, approved, rejected).
  - API services for vendor registration and status retrieval.
  - **Implemented:** Frontend components, API service, backend API route for registration with database integration, updated database schema, and frontend routing. Obsolete components have been removed.

## Technologies
- **Frontend:** React, TypeScript, React Router
- **Backend:** Node.js, Express.js, PostgreSQL
- **Testing:** Jest, React Testing Library

## Project Structure
- `src/`: Frontend application code.
  - `components/`: Reusable UI components.
  - `pages/`: Page-level components.
  - `services/`: API service definitions.
  - `context/`: React context providers.
  - `__tests__/`: Frontend unit and integration tests.
- `backend/`: Backend application code.
  - `src/`: Backend source files.
    - `routes/`: API route definitions.
    - `app.ts`: Main Express application setup.
    - `db.ts`: Database connection module.
  - `db/`: Database-related scripts.
    - `migrations/`: Database migration files.
- `db/migrations/`: SQL scripts for database schema management.
- `.gitignore`: Specifies intentionally untracked files that Git should ignore.
- `package.json`: Project dependencies and scripts (frontend).
- `tsconfig.json`: TypeScript compiler options for the frontend.
- `.env*`: Environment variable files for frontend and backend configuration.

## Setup and Running

### 1. Backend
- **Prerequisites:** Node.js, PostgreSQL
- **Database Setup:**
  - Ensure PostgreSQL is running.
  - Execute migration script: `psql -U <your_user> -d <your_database> < db/migrations/001_create_vendors_table.sql`
- **Backend Server:**
  - Navigate to the backend directory: `cd backend`
  - Install dependencies: `npm install` (or `yarn install`)
  - Set environment variables: Ensure backend/.env is configured with DB credentials and port.
  - Start the server: `node src/app.ts` (or `npm run start` if a script is defined)

### 2. Frontend
- **Prerequisites:** Node.js, npm/yarn
- **Frontend Development:**
  - Install dependencies: `npm install` (from the project root)
  - Set environment variables: Ensure .env.development is configured (e.g., `REACT_APP_API_URL`).
  - Start the development server: `npm start`

## Running Tests
- **Frontend:** `npm test` (from the project root)
- **Backend:** (Conceptual, requires backend setup) `cd backend && npm test` (requires setup for backend testing)

## Contributing
Please refer to the project's contribution guidelines (if any).

## License
[Specify License Here]
