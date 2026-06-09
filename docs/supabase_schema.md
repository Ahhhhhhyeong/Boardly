# Boardly — Supabase 데이터베이스 스키마

## 1. OAuth 사용 시 별도 `users` 테이블이 필요한가?

> [!IMPORTANT]
> **결론: `profiles` 테이블을 별도로 만드는 것을 권장합니다.**

Supabase는 이메일/비밀번호 및 OAuth(Google, GitHub 등) 로그인 모두 **`auth.users`** 라는 내부 시스템 테이블에 유저를 자동 저장합니다.

| 항목 | 설명 |
|---|---|
| `auth.users` | Supabase 내부 테이블. 직접 쿼리 불가 (보안상 노출 제한). 이메일, provider 정보, UID 등이 저장됨 |
| `public.profiles` | **우리가 만드는 테이블**. `auth.users.id`를 FK로 참조하며, 앱 전용 정보(display name, avatar 등)를 저장 |

### 별도 `profiles` 테이블이 필요한 이유

1. **`auth.users`는 직접 JOIN 불가** — RLS(Row Level Security) 때문에 `public` 스키마에서 `auth.users`를 직접 JOIN하면 권한 오류가 납니다.
2. **OAuth는 `name`을 자동 저장하지 않음** — 현재 코드에서 `user.name`을 UI에 표시하고(`Hi, {user.name}`), Board 생성 시 `userId`를 연결합니다. OAuth로 로그인 시 이 `name` 값을 어딘가에 저장해야 합니다.
3. **앱 전용 필드 확장** — 향후 avatar, preferences 등을 추가할 공간이 필요합니다.
4. **boards 테이블에서 `user_id`를 FK로 걸기 위해서는** `public` 스키마에 유저 레코드가 있어야 합니다.

---

## 2. 최종 테이블 구조

```
auth.users (Supabase 자동 관리)
    └── public.profiles (1:1, 앱 유저 정보)
            └── public.boards (1:N)
                    └── public.columns (1:N)
                    └── public.cards (N:1 columns)
```

---

## 3. SQL — Supabase SQL Editor에 그대로 붙여넣기

```sql
-- ============================================================
-- 0. Extensions
-- ============================================================
create extension if not exists "uuid-ossp";


-- ============================================================
-- 1. profiles
--    auth.users 와 1:1 연결되는 앱 유저 테이블
--    OAuth / 이메일 로그인 모두 여기에 저장
-- ============================================================
create table if not exists public.profiles (
    id          uuid primary key references auth.users(id) on delete cascade,
    name        text not null default '',
    email       text,
    avatar_url  text,
    created_at  timestamptz not null default now()
);

-- ⚡ 테이블 생성 직후 바로 RLS 활성화
alter table public.profiles enable row level security;

create policy "profiles: 본인만 조회" on public.profiles
    for select using (auth.uid() = id);

create policy "profiles: 본인만 수정" on public.profiles
    for update using (auth.uid() = id);

-- 유저가 가입하면 자동으로 profiles 행 생성 (트리거)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (id, name, email, avatar_url)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.email,
        new.raw_user_meta_data->>'avatar_url'
    )
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();


-- ============================================================
-- 2. boards
-- ============================================================
create table if not exists public.boards (
    id          uuid primary key default uuid_generate_v4(),
    user_id     uuid not null references public.profiles(id) on delete cascade,
    title       text not null,
    description text not null default '',
    color       text not null default '#6b7280',
    created_at  timestamptz not null default now()
);

-- ⚡ 테이블 생성 직후 바로 RLS 활성화
alter table public.boards enable row level security;

create policy "boards: 본인만 조회" on public.boards
    for select using (auth.uid() = user_id);

create policy "boards: 본인만 생성" on public.boards
    for insert with check (auth.uid() = user_id);

create policy "boards: 본인만 수정" on public.boards
    for update using (auth.uid() = user_id);

create policy "boards: 본인만 삭제" on public.boards
    for delete using (auth.uid() = user_id);


-- ============================================================
-- 3. columns
-- ============================================================
create table if not exists public.columns (
    id          uuid primary key default uuid_generate_v4(),
    board_id    uuid not null references public.boards(id) on delete cascade,
    title       text not null,
    color       text not null default '#6b7280',
    "order"     integer not null default 0,
    created_at  timestamptz not null default now()
);

-- ⚡ 테이블 생성 직후 바로 RLS 활성화
alter table public.columns enable row level security;

create policy "columns: 본인 board의 column만 조회" on public.columns
    for select using (
        exists (select 1 from public.boards where boards.id = columns.board_id and boards.user_id = auth.uid())
    );

create policy "columns: 본인 board에만 생성" on public.columns
    for insert with check (
        exists (select 1 from public.boards where boards.id = board_id and boards.user_id = auth.uid())
    );

create policy "columns: 본인 board의 column만 수정" on public.columns
    for update using (
        exists (select 1 from public.boards where boards.id = columns.board_id and boards.user_id = auth.uid())
    );

create policy "columns: 본인 board의 column만 삭제" on public.columns
    for delete using (
        exists (select 1 from public.boards where boards.id = columns.board_id and boards.user_id = auth.uid())
    );


-- ============================================================
-- 4. cards
-- ============================================================
create table if not exists public.cards (
    id          uuid primary key default uuid_generate_v4(),
    column_id   uuid not null references public.columns(id) on delete cascade,
    board_id    uuid not null references public.boards(id) on delete cascade,
    title       text not null,
    description text not null default '',
    priority    text not null default 'medium' check (priority in ('low', 'medium', 'high')),
    progress    integer not null default 0 check (progress >= 0 and progress <= 100),
    start_date  date,
    deadline    date,
    "order"     integer not null default 0,
    created_at  timestamptz not null default now()
);

-- ⚡ 테이블 생성 직후 바로 RLS 활성화
alter table public.cards enable row level security;

create policy "cards: 본인 board의 card만 조회" on public.cards
    for select using (
        exists (select 1 from public.boards where boards.id = cards.board_id and boards.user_id = auth.uid())
    );

create policy "cards: 본인 board에만 생성" on public.cards
    for insert with check (
        exists (select 1 from public.boards where boards.id = board_id and boards.user_id = auth.uid())
    );

create policy "cards: 본인 board의 card만 수정" on public.cards
    for update using (
        exists (select 1 from public.boards where boards.id = cards.board_id and boards.user_id = auth.uid())
    );

create policy "cards: 본인 board의 card만 삭제" on public.cards
    for delete using (
        exists (select 1 from public.boards where boards.id = cards.board_id and boards.user_id = auth.uid())
    );


-- ============================================================
-- 5. Indexes (성능 최적화)
-- ============================================================
create index if not exists idx_boards_user_id    on public.boards(user_id);
create index if not exists idx_columns_board_id  on public.columns(board_id);
create index if not exists idx_cards_board_id    on public.cards(board_id);
create index if not exists idx_cards_column_id   on public.cards(column_id);
```

---

## 4. 프론트엔드 타입 매핑 참고

| TypeScript 필드 | DB 컬럼 | 비고 |
|---|---|---|
| `user.id` | `profiles.id` | `auth.uid()` 와 동일 |
| `user.name` | `profiles.name` | OAuth는 트리거로 자동 채워짐 |
| `board.userId` | `boards.user_id` | snake_case 변환 필요 |
| `card.startDate` | `cards.start_date` | camelCase → snake_case |
| `card.deadline` | `cards.deadline` | 동일 |
| `column.order` | `columns.order` | 예약어라 `"order"` 로 quote |

> [!TIP]
> Supabase JS 클라이언트에서 `{ returning: 'minimal' }` 대신 **camelCase 자동 변환**을 원한다면 PostgREST의 `Accept-Profile` 헤더나 별도 변환 유틸을 사용하세요.

---

## 5. 적용 순서

1. Supabase 대시보드 → **SQL Editor** 열기
2. 위 SQL 전체 복사 → 붙여넣기 → **Run** 클릭
3. **Authentication → Providers** 에서 원하는 OAuth(Google, GitHub 등) 활성화
4. 트리거가 올바르게 붙어있는지 확인: **Database → Functions** 에서 `handle_new_user` 확인
