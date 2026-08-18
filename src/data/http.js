/*
 * Chapter 02 — Request / Response 실습용 Mock API.
 * 24_TECHNICAL_CONTENT_RULES §9 의 초기 핵심(GET · POST · 200 · 201 · 404 · JSON)만 다룬다.
 * Method 의미 구분(REST)은 Chapter 12, 데이터 저장은 Chapter 13 범위다.
 *
 * Route · Table · 서비스명은 Chapter 01 과 같은 계약을 유지한다. (§10 Code Consistency Gate)
 *   Route: /api/students/...     Table: students     Service: backend / db
 */

/* 학습용 예시 데이터 — 실제 개인정보가 아니다. */
export const MOCK_STUDENTS = [
  { id: 1, name: "김철수", score: 93 },
  { id: 2, name: "이영희", score: 88 }
];

export const METHODS = [
  {
    id: "GET",
    role: "가져오기",
    desc: "이미 있는 데이터를 달라고 요청한다.",
    target: "item",
    hint: "학생 한 명을 지정해야 하므로 번호가 필요합니다."
  },
  {
    id: "POST",
    role: "새로 만들기",
    desc: "새 데이터를 만들어 달라고 요청한다.",
    target: "collection",
    hint: "아직 번호가 없는 데이터를 만드는 요청이라 번호를 고르지 않습니다."
  }
];

export const RESOURCE = { id: "students", label: "students", desc: "학생 데이터 모음" };

export const TARGET_IDS = [
  { id: 1, note: "있는 학생" },
  { id: 2, note: "있는 학생" },
  { id: 999, note: "없는 학생" }
];

/* POST 로 보낼 본문은 고정이다. 본문 편집은 Chapter 12 범위. */
export const NEW_STUDENT = { name: "박민수", score: 77 };

export const STATUS_TEXT = {
  200: "OK",
  201: "Created",
  404: "Not Found",
  500: "Internal Server Error"
};

export const STATUS_MEANING = {
  200: "요청을 처리했고 결과 데이터를 함께 보냈다.",
  201: "요청대로 새 데이터를 만들었다.",
  404: "주소는 서버까지 갔지만 그 데이터를 찾지 못했다.",
  500: "서버가 처리하는 도중에 문제가 생겼다."
};

/* Request 한 건을 조립한다. UI 가 아니라 값만 만든다. */
export function buildRequest(method, id) {
  const m = METHODS.find((x) => x.id === method) || METHODS[0];
  const path = m.target === "item" ? `/api/students/${id}` : "/api/students";
  const headers = [["Host", "localhost"], ["Accept", "application/json"]];
  let body = null;

  if (m.target === "collection") {
    headers.push(["Content-Type", "application/json"]);
    body = JSON.stringify(NEW_STUDENT, null, 2);
  }

  return { method: m.id, path, headers, body, line: `${m.id} ${path} HTTP/1.1` };
}

/* 조립한 Request 에 대한 Response 를 만든다. */
export function buildResponse(request) {
  if (request.method === "POST") {
    const created = { id: 3, ...NEW_STUDENT };
    return {
      status: 201,
      ok: true,
      headers: [["Content-Type", "application/json"], ["Location", "/api/students/3"]],
      body: JSON.stringify(created, null, 2),
      node: "flask",
      edge: "nginx-browser",
      summary: "새 학생 데이터가 만들어졌고, 만들어진 결과를 그대로 돌려받았습니다."
    };
  }

  const id = Number(request.path.split("/").pop());
  const found = MOCK_STUDENTS.find((s) => s.id === id);

  if (!found) {
    return {
      status: 404,
      ok: false,
      headers: [["Content-Type", "application/json"]],
      body: JSON.stringify({ error: "student not found" }, null, 2),
      node: "flask",
      edge: "nginx-flask",
      summary: `${id}번 학생이 students 에 없어서, Flask가 데이터 대신 404를 돌려주었습니다.`
    };
  }

  return {
    status: 200,
    ok: true,
    headers: [["Content-Type", "application/json"]],
    body: JSON.stringify(found, null, 2),
    node: "flask",
    edge: "nginx-browser",
    summary: `${found.name} 학생의 데이터를 찾아서 JSON 으로 돌려받았습니다.`
  };
}

/* Request / Response 를 구성하는 부분과 그 역할 — Inspector 설명에 쓴다. */
export const REQUEST_PARTS = [
  { id: "method", label: "Method", role: "무엇을 하려는지" },
  { id: "path", label: "URL / Path", role: "무엇을 대상으로 하는지" },
  { id: "headers", label: "Headers", role: "요청에 대한 부가 정보" },
  { id: "body", label: "Body", role: "함께 보내는 데이터" }
];

export const RESPONSE_PARTS = [
  { id: "status", label: "Status Code", role: "결과를 한 줄로 요약한 숫자" },
  { id: "headers", label: "Headers", role: "응답에 대한 부가 정보" },
  { id: "body", label: "Body", role: "실제로 받은 데이터" }
];

export default { buildRequest, buildResponse };
