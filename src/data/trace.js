/*
 * Chapter 14 — 전체 Request → Response 추적.
 *
 * docs/harness/process/PROCESS_ANIMATION_SPEC.md 를 적용한다.
 *   · 단계 모델 §5 (IDLE → USER_CLICK → … → SUCCESS)
 *   · Packet 의 의미 변화 §6 (HTTP Request → SQL → DB Result → JSON Response)
 *   · 기본 Step Mode · 보조 Play Once §8 · Reduced Motion §9
 *
 * Legacy Chapter 14 에서 11단계 구성 · 단계별 설명 · 오류 2건 · summary 를 가져왔다.
 * Legacy 와 Chapter 01 은 같은 흐름을 "패킷이 지나간다"로 보여 줬다.
 * Chapter 14 는 학습을 마친 뒤의 종합 추적이므로, 각 단계에서
 *   기술 · 파일 · 코드 · 데이터 형태 · Architecture 위치
 * 다섯 가지를 함께 연결해서 본다. Chapter 01 의 Scene 을 복사하지 않는다.
 *
 * 시나리오는 Curriculum 대로 학생 2번(이영희) 조회다. Chapter 01(1번 김철수)과 구분된다.
 */
import { MOCK_STUDENTS } from "./http.js";

export const TARGET = MOCK_STUDENTS[1];              // { id: 2, name: "이영희", score: 88 }
export const REQUEST_PATH = `/api/students/${TARGET.id}`;

const JSON_BODY = JSON.stringify(TARGET, null, 2);

/*
 * dataKind — 이 단계에서 데이터가 어떤 모양인가
 *   none · http · sql · row · json · state · screen
 * ui — 이 단계에서 사용자 화면 상태 (initial · loading · success)
 */
export const TRACE_STEPS = [
  {
    n: 0,
    title: "대기",
    tech: null,
    node: null,
    edge: null,
    dir: null,
    ui: "initial",
    file: null,
    code: null,
    dataKind: "none",
    data: null,
    what: "아직 아무 요청도 없습니다.",
    detail: "모든 흐름은 사용자의 행동에서 시작합니다. 그전까지 서버는 아무 일도 하지 않습니다.",
    hold: 500
  },
  {
    n: 1,
    title: "사용자 클릭",
    tech: "USER",
    node: "user",
    edge: "user-browser",
    dir: "req",
    ui: "initial",
    file: null,
    code: null,
    dataKind: "none",
    data: null,
    what: `사용자가 '${TARGET.id}번 학생 조회'를 누릅니다.`,
    detail: "이 행동이 없으면 뒤쪽 계층은 아무 일도 하지 않습니다.",
    hold: 500
  },
  {
    n: 2,
    title: "Frontend 상태 변경",
    tech: "React",
    node: "browser",
    edge: null,
    dir: "req",
    ui: "loading",
    file: "frontend/src/app.jsx",
    code: 'setStatus("loading");',
    dataKind: "state",
    data: 'status: "loading"\nstudent: null',
    what: "화면 상태가 loading으로 바뀌고 fetch가 실행됩니다.",
    detail:
      "화면은 데이터를 기다리기 전에 먼저 상태부터 바꿉니다. Chapter 09에서 본 그 순서입니다.",
    hold: 600
  },
  {
    n: 3,
    title: "요청 생성",
    tech: "HTTP",
    node: "browser",
    edge: "browser-nginx",
    dir: "req",
    ui: "loading",
    file: "frontend/src/app.jsx",
    code: "const res = await fetch(`/api/students/${id}`);",
    dataKind: "http",
    data: `GET ${REQUEST_PATH} HTTP/1.1\nAccept: application/json`,
    what: `GET ${REQUEST_PATH} 요청이 만들어져 서버로 떠납니다.`,
    detail:
      "Method와 주소가 이 요청의 전부입니다. 브라우저는 Flask의 주소를 모르고, 언제나 입구로 보냅니다.",
    hold: 700
  },
  {
    n: 4,
    title: "Nginx 도착과 분기",
    tech: "Nginx",
    node: "nginx",
    edge: "browser-nginx",
    dir: "req",
    ui: "loading",
    file: "nginx/default.conf",
    code: "location /api/ { proxy_pass http://backend:5000; }",
    dataKind: "http",
    data: `GET ${REQUEST_PATH} HTTP/1.1\nHost: localhost`,
    what: "주소가 /api/ 로 시작하므로 backend로 넘깁니다.",
    detail:
      "/ 로 시작했다면 Nginx가 직접 화면 파일로 답했을 것입니다. 여기서 502가 나면 backend에 닿지 못한 것입니다.",
    hold: 650
  },
  {
    n: 5,
    title: "Flask Route 매칭",
    tech: "Flask",
    node: "flask",
    edge: "nginx-flask",
    dir: "req",
    ui: "loading",
    file: "backend/app.py",
    code: '@app.get("/api/students/<int:student_id>")',
    dataKind: "state",
    data: `student_id = ${TARGET.id}`,
    what: "주소와 짝이 맞는 함수가 실행됩니다.",
    detail: `주소의 ${TARGET.id} 가 student_id 값으로 전달됩니다. Chapter 11에서 본 매칭입니다.`,
    hold: 650
  },
  {
    n: 6,
    title: "SQL 실행",
    tech: "SQL",
    node: "mysql",
    edge: "flask-mysql",
    dir: "req",
    ui: "loading",
    file: "backend/app.py",
    code: 'cursor.execute("... WHERE id = %s", (student_id,))',
    dataKind: "sql",
    data: `SELECT id, name, score\nFROM students\nWHERE id = ${TARGET.id};`,
    what: "요청 처리 계층이 데이터 저장소에 물어볼 새 질문을 만들어 보냅니다.",
    /* "HTTP Request 가 SQL Query 로 바뀐다"고 단순화하지 않는다. (CLAUDE.md §22)
       같은 학생 조회 작업이 각 단계에서 그 단계의 방식으로 다시 표현되는 것이다. */
    detail:
      "같은 '2번 학생을 알고 싶다'는 작업이, 이 단계에서는 데이터 저장소가 알아듣는 방식(SQL)으로 다시 표현됩니다. " +
      "받은 HTTP 요청이 그대로 흘러가는 것이 아니라, 요청 처리 계층이 저장소용 질문을 새로 만들어 보내는 것입니다. " +
      "값은 문자열로 이어붙이지 않고 인자로 전달합니다.",
    hold: 700
  },
  {
    n: 7,
    title: "MySQL 결과",
    tech: "MySQL",
    node: "mysql",
    edge: "flask-mysql",
    dir: "res",
    ui: "loading",
    file: "database/init.sql",
    code: "CREATE TABLE students (id, name, score)",
    dataKind: "row",
    data: `${TARGET.id} | ${TARGET.name} | ${TARGET.score}`,
    what: "조건에 맞는 행 하나가 돌아옵니다.",
    detail: "여기서부터 방향이 반대가 됩니다. 이제 응답이 되돌아갑니다.",
    hold: 650
  },
  {
    n: 8,
    title: "JSON 변환",
    tech: "Flask",
    node: "flask",
    edge: "flask-nginx",
    dir: "res",
    ui: "loading",
    file: "backend/app.py",
    code: "return jsonify(student)",
    dataKind: "json",
    data: JSON_BODY,
    what: "받은 결과를 화면이 알아들을 형식으로 다시 표현합니다.",
    detail:
      "저장소가 돌려준 줄 하나를, 프로그램끼리 공통으로 읽을 수 있는 형식(JSON)으로 다시 씁니다. " +
      "같은 학생 정보가 이번에는 화면 쪽이 알아듣는 방식으로 표현된 것입니다.",
    hold: 700
  },
  {
    n: 9,
    title: "응답 전달",
    tech: "Nginx",
    node: "nginx",
    edge: "nginx-browser",
    dir: "res",
    ui: "loading",
    file: "nginx/default.conf",
    code: "proxy_pass (응답을 그대로 전달)",
    dataKind: "http",
    data: `HTTP/1.1 200 OK\nContent-Type: application/json\n\n${JSON_BODY}`,
    what: "Nginx가 응답을 브라우저로 그대로 전달합니다.",
    detail: "Nginx는 내용을 바꾸지 않습니다. 상태 코드 200과 함께 돌아갑니다.",
    hold: 700
  },
  {
    n: 10,
    title: "React 상태 갱신",
    tech: "React",
    node: "browser",
    edge: "browser-nginx",
    dir: "res",
    ui: "loading",
    file: "frontend/src/app.jsx",
    code: 'setStudent(await res.json()); setStatus("success");',
    dataKind: "state",
    data: `status: "success"\nstudent: ${JSON.stringify(TARGET)}`,
    what: "받은 JSON을 상태에 넣습니다.",
    detail: "이 시점에 화면을 다시 그릴 준비가 끝납니다. 아직 화면은 바뀌기 직전입니다.",
    hold: 650
  },
  {
    n: 11,
    title: "화면 렌더",
    tech: "React",
    node: "user",
    edge: "user-browser",
    dir: "res",
    ui: "success",
    file: "frontend/src/app.jsx",
    code: "return <p>{student.name} · {student.score}점</p>;",
    dataKind: "screen",
    data: `${TARGET.name}\n${TARGET.score}점`,
    what: `사용자가 ${TARGET.name}의 점수를 봅니다.`,
    detail:
      "요청 한 번이 네 계층을 지나 되돌아왔습니다. 데이터는 HTTP → SQL → Row → JSON → 화면 순으로 모양을 바꿨습니다.",
    hold: 700
  }
];

export const LAST_STEP = TRACE_STEPS.length - 1;

export const PLAY_DURATION = TRACE_STEPS.reduce((sum, s) => sum + (s.hold || 0), 0);

export const DATA_KIND_LABEL = {
  none: "데이터 없음",
  http: "HTTP 메시지",
  sql: "SQL 질의",
  row: "DB Row",
  json: "JSON",
  state: "프로그램 안의 값",
  screen: "화면"
};

/* 데이터의 모양이 바뀌는 지점만 모은 요약 — 학습 후 한눈에 확인하는 용도 */
export const SHAPE_CHAIN = [
  { at: 3, kind: "http", label: "HTTP Request" },
  { at: 6, kind: "sql", label: "SQL Query" },
  { at: 7, kind: "row", label: "DB Row" },
  { at: 8, kind: "json", label: "JSON Response" },
  { at: 11, kind: "screen", label: "화면" }
];

export default TRACE_STEPS;
