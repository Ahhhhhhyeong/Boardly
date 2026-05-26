## ✅ 설정 완료
프런트엔드와 백엔드를 동시에 실행할 수 있도록 Docker Compose 구성을 정리했습니다.


**변경한 파일**
- `docker-compose.yml`
- `./backend/Dockerfile`
- `./frontend/Dockerfile`

**구성 내용**
- 백엔드: 3000 포트
- 프런트엔드: 5173 포트
- 두 서비스가 함께 올라오도록 `depends_on` 설정
- 개발용으로 로컬 소스가 컨테이너에 바인드 마운트 되도록 구성
- 프런트엔드는 Vite 개발 서버가 0.0.0.0 에서 실행되도록 설정
- Windows 환경에서 파일 변경 반영이 안정적으로 되도록 `CHOKIDAR_USEPOLLING` 설정

---

## 🔍 검증 결과
다음 명령으로 설정과 실행을 확인했습니다.

1. `docker compose config`
   - 설정 파일 문법과 서비스 구성이 정상으로 확인되었습니다.
2. `docker compose up --build -d`
    - 빌드와 실행이 완료되었고, 출력에 아래 내용이 확인되었습니다.
    - ✔ Image boardly-frontend Built
    - ✔ Image boardly-backend Built
    - ✔ Container boardly-backend Started
    - ✔ Container boardly-frontend Started
3. `docker compose ps`
    - 두 컨테이너가 실행 중이며 포트 매핑도 확인되었습니다.
    - boardly-backend: 0.0.0.0:3000->3000/tcp
    - boardly-frontend: 0.0.0.0:5173->5173/tcp

---

## ▶️ 실행 방법
아래 명령을 실행하면 바로 올라옵니다.   

`docker compose up --build -d`   

이후 브라우저에서 확인할 수 있습니다.

- 백엔드: http://localhost:3000
- 프런트엔드: http://localhost:5173

---

## 🛑 종료 방법
다음 명령으로 전체 컨테이너를 정리할 수 있습니다.   

`docker compose down`


---

## 💡 참고
현재 설정은 개발용입니다. 로컬 파일 변경 시 컨테이너 안에서도 바로 반영되도록 바인드 마운트를 사용하고 있습니다.