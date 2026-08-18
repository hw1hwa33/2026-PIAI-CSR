/*
 * Chapter 12 — 22_CHAPTER_CURRICULUM.md 기준
 *   제목      REST API
 *   핵심 질문  조회·생성·수정·삭제를 어떻게 구분할까?
 *   기본      GET → Read · POST → Create · PATCH/PUT → Update · DELETE → Delete
 *   Activity  상황별 올바른 Method 선택
 *
 * Legacy Chapter 12 에서 Route 목록 · 생성 코드 · Method 별 결과 · 오류 2건 · summary 를 가져왔다.
 *
 * Chapter 02 와의 역할 분리 (20 §5)
 *   Chapter 02  Request / Response 가 무엇인가
 *   Chapter 12  같은 자원을 Method 로 어떻게 나누는가
 * 24_TECHNICAL_CONTENT_RULES §9 — REST 를 "JSON 을 쓰는 API"로 정의하지 않는다.
 */
const chapter12 = {
  id: 12,
  title: "API 주소와 동작에 규칙 만들기 — REST",
  coreQuestion: "조회·생성·수정·삭제를 어떻게 구분할까?",
  placeholder: false,

  intro:
    "Chapter 11까지는 조회만 봤습니다. 그런데 서비스에는 만들기·고치기·지우기도 필요합니다. " +
    "REST는 주소를 아무렇게나 만들지 않고, 무엇을 다룰지와 무슨 일을 할지를 일정한 방식으로 " +
    "표현하는 설계 방법입니다. 주소는 '무엇을'만 가리키게 두고 '어떻게 하겠다'는 따로 나타냅니다.",

  whyItMatters: [
    "만들기·고치기·지우기가 늘어날 때마다 주소를 새로 만들면, 나중에는 무엇을 다루는 API인지 알 수 없게 됩니다.",
    "주소는 '무엇을'만 가리키게 두고 '어떻게 하겠다'는 따로 표현하면, 주소만 봐도 대상이 보입니다."
  ],

  oneThing: "REST는 자원(주소)과 동작(Method)을 일정한 규칙으로 표현합니다.",

  objectives: [
    "상황 → 대상 고르기 → 동작 고르기 → 요청 완성",
    "전체를 가리키는 주소와 한 명을 가리키는 주소의 차이",
    "JSON을 쓴다고 REST가 되는 것은 아니라는 점"
  ],

  /* 상황에서 만들어지는 번호를 되짚어 볼 수 있게 참고표를 함께 둔다 */
  statusCodes: [200, 201, 204, 400, 405],

  codeIntro:
    "코드를 외우지 않아도 됩니다. 주소는 같은데 앞에 붙은 동작만 다르다는 것만 보면 됩니다.",

  codeFocus: {
    lines: [
      '@app.get("/api/students/2")     # 조회',
      '@app.patch("/api/students/2")   # 일부 수정',
      '@app.delete("/api/students/2")  # 삭제'
    ],
    say:
      "주소는 셋 다 똑같습니다. 달라지는 것은 앞에 붙은 동작뿐입니다. " +
      "주소는 '무엇을'만 가리키고, 동작은 Method가 나타냅니다. 그래서 주소에 동사를 넣지 않습니다.",
    path: "backend/app.py",
    node: "flask"
  },

  architecture: {
    caption:
      "이번 Chapter는 Flask가 받는 요청의 규칙을 정리합니다. 자리는 Chapter 11과 같고, " +
      "달라지는 것은 그 자리에서 무엇을 구분하느냐입니다.",
    highlight: ["nginx", "flask", "mysql"],
    scopeNotes: {
      user: "요청을 시작한 사람입니다. 이번 Chapter의 무대는 API 규칙입니다.",
      browser: "요청을 만드는 곳입니다. 화면 쪽은 Chapter 09에서 다뤘습니다."
    }
  },

  concept: {
    /* 비전공자가 REST 라는 단어를 여기서 처음 본다고 가정한다 */
    primer: {
      title: "REST가 무엇인가요?",
      body: [
        "REST는 API 주소를 아무렇게나 만들지 않고, 무엇을 다룰지와 무슨 일을 할지를 " +
          "일정한 방식으로 표현하는 설계 방법입니다.",
        "주소를 보면 무엇을 다루는지가 보이고, 앞에 붙은 동작을 보면 그것을 어떻게 하려는지가 보입니다."
      ],
      examples: [
        ["학생 전체 조회", "GET /api/students"],
        ["2번 학생 수정", "PATCH /api/students/2"]
      ],
      scope:
        "이 Chapter에서는 REST 전체 이론이 아니라, 주소는 대상을 가리키고 " +
        "Method는 행동을 나타낸다는 가장 기초적인 규칙만 봅니다."
    },
    lead:
      "REST의 핵심은 두 가지를 나누는 것입니다. 주소는 '무엇을'(자원), " +
      "Method는 '어떻게 하겠다'(동작). 이 둘을 섞지 않는 것이 규칙의 전부라고 해도 됩니다.",
    roles: [
      {
        role: "무엇을 다루는지 가리키는 것",
        tech: "Resource (주소)",
        desc:
          "/api/students 는 학생 전체, /api/students/2 는 2번 학생 한 명을 가리킵니다. " +
          "주소에 동사를 넣지 않습니다."
      },
      {
        role: "그것을 어떻게 하겠다는 것",
        tech: "Method",
        node: "flask",
        desc:
          "GET은 가져오기, POST는 만들기, PATCH는 일부 고치기, DELETE는 지우기입니다. " +
          "주소가 같아도 Method가 다르면 다른 함수가 실행됩니다."
      },
      {
        role: "처리 결과를 알려 주는 숫자",
        tech: "Status Code",
        desc:
          "같은 주소라도 무엇을 했느냐에 따라 돌아오는 번호가 다릅니다. " +
          "번호별 의미는 아래 참고표에 한 줄씩 정리해 두었습니다."
      }
    ],
    note:
      "만들기는 목록 주소에서 합니다. 아직 번호가 없기 때문입니다. " +
      "수정·삭제는 개별 주소에서 합니다. 무엇을 고칠지 지목해야 하기 때문입니다.",

    checkpoint:
      "여기까지 보면 이번 Chapter는 충분합니다 — 주소는 대상, Method는 동작. 이 둘을 섞지 않는다."
  },

  code: [
    {
      id: "rs-routes",
      name: "Route 목록",
      path: "backend/app.py (Route 부분)",
      lang: "python",
      desc: "같은 자원에 대해 Method로 동작을 구분한다.",
      lines: [
        { t: '@app.get("/api/students")                      # 목록 조회 → 200', node: "flask" },
        { t: '@app.post("/api/students")                     # 생성 → 201', node: "mysql" },
        { t: '@app.get("/api/students/<int:student_id>")     # 한 명 조회 → 200', node: "mysql" },
        { t: '@app.patch("/api/students/<int:student_id>")   # 일부 수정 → 200', node: "mysql" },
        { t: '@app.delete("/api/students/<int:student_id>")  # 삭제 → 204', node: "mysql" }
      ]
    },
    {
      id: "rs-post",
      name: "생성 부분",
      path: "backend/app.py (생성)",
      lang: "python",
      desc: "보낸 데이터로 새 행을 만들고 201과 새 주소를 알려 준다.",
      lines: [
        { t: '@app.post("/api/students")', node: "flask" },
        { t: "def create_student():", node: "flask" },
        { t: "    body = request.get_json()", node: "flask" },
        { t: "    conn = get_connection()", node: "mysql" },
        { t: "    cursor = conn.cursor()", node: "mysql" },
        { t: "    cursor.execute(", node: "mysql" },
        { t: '        "INSERT INTO students (name, score) VALUES (%s, %s)",', node: "mysql" },
        { t: '        (body["name"], body["score"]))      # 값은 인자로 전달', node: "mysql" },
        { t: "    conn.commit()", node: "mysql" },
        { t: "    new_id = cursor.lastrowid", node: "mysql" },
        { t: "    cursor.close(); conn.close()", node: "mysql" },
        { t: "", node: null },
        { t: '    return {"id": new_id, **body}, 201     # 새로 만들었다는 뜻', node: "flask" }
      ]
    }
  ],

  activity: {
    type: "rest",
    title: "대상과 하는 일을 골라 요청 만들어 보기",
    cta: "조합을 눌러 보기",
    guide:
      "'누구를 대상으로'와 '무엇을 하나'를 하나씩 누르면 요청 한 줄이 바로 만들어집니다. " +
      "무엇을 고르든 맞다 틀리다를 말하지 않고, 그 조합이 어떤 일을 하는지 보여 줍니다. " +
      "여러 조합을 눌러 비교해 보세요."
  },

  errors: [
    {
      id: "e12-405",
      code: "405 Method Not Allowed",
      title: "주소는 맞는데 거부당했다",
      symptom: "주소를 정확히 적었는데 405가 돌아온다.",
      cause: "그 주소가 받지 않는 Method를 썼다. 목록 주소에 PATCH를 보낸 경우가 흔하다.",
      fix: "응답의 Allow 헤더를 보면 그 주소가 받는 Method가 적혀 있다. 만들기는 목록, 수정·삭제는 개별 주소다.",
      node: "flask",
      edge: "nginx-flask"
    },
    {
      id: "e12-400",
      code: "400 Bad Request",
      title: "보낸 데이터에 필요한 값이 없다",
      symptom: "POST를 보냈는데 400이 돌아온다.",
      cause: "name이나 score가 빠졌거나 형식이 다르다.",
      fix: "보낸 본문을 확인하고, 서버에서도 필요한 값이 있는지 검사한다.",
      node: "flask",
      edge: null
    },
    {
      id: "e12-verb",
      code: "/api/deleteStudent",
      title: "주소에 동사를 넣는 습관",
      symptom: "주소가 늘어날수록 무엇을 다루는 API인지 알기 어려워진다.",
      cause: "동작을 주소로도, Method로도 표현하면 규칙이 둘로 갈린다.",
      fix:
        "주소는 대상만 가리키게 두고 동작은 Method로 표현한다. " +
        "/api/students/2 에 DELETE를 보내면 충분하다.",
      node: null,
      edge: null
    }
  ],

  summary: {
    remember: [
      "주소는 '무엇을'(대상), Method는 '어떻게 하겠다'(동작)를 나타낸다.",
      "만들기는 목록 주소, 수정·삭제는 개별 주소에서 한다.",
      "JSON을 쓴다고 REST가 되는 것은 아니다."
    ],
    points: [
      "주소는 '무엇을'(자원), Method는 '어떻게 하겠다'(동작)를 나타낸다.",
      "만들기는 목록 주소, 수정·삭제는 개별 주소에서 한다.",
      "200은 결과와 함께, 201은 새로 만들었을 때, 204는 돌려줄 내용이 없을 때 쓴다.",
      "405는 그 주소가 그 Method를 받지 않는다는 뜻이다.",
      "JSON을 쓴다고 REST가 되는 것은 아니다."
    ],
    keywords: ["GET", "POST", "PATCH", "DELETE", "201 Created", "204 No Content", "405"],
    position:
      "API의 규칙까지 정리했습니다. 요청 경로에서 남은 것은 데이터가 실제로 저장되는 곳뿐입니다.",
    next:
      "지금까지의 동작들은 결국 데이터를 바꿉니다. 다음 Chapter에서는 " +
      "그 데이터가 실제로 어디에 어떻게 저장되고 조회되는지 봅니다."
  }
};

export default chapter12;
