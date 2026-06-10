# Boardly

## 1. 프로젝트 소개 (Project Intro)

1. Boardly는 개인 작업 보드를 만들고, 컬럼과 카드를 통해 업무 흐름을 관리하는 Kanban 보드 애플리케이션입니다. 프론트엔드는 React/Vite 기반으로 구성되어 있으며, 백엔드는 Express와 Supabase를 통해 인증 및 데이터 API를 제공합니다.
1. Boardly is a Kanban board application for creating personal work boards and managing workflows with columns and cards. The frontend is built with React and Vite, while the backend uses Express and Supabase for authentication and data APIs.

![dashboard image](https://github.com/user-attachments/assets/899e7a7f-8c50-4e05-9045-ad28f2443477)

## 2. 주요 기능 

1. 이메일/비밀번호 기반 회원가입 및 로그인, 이메일 확인 후 자동 로그인 흐름을 지원합니다.   
   Supports email/password signup and signin, including automatic login after email confirmation.

1. 보드 생성, 수정, 삭제가 가능하며 각 보드에는 기본 Kanban 컬럼이 자동 생성됩니다.   
   Users can create, update, and delete boards, and each new board automatically receives default Kanban columns.

1. 컬럼과 카드를 추가, 수정, 삭제할 수 있으며 카드에는 우선순위, 진행률, 시작일, 마감일을 기록할 수 있습니다.   
   Users can add, update, and delete columns and cards. Cards can include priority, progress, start date, and deadline values.

1. 로그인 세션이 유지되는 경우 `/` 또는 `/auth` 접근 시 자동으로 대시보드로 이동합니다.   
   When a login session is active, visiting `/` or `/auth` automatically redirects to the dashboard.

![board image](https://github.com/user-attachments/assets/ea522c97-7844-4a74-bc75-5573200401af)

## 3. 기술 스택

1. Frontend: React, Vite, TypeScript, React Router, Tailwind CSS, Radix UI, lucide-react

1. Backend: Node.js, Express, Supabase JavaScript Client

1. Database/Auth: Supabase Auth, Supabase Postgres, Row Level Security

1. Local development: Docker Compose or separate npm commands can be used.

## 4. 프로젝트 구조

```text
Boardly/
  backend/               Express API server
  docs/                  Project documentation
  frontend/              React/Vite client
  docker-compose.yml     Local Docker development setup
  .env.example           Example environment variables
```

1. `frontend`는 화면, 라우팅, API 호출, UI 컴포넌트를 포함합니다.   
    `frontend` contains screens, routing, API calls, and UI components.

1. `backend`는 인증, 보드, 컬럼, 카드 API를 제공합니다.   
    `backend` provides authentication, board, column, and card APIs.

1. `docs/supabase_schema.md`는 Supabase 테이블과 RLS 정책 설정에 필요한 SQL을 포함합니다.  
   `docs/supabase_schema.md` includes the SQL required for Supabase tables and RLS policies.

## 5. 사전 준비

1. Node.js와 npm이 필요합니다.   
   Node.js and npm are required.

1. Docker로 실행하려면 Docker Desktop 또는 Docker Engine이 필요합니다.   
   Docker Desktop or Docker Engine is required when running with Docker.

1. Supabase 프로젝트를 생성하고 `docs/supabase_schema.md`의 SQL을 Supabase SQL Editor에서 실행해야 합니다.   
   Create a Supabase project and run the SQL from `docs/supabase_schema.md` in the Supabase SQL Editor.

1. Supabase Authentication의 Redirect URLs에 개발 환경 콜백 URL을 추가해야 합니다.   
   Add the development callback URL to Supabase Authentication Redirect URLs.

```text
http://localhost:5173/auth/callback
```

## 6. 환경변수 설정

1. `.env.example`을 참고하여 루트 디렉토리에 `.env` 파일을 생성합니다.   
   Create a `.env` file in the root directory using `.env.example` as a reference.

```env
BACKEND_PORT=3000
FRONTEND_PORT=5173
FRONTEND_HOST=0.0.0.0
CHOKIDAR_USEPOLLING=true

VITE_API_BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
AUTH_REDIRECT_URL=http://localhost:5173/auth/callback

SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_KEY=YOUR_SUPABASE_KEY
```

1. `SUPABASE_URL`은 Supabase 프로젝트 URL을 입력합니다. 현재 백엔드는 `/rest/v1`이 포함되어도 자동으로 정리합니다.   
   Set `SUPABASE_URL` to your Supabase project URL. The backend normalizes the value even if `/rest/v1` is included.

1. `SUPABASE_KEY`는 Supabase anon/publishable key를 입력합니다.   
    Set `SUPABASE_KEY` to your Supabase anon or publishable key.

1. 배포 환경에서는 `AUTH_REDIRECT_URL`을 실제 프론트엔드 도메인의 `/auth/callback` 주소로 변경합니다.   
    In production, set `AUTH_REDIRECT_URL` to the `/auth/callback` URL on your real frontend domain.

## 7. Docker Compose로 실행

1. 루트 디렉토리에서 아래 명령어를 실행합니다.   
   Run the following command from the root directory.

```bash
docker compose up --build
```

1. 프론트엔드는 기본적으로 `http://localhost:5173`에서 실행됩니다.   
    The frontend runs at `http://localhost:5173` by default.

1. 백엔드는 기본적으로 `http://localhost:3000`에서 실행됩니다.   
    The backend runs at `http://localhost:3000` by default.

## 8. 개별 실행

1. 백엔드를 실행합니다.   
   Start the backend.

```bash
cd backend
npm install
npm run dev
```

1. 다른 터미널에서 프론트엔드를 실행합니다.   
   Start the frontend in another terminal.

```bash
cd frontend
npm install
npm run dev
```

## 9. 인증 흐름

1. 사용자가 회원가입을 하면 Supabase가 이메일 확인 메일을 발송합니다.   
   When a user signs up, Supabase sends an email confirmation message.

1. 사용자가 메일의 확인 링크를 클릭하면 `/auth/callback`으로 돌아옵니다.   
   When the user clicks the confirmation link, the browser returns to `/auth/callback`.

1. 프론트엔드는 콜백 URL의 인증 토큰을 백엔드 `/auth/session`으로 전달합니다.   
   The frontend sends the auth token from the callback URL to backend `/auth/session`.

1. 백엔드는 토큰을 검증하고 HttpOnly 세션 쿠키를 설정한 뒤 사용자를 대시보드로 이동시킵니다.  
   The backend validates the token, sets an HttpOnly session cookie, and the app moves the user to the dashboard.

![auth image](https://github.com/user-attachments/assets/30f5734a-6c8b-47f8-bd31-a80068ae1345)

## 10. 데이터 모델

1. Supabase 데이터는 `profiles`, `boards`, `columns`, `cards` 테이블로 구성됩니다.   
    Supabase data is organized into `profiles`, `boards`, `columns`, and `cards` tables.

1. `profiles`는 Supabase `auth.users`와 1:1로 연결됩니다.   
   `profiles` has a one-to-one relationship with Supabase `auth.users`.

1. `boards`는 사용자별 보드를 저장합니다.   
   `boards` stores each user's boards.

1. `columns`는 보드의 Kanban 단계 정보를 저장합니다.   
   `columns` stores Kanban workflow stages for each board.

1. `cards`는 각 보드와 컬럼에 속한 작업 항목을 저장합니다.   
    `cards` stores task items that belong to a board and column.

## 11. API 개요

1. 인증 API는 `/auth/signup`, `/auth/signin`, `/auth/session`, `/auth/signout`, `/auth/me`를 제공합니다.   
   Auth APIs include `/auth/signup`, `/auth/signin`, `/auth/session`, `/auth/signout`, and `/auth/me`.

1. 보드 API는 `/boards`에서 조회와 생성을 처리하고, `/boards/:id`에서 수정과 삭제를 처리합니다.    
   Board APIs use `/boards` for listing and creation, and `/boards/:id` for update and deletion.

1. 컬럼 API는 `/columns`와 `/columns/:id`를 통해 컬럼 데이터를 관리합니다.   
   Column APIs manage column data through `/columns` and `/columns/:id`.

1. 카드 API는 `/cards`와 `/cards/:id`를 통해 카드 데이터를 관리합니다.   
   Card APIs manage card data through `/cards` and `/cards/:id`.

## 12. 빌드

1. 프론트엔드 프로덕션 빌드를 실행합니다.   
   Run the frontend production build.

```bash
cd frontend
npm run build
```

1. 백엔드는 Node.js 환경에서 `npm start`로 실행할 수 있습니다.   
   The backend can run in a Node.js environment with `npm start`.

```bash
cd backend
npm start
```

## 13. 참고 문서

1. Supabase 스키마와 RLS 정책은 `docs/supabase_schema.md`를 확인하세요.   
   See `docs/supabase_schema.md` for the Supabase schema and RLS policies.

1. 프론트엔드 원본 README는 `frontend/README.md`에 있습니다.   
   The original frontend README is available at `frontend/README.md`.
