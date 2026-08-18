/*
 * Chapter 03 — 학생 웹서비스의 실제 폴더 구조 (22_CHAPTER_CURRICULUM.md 기준).
 *
 * 예제 코드는 docs/reference/LEGACY_COURSE_CONTENT.html 의 Chapter 03 tree 를 옮겨 온 뒤
 * 24_TECHNICAL_CONTENT_RULES.md §10 Code Consistency Gate 로 교정한 것이다.
 *   · Legacy 의 frontend/src/StudentView.jsx → 현재 계약인 frontend/src/app.jsx 로 통일
 *   · Legacy nginx 의 proxy_set_header 줄 제거 → Chapter 01 의 default.conf 와 동일하게 유지
 *   · Legacy init.sql 의 '박민수 76' 제거 → 박민수는 Chapter 02 에서 POST 로 생성되는 데이터
 *   · Legacy backend 의 환경변수(DB_*)는 유지, .env 의 이름(MYSQL_*)과 역할을 구분
 *
 * 폴더 경로는 Chapter 01 · 02 의 Code Explorer 경로와 정확히 일치시킨다.
 *
 * axis 는 그 항목이 무엇에 해당하는지 구분한다.
 *   runtime  요청이 실제로 지나가는 계층
 *   env      실행 환경 (요청이 지나가는 계층이 아니다)
 *   manage   소스·버전 관리 축 (요청이 지나가는 계층이 아니다)
 *   doc      문서
 */

/* 매칭 선택지 — Folder Tree ↔ Architecture 대응 */
export const MAP_TARGETS = [
  { id: "browser", label: "Browser / Frontend", axis: "runtime", node: "browser" },
  { id: "nginx", label: "Nginx", axis: "runtime", node: "nginx" },
  { id: "flask", label: "Flask API", axis: "runtime", node: "flask" },
  { id: "mysql", label: "MySQL", axis: "runtime", node: "mysql" },
  { id: "compose", label: "Docker Compose · 실행 환경", axis: "env", node: "docker" },
  { id: "config", label: "환경 변수 · 설정", axis: "env", node: "docker" }
];

export const PROJECT_ROOT = "student-web/";

const APP_JSX = [
  'import { useState } from "react";',
  "",
  "export default function App() {",
  '  const [status, setStatus] = useState("idle");',
  "  const [student, setStudent] = useState(null);",
  "",
  "  async function loadStudent(id) {",
  '    setStatus("loading");',
  "    const res = await fetch(`/api/students/${id}`);",
  '    if (!res.ok) { setStatus("error"); return; }',
  "    setStudent(await res.json());",
  '    setStatus("success");',
  "  }",
  "",
  '  if (status === "success") return <p>{student.name} · {student.score}점</p>;',
  "  return <button onClick={() => loadStudent(1)}>학생 조회</button>;",
  "}"
].join("\n");

const APP_PY = [
  "import os, mysql.connector",
  "from flask import Flask, jsonify",
  "",
  "app = Flask(__name__)",
  "",
  "def get_connection():                       # DB 연결은 따로 분리한다",
  "    return mysql.connector.connect(",
  '        host=os.environ["DB_HOST"],',
  '        database=os.environ["DB_NAME"],',
  '        user=os.environ["DB_USER"],',
  '        password=os.environ["DB_PASSWORD"])',
  "",
  '@app.get("/api/students/<int:student_id>")  # 주소와 함수를 연결한다',
  "def get_student(student_id):",
  "    return jsonify(find_student(student_id))"
].join("\n");

const DEFAULT_CONF = [
  "server {",
  "    listen 80;",
  "",
  "    root /usr/share/nginx/html;",
  "    index index.html;",
  "",
  "    location /api/ {",
  "        proxy_pass http://backend:5000;",
  "    }",
  "",
  "    location / {",
  "        try_files $uri $uri/ /index.html;",
  "    }",
  "}"
].join("\n");

const INIT_SQL = [
  "CREATE TABLE students (",
  "    id INT AUTO_INCREMENT PRIMARY KEY,",
  "    name VARCHAR(100) NOT NULL,",
  "    score INT NOT NULL",
  ");",
  "",
  "INSERT INTO students (name, score) VALUES",
  "    ('김철수', 93),",
  "    ('이영희', 88);"
].join("\n");

const COMPOSE_YAML = [
  "services:",
  "  web:                        # nginx/ 폴더가 이 서비스가 된다",
  "    build: ./nginx",
  '    ports: ["80:80"]',
  "    depends_on: [backend]",
  "",
  "  backend:                    # backend/ 폴더가 이 서비스가 된다",
  "    build: ./backend",
  "    environment:",
  "      DB_HOST: db",
  "      DB_NAME: student_db",
  "      DB_USER: student_user",
  "      DB_PASSWORD: ${MYSQL_PASSWORD}",
  "    depends_on: [db]",
  "",
  "  db:                         # database/init.sql 로 표를 만든다",
  "    image: mysql:8.0",
  "    environment:",
  "      MYSQL_DATABASE: student_db",
  "      MYSQL_USER: student_user",
  "      MYSQL_PASSWORD: ${MYSQL_PASSWORD}",
  "      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}",
  "    volumes:",
  "      - db_data:/var/lib/mysql",
  "      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql:ro",
  "",
  "volumes:",
  "  db_data:"
].join("\n");

const ENV_EXAMPLE = ["MYSQL_PASSWORD=change-me", "MYSQL_ROOT_PASSWORD=change-root-me"].join("\n");

const GITIGNORE = [".env", "node_modules/", "__pycache__/"].join("\n");

const README_MD = [
  "# 학생 성적 조회 웹서비스",
  "",
  "## 실행 방법",
  "",
  "1. `cp .env.example .env` 로 환경변수 파일을 만들고 값을 채운다.",
  "2. `docker compose up -d --build`",
  "3. 브라우저에서 http://localhost 접속",
  "",
  "## 구조",
  "",
  "Browser → Nginx → Flask API → MySQL"
].join("\n");

export const PROJECT_ENTRIES = [
  {
    id: "frontend",
    name: "frontend/",
    kind: "dir",
    role: "화면을 만드는 코드",
    target: "browser",
    why:
      "사용자가 보는 화면과 요청을 만드는 코드가 들어 있습니다. " +
      "빌드하면 정적 파일이 되고, 그 파일을 Nginx가 사용자에게 내려 줍니다.",
    change: "이 폴더를 고치면 버튼과 화면 구성이 바뀝니다.",
    misread: "Frontend는 MySQL에 직접 연결하지 않습니다. 항상 API를 거칩니다.",
    files: [
      {
        id: "f-app",
        name: "src/app.jsx",
        path: "frontend/src/app.jsx",
        lang: "jsx",
        node: "browser",
        purpose: "버튼을 누르면 API에 요청하고, 받은 JSON을 화면 상태로 바꾼다.",
        here: "화면을 그리는 코드라서 frontend/ 안에 있습니다. 서버에서 실행되지 않고 브라우저에서 실행됩니다.",
        code: APP_JSX
      },
      { id: "f-api", name: "src/api.js", note: "요청 보내는 부분 · Chapter 02에서 확인" },
      { id: "f-front-docker", name: "Dockerfile", note: "실행 환경 설명서 · Chapter 07" }
    ]
  },
  {
    id: "nginx",
    name: "nginx/",
    kind: "dir",
    role: "서비스 입구 설정",
    target: "nginx",
    why:
      "들어온 요청을 어디로 보낼지 정하는 설정이 들어 있습니다. " +
      "/ 는 화면 파일로, /api/ 는 backend로 보내는 규칙이 여기에 있습니다.",
    change: "이 폴더를 고치면 요청이 가는 길이 바뀝니다.",
    misread: "nginx/에는 코드가 아니라 규칙이 들어갑니다. Nginx는 Flask의 내부 기능이 아니라 앞단의 별도 서비스입니다.",
    files: [
      {
        id: "f-conf",
        name: "default.conf",
        path: "nginx/default.conf",
        lang: "nginx",
        node: "nginx",
        purpose: "/api/ 로 시작하는 요청은 backend로, 나머지는 화면 파일로 응답한다.",
        here: "요청의 갈림길을 정하는 설정이라서 별도 폴더에 둡니다. 화면 코드나 API 코드와 섞이지 않습니다.",
        code: DEFAULT_CONF
      },
      { id: "f-nginx-docker", name: "Dockerfile", note: "설정을 담은 이미지를 만든다 · Chapter 07" }
    ]
  },
  {
    id: "backend",
    name: "backend/",
    kind: "dir",
    role: "요청을 처리하는 코드",
    target: "flask",
    why:
      "주소에 맞는 함수를 실행하고 JSON을 만들어 돌려주는 코드가 들어 있습니다. " +
      "화면 코드와 섞이지 않도록 따로 둡니다.",
    change: "이 폴더를 고치면 API 주소와 응답 내용이 바뀝니다.",
    misread: "Flask는 데이터를 보관하지 않습니다. 보관은 MySQL의 일입니다.",
    files: [
      {
        id: "f-app-py",
        name: "app.py",
        path: "backend/app.py",
        lang: "python",
        node: "flask",
        purpose: "주소와 함수를 연결하고, DB 연결은 따로 분리해 둔다.",
        here:
          "요청을 처리하는 코드라서 backend/ 안에 있습니다. " +
          "DB 접속 정보는 코드에 적지 않고 환경 변수로 받습니다.",
        code: APP_PY
      },
      { id: "f-req", name: "requirements.txt", note: "설치할 라이브러리 목록 · Chapter 07" },
      { id: "f-back-docker", name: "Dockerfile", note: "실행 환경 설명서 · Chapter 07" }
    ]
  },
  {
    id: "database",
    name: "database/",
    kind: "dir",
    role: "데이터 구조 정의",
    target: "mysql",
    why:
      "어떤 표에 어떤 값을 저장할지 적어 둔 파일이 들어 있습니다. " +
      "데이터 자체는 코드가 아니라 저장소에 남습니다.",
    change: "이 폴더를 고치면 저장되는 데이터의 모양이 바뀝니다.",
    misread:
      "여기의 SQL은 처음 실행할 때 표를 만드는 용도입니다. " +
      "서비스가 쌓는 실제 데이터는 이 폴더가 아니라 Volume에 남습니다.",
    files: [
      {
        id: "f-init",
        name: "init.sql",
        path: "database/init.sql",
        lang: "sql",
        node: "mysql",
        purpose: "처음 실행할 때 표를 만들고 예시 데이터를 넣는다.",
        here:
          "데이터의 모양을 정하는 파일이라 database/ 에 둡니다. " +
          "compose.yaml이 이 파일을 db 서비스에 넣어 줍니다.",
        code: INIT_SQL
      }
    ]
  },
  {
    id: "compose",
    name: "compose.yaml",
    kind: "file",
    role: "여러 서비스를 함께 실행하는 설정",
    target: "compose",
    why:
      "위 네 폴더를 각각 어떤 서비스로 띄울지 적어 둔 파일입니다. " +
      "요청이 지나가는 계층이 아니라, 그 계층들을 실행해 주는 환경 설정입니다.",
    change: "이 파일을 고치면 어떤 서비스가 어떻게 실행되는지가 바뀝니다.",
    preview: {
      id: "f-compose",
      name: "compose.yaml",
      path: "compose.yaml",
      lang: "yaml",
      node: null,
      purpose: "폴더 하나가 서비스 하나가 된다. build 경로가 곧 폴더 이름이다.",
      here:
        "특정 계층에 속하지 않고 전체를 실행하는 파일이라 프로젝트 맨 위에 둡니다. " +
        "세부 문법은 Chapter 08에서 다룹니다.",
      code: COMPOSE_YAML
    }
  },
  {
    id: "env",
    name: ".env.example",
    kind: "file",
    role: "환경 변수 예시",
    target: "config",
    why:
      "비밀번호처럼 사람마다 다른 값의 이름만 적어 둔 예시 파일입니다. " +
      "실제 값이 담긴 .env 는 저장소에 올리지 않습니다.",
    change: "이 파일을 고치면 각자 채워야 할 값의 목록이 바뀝니다.",
    preview: {
      id: "f-env",
      name: ".env.example",
      path: ".env.example",
      lang: "dotenv",
      node: null,
      purpose: "이 파일을 복사해 .env 를 만들고 값을 직접 채운다.",
      here:
        "값이 아니라 '이름'만 공유하기 위한 파일이라 저장소에 올려 둡니다. " +
        "실제 값이 든 .env 는 각자 만들고 올리지 않습니다.",
      code: ENV_EXAMPLE
    }
  },
  {
    id: "gitignore",
    name: ".gitignore",
    kind: "file",
    role: "기록에서 제외할 목록",
    axis: "manage",
    matchable: false,
    why:
      "Git이 기록하지 않을 파일을 적어 둡니다. 실제 비밀번호가 든 .env 를 여기에 넣습니다. " +
      "Git은 요청이 지나가는 계층이 아니라 코드 변경을 기록하는 별도의 축입니다.",
    change: "이 파일을 고치면 어떤 파일이 기록에 남는지가 바뀝니다.",
    preview: {
      id: "f-gitignore",
      name: ".gitignore",
      path: ".gitignore",
      lang: "gitignore",
      node: null,
      purpose: "비밀번호 파일과 자동 생성 폴더를 Git이 무시하게 한다.",
      here:
        "저장소 전체에 적용되는 규칙이라 프로젝트 맨 위에 둡니다. " +
        "Git 사용법은 Chapter 04에서 다룹니다.",
      code: GITIGNORE
    }
  },
  {
    id: "readme",
    name: "README.md",
    kind: "file",
    role: "프로젝트 설명 문서",
    axis: "doc",
    matchable: false,
    why: "이 프로젝트를 처음 보는 사람이 무엇부터 해야 하는지 적어 두는 문서입니다.",
    change: "이 파일을 고치면 처음 받는 사람이 읽는 안내가 바뀝니다.",
    preview: {
      id: "f-readme",
      name: "README.md",
      path: "README.md",
      lang: "markdown",
      node: null,
      purpose: "처음 받는 사람이 무엇부터 해야 하는지 적어 둔다.",
      here:
        "특정 계층의 파일이 아니라 프로젝트 전체를 설명하는 문서라 맨 위에 둡니다.",
      code: README_MD
    }
  }
];

/* 매칭 대상만 추린 파생값 */
export const MATCHABLE = PROJECT_ENTRIES.filter((e) => e.matchable !== false);

/* 선택 가능한 파일(대표 예제 코드가 있는 것)만 추린 파생값 */
export const previewsOf = (entry) => {
  if (!entry) return [];
  if (entry.preview) return [entry.preview];
  return (entry.files || []).filter((f) => f.code);
};

export const getTarget = (id) => MAP_TARGETS.find((t) => t.id === id) || null;
export const getEntry = (id) => PROJECT_ENTRIES.find((e) => e.id === id) || null;

export default PROJECT_ENTRIES;
