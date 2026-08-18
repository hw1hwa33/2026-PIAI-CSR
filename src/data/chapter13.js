/*
 * Chapter 13 — 22_CHAPTER_CURRICULUM.md 기준
 *   제목      SQL / Database
 *   핵심 질문  데이터는 실제로 어디에서 저장되고 조회될까?
 *   Activity  SQL 실행 → Table Row 강조 → JSON 형태로 반환
 *   위험성     UPDATE 에 WHERE 누락 시 모든 Row 변경 가능성 시뮬레이션
 *
 * Legacy Chapter 13 에서 init.sql · SELECT/UPDATE 예시 · WHERE 누락 시뮬레이션 ·
 * 오류 2건 · summary 를 가져왔다. 위험 명령을 실행하지 않고 예고만 하는 방식도 유지했다.
 *
 * 표 계약: students(id, name, score) — Chapter 03 init.sql 과 동일.
 * 표의 내용은 Chapter 02 Mock 과 Chapter 02·12 에서 만든 행을 이어받는다.
 * 범위 통제 (20 §5) — JOIN · 인덱스 · 트랜잭션 · 정규화는 다루지 않는다.
 */
const chapter13 = {
  id: 13,
  title: "학생 데이터를 저장하고 찾기 — SQL / MySQL",
  coreQuestion: "데이터는 실제로 어디에 저장되고 어떻게 찾을까?",
  placeholder: false,

  intro:
    "Chapter 12까지 만든 요청들은 결국 데이터를 읽거나 바꿉니다. " +
    "그 데이터가 실제로 남는 곳이 데이터베이스입니다. 데이터는 표(table)의 행(row)으로 저장되고, " +
    "SQL은 그 표에서 무엇을 꺼내고 무엇을 바꿀지 적는 언어입니다.",

  whyItMatters: [
    "학생 이름과 점수는 어딘가에 실제로 남아 있어야 합니다. 프로그램을 껐다 켜도 사라지면 안 됩니다.",
    "데이터베이스는 그 값을 표로 보관하고, 필요한 줄만 찾아 줍니다. 무엇을 찾을지 적는 언어가 SQL입니다."
  ],

  oneThing: "MySQL은 데이터를 표로 저장하고 SQL로 찾아 줍니다.",

  objectives: [
    "표에서 원하는 줄만 꺼내기",
    "대상을 정하는 조건 WHERE, 그리고 빠뜨렸을 때 생기는 일",
    "찾은 줄 하나가 화면까지 가는 과정"
  ],

  codeIntro:
    "SQL 문법을 외우지 않아도 됩니다. '무엇을 대상으로 하는가'를 정하는 부분 하나만 보면 됩니다.",

  codeFocus: {
    lines: ["SELECT id, name, score", "FROM students", "WHERE id = %s      -- 전달한 값 (1,)"],
    say:
      "\"students 표에서 id가 1인 줄의 번호·이름·점수를 꺼내 달라\"는 뜻입니다. " +
      "%s 는 실제 값이 안전하게 들어갈 자리이고, (1,) 은 이번에 전달한 값입니다. " +
      "WHERE 가 없으면 조건이 '전부'가 됩니다.",
    path: "backend/app.py 가 실행하는 조회",
    node: "mysql"
  },

  architecture: {
    edgeLabels: { "flask-mysql": "SQL" },
    caption:
      "이번 Chapter의 무대는 요청 경로의 마지막 계층입니다. 데이터가 실제로 남는 유일한 곳입니다.",
    highlight: ["flask", "mysql"],
    scopeNotes: {
      user: "요청을 시작한 사람입니다. 이번 Chapter의 무대는 저장소입니다.",
      browser: "화면은 여기에 직접 연결하지 않습니다. 항상 Flask를 거칩니다.",
      nginx: "입구는 이 구간에 관여하지 않습니다. Nginx는 Chapter 10에서 다뤘습니다."
    }
  },

  concept: {
    lead:
      "표는 칸(column)이 정해져 있고, 데이터는 그 칸에 맞춰 한 줄(row)씩 쌓입니다. " +
      "SQL에서 가장 중요한 것은 '무엇을 대상으로 하는가'이고, 그것을 정하는 것이 WHERE입니다.",
    roles: [
      {
        role: "데이터가 쌓이는 곳",
        tech: "Table (표)",
        node: "mysql",
        desc:
          "students 표에는 id · name · score 세 칸이 있습니다. " +
          "칸의 모양은 database/init.sql이 처음 실행될 때 정해집니다."
      },
      {
        role: "꺼내기",
        tech: "SELECT",
        desc:
          "어떤 칸을, 어느 표에서, 어떤 조건으로 꺼낼지 적습니다. 데이터를 바꾸지 않습니다."
      },
      {
        role: "대상을 정하는 조건",
        tech: "WHERE",
        desc:
          "조건에 맞는 행만 대상이 됩니다. WHERE가 없으면 조건이 '전부'가 됩니다. " +
          "SELECT에서는 결과가 많아질 뿐이지만, UPDATE·DELETE에서는 되돌릴 수 없는 사고가 됩니다."
      },
      {
        role: "바꾸기와 지우기",
        tech: "UPDATE / DELETE",
        desc:
          "Chapter 12의 PATCH와 DELETE가 실제로 실행하는 것이 이 명령들입니다. " +
          "실행 전에 같은 조건으로 SELECT해서 몇 행이 나오는지 확인하는 것이 안전합니다."
      }
    ],
    note:
      "표에 쌓인 데이터는 코드가 아닙니다. Git에 올라가지도 않고, 컨테이너를 지워도 " +
      "Chapter 08에서 본 저장 공간(volume)에 남습니다.",

    checkpoint:
      "여기까지 보면 이번 Chapter는 충분합니다 — 대상을 정하는 것은 WHERE이고, " +
      "조회한 줄 하나가 JSON이 되어 화면까지 간다.",

    advanced: [
      {
        label: "표 구조는 어떻게 정해지나?",
        note: "칸마다 담을 값을 미리 정해 둔다",
        body: [
          "표를 만들 때 각 칸이 어떤 값을 담을지 미리 정해 둡니다. 이 정의는 database/init.sql 이 " +
            "처음 실행될 때 한 번 정해집니다.",
          "한 칸에 여러 단어가 붙어 있어도 한 덩어리로 외울 필요는 없습니다. 단어 하나가 규칙 하나입니다.",
          "각 단어가 무슨 뜻인지는 위 실습의 '표 구조 자세히 보기'에서 하나씩 확인할 수 있습니다."
        ]
      }
    ]
  },

  code: [
    {
      id: "sq-init",
      name: "init.sql",
      path: "database/init.sql",
      lang: "sql",
      desc: "처음 실행할 때 표를 만들고 예시 데이터를 넣는다.",
      lines: [
        { t: "CREATE TABLE students (", node: "mysql" },
        { t: "    id INT AUTO_INCREMENT PRIMARY KEY,   -- 번호는 자동으로 붙는다", node: "mysql" },
        { t: "    name VARCHAR(100) NOT NULL,", node: "mysql" },
        { t: "    score INT NOT NULL", node: "mysql" },
        { t: ");", node: "mysql" },
        { t: "", node: null },
        { t: "INSERT INTO students (name, score) VALUES", node: "mysql" },
        { t: "    ('김철수', 93),", node: "mysql" },
        { t: "    ('이영희', 88);", node: "mysql" }
      ]
    },
    {
      id: "sq-query",
      name: "조회와 수정",
      path: "조회 · 수정 예시",
      lang: "sql",
      desc: "조건을 붙여 원하는 행만 다룬다. 마지막 줄은 실행하지 않는다.",
      lines: [
        { t: "-- 한 명만 조회 (Chapter 11의 Flask가 실행하는 것)", node: "mysql" },
        { t: "SELECT id, name, score FROM students WHERE id = 1;", node: "mysql" },
        { t: "", node: null },
        { t: "-- 한 명만 수정 (Chapter 12의 PATCH)", node: "mysql" },
        { t: "UPDATE students SET score = 90 WHERE id = 2;", node: "mysql" },
        { t: "", node: null },
        { t: "-- 위험: WHERE가 없으면 표의 모든 행이 바뀐다", node: null },
        { t: "-- UPDATE students SET score = 0;", node: null }
      ]
    },
    {
      id: "sq-safe",
      name: "안전하게 바꾸는 순서",
      path: "실행 전 확인 습관",
      lang: "sql",
      desc: "바꾸기 전에 같은 조건으로 먼저 조회한다.",
      lines: [
        { t: "-- 1. 대상이 몇 행인지 먼저 확인한다", node: "mysql" },
        { t: "SELECT id, name, score FROM students WHERE id = 2;", node: "mysql" },
        { t: "", node: null },
        { t: "-- 2. 같은 조건으로 바꾼다", node: "mysql" },
        { t: "UPDATE students SET score = 90 WHERE id = 2;", node: "mysql" }
      ]
    }
  ],

  activity: {
    type: "sql",
    title: "학생 데이터에서 원하는 줄 찾아보기",
    cta: "어떤 줄이 대상인지 직접 보기",
    guide:
      "알고 싶은 것을 하나 누르면 표에서 어떤 줄이 대상이 되는지 바로 표시됩니다. " +
      "그다음에 데이터베이스에는 그 질문을 어떻게 적는지 보여 줍니다. " +
      "조건이 없는 명령은 실행하지 않고 결과만 미리 보여 줍니다."
  },

  errors: [
    {
      id: "e13-where",
      code: "WHERE 누락",
      title: "한 행만 바꾸려다 전부 바꿨다",
      symptom: "UPDATE를 실행했더니 영향받은 행 수가 예상보다 훨씬 많다.",
      cause: "조건을 적지 않아 표의 모든 행이 대상이 됐다.",
      fix:
        "먼저 같은 조건으로 SELECT해서 몇 행이 나오는지 확인한 뒤 실행한다. " +
        "이미 실행했다면 백업이나 volume 스냅샷 없이는 되돌릴 수 없다.",
      node: "mysql",
      edge: "flask-mysql"
    },
    {
      id: "e13-notable",
      code: "Table 'students' doesn't exist",
      title: "표가 만들어지지 않았다",
      symptom: "backend 로그에 표가 없다는 오류가 계속 찍힌다.",
      cause: "init.sql이 실행되지 않았다. 이 파일은 데이터 폴더가 비어 있는 첫 실행에만 실행된다.",
      fix:
        "compose의 db 서비스에 init.sql이 연결돼 있는지 확인한다. " +
        "이미 volume이 만들어진 뒤라면 그 볼륨을 정리해야 다시 실행되는데, 이때 데이터가 사라지므로 주의한다.",
      node: "mysql",
      edge: null
    },
    {
      id: "e13-value",
      code: "응답은 200인데 값이 이상하다",
      title: "통신은 정상인데 데이터가 다르다",
      symptom: "화면에 나온 점수가 예상과 다르다.",
      cause: "통신 문제가 아니라 표에 저장된 값 자체가 다르다.",
      fix: "같은 조건으로 SELECT를 직접 실행해 표의 값과 화면의 값을 비교한다.",
      node: "mysql",
      edge: "flask-mysql"
    }
  ],

  summary: {
    remember: [
      "데이터는 표의 줄로 저장되고, 그 표의 모양은 처음 실행될 때 한 번 정해진다.",
      "대상을 정하는 것은 WHERE다. 없으면 조건이 '전부'가 된다.",
      "찾은 줄 하나를 요청 처리 계층이 JSON으로 바꿔 화면까지 보낸다."
    ],
    points: [
      "데이터는 표의 행으로 저장되고, 그 표의 모양은 init.sql이 정한다.",
      "SELECT는 꺼내기만 하고 데이터를 바꾸지 않는다.",
      "대상을 정하는 것은 WHERE다. 없으면 조건이 '전부'가 된다.",
      "UPDATE·DELETE 전에 같은 조건으로 SELECT해 보는 것이 안전하다.",
      "조회한 행은 Flask가 JSON으로 바꿔 화면까지 보낸다."
    ],
    keywords: ["CREATE TABLE", "SELECT", "WHERE", "UPDATE", "DELETE", "volume"],
    position:
      "요청 경로의 마지막 계층까지 모두 확인했습니다. Browser → Nginx → Flask → MySQL 전부를 봤습니다.",
    next:
      "이제 따로 배운 계층을 하나의 요청으로 이어 봅니다. " +
      "다음 Chapter에서는 요청 한 건을 처음부터 끝까지 추적합니다."
  }
};

export default chapter13;
