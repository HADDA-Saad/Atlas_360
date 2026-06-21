-- Notifications table for in-app bell notifications
create table if not exists notifications (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  type        text        not null,
  title       text        not null,
  body        text        not null,
  link        text        not null default '/dashboard',
  is_read     boolean     not null default false,
  created_at  timestamptz not null default now()
);

alter table notifications enable row level security;

-- Users can only see and update their own notifications
create policy "users can read own notifications"
  on notifications for select
  using (auth.uid() = user_id);

create policy "users can update own notifications"
  on notifications for update
  using (auth.uid() = user_id);

-- Service role (server-side) can insert notifications for any user
-- (no insert policy needed — service role bypasses RLS)

-- Fast lookups: user's unread feed ordered by newest first
create index if not exists notifications_user_feed_idx
  on notifications(user_id, is_read, created_at desc);
