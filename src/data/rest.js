/*
 * Chapter 12 — REST: 자원(주소)과 동작(Method)을 나눠 표현하기.
 *
 * Legacy Chapter 12 에서 Route 목록 · 생성 코드 · Method 별 결과 · 오류 2건 · summary 를 가져왔다.
 * Legacy 는 "하려는 일 + Method" 두 선택지를 조합하는 형태였는데,
 * 그 방식은 Chapter 02 의 Request Builder 와 조작감이 겹친다.
 * 여기서는 자원 × Method 전체 조합을 한 장의 표로 펼쳐 놓고 고르게 한다.
 *
 * Chapter 02 와의 차이 (20 §5)
 *   Chapter 02  요청과 응답이 무엇으로 이루어지는가
 *   Chapter 12  같은 자원을 Method 로 어떻게 나누는가
 *
 * 코드 계약: /api/students · /api/students/<int:student_id> · Table students
 */

import { MOCK_STUDENTS, NEW_STUDENT } from "./http.js";

export const RESOURCES = [
  {
    id: "collection",
    path: "/api/students",
    label: "목록 주소",
    means: "학생 전체를 가리킨다",
    allow: ["GET", "POST"]
  },
  {
    id: "item",
    path: "/api/students/2",
    label: "개별 주소",
    means: "2번 학생 한 명을 가리킨다",
    allow: ["GET", "PATCH", "DELETE"]
  }
];

export const METHODS = [
  { id: "GET", ko: "조회", means: "가져오기만 한다. 데이터는 바뀌지 않는다." },
  { id: "POST", ko: "생성", means: "새로 만든다. 만들 대상은 아직 번호가 없다." },
  { id: "PATCH", ko: "일부 수정", means: "이미 있는 것의 일부만 바꾼다." },
  { id: "DELETE", ko: "삭제", means: "이미 있는 것을 지운다." }
];

const json = (o) => JSON.stringify(o, null, 2);

/* 표의 내용은 Chapter 02 와 같은 Mock 을 그대로 쓴다 (Single Source of Truth) */
export const ROWS = MOCK_STUDENTS;
export const CREATED = { id: 3, ...NEW_STUDENT };

/* 자원 × Method 한 칸의 결과. 허용되지 않는 조합은 405 를 돌려준다. */
export function cellOf(resourceId, method) {
  const res = RESOURCES.find((r) => r.id === resourceId);
  const allowed = res.allow.includes(method);

  if (!allowed) {
    return {
      allowed: false,
      status: 405,
      statusText: "Method Not Allowed",
      ok: false,
      sql: "실행되지 않음",
      body: json({ error: "method not allowed" }),
      headers: [["Allow", res.allow.join(", ")]],
      why:
        resourceId === "collection"
          ? "목록 주소는 '전체'를 가리킵니다. 무엇을 고칠지 지목하지 않았으므로 수정·삭제를 받지 않습니다."
          : "개별 주소는 이미 있는 하나를 가리킵니다. 새로 만드는 요청은 목록 주소에서 합니다."
    };
  }

  if (resourceId === "collection" && method === "GET") {
    return {
      allowed: true, status: 200, statusText: "OK", ok: true,
      node: "flask", edge: "nginx-flask",
      sql: "SELECT id, name, score FROM students;",
      reqBody: null,
      body: json(ROWS),
      headers: [["Content-Type", "application/json"]],
      why: "목록 주소를 GET하면 학생 전체를 배열로 돌려줍니다."
    };
  }
  if (resourceId === "collection" && method === "POST") {
    return {
      allowed: true, status: 201, statusText: "Created", ok: true,
      node: "mysql", edge: "flask-mysql",
      /* 값을 SQL 문자열에 직접 넣지 않는다 — 이 교안의 모든 SQL 은 파라미터 바인딩을 쓴다.
         (24_TECHNICAL_CONTENT_RULES · CLAUDE.md §20) */
      sql: "INSERT INTO students (name, score) VALUES (%s, %s);",
      sqlParams: `('${NEW_STUDENT.name}', ${NEW_STUDENT.score})`,
      reqBody: json(NEW_STUDENT),
      body: json(CREATED),
      headers: [["Content-Type", "application/json"], ["Location", `/api/students/${CREATED.id}`]],
      why:
        "만들기는 목록 주소에서 합니다. 아직 번호가 없기 때문입니다. " +
        "만들어진 뒤에는 201과 함께 새 주소를 Location 헤더로 알려 줍니다."
    };
  }
  if (resourceId === "item" && method === "GET") {
    return {
      allowed: true, status: 200, statusText: "OK", ok: true,
      node: "mysql", edge: "flask-mysql",
      sql: "SELECT id, name, score FROM students WHERE id = %s;",
      sqlParams: "(2,)",
      reqBody: null,
      body: json(ROWS[1]),
      headers: [["Content-Type", "application/json"]],
      why: "개별 주소를 GET하면 그 한 명만 돌려줍니다."
    };
  }
  if (resourceId === "item" && method === "PATCH") {
    return {
      allowed: true, status: 200, statusText: "OK", ok: true,
      node: "mysql", edge: "flask-mysql",
      sql: "UPDATE students SET score = %s WHERE id = %s;",
      sqlParams: "(90, 2)",
      reqBody: json({ score: 90 }),
      body: json({ id: 2, name: "이영희", score: 90 }),
      headers: [["Content-Type", "application/json"]],
      why:
        "PATCH는 보낸 값만 바꿉니다. 이름은 보내지 않았으므로 그대로 남습니다. " +
        "전체를 통째로 바꾸려면 PUT을 씁니다."
    };
  }
  return {
    allowed: true, status: 204, statusText: "No Content", ok: true,
    node: "mysql", edge: "flask-mysql",
    sql: "DELETE FROM students WHERE id = %s;",
    sqlParams: "(2,)",
    reqBody: null,
    body: "(본문 없음)",
    headers: [],
    why:
      "지우고 나면 돌려줄 내용이 없으므로 본문 없이 204로 답합니다. " +
      "WHERE가 빠지면 표 전체가 지워집니다 — 이 위험은 Chapter 13에서 다룹니다."
  };
}

/* 상황 카드 — 하려는 일에 맞는 칸을 고른다. */
export const MISSIONS = [
  {
    id: "list",
    task: "학생 명단 전체를 화면에 보여 주려고 한다.",
    resource: "collection",
    method: "GET",
    done: "학생 목록 전체를 받는다"
  },
  {
    id: "add",
    task: `새로 들어온 학생 '${NEW_STUDENT.name}'을 등록하려고 한다.`,
    resource: "collection",
    method: "POST",
    done: "새 학생이 만들어지고 번호가 붙는다"
  },
  {
    id: "update",
    task: "2번 학생의 점수만 90점으로 고치려고 한다.",
    resource: "item",
    method: "PATCH",
    done: "그 학생의 점수만 바뀐다"
  },
  {
    id: "remove",
    task: "2번 학생을 명단에서 지우려고 한다.",
    resource: "item",
    method: "DELETE",
    done: "그 학생 한 명만 지워진다"
  }
];

export default RESOURCES;
