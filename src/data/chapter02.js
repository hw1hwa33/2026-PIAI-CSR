/*
 * Chapter 02 — 22_CHAPTER_CURRICULUM.md 기준
 *   제목      Request와 Response
 *   핵심 질문  Browser와 Server는 어떻게 대화할까?
 *   핵심      HTTP Request · Response · URL · Method · Status Code · JSON
 *   Activity  Method + Resource + ID를 선택해 Request 조립
 *   오류      GET /api/students/999 → 404 시뮬레이션
 *
 * 범위 통제 (20_COURSE_ORCHESTRATOR §5)
 *   Method 별 의미 구분(REST)은 Chapter 12, 데이터 저장은 Chapter 13 에서 다룬다.
 *   여기서는 "요청과 응답이 어떤 부분으로 이루어져 있는가"까지만 본다.
 *
 * 코드 계약은 Chapter 01 과 동일하다. (24 §10) Route /api/students/... · service backend
 */
const chapter02 = {
  id: 2,
  title: "화면과 서버가 말을 주고받는 방법",
  coreQuestion: "화면은 필요한 데이터를 서버에 어떻게 요청할까?",
  placeholder: false,

  intro:
    "Chapter 01에서는 요청이 지나가는 길을 봤습니다. 그런데 그 길 위로 오간 것은 정확히 무엇일까요? " +
    "화면과 서버는 정해진 서식의 글 두 장을 주고받습니다. 보내는 쪽이 요청서, 돌아오는 쪽이 응답서입니다. " +
    "이 Chapter에서는 그 두 장을 직접 만들어 보내고 뜯어봅니다.",

  whyItMatters: [
    "Chapter 01에서 요청이 지나가는 길은 봤습니다. 그런데 그 길 위로 오간 것이 정확히 무엇인지는 아직 모릅니다.",
    "화면과 서버는 아무렇게나 말하지 않습니다. 칸이 정해진 서식 두 장을 주고받습니다. " +
      "그 칸에 무엇을 적는지만 알면 처음 보는 것도 읽을 수 있습니다."
  ],

  /* 이 한 줄은 Chapter 에서 가장 크게 보이는 문장이다.
     Request / Response 라는 이름은 본문에서 요청서 · 응답서와 함께 소개한다. */
  oneThing: "요청서를 보내면 응답서가 돌아옵니다.",

  objectives: [
    "요청서의 칸 — 무엇을 · 어디에 · 추가 정보 · 보낼 내용",
    "응답서의 처리 결과 번호(Status Code)",
    "200과 404의 차이"
  ],

  /* 오류(404) 자체가 이 Chapter 의 핵심 체험이므로 오류 구간을 접지 않는다. (CLAUDE.md) */
  errorsPrimary: true,

  /*
   * 전체 Runtime 구조는 모든 Chapter 에서 동일하게 유지한다.
   * highlight 는 "이번에 집중해서 볼 구간"일 뿐이며, 빠진 Node 를 지우지 않는다.
   * MySQL 은 지도에 그대로 남되 muted 상태로 표시되고, 학습 시점은 Chapter 13 이다.
   */
  architecture: {
    edgeLabels: { "browser-nginx": "HTTP 요청" },
    caption:
      "전체 구조는 Chapter 01에서 본 것과 같습니다. 이번에는 그중 Browser와 Server가 " +
      "주고받는 내용 자체에 집중합니다.",
    highlight: ["user", "browser", "nginx", "flask"],
    scopeNotes: {
      mysql:
        "전체 시스템에는 포함되지만, 데이터 저장과 SQL은 Chapter 13에서 자세히 학습합니다. " +
        "이번 Chapter에서는 Flask가 돌려주는 응답의 형식까지만 봅니다."
    }
  },

  concept: {
    lead:
      "요청과 응답은 자유로운 글이 아니라 칸이 정해진 서식입니다. " +
      "어느 칸에 무엇을 적는지만 알면, 처음 보는 API도 읽을 수 있습니다.",
    roles: [
      {
        role: "무엇을 하려는지 적는 칸",
        tech: "Method",
        desc:
          "가져올 것인지(GET), 새로 만들 것인지(POST)를 알려줍니다. " +
          "같은 주소라도 Method가 다르면 서버는 다른 일을 합니다."
      },
      {
        role: "무엇을 대상으로 하는지 적는 칸",
        tech: "URL / Path",
        desc: "/api/students/1 처럼, 서버 안의 어떤 데이터를 가리키는지 알려주는 주소입니다."
      },
      {
        role: "결과를 한 줄로 요약하는 숫자",
        tech: "Status Code",
        desc:
          "200은 잘 됐다, 201은 새로 만들었다, 404는 그 데이터를 찾지 못했다는 뜻입니다. " +
          "본문을 읽기 전에 이 숫자만 봐도 성공인지 실패인지 알 수 있습니다."
      },
      {
        role: "주고받는 데이터를 적는 형식",
        tech: "JSON",
        desc:
          "이름과 값을 짝지어 적는 텍스트 형식입니다. 사람도 읽을 수 있고 프로그램도 바로 해석할 수 있어 " +
          "요청·응답의 Body에 널리 씁니다."
      }
    ],
    note:
      "JSON을 쓴다고 해서 곧바로 REST API가 되는 것은 아닙니다. " +
      "Method와 주소를 어떤 규칙으로 정할지는 Chapter 12에서 따로 다룹니다."
  },

  codeIntro:
    "코드 전체를 읽을 필요는 없습니다. 화면이 응답을 받았을 때 가장 먼저 무엇을 보는지 한 줄만 확인합니다.",

  codeFocus: {
    lines: ["if (res.status === 404) { … }"],
    say:
      "화면은 데이터를 읽기 전에 처리 결과 번호(Status Code)부터 확인합니다. " +
      "404면 \"그 학생이 없다\"는 뜻이므로 데이터를 읽지 않고 안내 문구를 보여 줍니다.",
    path: "frontend/src/api.js",
    node: "browser"
  },

  code: [
    {
      id: "frontend",
      name: "api.js",
      path: "frontend/src/api.js",
      lang: "javascript",
      desc: "Browser는 응답의 Status Code를 먼저 확인하고, 그 다음에 Body를 읽는다.",
      lines: [
        { t: "export async function getStudent(id) {", node: "browser" },
        { t: "  const res = await fetch(`/api/students/${id}`);", node: "browser" },
        { t: "", node: null },
        { t: "  if (res.status === 404) {", node: "browser" },
        { t: '    return { ok: false, reason: "not-found" };   // 그런 학생이 없다', node: "browser" },
        { t: "  }", node: "browser" },
        { t: "  if (!res.ok) {", node: "browser" },
        { t: '    return { ok: false, reason: "server-error" }; // 500 등', node: "browser" },
        { t: "  }", node: "browser" },
        { t: "", node: null },
        { t: "  return { ok: true, data: await res.json() };    // Body 를 읽는다", node: "browser" },
        { t: "}" }
      ]
    },
    {
      id: "backend-get",
      name: "app.py · GET",
      path: "backend/app.py",
      lang: "python",
      desc: "찾지 못하면 데이터 대신 404를 돌려준다. 주소가 틀린 것이 아니라 데이터가 없는 것이다.",
      lines: [
        { t: '@app.get("/api/students/<int:student_id>")', node: "flask" },
        { t: "def get_student(student_id):", node: "flask" },
        { t: "    row = find_student(student_id)", node: "flask" },
        { t: "    if row is None:", node: "flask" },
        { t: '        return jsonify(error="student not found"), 404', node: "flask" },
        { t: "    return jsonify(id=row[0], name=row[1], score=row[2])   # 기본 200", node: "flask" }
      ]
    },
    {
      id: "backend-post",
      name: "app.py · POST",
      path: "backend/app.py",
      lang: "python",
      desc: "새로 만든 경우에는 200이 아니라 201을 돌려준다.",
      lines: [
        { t: '@app.post("/api/students")', node: "flask" },
        { t: "def create_student():", node: "flask" },
        { t: "    body = request.get_json()", node: "flask" },
        { t: '    new_id = insert_student(body["name"], body["score"])', node: "flask" },
        { t: '    return jsonify(id=new_id, name=body["name"], score=body["score"]), 201', node: "flask" }
      ]
    }
  ],

  activity: {
    type: "request",
    title: "요청서를 직접 조립하고 응답서를 뜯어보기",
    cta: "요청을 직접 만들어 보내 보기",
    guide:
      "무엇을 할지와 어느 학생을 대상으로 할지 골라 요청 한 건을 만들고 보내 보세요. " +
      "잘 처리된 경우와 찾지 못한 경우를 모두 눌러 보면 응답서를 읽는 법이 보입니다.",
    mockNote: "이 실습의 응답은 학습용 예시 데이터이며, 실제 서버로 나가지 않습니다."
  },

  errors: [
    {
      id: "e2-404",
      code: "404 Not Found",
      title: "주소는 맞는데 그 데이터가 없다",
      symptom: "GET /api/students/999 를 보내면 데이터 대신 404가 돌아온다.",
      cause: "Route는 정상 동작했지만 students 에 999번 행이 없다.",
      fix: "요청한 id가 실제로 있는지 먼저 확인한다. 끊긴 구간은 Flask ↔ 데이터다.",
      node: "flask",
      edge: "nginx-flask"
    },
    {
      id: "e2-500",
      code: "500 Internal Server Error",
      title: "서버가 처리 도중 멈췄다",
      symptom: "요청은 도착했는데 500이 돌아온다.",
      cause: "Flask 안에서 예외가 발생했다. 요청 내용이 아니라 서버 코드나 연결 쪽 문제다.",
      fix: "docker compose logs -f backend 로 서버 로그를 먼저 확인한다.",
      node: "flask",
      edge: "nginx-flask"
    },
    {
      id: "e2-empty",
      code: "200 OK 인데 화면이 비어 있다",
      title: "응답은 성공했지만 Body가 비어 있다",
      symptom: "오류는 없는데 화면에 아무것도 나오지 않는다.",
      cause:
        "Status Code만 보고 성공이라 판단한 경우입니다. 200은 '요청을 처리했다'는 뜻이지 " +
        "'데이터가 들어 있다'는 뜻이 아닙니다.",
      fix: "Status Code와 Body를 함께 확인한다. 화면을 그리는 쪽에서 빈 값 처리도 해 준다.",
      node: "browser",
      edge: "nginx-browser"
    }
  ],

  summary: {
    remember: [
      "Browser와 Server는 칸이 정해진 요청서와 응답서를 주고받는다.",
      "응답서의 숫자 하나(200 · 404 · 500)만 봐도 어떻게 됐는지 알 수 있다.",
      "404는 '서버까지는 갔는데 그 데이터가 없다'는 뜻이다."
    ],
    points: [
      "Browser와 Server는 정해진 서식의 요청서와 응답서를 주고받는다.",
      "요청서는 Method(무엇을 할지) · URL(무엇을 대상으로) · Headers · Body로 이루어진다.",
      "응답서의 Status Code 숫자 하나로 결과를 먼저 판단할 수 있다 — 200 · 201 · 404 · 500.",
      "Body에 실려 오는 데이터의 형식이 JSON이며, JSON을 쓴다고 REST가 되는 것은 아니다."
    ],
    keywords: ["Method", "URL", "Status Code", "Header", "Body", "JSON"],
    position:
      "Chapter 01에서 본 길 위로 실제로 무엇이 오가는지를 확인했습니다. " +
      "지금까지는 Browser와 Server 사이의 대화만 봤습니다.",
    next:
      "요청과 응답의 형식을 알았으니, 이제 이 대화를 실제로 처리하는 프로그램들이 " +
      "어떤 폴더 구조로 나뉘어 있는지 볼 차례입니다. 다음 Chapter에서 프로젝트 파일과 폴더를 살펴봅니다."
  }
};

export default chapter02;
