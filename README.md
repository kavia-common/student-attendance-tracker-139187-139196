# Student Attendance Tracker

This workspace contains the backend container `student_attendance_backend`.

Quickstart:
- Copy `.env.example` to `.env` and adjust values as needed.
- Install dependencies:
  - From the backend folder: `npm install`
- Start the backend:
  - `npm run dev` (development with auto-reload) or `npm start`
- API Docs:
  - Visit `/docs` (e.g., http://localhost:3001/docs)
- Health:
  - `GET /`
- Auth:
  - `POST /login` with JSON `{ "email": "admin@example.com", "password": "admin123" }`
- Students (JWT required):
  - `GET /students`
  - `POST /students`
  - `GET /students/:id`
  - `PUT /students/:id`
  - `DELETE /students/:id`
- Attendance (JWT required):
  - `GET /attendance?studentId=&date=&status=`
  - `POST /attendance`
  - `GET /attendance/:id`
  - `PUT /attendance/:id`
  - `DELETE /attendance/:id`
- Reports (JWT required):
  - `GET /reports/summary?from=YYYY-MM-DD&to=YYYY-MM-DD&studentId=ID`

Database:
- If DB_* env vars are set, the app connects via Knex and auto-creates tables.
- If not, it runs with an in-memory store (for demo/development).
- You can configure DB either via a single DB_URL or discrete DB_* variables. See `student_attendance_backend/.env.example`.
- On startup, the app logs whether it’s using in-memory or connected to the database. The health endpoint also reports DB status.

Troubleshooting DB connection:
- Ensure `DB_CLIENT` matches your driver (e.g., `pg` for Postgres, `mysql2` for MySQL).
- If using Postgres over SSL (e.g., Supabase), set `DB_SSL=true` or use `?sslmode=require` in DB_URL.
- Verify credentials and host reachability from the backend container.
- Check `GET /` health endpoint for `{ database: { mode, connected } }`.
- Review logs for messages prefixed with `[db]`.

Supabase:
- See `student_attendance_backend/assets/supabase.md` for full integration steps.
- Backend env:
  - SUPABASE_URL, SUPABASE_SERVICE_KEY (server-side, never expose service key)
  - SUPABASE_ANON_KEY (optional, mainly for frontend)
- Required DB tables and RLS policies are documented in supabase.md.
- In Supabase Dashboard, set Site URL and Redirect URLs for auth as described.