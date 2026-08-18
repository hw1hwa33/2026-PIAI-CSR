/*
 * Chapter 14 — 22_CHAPTER_CURRICULUM.md 기준
 *   제목      전체 Request → Response 추적
 *   핵심 질문  지금까지 배운 기술을 하나의 흐름으로 연결할 수 있는가?
 *   Scenario  학생 ID 2 조회
 *   Activity  학습 모드(이전/다음) 기본 · 전체 재생 보조
 *
 * docs/harness/process/PROCESS_ANIMATION_SPEC.md 를 적용한다.
 * Legacy Chapter 14 에서 단계 구성 · 단계별 설명 · 오류 2건 · summary 를 가져왔다.
 *
 * Chapter 01 과의 역할 분리 (CLAUDE.md Reference Chapter Principle)
 *   Chapter 01  기술 이름을 모르는 상태에서 "무슨 일이 일어나는가"를 처음 본다
 *   Chapter 14  학습을 마친 뒤 각 단계를 기술 · 파일 · 코드 · 데이터 모양까지 연결해 다시 본다
 */
const chapter14 = {
  id: 14,
  title: "클릭 한 번을 처음부터 끝까지 따라가기",
  coreQuestion: "지금까지 본 것들이 요청 한 번에서 어떻게 이어질까?",
  placeholder: false,

  intro:
    "Chapter 09부터 13까지 계층을 하나씩 따로 봤습니다. 이제 그 계층들을 하나의 요청으로 잇습니다. " +
    "Chapter 01에서는 이름도 모르는 상자들이 순서대로 일하는 것만 봤다면, " +
    "이번에는 각 단계에서 어느 파일의 어떤 코드가 실행되고 데이터가 어떤 모양으로 바뀌는지까지 확인합니다.",

  whyItMatters: [
    "Chapter 09부터 13까지 계층을 하나씩 따로 봤습니다. 조각으로는 알겠는데, 이어 붙이면 어떻게 되는지가 남았습니다.",
    "클릭 한 번이 실제로 어떤 순서로 지나가는지 끝까지 따라가 보면 전체가 하나로 연결됩니다."
  ],

  oneThing: "클릭 하나가 모든 계층을 거쳐 다시 화면으로 돌아옵니다.",

  objectives: [
    "요청 한 번이 지나는 단계 전부",
    "같은 작업이 단계마다 다른 형태로 표현되는 모습",
    "문제가 생겼을 때 어느 구간부터 볼지"
  ],

  codeIntro:
    "새 코드는 없습니다. 문제가 생겼을 때 어느 구간부터 확인할지 정하는 두 줄만 봅니다.",

  codeFocus: {
    lines: ["curl -I http://localhost/                # 화면이 뜨는가", "curl -i http://localhost/api/students/2  # 데이터가 오는가"],
    say:
      "이 두 가지를 나눠 확인하면 어디서 끊겼는지 좁혀집니다. " +
      "화면은 뜨는데 데이터만 안 오면 서비스 입구 뒤쪽, 화면부터 안 뜨면 서비스 입구 쪽 문제입니다.",
    path: "터미널 · 어디까지 정상인지 좁힐 때",
    node: "nginx"
  },

  architecture: {
    edgeLabels: { "browser-nginx": "HTTP 요청", "flask-mysql": "SQL", "nginx-flask": "proxy_pass" },
    caption:
      "이번 Chapter는 요청 경로 전체가 학습 범위입니다. 아래 지도의 강조는 지금 보고 있는 단계를 따라 움직입니다.",
    highlight: ["user", "browser", "nginx", "flask", "mysql"]
  },

  concept: {
    lead:
      "하나의 요청을 따라가면 두 가지가 동시에 움직입니다. 하나는 '지금 어느 계층이 일하는가'이고, " +
      "다른 하나는 '데이터가 지금 어떤 모양인가'입니다. 이 둘을 같이 보면 전체가 이어집니다.",
    roles: [
      {
        role: "요청이 내려가는 방향",
        tech: "USER → Browser → Nginx → Flask → MySQL",
        desc:
          "각 계층은 자기 일만 하고 다음으로 넘깁니다. 브라우저는 Flask 주소를 모르고, " +
          "Nginx는 데이터를 모르고, Flask는 데이터를 보관하지 않습니다."
      },
      {
        role: "응답이 올라오는 방향",
        tech: "MySQL → Flask → Nginx → Browser → USER",
        desc:
          "같은 길을 반대로 돌아옵니다. 방향이 바뀌는 지점은 MySQL이 행을 돌려주는 순간입니다."
      },
      {
        role: "같은 작업의 여러 표현",
        tech: "HTTP → SQL → Row → JSON → 화면",
        desc:
          "같은 '2번 학생을 알고 싶다'는 작업이 각 처리 단계에서 그 단계의 방식으로 다시 표현됩니다. " +
          "요청이 그대로 흘러가는 것이 아닙니다 — 예를 들어 요청 처리 계층은 받은 HTTP 요청을 보고 " +
          "데이터 저장소에 물어볼 새 질문(SQL)을 직접 만들어 보냅니다."
      },
      {
        role: "문제를 좁히는 순서",
        tech: "구간 나누기",
        desc:
          "화면이 뜨는지 → /api/ 응답이 오는지 → backend 로그 → db 접속 순으로 확인하면 " +
          "어느 구간에서 끊겼는지 알 수 있습니다."
      }
    ],
    note:
      "Git · GitHub · Docker는 이 경로에 없습니다. 코드를 관리하고 실행 환경을 만들 뿐, " +
      "요청이 그것들을 통과하지는 않습니다."
  },

  code: [
    {
      id: "tr-curl",
      name: "구간별로 확인하기",
      path: "터미널 · 어디까지 정상인지 좁힐 때",
      lang: "bash",
      desc: "화면 없이 요청만 보내면 어느 구간까지 정상인지 알 수 있다.",
      lines: [
        { t: "curl -I http://localhost/                  # 1. 화면이 뜨는가 (Nginx)", node: "nginx" },
        { t: "curl -i http://localhost/api/students/2    # 2. 데이터가 오는가 (Flask)", node: "flask" },
        { t: "", node: null },
        { t: "docker compose logs -f backend             # 3. 처리 중 오류가 있는가", node: "flask" },
        { t: "docker compose ps                          # 4. db 가 떠 있는가", node: "mysql" }
      ]
    },
    {
      id: "tr-chain",
      name: "한 요청이 만든 것들",
      path: "같은 요청, 계층별로 다른 모양",
      lang: "text",
      desc: "같은 뜻이 계층을 지날 때마다 형태만 바뀐다.",
      lines: [
        { t: "GET /api/students/2                                  ← HTTP Request", node: "browser" },
        { t: "SELECT id, name, score FROM students WHERE id = 2;   ← SQL Query", node: "mysql" },
        { t: "2 | 이영희 | 88                                       ← DB Row", node: "mysql" },
        { t: '{ "id": 2, "name": "이영희", "score": 88 }             ← JSON Response', node: "flask" },
        { t: "이영희 · 88점                                          ← 화면", node: "browser" }
      ]
    }
  ],

  activity: {
    type: "trace",
    title: "학생 2번 조회 전체 추적",
    cta: "단계별로 따라가 보기",
    guide:
      "기본은 학습 모드입니다. 이전·다음으로 직접 따라가면서 각 단계의 기술·파일·코드와 " +
      "데이터의 모양을 함께 확인합니다. 전체 재생은 한 번만 재생하고 멈춥니다."
  },

  errors: [
    {
      id: "e14-unknown",
      code: "어디가 문제인지 모를 때",
      title: "증상만으로는 구간을 알 수 없다",
      symptom: "화면에 아무것도 안 나오는데 원인을 짐작할 수 없다.",
      cause: "여러 계층 중 어디서 끊겼는지 확인하지 않았다.",
      fix:
        "화면(/)이 뜨는지 → /api/ 응답이 오는지 → docker compose logs backend → db 접속 순으로 좁혀 간다. " +
        "각 단계가 바로 이 Chapter의 구간이다.",
      node: "nginx",
      edge: "browser-nginx"
    },
    {
      id: "e14-value",
      code: "응답은 200인데 값이 이상함",
      title: "통신은 정상인데 데이터가 다르다",
      symptom: "화면에 나온 점수가 예상과 다르다.",
      cause: "경로는 모두 정상이고 표에 저장된 값 자체가 다르다.",
      fix: "같은 조건으로 SQL을 직접 실행해 DB의 값과 화면의 값을 비교한다.",
      node: "mysql",
      edge: "flask-mysql"
    },
    {
      id: "e14-cache",
      code: "고쳤는데 화면이 그대로",
      title: "어느 축을 고쳤는지 헷갈리는 경우",
      symptom: "코드를 고치고 커밋까지 했는데 화면이 바뀌지 않는다.",
      cause:
        "commit은 코드 관리 축의 일입니다. 실행 중인 컨테이너는 만들어진 시점의 코드를 갖고 있습니다.",
      fix: "docker compose up -d --build 로 다시 빌드해 실행한다. 두 축은 별개다.",
      node: null,
      edge: null
    }
  ],

  summary: {
    remember: [
      "요청은 화면 → 서비스 입구 → 요청 처리 → 데이터 저장으로 내려가고, 같은 길로 돌아온다.",
      "방향이 바뀌는 지점은 데이터 저장소가 줄 하나를 돌려주는 순간이다.",
      "Git · GitHub · Docker는 이 경로에 들어가지 않는다."
    ],
    points: [
      "요청은 USER → Browser → Nginx → Flask → MySQL로 내려가고 같은 길로 돌아온다.",
      "방향이 바뀌는 지점은 MySQL이 행을 돌려주는 순간이다.",
      "같은 작업이 HTTP · SQL · Row · JSON · 화면 순으로 각 단계의 방식에 맞게 다시 표현된다.",
      "문제는 구간을 나눠 좁히면 찾을 수 있다.",
      "Git · GitHub · Docker는 이 경로에 들어가지 않는다."
    ],
    keywords: ["Request", "Response", "SQL", "JSON", "State", "Render"],
    position:
      "요청 경로 전체를 하나의 흐름으로 이었습니다. 남은 것은 이 시스템을 직접 다루는 일입니다.",
    next:
      "마지막으로 프로젝트를 직접 가져와 실행하고, 고치고, 다시 공유하는 " +
      "전체 순환을 해 봅니다."
  }
};

export default chapter14;
