# Backend Placeholder

This directory contains placeholder files and structure for the backend of the Chanubram project, focusing on vendor management.

## Technologies
- **Runtime:** Node.js
- **Framework:** Express.js (for API routing)
- **Database:** PostgreSQL

## Project Structure
- `src/`: Contains the core backend application code.
  - `routes/`: Defines API endpoints.
    - `vendorRoutes.ts`: Implemented API routes for vendor registration, status checks.
  - `app.ts`: Main Express application setup, including middleware and route mounting.
  - `db.ts`: Database connection module using `pg` library.
- `db/`: Contains database-related scripts.
  - `migrations/`: Holds database migration scripts.
    - `001_create_vendors_table.sql`: SQL script to create the `vendors` table with address and business description fields.
- `package.json`: Backend dependencies and scripts.
- `tsconfig.json`: TypeScript compiler options for the backend.
- `.env*`: Environment variable files for backend configuration.

## Setup and Running

### 1. Database Setup
- Ensure PostgreSQL is installed and running.
- Execute the migration script to create the `vendors` table:
  ```bash
  psql -U <your_user> -d <your_database> < db/migrations/001_create_vendors_table.sql
  ```
  Replace `<your_user>` and `<your_database>` with your PostgreSQL credentials.

### 2. Backend Server
- **Install Dependencies:**
  ```bash
  cd backend
  npm install
  ```
- **Environment Variables:**
  - Copy `backend/.env` to `backend/.env.local` and configure your database connection details and port.
  - For production, configure `backend/.env.production`.
- **Start the Server:**
  ```bash
  cd backend
  npm run dev # For development with nodemon
  # or
  npm start # For production (after 'npm run build')
  ```

## API Endpoints
- `POST /api/vendors/register`: Registers a new vendor.
- `GET /api/vendors/me`: Retrieves the current logged-in vendor's data (stubbed).
- `POST /api/vendors/admin/approve/:vendorId`: Admin endpoint to approve a vendor (stubbed).
- `POST /api/vendors/admin/reject/:vendorId`: Admin endpoint to reject a vendor (stubbed).
- `PUT /api/vendors/:vendorId`: Vendor endpoint to update their application (stubbed).

## Next Steps
- Implement authentication and authorization.
- Develop admin interfaces for managing vendors.
- Enhance error handling and logging.
- Set up production-ready deployment configurations.
- Write comprehensive backend tests.
