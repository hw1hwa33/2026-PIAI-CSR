/*
 * Chapter 11 — Flask Route 매칭.
 *
 * Legacy Chapter 11 에서 app.py · Route 매칭 Activity 아이디어 · 오류 2건 · summary 를 가져왔다.
 * Legacy 는 Chapter 02·10 과 같은 "고르고 보내기" UI 였으므로,
 * 여기서는 등록된 Route 표를 위에서부터 검사하는 매칭 과정 자체를 보여 준다.
 *
 * 코드 계약 (24_TECHNICAL_CONTENT_RULES §6 · §10)
 *   Route  /api/students · /api/students/<int:student_id>
 *   SQL    파라미터 바인딩 (%s, (student_id,)) — 문자열 이어붙이기 금지
 *   Table  students
 *
 * Method 별 의미 구분(REST)은 Chapter 12 범위다. 여기서는 주소와 함수의 연결만 본다.
 */

export const APP_PATH = "backend/app.py";

export const MOCK_ROWS = [
  { id: 1, name: "김철수", score: 93 },
  { id: 2, name: "이영희", score: 88 }
];

/* 등록된 Route. Flask 는 주소 모양과 Method 를 함께 본다. */
export const ROUTES = [
  {
    id: "list",
    decorator: '@app.get("/api/students")',
    fn: "list_students()",
    method: "GET",
    pattern: "/api/students",
    params: [],
    desc: "id가 없는 주소 — 목록 전체를 돌려준다"
  },
  {
    id: "item",
    decorator: '@app.get("/api/students/<int:student_id>")',
    fn: "get_student(student_id)",
    method: "GET",
    pattern: "/api/students/<int:student_id>",
    params: ["student_id"],
    desc: "마지막 칸이 정수인 주소 — 학생 한 명을 돌려준다"
  }
];

export const INCOMING = [
  { id: "one", method: "GET", path: "/api/students/2", label: "있는 학생 한 명" },
  { id: "list", method: "GET", path: "/api/students", label: "목록 전체" },
  { id: "missing", method: "GET", path: "/api/students/999", label: "없는 학생" },
  { id: "typed", method: "GET", path: "/api/students/abc", label: "숫자가 아닌 값" },
  { id: "wrong", method: "GET", path: "/api/teachers/1", label: "등록되지 않은 주소" },
  { id: "post", method: "POST", path: "/api/students", label: "주소는 맞지만 다른 Method" }
];

const json = (o) => JSON.stringify(o, null, 2);

/* 이 Route 가 이 요청을 받을 수 있는가 — 주소 모양과 Method 를 각각 따로 본다. */
export function testRoute(route, req) {
  const parts = req.path.split("/").filter(Boolean);      // api, students, ...
  const pat = route.pattern.split("/").filter(Boolean);

  if (parts.length !== pat.length) {
    return { path: false, method: false, why: "주소의 칸 수가 다르다" };
  }
  for (let i = 0; i < pat.length; i += 1) {
    if (pat[i].startsWith("<")) {
      if (!/^\d+$/.test(parts[i])) {
        return { path: false, method: false, why: `${parts[i]} 는 <int:...> 자리에 맞지 않는다` };
      }
      continue;
    }
    if (pat[i] !== parts[i]) {
      return { path: false, method: false, why: `${parts[i]} 가 ${pat[i]} 와 다르다` };
    }
  }
  if (route.method !== req.method) {
    return { path: true, method: false, why: `주소는 맞지만 ${route.method} 만 받는다` };
  }
  return { path: true, method: true, why: "주소 모양과 Method 가 모두 맞다" };
}

export function matchRoute(req) {
  let pathOnly = null;
  for (const r of ROUTES) {
    const t = testRoute(r, req);
    if (t.path && t.method) return { route: r, test: t, kind: "match" };
    if (t.path && !pathOnly) pathOnly = { route: r, test: t, kind: "method" };
  }
  return pathOnly || { route: null, test: null, kind: "none" };
}

/* 매칭 결과 → 실행 → 응답. 값은 상태에서 계산한다. */
export function handle(reqId) {
  const req = INCOMING.find((r) => r.id === reqId);
  if (!req) return null;
  const m = matchRoute(req);

  if (m.kind === "none") {
    return {
      req, match: m,
      bind: null, sql: null,
      status: 404, statusText: "Not Found", ok: false,
      node: "flask", edge: "nginx-flask",
      body: json({ error: "not found" }),
      verdict:
        "어떤 Route와도 짝이 맞지 않습니다. Flask는 실행할 함수를 찾지 못해 404로 답합니다. " +
        "서버가 고장 난 것이 아니라 그런 주소가 없다는 뜻입니다.",
      hint: "등록된 주소는 /api/students 와 /api/students/<int:student_id> 두 개뿐입니다."
    };
  }

  if (m.kind === "method") {
    return {
      req, match: m,
      bind: null, sql: null,
      status: 405, statusText: "Method Not Allowed", ok: false,
      node: "flask", edge: "nginx-flask",
      body: json({ error: "method not allowed" }),
      verdict:
        "주소 모양은 맞지만 그 주소가 받는 Method가 아닙니다. " +
        "Route는 주소와 Method를 함께 봅니다.",
      hint: "Method별로 동작을 나누는 방법은 Chapter 12에서 배웁니다."
    };
  }

  const route = m.route;

  if (route.id === "list") {
    return {
      req, match: m,
      bind: [],
      sql: "SELECT id, name, score FROM students;",
      status: 200, statusText: "OK", ok: true,
      node: "flask", edge: "nginx-flask",
      body: json(MOCK_ROWS),
      verdict:
        "주소에 id가 없으므로 목록 조회 함수가 실행됩니다. " +
        "같은 자원이라도 주소 모양이 다르면 다른 함수가 실행됩니다.",
      hint: "함수가 돌려준 값은 Flask가 JSON으로 바꿔 응답 본문에 담습니다."
    };
  }

  const id = Number(req.path.split("/").pop());
  const row = MOCK_ROWS.find((r) => r.id === id) || null;

  return {
    req, match: m,
    bind: [["student_id", String(id)]],
    sql: "SELECT id, name, score FROM students WHERE id = %s;",
    sqlParams: `(${id},)`,
    status: row ? 200 : 404,
    statusText: row ? "OK" : "Not Found",
    ok: !!row,
    node: row ? "mysql" : "flask",
    edge: "flask-mysql",
    body: row ? json(row) : json({ error: "student not found" }),
    row,
    verdict: row
      ? "주소의 값이 함수 인자로 전달되고, 그 값으로 DB를 조회한 결과가 JSON이 됩니다."
      : "Route는 맞았고 함수도 실행됐습니다. 다만 그 번호의 행이 없어 함수가 404를 돌려줬습니다.",
    hint: row
      ? "값은 SQL 문자열에 이어붙이지 않고 인자로 따로 전달합니다."
      : "404가 항상 '주소가 틀렸다'는 뜻은 아닙니다. 여기서는 '데이터가 없다'는 뜻입니다."
  };
}

export const CODE = [
  { t: "import os, mysql.connector", hot: [] },
  { t: "from flask import Flask, jsonify", hot: [] },
  { t: "", hot: [] },
  { t: "app = Flask(__name__)", hot: [] },
  { t: "", hot: [] },
  { t: '@app.get("/api/students")', hot: ["list"] },
  { t: "def list_students():", hot: ["list"] },
  { t: '    rows = query("SELECT id, name, score FROM students")', hot: ["list"] },
  { t: "    return jsonify(rows)", hot: ["list"] },
  { t: "", hot: [] },
  { t: '@app.get("/api/students/<int:student_id>")', hot: ["item"] },
  { t: "def get_student(student_id):", hot: ["item"] },
  { t: "    student = query_one(", hot: ["item"] },
  { t: '        "SELECT id, name, score FROM students WHERE id = %s",', hot: ["item"] },
  { t: "        (student_id,))          # 값은 인자로 전달한다", hot: ["item"] },
  { t: "    if student is None:", hot: ["item"] },
  { t: '        return {"error": "student not found"}, 404', hot: ["item"] },
  { t: "    return jsonify(student)", hot: ["item"] }
];

export default ROUTES;
