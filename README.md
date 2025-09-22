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

Supabase:
- See `student_attendance_backend/assets/supabase.md` for future integration notes.