/*
 * Chapter 11 — 22_CHAPTER_CURRICULUM.md 기준
 *   제목      Flask API
 *   핵심 질문  Nginx가 전달한 Request를 실제로 누가 처리할까?
 *   핵심      Route · Python Function · DB Query · JSON Response
 *   Activity  Request 를 올바른 Route 와 연결
 *
 * Legacy Chapter 11 에서 app.py · Route 매칭 아이디어 · 오류 2건 · summary 를 가져왔다.
 * Legacy 의 Activity 는 Chapter 02·10 과 같은 "고르고 보내기" 형태였으므로,
 * 등록된 Route 표 위에서 매칭이 일어나는 과정을 보여 주는 형태로 재설계했다.
 *
 * 범위 통제 (20 §5) — Blueprint · 미들웨어 · 인증 · ORM 은 다루지 않는다.
 * Method 별 의미 구분은 Chapter 12, 데이터 저장은 Chapter 13 범위다.
 */
const chapter11 = {
  id: 11,
  title: "요청을 Python 함수로 연결하기 — Flask",
  coreQuestion: "넘겨받은 요청을 실제로 누가 처리할까?",
  placeholder: false,

  intro:
    "Chapter 10에서 서비스 입구가 데이터 요청을 뒤쪽으로 넘겼습니다. " +
    "넘겨받은 쪽에서는 주소를 보고 실행할 함수를 고릅니다. " +
    "'이 주소가 오면 이 함수를 실행한다'는 약속을 미리 적어 두는 방식입니다.",

  whyItMatters: [
    "입구가 요청을 넘겨줘도, 그 요청을 실제로 처리할 프로그램이 없으면 아무 일도 일어나지 않습니다.",
    "\"이 주소로 요청이 오면 이 함수를 실행한다\"는 약속을 미리 적어 두는 것이 이 자리가 하는 일입니다."
  ],

  oneThing: "Flask는 주소에 맞는 Python 함수를 실행합니다.",

  objectives: [
    "GET /api/students/2 → /api/students/<번호> → get_student(2) 연결",
    "주소 안의 숫자가 함수에 값으로 넘어가는 과정",
    "(심화) 함수 안에서 일어나는 일 — SQL과 JSON"
  ],

  codeIntro:
    "이번 Chapter의 코드는 사실상 한 줄입니다. 이 줄만 이해하면 나머지는 그 함수 안의 이야기입니다.",

  codeFocus: {
    lines: ['@app.get("/api/students/<int:student_id>")', "def get_student(student_id):"],
    say:
      "\"이 주소로 요청이 오면 이 함수를 실행한다\"는 약속입니다. " +
      "<int:student_id> 는 주소에서 숫자 하나를 받아 student_id 라는 이름으로 함수에 넘기라는 뜻입니다. " +
      "그래서 /api/students/2 로 요청하면 get_student(2) 가 실행됩니다.",
    path: "backend/app.py",
    node: "flask"
  },

  architecture: {
    caption:
      "이번 Chapter의 무대는 Nginx가 넘긴 요청을 실제로 처리하는 곳입니다. " +
      "여기서 SQL을 만들고 JSON을 만듭니다.",
    highlight: ["nginx", "flask"],
    scopeNotes: {
      user: "요청을 시작한 사람입니다. 화면 쪽 동작은 Chapter 09에서 다뤘습니다.",
      browser: "요청을 만든 곳입니다. 이번 Chapter의 무대는 서버 쪽입니다.",
      mysql: "Flask가 조회를 요청하는 곳입니다. SQL 자체는 Chapter 13에서 자세히 봅니다."
    }
  },

  concept: {
    lead:
      "이번 Chapter에서 이해할 것은 하나입니다 — 주소와 처리할 함수를 연결한다. " +
      "GET /api/students/2 가 들어오면 /api/students/<번호> 라고 적어 둔 약속이 걸리고, " +
      "get_student(2) 가 실행됩니다. 나머지는 모두 그 함수 안에서 벌어지는 일입니다.",
    roles: [
      {
        role: "주소와 처리 함수를 연결하는 규칙",
        tech: "Route",
        node: "flask",
        desc:
          "@app.get(\"/api/students/<int:student_id>\") 처럼 적습니다. " +
          "\"이 주소로 요청이 오면 이 함수를 실행한다\"는 약속입니다."
      },
      {
        role: "주소에서 값 하나를 받는 자리",
        tech: "<int:student_id>",
        term: "URL 변수",
        desc:
          "주소에서 숫자 하나를 받아 student_id 라는 이름으로 함수에 넘긴다는 뜻입니다. " +
          "int 라고 적어 두었으므로 숫자가 아닌 값이 오면 아예 짝이 맞지 않습니다."
      },
      {
        role: "그 주소를 맡아 처리하는 함수",
        tech: "get_student(student_id)",
        term: "Handler",
        desc:
          "짝이 맞으면 이 함수가 실행됩니다. /api/students/2 → get_student(2) 입니다. " +
          "짝이 맞지 않으면 이 함수는 실행조차 되지 않습니다."
      }
    ],
    note:
      "같은 404라도 원인이 다릅니다. 짝이 맞지 않아 함수가 실행조차 되지 않은 경우와, " +
      "함수는 실행됐지만 그 번호의 데이터가 없던 경우입니다. 이 둘을 구분하는 것이 문제를 좁히는 첫걸음입니다.",

    checkpoint:
      "여기까지 보면 이번 Chapter는 충분합니다 — 주소를 보고 실행할 함수를 고르는 것이 이 계층의 일이다.",

    advanced: [
      {
        label: "함수 안에서는 무슨 일이 생길까?",
        note: "SQL → JSON. Chapter 13에서 다시 자세히 봅니다.",
        body: [
          "이 계층은 데이터를 직접 갖고 있지 않습니다. 그래서 데이터 저장소(MySQL)에 " +
            "\"id가 2인 학생을 알려 달라\"고 물어봅니다. 그 질문을 적는 언어가 SQL입니다.",
          "값은 SQL 문장에 이어붙이지 않습니다. \"... WHERE id = %s\" 처럼 자리만 두고 값은 인자로 따로 넘깁니다. " +
            "그러면 사용자가 보낸 문자가 명령의 일부로 해석되지 않습니다. 이것을 파라미터 바인딩이라고 합니다.",
          "받은 결과는 프로그램끼리 읽을 수 있는 형식(JSON)으로 바꿔 돌려줍니다. " +
            "이 응답이 서비스 입구를 거쳐 화면까지 갑니다."
        ]
      }
    ]
  },

  code: [
    {
      id: "fl-app",
      name: "app.py",
      path: "backend/app.py",
      lang: "python",
      desc: "주소별로 실행할 함수를 정하고, 결과를 JSON으로 돌려준다.",
      lines: [
        { t: "import os, mysql.connector", node: null },
        { t: "from flask import Flask, jsonify", node: "flask" },
        { t: "", node: null },
        { t: "app = Flask(__name__)", node: "flask" },
        { t: "", node: null },
        { t: "def get_connection():                       # DB 연결은 따로 분리한다", node: "mysql" },
        { t: "    return mysql.connector.connect(", node: "mysql" },
        { t: '        host=os.environ["DB_HOST"],         # compose 가 넣어 준 값', node: "mysql" },
        { t: '        database=os.environ["DB_NAME"],', node: "mysql" },
        { t: '        user=os.environ["DB_USER"],', node: "mysql" },
        { t: '        password=os.environ["DB_PASSWORD"])  # 코드에 적지 않는다', node: "mysql" },
        { t: "", node: null },
        { t: '@app.get("/api/students/<int:student_id>")  # 주소와 함수를 연결', node: "flask" },
        { t: "def get_student(student_id):               # 주소의 값이 인자가 된다", node: "flask" },
        { t: "    conn = get_connection()", node: "mysql" },
        { t: "    cursor = conn.cursor(dictionary=True)", node: "mysql" },
        { t: "    cursor.execute(", node: "mysql" },
        { t: '        "SELECT id, name, score FROM students WHERE id = %s",', node: "mysql" },
        { t: "        (student_id,))                     # 값은 인자로 전달", node: "mysql" },
        { t: "    student = cursor.fetchone()", node: "mysql" },
        { t: "    cursor.close(); conn.close()", node: "mysql" },
        { t: "", node: null },
        { t: "    if student is None:", node: "flask" },
        { t: '        return {"error": "student not found"}, 404', node: "flask" },
        { t: "    return jsonify(student)                # JSON 으로 돌려준다", node: "flask" }
      ]
    },
    {
      id: "fl-safe",
      name: "값을 다루는 두 가지 방법",
      path: "backend/app.py (비교)",
      lang: "python",
      desc: "위는 쓰지 않는다. 아래처럼 값을 인자로 전달한다.",
      lines: [
        { t: "# 이렇게 쓰지 않는다 — 입력한 문자가 명령의 일부가 될 수 있다", node: null },
        { t: '# cursor.execute("SELECT ... WHERE id = " + student_id)', node: null },
        { t: "", node: null },
        { t: "# 이렇게 쓴다 — 값은 언제나 값으로만 다뤄진다", node: "mysql" },
        { t: "cursor.execute(", node: "mysql" },
        { t: '    "SELECT id, name, score FROM students WHERE id = %s",', node: "mysql" },
        { t: "    (student_id,))", node: "mysql" }
      ]
    }
  ],

  activity: {
    type: "flask-route",
    title: "주소와 함수가 이어지는 것 보기",
    cta: "주소와 함수가 어떻게 이어지는지 보기",
    guide:
      "요청을 하나 누르면 미리 적어 둔 주소 규칙을 위에서부터 하나씩 살펴봅니다. " +
      "주소 모양과 요청 종류를 각각 어떻게 보는지, 주소의 숫자가 어떻게 함수에 넘어가는지 볼 수 있습니다."
  },

  errors: [
    {
      id: "e11-404",
      code: "404 (Route 없음)",
      title: "주소는 보냈는데 함수가 실행되지 않는다",
      symptom: "요청을 보내면 곧바로 404가 오고 backend 로그에 처리 기록이 없다.",
      cause: "등록된 Route와 주소 모양이 다르다. 철자나 <int:...> 형식이 맞지 않는 경우가 흔하다.",
      fix: "등록된 Route 목록과 실제 요청 주소를 나란히 놓고 비교한다.",
      node: "flask",
      edge: "nginx-flask"
    },
    {
      id: "e11-500",
      code: "500 Internal Server Error",
      title: "함수는 실행됐는데 도중에 멈췄다",
      symptom: "500이 오고 화면에는 아무 데이터도 표시되지 않는다.",
      cause: "함수 실행 중 오류가 났다. DB 연결 실패가 가장 흔한 원인이다.",
      fix:
        "docker compose logs backend 로 실제 오류 메시지를 확인한다. " +
        "환경 변수(DB_HOST · DB_NAME · DB_USER · DB_PASSWORD)가 제대로 들어갔는지 본다.",
      node: "flask",
      edge: "flask-mysql"
    },
    {
      id: "e11-concat",
      code: "SQL에 값을 이어붙임",
      title: "값을 문자열로 붙이는 습관",
      symptom: "동작은 하지만 입력에 따라 예상하지 못한 결과가 나온다.",
      cause: "사용자가 보낸 값이 명령의 일부로 해석될 수 있다.",
      fix: "%s 자리를 두고 값을 인자로 전달한다. 이 교안의 모든 예제가 그렇게 되어 있다.",
      node: "mysql",
      edge: "flask-mysql"
    }
  ],

  summary: {
    remember: [
      "주소와 처리할 함수를 연결해 두는 것이 이 계층의 일이다.",
      "주소 안의 값은 그대로 함수에 넘어간다 — /api/students/2 → get_student(2).",
      "같은 404라도 '짝이 없어서'와 '데이터가 없어서'는 다르다."
    ],
    points: [
      "Route는 주소와 함수를 잇는 약속이고, 주소 모양과 Method를 함께 본다.",
      "주소 안의 값은 함수 인자로 전달된다.",
      "Flask는 데이터를 보관하지 않고 MySQL에 물어본다.",
      "SQL의 값은 문자열로 이어붙이지 않고 인자로 전달한다.",
      "함수가 돌려준 값이 JSON 응답이 되어 Nginx를 거쳐 화면까지 간다."
    ],
    keywords: ["@app.get", "Route", "URL 변수", "jsonify", "파라미터 바인딩"],
    position:
      "요청 경로의 세 번째 계층까지 확인했습니다. 화면(Ch09) → 입구(Ch10) → 처리(Ch11)입니다.",
    next:
      "지금까지는 조회만 봤습니다. 다음 Chapter에서는 만들기·수정하기·삭제하기를 " +
      "어떻게 구분해서 표현하는지 배웁니다."
  }
};

export default chapter11;
