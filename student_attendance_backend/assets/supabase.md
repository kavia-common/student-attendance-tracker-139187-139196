# Supabase Integration Plan (Backend)

This backend is prepared for Supabase integration. The current app can run without Supabase (in-memory or via Knex DB), but to migrate to Supabase Postgres and/or Supabase Auth follow the steps below.

Environment variables (backend):
- SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY
- SITE_URL for auth redirects (optional for backend, required for frontend auth flows)

Implementations added:
- `src/services/supabase.js` creates a singleton Supabase client using SUPABASE_SERVICE_KEY (server-side only).

Database schema (public):
Use this SQL to create tables in Supabase to match the backend repository contract.

```sql
-- Students
create table if not exists public.students (
  id serial primary key,
  name text not null,
  "rollNumber" text not null unique,
  "className" text,
  section text,
  "createdAt" timestamp with time zone default now(),
  "updatedAt" timestamp with time zone default now()
);

-- Attendance
create table if not exists public.attendance (
  id serial primary key,
  "studentId" integer not null references public.students(id) on delete cascade,
  date date not null,
  status text not null check (status in ('present','absent','late','excused')),
  notes text,
  "createdAt" timestamp with time zone default now(),
  "updatedAt" timestamp with time zone default now(),
  unique ("studentId", date)
);

-- Users (for local JWT-based auth; if you migrate to Supabase Auth, you may not need this)
create table if not exists public.users (
  id serial primary key,
  email text not null unique,
  "passwordHash" text not null,
  role text default 'teacher',
  "createdAt" timestamp with time zone default now(),
  "updatedAt" timestamp with time zone default now()
);
```

Recommended triggers to update updatedAt automatically:
```sql
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$ language plpgsql;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'students_set_updated_at') then
    create trigger students_set_updated_at before update on public.students
    for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'attendance_set_updated_at') then
    create trigger attendance_set_updated_at before update on public.attendance
    for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'users_set_updated_at') then
    create trigger users_set_updated_at before update on public.users
    for each row execute function public.set_updated_at();
  end if;
end $$;
```

Row Level Security (RLS):
Enable RLS and provide basic policies. If you continue using local JWT for backend-only access, you can keep RLS restrictive and have the backend use the service role key.

```sql
alter table public.students enable row level security;
alter table public.attendance enable row level security;
alter table public.users enable row level security;

-- Example policies (service role bypasses RLS):
do $$
begin
  if not exists (select 1 from pg_policies where polname = 'students_read_all') then
    create policy students_read_all on public.students for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where polname = 'students_write_all') then
    create policy students_write_all on public.students for all to authenticated using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where polname = 'attendance_read_all') then
    create policy attendance_read_all on public.attendance for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where polname = 'attendance_write_all') then
    create policy attendance_write_all on public.attendance for all to authenticated using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where polname = 'users_no_access') then
    -- deny by default, only service role should interact with users table
    create policy users_no_access on public.users for all to authenticated using (false) with check (false);
  end if;
end $$;
```

Optional: Supabase Auth mapping (if replacing local JWT)
- Use Supabase Auth users table (auth.users) as the identity source.
- Create a profile table mapping user_id (uuid) -> role.
- Update backend to validate Supabase JWT (using @supabase/supabase-js) instead of local JWT.

Auth URLs and redirect configuration
1. In Supabase Dashboard -> Authentication -> URL Configuration
   - Site URL: set to your frontend domain (e.g., http://localhost:3000 during dev)
   - Additional Redirect URLs:
     - http://localhost:3000/**
     - https://yourapp.com/**
2. Update email templates as needed.

RPC helper for automated setup via tools
To allow automated SQL from this agent, ensure the public.run_sql(text) RPC exists:
```sql
create or replace function public.run_sql(sql text)
returns void
language plpgsql
security definer
as $$
begin
  execute sql;
end;
$$;
```
Note: Limit who can call this in production.

Environment setup
- Copy `.env.example` to `.env` and set SUPABASE_URL, SUPABASE_SERVICE_KEY on the backend (server-side only).
- Frontend should use anon key and site URL utilities.

Security Notes:
- Do not commit secrets.
- Never expose SUPABASE_SERVICE_KEY to frontend.
- Prefer service role for backend database operations and keep strict RLS.
