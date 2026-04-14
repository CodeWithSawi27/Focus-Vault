create table public.habits (
id uuid not null default gen_random_uuid (),
user_id text not null,
name text not null,
description text null,
frequency text not null default 'daily'::text,
streak integer not null default 0,
longest_streak integer not null default 0,
created_at timestamp with time zone null default now(),
updated_at timestamp with time zone null default now(),
reminder_time time without time zone null,
constraint habits_pkey primary key (id),
constraint habits_user_id_fkey foreign KEY (user_id) references users (firebase_uid) on delete CASCADE,
constraint habits_frequency_check check (
(
frequency = any (array['daily'::text, 'weekly'::text])
)
)
) TABLESPACE pg_default;

create trigger habits_updated_at BEFORE
update on habits for EACH row
execute FUNCTION update_updated_at ();

create table public.habit_logs (
id uuid not null default gen_random_uuid (),
habit_id uuid not null,
user_id text not null,
completed_at timestamp with time zone null default now(),
constraint habit_logs_pkey primary key (id),
constraint habit_logs_habit_id_fkey foreign KEY (habit_id) references habits (id) on delete CASCADE,
constraint habit_logs_user_id_fkey foreign KEY (user_id) references users (firebase_uid) on delete CASCADE
) TABLESPACE pg_default;

create table public.focus_sessions (
id uuid not null default gen_random_uuid (),
user_id text not null,
duration integer not null,
completed boolean not null default false,
started_at timestamp with time zone null default now(),
ended_at timestamp with time zone null,
category text null,
notes text null,
pause_count integer not null default 0,
constraint focus_sessions_pkey primary key (id),
constraint focus_sessions_user_id_fkey foreign KEY (user_id) references users (firebase_uid) on delete CASCADE
) TABLESPACE pg_default;

create table public.users (
id uuid not null default gen_random_uuid (),
firebase_uid text not null,
email text not null,
display_name text null,
created_at timestamp with time zone null default now(),
avatar_base64 text null,
constraint users_pkey primary key (id),
constraint users_email_key unique (email),
constraint users_firebase_uid_key unique (firebase_uid)
) TABLESPACE pg_default;

-- Drop old tables if you created them
DROP TABLE IF EXISTS task_logs;
DROP TABLE IF EXISTS task_comments;
DROP TABLE IF EXISTS task_subtasks;
DROP TABLE IF EXISTS tasks;

-- Updated Core Tasks Table (Firebase Compatible)
CREATE TABLE tasks (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id TEXT NOT NULL, -- Changed from UUID to TEXT
title TEXT NOT NULL,
description TEXT,
status TEXT NOT NULL DEFAULT 'todo',
priority TEXT NOT NULL DEFAULT 'medium',
due_date TIMESTAMPTZ,
start_date TIMESTAMPTZ,
estimated_effort INTEGER,
time_logged INTEGER DEFAULT 0,
project_id TEXT,
assignee_id TEXT,
reporter_id TEXT, -- Changed from UUID to TEXT
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW(),
completed_at TIMESTAMPTZ
);

-- Subtasks Table
CREATE TABLE task_subtasks (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
title TEXT NOT NULL,
completed BOOLEAN DEFAULT FALSE,
created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Comments Table
CREATE TABLE task_comments (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
user_id TEXT, -- Changed to TEXT
content TEXT NOT NULL,
created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Time Logs Table
CREATE TABLE task_logs (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
user_id TEXT, -- Changed to TEXT
duration INTEGER NOT NULL,
logged_at TIMESTAMPTZ DEFAULT NOW()
);
