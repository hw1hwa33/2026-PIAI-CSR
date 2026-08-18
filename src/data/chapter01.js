import { PROCESS_STEPS, STUDENT, REQUEST_PATH } from "./process.js";

/*
 * Chapter 01 — 22_CHAPTER_CURRICULUM.md 기준
 *   제목      웹서비스 전체 보기
 *   핵심 질문  웹사이트 버튼 하나를 누르면 뒤에서 무슨 일이 일어날까?
 *   성공 기준  "데이터를 실제로 저장하는 곳은?" → MySQL
 *
 * 코드는 24_TECHNICAL_CONTENT_RULES.md §10 Code Consistency Gate 를 따른다.
 *   service : backend / db      Route : /api/students/...      Table : students
 * 컴포넌트는 고치지 않고 이 데이터만 읽어 화면을 만든다.
 */
const chapter01 = {
  id: 1,
  title: "버튼을 누르면 뒤에서 무슨 일이 일어날까?",
  coreQuestion: "웹사이트 버튼 하나를 누르면 뒤에서 무슨 일이 일어날까?",
  placeholder: false,

  intro:
    "성적 조회 버튼을 누르면 점수가 뜹니다. 너무 당연해서 그냥 넘어가지만, " +
    "그 사이에는 역할이 다른 네 개의 프로그램이 순서대로 일을 합니다. " +
    "이 Chapter에서는 요청 한 건이 그 순서를 통과하는 과정을 직접 따라갑니다.",

  /* 왜 이걸 보나요? — 기술 설명보다 먼저 나온다 (CLAUDE.md Course Identity) */
  whyItMatters: [
    "성적 조회 버튼을 누르면 점수가 뜹니다. 그런데 그 사이에 무슨 일이 일어나는지는 보이지 않습니다.",
    "앞으로 등장할 여러 도구가 각각 어디에서 일하는지 알려면 먼저 전체 그림 한 장이 필요합니다."
  ],

  oneThing: "요청은 여러 역할을 거쳐 갔다가 응답으로 돌아옵니다.",

  objectives: [
    "요청이 지나가는 길과 돌아오는 길",
    "입구 · 처리 · 저장이라는 세 가지 역할",
    "데이터가 실제로 남는 곳"
  ],

  architecture: {
    caption: "이번 Chapter가 다루는 구간 — 클릭 한 번이 저장소까지 갔다가 되돌아옵니다.",
    highlight: ["user", "browser", "nginx", "flask", "mysql"]
  },

  /* 21_COURSE_CONTENT_CORE §1 Role Before Tool — 역할을 먼저, 기술 이름은 뒤에 */
  concept: {
    lead:
      "웹 서비스는 하나의 프로그램이 아닙니다. 요청을 받는 곳, 판단하는 곳, 보관하는 곳이 " +
      "따로 있고, 요청 한 건이 그 사이를 순서대로 지나갑니다.",
    roles: [
      {
        role: "요청을 만드는 곳",
        tech: "Browser / Frontend",
        desc: "사람의 클릭을 서버가 알아들을 수 있는 형식의 요청으로 바꿉니다."
      },
      {
        role: "서비스의 입구",
        tech: "Nginx",
        desc:
          "들어온 요청의 주소를 보고 어디로 보낼지 정합니다. " +
          "/ 는 화면 파일로, /api/ 는 Backend로 보냅니다. 스스로 판단하거나 저장하지는 않습니다."
      },
      {
        role: "요청을 처리하는 곳",
        tech: "Flask API",
        desc:
          "주소에 맞는 함수를 실행합니다. 필요한 데이터는 스스로 가지고 있지 않아 저장소에 물어봅니다."
      },
      {
        role: "데이터를 보관하는 곳",
        tech: "MySQL",
        desc: "값이 실제로 저장되어 있는 곳입니다. SQL로 물어보면 해당하는 행을 돌려줍니다."
      }
    ],
    note:
      "Git · GitHub는 코드의 변경 기록을 관리하는 축이고, Docker는 위 프로그램들을 같은 방식으로 " +
      "실행해 주는 환경입니다. 둘 다 요청이 지나가는 길목이 아닙니다."
  },

  /*
   * Beginner Code UX (CLAUDE.md §5 · §9)
   *   Ch01 에서 코드는 Secondary 다. async / res.json() / @app.get / proxy_pass / SELECT 를
   *   동시에 이해하도록 요구하지 않는다. 먼저 "방금 화면이 요청을 만든 부분" 한 줄만 본다.
   */
  codeIntro:
    "이번에는 코드를 외우지 않습니다. 방금 따라간 흐름에서 '요청을 만드는 순간'이 " +
    "코드의 어느 한 줄인지만 확인합니다.",

  codeFocus: {
    lines: ["fetch(`/api/students/1`)"],
    say:
      "화면이 서버에게 \"1번 학생 정보를 주세요\"라고 말하는 부분입니다. " +
      "이 한 줄에서 요청이 출발해, 서비스 입구(Nginx)와 요청 처리(Flask API)를 거쳐 데이터 저장(MySQL)까지 갔다가 돌아옵니다.",
    path: "frontend/src/app.jsx",
    node: "browser"
  },

  code: [
    {
      id: "frontend",
      name: "app.jsx",
      path: "frontend/src/app.jsx",
      lang: "jsx",
      desc: "버튼을 누르면 Browser가 요청을 만들고, 받은 JSON을 State에 넣어 화면을 다시 그린다.",
      lines: [
        { t: "async function loadStudent(id) {", node: "browser" },
        { t: "  setStatus(\"loading\");", node: "browser" },
        { t: "  const res = await fetch(`/api/students/${id}`);", node: "browser" },
        { t: "  const data = await res.json();", node: "browser" },
        { t: "  setStudent(data);      // React State 변경 → 화면 다시 그리기", node: "browser" },
        { t: "  setStatus(\"success\");", node: "browser" },
        { t: "}" }
      ]
    },
    {
      id: "nginx",
      name: "default.conf",
      path: "nginx/default.conf",
      lang: "nginx",
      desc: "Nginx는 / 는 화면 파일로, /api/ 는 Backend로 보낸다.",
      lines: [
        { t: "server {", node: "nginx" },
        { t: "    listen 80;", node: "nginx" },
        { t: "", node: null },
        { t: "    root /usr/share/nginx/html;", node: "nginx" },
        { t: "    index index.html;", node: "nginx" },
        { t: "", node: null },
        { t: "    location /api/ {", node: "nginx" },
        { t: "        proxy_pass http://backend:5000;", node: "nginx" },
        { t: "    }", node: "nginx" },
        { t: "", node: null },
        { t: "    location / {", node: "nginx" },
        { t: "        try_files $uri $uri/ /index.html;", node: "nginx" },
        { t: "    }", node: "nginx" },
        { t: "}" }
      ]
    },
    {
      id: "backend",
      name: "app.py",
      path: "backend/app.py",
      lang: "python",
      desc: "Flask는 주소에 맞는 함수를 실행하고, 필요한 값을 MySQL에 물어본 뒤 JSON으로 돌려준다.",
      lines: [
        { t: '@app.get("/api/students/<int:student_id>")', node: "flask" },
        { t: "def get_student(student_id):", node: "flask" },
        { t: "    cursor = get_connection().cursor()", node: "flask" },
        { t: "    cursor.execute(", node: "flask" },
        { t: '        "SELECT id, name, score FROM students WHERE id = %s",', node: "mysql" },
        { t: "        (student_id,),          # 값은 반드시 분리해서 전달한다", node: "mysql" },
        { t: "    )", node: "flask" },
        { t: "    row = cursor.fetchone()", node: "mysql" },
        { t: "    if row is None:", node: "flask" },
        { t: '        return jsonify(error="student not found"), 404', node: "flask" },
        { t: "    return jsonify(id=row[0], name=row[1], score=row[2])", node: "flask" }
      ]
    },
    {
      id: "database",
      name: "init.sql",
      path: "database/init.sql",
      lang: "sql",
      desc: "MySQL에는 이런 표가 들어 있고, 값은 여기에 실제로 저장된다.",
      lines: [
        { t: "CREATE TABLE students (", node: "mysql" },
        { t: "    id    INT AUTO_INCREMENT PRIMARY KEY,", node: "mysql" },
        { t: "    name  VARCHAR(100) NOT NULL,", node: "mysql" },
        { t: "    score INT NOT NULL", node: "mysql" },
        { t: ");", node: "mysql" },
        { t: "", node: null },
        { t: `SELECT id, name, score FROM students WHERE id = ${STUDENT.id};`, node: "mysql" }
      ]
    }
  ],

  activity: {
    type: "process",
    title: "요청 한 건을 처음부터 끝까지 따라가기",
    cta: "흐름 따라가 보기",
    guide:
      "이전 / 다음으로 직접 한 칸씩 움직이거나, 전체 흐름 보기로 한 번 재생할 수 있습니다. " +
      "장면 안의 상자를 누르면 그곳이 무슨 일을 하는지 볼 수 있습니다.",
    mockNote: "화면의 학생 이름과 점수는 학습용 예시 데이터입니다. 실제 서버로 요청이 나가지 않습니다.",
    steps: PROCESS_STEPS,
    student: STUDENT
  },

  errors: [
    {
      id: "e-502",
      code: "502 Bad Gateway",
      title: "Nginx는 살아 있는데 Backend가 응답하지 않는다",
      symptom: "화면에 502 Bad Gateway 가 뜬다.",
      cause: "Nginx가 요청을 넘기려는 backend 컨테이너가 떠 있지 않거나 포트가 다르다.",
      fix: "docker compose ps 로 backend 상태를 확인하고, proxy_pass 주소와 포트를 맞춘다.",
      node: "nginx",
      edge: "nginx-flask"
    },
    {
      id: "e-404",
      code: "404 Not Found",
      title: "그 학생이 students 테이블에 없다",
      symptom: `GET /api/students/999 를 요청하면 404 가 돌아온다.`,
      cause: "Route는 정상이지만 조회 결과가 비어 있어 Flask가 404를 돌려준다.",
      fix: "요청한 id가 실제로 테이블에 있는지 확인한다. 끊긴 구간은 Flask ↔ MySQL이다.",
      node: "flask",
      edge: "flask-mysql"
    },
    {
      id: "e-conn",
      code: "DB Connection Error",
      title: "Flask가 MySQL에 접속하지 못한다",
      symptom: "500 오류가 나고 로그에 접속 거부가 찍힌다.",
      cause: "DB 주소·계정·비밀번호 환경변수가 비었거나 db가 아직 준비되지 않았다.",
      fix:
        ".env.example 을 복사해 값을 채우고, db가 준비된 뒤 backend가 뜨도록 순서를 잡는다. " +
        "실제 비밀번호는 저장소에 올리지 않는다.",
      node: "mysql",
      edge: "flask-mysql"
    }
  ],

  summary: {
    remember: [
      "웹 서비스는 하나의 프로그램이 아니라, 역할이 다른 여러 프로그램이 순서대로 일하는 것이다.",
      "요청은 화면 → 서비스 입구 → 요청 처리 → 데이터 저장 순서로 가고, 응답은 그 길을 그대로 되돌아온다.",
      "값이 실제로 남아 있는 곳은 데이터 저장소(MySQL) 하나뿐이다."
    ],
    points: [
      `클릭 한 번은 USER → Browser → Nginx → Flask → MySQL 순서로 전달된다.`,
      "Nginx는 입구, Flask는 처리, MySQL은 보관 — 역할이 겹치지 않는다.",
      `요청은 GET ${REQUEST_PATH} 로 시작해 SQL Query, DB Result, JSON Response로 모습을 바꾼다.`,
      "응답이 돌아오면 Frontend가 State를 바꾸고 화면을 다시 그린다."
    ],
    keywords: ["요청(Request)", "응답(Response)", "Nginx", "Flask", "MySQL", "JSON"],
    position: "전체 15개 Chapter 중 첫 번째 — 앞으로 배울 모든 기술의 위치를 잡는 지도에 해당합니다.",
    next:
      "이번에는 요청이 지나가는 길을 봤습니다. 다음 Chapter에서는 그 요청과 응답이 " +
      "실제로 어떤 내용으로 되어 있는지(Method · URL · Status Code · JSON) 들여다봅니다."
  }
};

export default chapter01;
