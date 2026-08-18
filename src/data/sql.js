/*
 * Chapter 13 — SQL / Database.
 *
 * Legacy Chapter 13 에서 init.sql · SELECT/UPDATE 예시 · WHERE 누락 위험 시뮬레이션 ·
 * 오류 2건 · summary 를 가져왔다. WHERE 누락을 실행하지 않고 예고만 하는 방식도 그대로 살렸다.
 * (24_TECHNICAL_CONTENT_RULES §7 — 파괴적 SQL 은 기본 Activity 에서 실제로 실행하지 않는다)
 *
 * 표 내용은 Chapter 02 의 Mock 과 Chapter 02·12 에서 만든 행을 이어받는다.
 *   1 김철수 93 · 2 이영희 88 · 3 박민수 77
 * 문자열 이어붙이기 예제는 만들지 않는다. 값은 언제나 인자로 전달한다.
 */
import { MOCK_STUDENTS, NEW_STUDENT } from "./http.js";

export const TABLE = "students";
export const INIT_PATH = "database/init.sql";

/*
 * 첫 화면의 표는 데이터만 보여 준다.
 * AUTO_INCREMENT · VARCHAR · PRIMARY KEY · NOT NULL 은 표 머리글에서 빼고
 * "표 구조 자세히 보기" 안에서만 설명한다. (CLAUDE.md §21)
 *   label 표 머리글에 보이는 쉬운 이름
 *   type  심화에서만 보이는 실제 정의
 */
export const COLUMNS = [
  {
    id: "id",
    label: "번호",
    type: "INT AUTO_INCREMENT PRIMARY KEY",
    role: "행을 구분하는 번호 · 새 행이 들어오면 자동으로 붙는다",
    /* 한 문장으로 몰아 설명하지 않는다. 키워드를 하나씩 본 뒤 마지막에 다시 조합한다. */
    parts: [
      ["INT", "정수를 저장한다."],
      ["AUTO_INCREMENT", "새 데이터가 들어올 때 번호를 자동으로 증가시킨다."],
      ["PRIMARY KEY", "각 행을 구분하는 대표 값이다. 중복되지 않게 관리된다."]
    ],
    combine: {
      code: "id INT AUTO_INCREMENT PRIMARY KEY",
      say: "따라서 id는 자동으로 번호가 붙는 각 행의 고유한 정수 번호입니다."
    }
  },
  {
    id: "name",
    label: "이름",
    type: "VARCHAR(100) NOT NULL",
    role: "이름 · 비어 있을 수 없다",
    parts: [
      ["VARCHAR(100)", "최대 100자 문자열을 저장한다."],
      ["NOT NULL", "값을 비워 둘 수 없다."]
    ],
    combine: {
      code: "name VARCHAR(100) NOT NULL",
      say: "따라서 name은 반드시 값이 있어야 하는, 최대 100자까지의 이름입니다."
    }
  },
  {
    id: "score",
    label: "점수",
    type: "INT NOT NULL",
    role: "점수 · 비어 있을 수 없다",
    parts: [
      ["INT", "정수를 저장한다."],
      ["NOT NULL", "값을 비워 둘 수 없다."]
    ],
    combine: {
      code: "score INT NOT NULL",
      say: "따라서 score는 반드시 값이 있어야 하는 정수 점수입니다."
    }
  }
];

/* SQL 문장에 보이는 두 기호 — 나오는 즉시 설명한다 (CLAUDE.md §21) */
export const PARAM_NOTES = [
  { mark: "%s", role: "실제 값이 안전하게 들어갈 자리", desc: "문장에 값을 직접 이어붙이지 않고 자리만 비워 둡니다." },
  { mark: "(1,)", role: "이번 질의에 전달한 값", desc: "비워 둔 자리에 넣을 값을 따로 넘깁니다. 값은 언제나 값으로만 다뤄집니다." }
];

/* Chapter 02·12 에서 만든 행까지 포함한 현재 표 */
export const ROWS = [...MOCK_STUDENTS, { id: 3, ...NEW_STUDENT }];

export const QUERIES = [
  {
    id: "all",
    label: "전체 조회",
    question: "학생이 모두 몇 명이고 누가 있는지 알고 싶다",
    sql: "SELECT id, name, score FROM students;",
    kind: "read",
    desc: "조건이 없으므로 표의 모든 행이 나온다.",
    detail:
      "조회는 데이터를 바꾸지 않습니다. 몇 행이 대상인지 확인하고 싶을 때 " +
      "먼저 SELECT 해 보는 습관이 안전합니다."
  },
  {
    id: "one",
    label: "한 명만 조회",
    question: "1번 학생의 점수만 알고 싶다",
    sql: "SELECT id, name, score FROM students WHERE id = %s;",
    params: "(1,)",
    kind: "read",
    target: [1],
    desc: "WHERE가 대상을 한 행으로 좁힌다.",
    detail:
      "Flask가 Chapter 11에서 실행한 것이 바로 이 조회입니다. " +
      "값은 문자열로 이어붙이지 않고 %s 자리에 인자로 전달합니다."
  },
  {
    id: "update",
    label: "한 명만 수정",
    question: "2번 학생의 점수만 90점으로 바꾸고 싶다",
    sql: "UPDATE students SET score = %s WHERE id = %s;",
    params: "(90, 2)",
    kind: "write",
    target: [2],
    change: { id: 2, field: "score", from: 88, to: 90 },
    desc: "조건에 맞는 1행만 바뀐다.",
    detail:
      "Chapter 12의 PATCH가 실제로 실행하는 것이 이 SQL입니다. " +
      "실행 전에 같은 조건으로 SELECT 해서 몇 행이 나오는지 확인하면 안전합니다."
  },
  {
    id: "delete",
    label: "한 명만 삭제",
    question: "3번 학생 한 명만 명단에서 지우고 싶다",
    sql: "DELETE FROM students WHERE id = %s;",
    params: "(3,)",
    kind: "write",
    target: [3],
    remove: [3],
    desc: "조건에 맞는 1행만 지워진다.",
    detail:
      "Chapter 12의 DELETE가 실행하는 SQL입니다. 지운 뒤에는 돌려줄 내용이 없어 204로 답합니다."
  },
  {
    id: "danger",
    label: "WHERE 없는 수정",
    question: "조건을 빠뜨리면 어떻게 되는지 보고 싶다",
    sql: "UPDATE students SET score = 0;",
    kind: "danger",
    desc: "조건이 없으므로 표의 모든 행이 대상이 된다.",
    detail:
      "이 연습에서는 실행하지 않습니다. WHERE가 없으면 조건이 '전부'가 되어 " +
      "모든 학생의 점수가 0이 되고, 되돌릴 수 없습니다. " +
      "실행 전에 같은 조건으로 SELECT 해서 몇 행이 나오는지 반드시 확인합니다."
  }
];

export const getQuery = (id) => QUERIES.find((q) => q.id === id) || null;

/* 결과는 현재 표에서 계산한다. 위험한 쿼리는 표를 바꾸지 않고 예고만 한다. */
export function runQuery(rows, id) {
  const q = getQuery(id);
  if (!q) return null;

  if (q.kind === "danger") {
    return {
      query: q,
      executed: false,
      affected: rows.map((r) => r.id),
      preview: rows.map((r) => ({ ...r, score: 0 })),
      next: null,
      count: rows.length,
      countLabel: `${rows.length}행 전체가 대상 · 되돌릴 수 없다`,
      json: null,
      verdict:
        "학습 화면에서는 실행하지 않습니다. 실행했다면 표의 모든 행이 바뀌었을 것입니다."
    };
  }

  if (q.kind === "read") {
    const hit = q.target ? rows.filter((r) => q.target.includes(r.id)) : rows.slice();
    return {
      query: q,
      executed: true,
      affected: hit.map((r) => r.id),
      preview: rows,
      next: null,
      count: hit.length,
      countLabel: `${hit.length}행 조회됨 · 데이터 변경 없음`,
      json: hit.length === 1 ? JSON.stringify(hit[0], null, 2) : JSON.stringify(hit, null, 2),
      verdict:
        hit.length === 1
          ? "이 한 행이 Flask에서 JSON으로 바뀌어 화면까지 갑니다."
          : "조회 결과가 여러 행이면 JSON 배열이 됩니다."
    };
  }

  if (q.remove) {
    const next = rows.filter((r) => !q.remove.includes(r.id));
    return {
      query: q,
      executed: true,
      affected: [],          /* 지워진 행은 더 이상 표에 없다 — 결과 상태를 그대로 보여 준다 */
      preview: next,
      next,
      count: rows.length - next.length,
      countLabel: `${rows.length - next.length}행 삭제됨`,
      json: null,
      verdict: "조건에 맞는 행만 사라졌습니다. 나머지 행은 그대로입니다."
    };
  }

  const ch = q.change;
  const next = rows.map((r) => (r.id === ch.id ? { ...r, [ch.field]: ch.to } : r));
  return {
    query: q,
    executed: true,
    affected: [ch.id],
    preview: next,
    next,
    count: 1,
    countLabel: `1행 변경됨 (${ch.from} → ${ch.to})`,
    json: null,
    verdict: "조건에 맞는 한 행의 값만 바뀌었습니다."
  };
}

export default QUERIES;
