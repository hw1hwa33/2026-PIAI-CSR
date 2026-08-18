/*
 * PROCESS_ANIMATION_SPEC.md §5 단계 모델 / §11 단계별 문구 / §12 컴퓨터 화면 상태
 * 21_COURSE_CONTENT_CORE §2 One System Rule — 예제는 학생 1번(김철수 / 93점) 하나로 고정한다.
 * UI 없음 — 데이터만 정의한다.
 *
 * step 필드 (ProcessScene 이 직접 읽는 값)
 *   ui      "initial" | "loading" | "success"        SPEC §12
 *   click   true 면 조회 버튼이 눌린 모습
 *   wire    "req" | "res"                            살아 있는 배선
 *   active  "nginx" | "flask" | "mysql"              지금 일하는 서버 계층
 *   packet  { at, kind, label, lines[] }             이동 중인 데이터 + 의미 카드
 *
 * step 필드 (ProcessActivity 가 읽는 값)
 *   id, title, text, node, edge, visit, hold, packetState, preview, done
 *
 * packetState 는 SPEC §15 의 값만 사용한다 — idle | request | sql | dbResult | response
 */

export const STUDENT = { id: 1, name: "김철수", score: 93 };

export const REQUEST_PATH = `/api/students/${STUDENT.id}`;

export const PROCESS_STEPS = [
  {
    id: "IDLE",
    index: 0,
    title: "대기",
    text: "학생 성적 조회 화면이 열려 있습니다. 아직 아무 요청도 보내지 않았습니다.",
    ui: "initial",
    node: "browser",
    packetState: "idle",
    preview: { label: "데이터 상태", value: "아직 요청 없음" },
    hold: 700
  },
  {
    id: "USER_CLICK",
    index: 1,
    title: "사용자가 조회 버튼을 누른다",
    text: "사용자가 학생 조회 버튼을 눌렀습니다.",
    ui: "initial",
    click: true,
    node: "user",
    edge: "user-browser",
    packetState: "idle",
    preview: { label: "사용자 행동", value: "조회 버튼 클릭" },
    hold: 400
  },
  {
    id: "REQUEST_CREATED",
    index: 2,
    title: "Browser가 요청을 만든다",
    text: `Browser가 GET ${REQUEST_PATH} 요청을 생성했습니다.`,
    ui: "loading",
    node: "browser",
    packetState: "request",
    packet: {
      at: "browser",
      kind: "request",
      label: "HTTP REQUEST",
      lines: [`GET ${REQUEST_PATH}`, "Host: localhost", "Accept: application/json"]
    },
    preview: { label: "HTTP Request", value: `GET ${REQUEST_PATH}` },
    hold: 500
  },
  {
    id: "REQUEST_TRAVEL_TO_SERVER",
    index: 3,
    title: "요청이 서버로 이동한다",
    text: "Request가 컴퓨터에서 서버로 이동합니다.",
    ui: "loading",
    wire: "req",
    node: "browser",
    edge: "browser-nginx",
    packetState: "request",
    packet: {
      at: "network",
      kind: "request",
      label: "HTTP REQUEST · 이동 중",
      lines: ["출발 : 내 컴퓨터의 Browser", "도착 : 서버의 80번 입구", "방향 : 컴퓨터 → 서버"]
    },
    preview: { label: "HTTP Request", value: `GET ${REQUEST_PATH}` },
    hold: 1000
  },
  {
    id: "NGINX_RECEIVED",
    index: 4,
    title: "Nginx가 요청을 받는다",
    text: "Nginx가 요청을 받았습니다. /api 경로이므로 Backend로 전달합니다.",
    ui: "loading",
    active: "nginx",
    visit: "nginx",
    node: "nginx",
    packetState: "request",
    packet: {
      at: "nginx",
      kind: "request",
      label: "HTTP REQUEST · Nginx 도착",
      lines: ["location /api/ {", "  proxy_pass http://backend:5000;", "}"]
    },
    preview: { label: "HTTP Request", value: `GET ${REQUEST_PATH} → backend:5000` },
    hold: 700
  },
  {
    id: "FLASK_PROCESSING",
    index: 5,
    title: "Flask API가 요청을 처리한다",
    text: `Flask가 Route를 확인하고 학생 ID ${STUDENT.id}을 처리합니다.`,
    ui: "loading",
    active: "flask",
    visit: "flask",
    node: "flask",
    edge: "nginx-flask",
    packetState: "request",
    packet: {
      at: "flask",
      kind: "request",
      label: "HTTP REQUEST · Route 확인",
      lines: [
        '@app.get("/api/students/<int:student_id>")',
        "def get_student(student_id):",
        `    # student_id = ${STUDENT.id}`
      ]
    },
    preview: { label: "Flask Route", value: `get_student(student_id=${STUDENT.id})` },
    hold: 700
  },
  {
    id: "SQL_QUERY_TO_DB",
    index: 6,
    title: "요청이 SQL Query로 바뀐다",
    text: "Flask가 학생 정보를 찾기 위한 SQL Query를 MySQL로 보냅니다.",
    ui: "loading",
    active: "mysql",
    node: "mysql",
    edge: "flask-mysql",
    packetState: "sql",
    packet: {
      at: "mysql",
      kind: "sql",
      label: "SQL QUERY",
      lines: ["SELECT id, name, score", "FROM students", `WHERE id = ${STUDENT.id}`]
    },
    preview: {
      label: "SQL Query",
      value: `SELECT id, name, score FROM students WHERE id = ${STUDENT.id}`
    },
    hold: 800
  },
  {
    id: "DB_RESULT_READY",
    index: 7,
    title: "MySQL이 데이터를 찾았다",
    text: "MySQL이 students 테이블에서 학생 데이터를 찾았습니다.",
    ui: "loading",
    active: "mysql",
    visit: "mysql",
    node: "mysql",
    packetState: "dbResult",
    packet: {
      at: "mysql",
      kind: "dbResult",
      label: "DB RESULT · 1 row",
      lines: ["id | name   | score", `${STUDENT.id}  | ${STUDENT.name} | ${STUDENT.score}`]
    },
    preview: {
      label: "DB Result",
      value: `${STUDENT.id} | ${STUDENT.name} | ${STUDENT.score}`
    },
    hold: 700
  },
  {
    id: "JSON_RESPONSE_BUILT",
    index: 8,
    title: "DB 결과가 JSON 응답이 된다",
    text: "Flask가 조회 결과를 JSON 응답으로 변환합니다.",
    ui: "loading",
    active: "flask",
    node: "flask",
    edge: "mysql-flask",
    packetState: "response",
    packet: {
      at: "flask",
      kind: "response",
      label: "JSON RESPONSE · 200 OK",
      lines: [
        "{",
        `  "id": ${STUDENT.id}, "name": "${STUDENT.name}",`,
        `  "score": ${STUDENT.score}`,
        "}"
      ]
    },
    preview: {
      label: "JSON Response",
      value: `{ "id": ${STUDENT.id}, "name": "${STUDENT.name}", "score": ${STUDENT.score} }`
    },
    hold: 700
  },
  {
    id: "RESPONSE_TRAVEL_TO_CLIENT",
    index: 9,
    title: "응답이 컴퓨터로 돌아간다",
    text: "JSON Response가 서버에서 컴퓨터로 돌아갑니다.",
    ui: "loading",
    wire: "res",
    node: "browser",
    edge: "nginx-browser",
    packetState: "response",
    packet: {
      at: "wireBack",
      kind: "response",
      label: "JSON RESPONSE · 이동 중",
      lines: ["출발 : 서버", "도착 : 내 컴퓨터의 Browser", "방향 : 서버 → 컴퓨터"]
    },
    preview: {
      label: "JSON Response",
      value: `{ "id": ${STUDENT.id}, "name": "${STUDENT.name}", "score": ${STUDENT.score} }`
    },
    hold: 1000
  },
  {
    id: "UI_RENDERED",
    index: 10,
    title: "Frontend가 화면을 다시 그린다",
    text: "Frontend가 응답 데이터를 State에 저장하고 화면을 다시 그립니다.",
    ui: "success",
    node: "browser",
    packetState: "response",
    packet: {
      at: "browser",
      kind: "response",
      label: "화면에 반영",
      lines: ["name  → 이름 칸", "score → 점수 칸"]
    },
    preview: { label: "화면 표시", value: `${STUDENT.name} · ${STUDENT.score}점` },
    hold: 800
  },
  {
    id: "SUCCESS",
    index: 11,
    title: "조회 완료",
    text: "학생 조회가 완료되었습니다.",
    ui: "success",
    node: "browser",
    packetState: "idle",
    preview: { label: "화면 표시", value: `${STUDENT.name} · ${STUDENT.score}점` },
    done: true,
    hold: 0
  }
];

/* SPEC §8.2 — Play Once 총 재생 시간이 6~9초 범위인지 확인용 파생값 */
export const PLAY_ONCE_DURATION = PROCESS_STEPS.reduce((sum, s) => sum + (s.hold || 0), 0);

export default PROCESS_STEPS;
