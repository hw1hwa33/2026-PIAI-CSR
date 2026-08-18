# 24_TECHNICAL_CONTENT_RULES

## 목적

교안의 코드와 기술 설명이 서로 모순되거나
초보자에게 잘못된 Mental Model을 만들지 않도록 한다.

---

## 1. Reference Stack

기본 교안 Stack:

- Frontend: React
- Gateway/Web Server: Nginx
- Backend API: Flask
- Database: MySQL
- Runtime: Docker / Docker Compose
- Version Control: Git
- Remote Repository: GitHub

사용자 요청이 없으면 Stack을 중간에 임의 변경하지 않는다.

---

## 2. Architecture Accuracy

기본 Production Mental Model:

```text
Browser
  ↓
Nginx
  ├─ / → React build/static files
  └─ /api → Flask
                ↓
              MySQL
```

Development 환경에서 React Dev Server를 별도로 쓰는 경우
Production 구조와 명확히 구분한다.

Nginx를 Flask 내부 구성요소로 설명하지 않는다.

Docker를 Request가 통과하는 Network Layer로 설명하지 않는다.

GitHub를 Runtime 구성요소로 설명하지 않는다.

---

## 3. Docker

구분:
- Dockerfile: Image build instructions
- Image: 실행 환경 Template
- Container: Image가 실행된 Instance
- Compose: 여러 Service의 실행 구성
- Volume: 지속 데이터
- Network: Service 간 통신

기본 명령:

```bash
docker build -t student-backend ./backend
docker compose up -d --build
docker compose ps
docker compose logs -f
docker compose down
```

`docker compose down -v`는 데이터 삭제 위험 명령으로 분리한다.

---

## 4. Git / GitHub

기본 흐름:

```text
edit
→ git status
→ git add
→ git commit
→ git push
```

Git:
Local version control.

GitHub:
Remote Git hosting/collaboration.

`git add`를 GitHub Upload로 설명하지 않는다.

---

## 5. Secrets

실제 Password, Token, API Key를 예제 코드에 하드코딩하지 않는다.

사용:

`.env.example`

예:

```text
MYSQL_PASSWORD=change-me
MYSQL_ROOT_PASSWORD=change-root-me
```

`.gitignore`:

```text
.env
```

실제 Secret Commit을 안내하지 않는다.

---

## 6. Flask

기본 학습 코드에서는:
- Route가 명확해야 한다.
- JSON Response가 명확해야 한다.
- DB Connection은 함수로 분리 가능.
- SQL Parameter Binding을 사용한다.
- SQL 문자열에 사용자 입력을 직접 이어붙이지 않는다.

예:

```python
cursor.execute(
    "SELECT id, name, score FROM students WHERE id = %s",
    (student_id,)
)
```

---

## 7. SQL

초보자에게:
- SELECT
- INSERT
- UPDATE
- DELETE

순으로 확장한다.

`UPDATE` / `DELETE`의 WHERE 누락 위험을 시뮬레이션으로 교육한다.

파괴적 SQL은 기본 Activity에서 실제 실행하지 않는다.

---

## 8. Nginx

기본 목적:
- 정적 Frontend 제공
- `/api/` 요청 Backend 전달

설명 중심:
- listen
- location
- proxy_pass
- try_files

내부 worker 구조는 심화.

---

## 9. HTTP / REST

초기 핵심:
- GET
- POST
- PATCH/PUT
- DELETE
- 200
- 201
- 404
- 500
- JSON

REST를 단순히 "JSON을 쓰는 API"라고 정의하지 않는다.

---

## 10. Code Consistency Gate

Chapter별 코드가 최종 프로젝트에서 충돌하지 않아야 한다.

특히 확인:
- 서비스명 `backend`, `db`
- Port
- Route `/api/students/...`
- DB Name
- Table `students`
- 환경변수 이름
- Nginx upstream
- Compose service name

새 코드를 추가할 때 기존 이름과 계약을 유지한다.
