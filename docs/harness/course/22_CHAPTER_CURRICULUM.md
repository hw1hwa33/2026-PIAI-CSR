# 22_CHAPTER_CURRICULUM

## 전체 Curriculum

### Chapter 01 — 웹서비스 전체 보기
핵심 질문: `웹사이트 버튼 하나를 누르면 뒤에서 무슨 일이 일어날까?`

핵심:
- 전체 Architecture
- 역할 분담
- Request가 내려가고 Response가 돌아오는 흐름

예제:
`GET /api/students/1`

Activity:
`학생 조회` 클릭 → Browser → Nginx → Flask → MySQL → JSON → Browser 패킷 이동

성공 기준:
`데이터를 실제로 저장하는 곳은?` → MySQL

---

### Chapter 02 — Request와 Response
핵심 질문: `Browser와 Server는 어떻게 대화할까?`

핵심:
- HTTP Request
- Response
- URL
- Method
- Status Code
- JSON

Activity:
Method + Resource + ID를 선택해 Request 조립.

예:
`GET /api/students/1`

오류:
`GET /api/students/999` → 404 시뮬레이션.

---

### Chapter 03 — 프로젝트 파일과 폴더
핵심 질문: `왜 frontend/backend/nginx/database 폴더를 나누는가?`

기본 구조:

```text
student-web/
├─ frontend/
├─ backend/
├─ nginx/
├─ database/
├─ compose.yaml
├─ .env.example
├─ .gitignore
└─ README.md
```

Activity:
Folder Tree ↔ Architecture Node 매칭.

---

### Chapter 04 — Git
핵심 질문: `코드를 망치기 전에 변경 기록을 어떻게 남길까?`

핵심:
`Working Directory → git add → Staging → git commit → History`

예제:

```bash
git init
git status
git add .
git commit -m "feat: start project"
```

Activity:
파일 변경 → Stage → Commit 이동 애니메이션.

대표 오해:
`git add`는 GitHub로 보내는 명령이 아니다.

---

### Chapter 05 — GitHub
핵심 질문: `Local Git 기록을 다른 장소와 어떻게 공유할까?`

핵심:
`Local Repository ↔ Remote Repository`

예제:

```bash
git remote add origin <REPOSITORY_URL>
git branch -M main
git push -u origin main
```

다른 PC:

```bash
git clone <REPOSITORY_URL>
```

Activity:
Local commit을 Push하여 GitHub Timeline 동기화.

---

### Chapter 06 — Docker
핵심 질문: `"내 컴퓨터에서는 되는데요"를 어떻게 줄일까?`

핵심:
`Code + Runtime + Dependencies → Image → Container`

예제:

```bash
docker --version
docker run --rm hello-world
```

Activity:
서로 다른 PC 환경 위에 동일 Image를 실행하여 결과 비교.

---

### Chapter 07 — Dockerfile
핵심 질문: `원하는 실행 환경을 Docker에게 어떻게 설명할까?`

예제:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["flask", "--app", "app", "run", "--host=0.0.0.0"]
```

Activity:
Dockerfile 각 줄 실행 → Image Layer/환경 변화 시각화.

---

### Chapter 08 — Docker Compose
핵심 질문: `여러 Container를 어떻게 하나의 Application처럼 실행할까?`

핵심:
- services
- network
- environment
- volume
- depends_on
- healthcheck

예제 서비스:
- backend
- db
- 이후 web/nginx 추가

Activity:
Compose YAML의 service 선택 ↔ Architecture Node 강조.

실행:

```bash
docker compose up -d
docker compose ps
docker compose logs -f
```

---

### Chapter 09 — Frontend
핵심 질문: `API의 JSON을 어떻게 사용자 화면으로 바꿀까?`

핵심:
- State
- Event
- Render
- fetch

상태:
`idle → loading → success/error`

Activity:
학생 조회 → 상태 변화와 화면 변화 동기화.

---

### Chapter 10 — Nginx
핵심 질문: `사용자의 요청을 Frontend와 Backend 중 어디로 보낼까?`

기본 구조:

`/ → Frontend`
`/api/ → Flask`

예제:

```nginx
server {
    listen 80;

    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        proxy_pass http://backend:5000;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Activity:
`/` 또는 `/api/students/1` 요청을 선택 → 화살표 분기.

오류:
잘못된 backend host → 502 시뮬레이션.

---

### Chapter 11 — Flask API
핵심 질문: `Nginx가 전달한 Request를 실제로 누가 처리할까?`

핵심:
- Route
- Python Function
- DB Query
- JSON Response

예:

```python
@app.get("/api/students/<int:student_id>")
def get_student(student_id):
    ...
```

Activity:
Request를 올바른 Route와 연결.

---

### Chapter 12 — REST API
핵심 질문: `조회·생성·수정·삭제를 어떻게 구분할까?`

기본:
- GET → Read
- POST → Create
- PATCH/PUT → Update
- DELETE → Delete

Activity:
상황별 올바른 Method 선택.

예:
`POST /api/students` → DB Row 생성 시뮬레이션.

---

### Chapter 13 — SQL / Database
핵심 질문: `데이터는 실제로 어디에서 저장되고 조회될까?`

예:

```sql
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    score INT NOT NULL
);
```

조회:

```sql
SELECT id, name, score
FROM students
WHERE id = 1;
```

Activity:
SQL 실행 → Table Row 강조 → JSON 형태로 반환.

위험성 Activity:
`UPDATE ...`에 WHERE 누락 시 모든 Row 변경 가능성 시뮬레이션.

---

### Chapter 14 — 전체 Request → Response 추적
핵심 질문: `지금까지 배운 기술을 하나의 흐름으로 연결할 수 있는가?`

기본 Scenario:
학생 ID 2 조회.

단계:
1. User Click
2. Frontend fetch
3. Request 생성
4. Nginx
5. Flask Route
6. SQL
7. MySQL Result
8. Flask JSON
9. Response
10. React State
11. Render

Activity:
- 학습 모드: 이전/다음 단계
- 전체 재생 모드

기본값은 학습 모드.

---

### Chapter 15 — 전체 프로젝트 완성
핵심 질문: `프로젝트를 가져오고 실행하고 수정하고 다시 GitHub에 올릴 수 있는가?`

흐름:

```text
git clone
→ .env 준비
→ docker compose up -d --build
→ docker compose ps
→ Browser/API 확인
→ 코드 수정
→ git status
→ git add
→ git commit
→ git push
→ docker compose down
```

최종 Activity:
Git / GitHub / Docker / Nginx / React / Flask / MySQL Node를 모두 완료 상태로 만든다.

완료 메시지:
`WEB APPLICATION COMPLETE`
