/*
 * Chapter 15 — 22_CHAPTER_CURRICULUM.md 기준
 *   제목      전체 프로젝트 완성
 *   핵심 질문  프로젝트를 가져오고 실행하고 수정하고 다시 GitHub에 올릴 수 있는가?
 *   최종      Git / GitHub / Docker / Nginx / React / Flask / MySQL 을 모두 완료 상태로
 *   완료 메시지 WEB APPLICATION COMPLETE
 *
 * Legacy Chapter 15 에서 전체 순환 명령 · 출력 · 오류 3건 · summary 를 가져왔다.
 * Legacy 의 터미널 입력형 대신, 각 단계가 어느 축을 움직이는지 보이는 형태로 재설계했다.
 *
 * 새 기술을 많이 가르치는 장이 아니다. 지금까지 배운 것을 조립하는 것이 목적이다.
 * docker compose down -v 는 데이터 삭제 위험 명령이라 기본 흐름에 넣지 않는다.
 */
const chapter15 = {
  id: 15,
  title: "전체 웹서비스 한 바퀴 돌기",
  coreQuestion: "받아서 실행하고 고쳐서 다시 공유하는 한 바퀴를 돌 수 있을까?",
  placeholder: false,

  intro:
    "마지막 Chapter입니다. 새로 배울 기술은 거의 없습니다. " +
    "지금까지 따로 배운 것을 하나의 순환으로 이어 봅니다 — " +
    "코드를 가져와 실행하고, 화면과 API를 확인하고, 고쳐서 기록을 남기고, 다시 공유하는 것입니다.",

  whyItMatters: [
    "각 기술을 따로 아는 것과, 그것들이 하나의 서비스로 이어지는 것을 보는 것은 다릅니다.",
    "받아서 실행하고, 확인하고, 고쳐서 다시 공유하는 한 바퀴를 돌아 보면 세 축이 각각 무슨 일을 하는지 분명해집니다."
  ],

  oneThing: "지금까지 본 모든 역할이 하나의 웹서비스를 만듭니다.",

  objectives: [
    "받아서 실행하고 고쳐서 다시 공유하는 한 바퀴",
    "코드와 기록 관리 · 실행 환경 · 실제 요청 경로의 구분",
    "비밀번호를 다루는 방법과 조심할 명령"
  ],

  codeIntro:
    "새 명령은 없습니다. 지금까지 따로 쓴 명령을 한 바퀴 순서로 이어 본다는 것만 확인합니다.",

  codeFocus: {
    lines: [
      "git clone …            # 코드와 기록 받기",
      "docker compose up -d   # 실행 환경 띄우기",
      "git push               # 고친 내용 다시 공유"
    ],
    say:
      "세 명령이 각각 다른 축을 움직입니다. clone·push 는 코드와 기록 관리, " +
      "compose up 은 실행 환경입니다. 코드를 고치고 커밋했는데 화면이 그대로라면 이 둘을 헷갈린 것입니다.",
    path: "터미널 · 처음부터 끝까지"
  },

  architecture: {
    caption:
      "마지막으로 세 축을 함께 봅니다. 요청은 아래 길만 지나가고, " +
      "코드 관리와 실행 환경은 그 길을 만들고 관리하는 별도의 축입니다.",
    highlight: ["user", "browser", "nginx", "flask", "mysql"],
    axisFocus: ["local-git", "github", "docker"]
  },

  concept: {
    lead:
      "완성된 프로젝트를 설명할 때는 세 가지를 나눠서 말하면 됩니다 — " +
      "코드와 기록 관리, 실행 환경, 실제 요청 경로. 새 기술은 없습니다.",
    roles: [
      {
        role: "코드와 기록 관리",
        tech: "Local Git ↔ GitHub",
        node: "github",
        desc:
          "clone으로 받아 오고, commit으로 기록을 남기고, push로 공유합니다. " +
          "이 축의 동작은 실행 중인 서비스를 바꾸지 않습니다."
      },
      {
        role: "실행 환경",
        tech: "Docker Compose",
        node: "docker",
        desc:
          "compose up으로 세 서비스를 띄우고 down으로 정리합니다. " +
          "이 축의 동작은 GitHub에 아무것도 올리지 않습니다."
      },
      {
        role: "실제 요청 경로",
        tech: "Nginx → Flask API → MySQL",
        node: "nginx",
        desc:
          "실제 사용자 요청은 이 길만 지나갑니다. 화면이 뜨는지와 API가 오는지를 " +
          "따로 확인하면 문제 구간을 좁힐 수 있습니다."
      },
      {
        role: "저장소에 올리면 안 되는 것",
        tech: ".env",
        desc:
          "실제 비밀번호가 든 .env는 커밋하지 않습니다. 공유용으로는 .env.example만 올리고, " +
          "받은 사람이 각자 복사해 값을 채웁니다."
      }
    ],
    note:
      "코드를 고치고 커밋했는데 화면이 그대로라면 축을 헷갈린 것입니다. " +
      "실행 중인 컨테이너는 만들어진 시점의 코드를 갖고 있으므로 다시 빌드해야 합니다."
  },

  code: [
    {
      id: "fin-cycle",
      name: "전체 순환",
      path: "터미널 · 처음부터 끝까지",
      lang: "bash",
      desc: "받아서 실행하고, 고쳐서 다시 공유하는 한 바퀴다.",
      lines: [
        { t: "git clone <REPOSITORY_URL>          # 1. 코드와 기록 받기", node: null },
        { t: "cd student-web", node: null },
        { t: "cp .env.example .env                # 2. 값은 직접 채운다", node: null },
        { t: "", node: null },
        { t: "docker compose up -d --build        # 3. 세 서비스 실행", node: "nginx" },
        { t: "docker compose ps                   # 4. 상태 확인", node: null },
        { t: "", node: null },
        { t: "# 5. 브라우저에서 확인", node: "browser" },
        { t: "#    http://localhost                → 화면", node: "nginx" },
        { t: "#    http://localhost/api/students/1 → JSON", node: "flask" },
        { t: "", node: null },
        { t: "# 6. 코드 수정 후", node: null },
        { t: "git status", node: null },
        { t: "git add backend/app.py", node: null },
        { t: 'git commit -m "feat: 점수 표시 문구 수정"', node: null },
        { t: "git push                            # 7. 다시 공유", node: null },
        { t: "", node: null },
        { t: "docker compose down                 # 8. 실행 종료 (데이터는 유지)", node: null }
      ]
    },
    {
      id: "fin-env",
      name: ".env.example",
      path: ".env.example",
      lang: "text",
      desc: "저장소에는 예시만 올리고, 실제 값이 든 .env는 커밋하지 않는다.",
      lines: [
        { t: "MYSQL_PASSWORD=change-me", node: null },
        { t: "MYSQL_ROOT_PASSWORD=change-root-me", node: null }
      ]
    },
    {
      id: "fin-check",
      name: "문제가 생겼을 때",
      path: "터미널 · 구간을 좁힐 때",
      lang: "bash",
      desc: "Chapter 14에서 배운 순서 그대로 확인한다.",
      lines: [
        { t: "curl -I http://localhost/                # 화면까지 정상인가", node: "nginx" },
        { t: "curl -i http://localhost/api/students/1  # API 까지 정상인가", node: "flask" },
        { t: "docker compose logs -f backend           # 처리 중 오류가 있는가", node: "flask" },
        { t: "docker compose ps                        # db 가 떠 있는가", node: "mysql" }
      ]
    }
  ],

  activity: {
    type: "complete",
    title: "한 바퀴 함께 돌아보기",
    cta: "한 바퀴 따라가 보기",
    guide:
      "다음 단계 보기를 누르면 실제로 하는 순서대로 한 단계씩 따라갑니다. " +
      "단계마다 세 축 중 어느 것이 움직이는지 위 보드에서 함께 확인할 수 있습니다."
  },

  errors: [
    {
      id: "e15-port",
      code: "port is already allocated",
      title: "80번 포트를 이미 쓰고 있다",
      symptom: "compose up을 실행하면 web 서비스만 뜨지 않는다.",
      cause: "이전 실행이 남아 있거나 다른 프로그램이 80번을 쓰고 있다.",
      fix: "docker compose down으로 정리하거나 ports를 \"8080:80\"으로 바꾼다.",
      node: "nginx",
      edge: "browser-nginx"
    },
    {
      id: "e15-down-v",
      code: "docker compose down -v",
      title: "데이터까지 지워지는 명령",
      symptom: "-v를 붙여 실행한 뒤 데이터베이스가 비어 있다.",
      cause: "-v는 volume까지 삭제한다. 그 안의 데이터는 되돌릴 수 없다.",
      fix:
        "기본 학습 흐름에서는 -v 없이 down만 사용한다. " +
        "정말로 데이터를 지울 때만 따로 실행한다.",
      node: "mysql",
      edge: null
    },
    {
      id: "e15-env",
      code: ".env가 커밋됨",
      title: "실제 비밀번호가 저장소에 올라갔다",
      symptom: "GitHub 저장소에서 .env 파일이 보인다.",
      cause: ".gitignore를 확인하지 않았거나 이미 추적 중인 상태였다.",
      fix:
        "파일을 지우는 것만으로는 기록에 남습니다. 그 비밀번호 값을 즉시 바꾸고, " +
        ".gitignore에 .env를 넣은 뒤 .env.example만 공유합니다.",
      node: null,
      edge: null
    }
  ],

  summary: {
    remember: [
      "코드와 기록 관리(Git · GitHub)는 실행 중인 서비스를 바꾸지 않는다.",
      "실행 환경(Docker Compose)은 GitHub에 아무것도 올리지 않는다.",
      "사용자 요청은 화면 → 서비스 입구 → 요청 처리 → 데이터 저장, 이 길만 지나간다."
    ],
    points: [
      "clone → .env → compose up → 확인 → 수정 → commit → push → down 이 한 바퀴다.",
      "코드 관리 축(Git · GitHub)은 실행 중인 서비스를 바꾸지 않는다.",
      "실행 환경 축(Docker Compose)은 GitHub에 아무것도 올리지 않는다.",
      "요청은 Browser → Nginx → Flask → MySQL 길만 지나간다.",
      ".env는 커밋하지 않고 .env.example만 공유한다.",
      "docker compose down -v 는 데이터까지 지우므로 기본 흐름에서 쓰지 않는다."
    ],
    keywords: ["git clone", ".env", "docker compose up", "git push", "docker compose down"],
    position:
      "15개 Chapter를 모두 마쳤습니다. 세 축과 요청 경로 전체를 하나의 시스템으로 볼 수 있게 되었습니다.",
    next:
      "이제 스스로 설명할 수 있습니다 — Git은 변경 기록을 관리하고, GitHub는 그 기록을 원격에서 공유하며, " +
      "Docker는 실행 환경을 통일합니다. 사용자의 요청은 Browser에서 만들어져 Nginx를 거쳐 Flask API로 전달되고, " +
      "Flask가 MySQL에서 데이터를 조회해 JSON으로 돌려주면 Frontend가 상태를 바꿔 화면을 다시 그립니다."
  }
};

export default chapter15;
