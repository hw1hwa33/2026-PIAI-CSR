/*
 * Chapter 08 — 22_CHAPTER_CURRICULUM.md 기준
 *   제목      Docker Compose
 *   핵심 질문  여러 Container를 어떻게 하나의 Application처럼 실행할까?
 *   핵심      services · network · environment · volume · depends_on
 *   Activity  Compose YAML 의 service 선택 ↔ Architecture Node 강조
 *
 * Legacy Chapter 08 에서 서비스별 설정 설명 · 명령 · 오류 2건 · summary 를 가져왔다.
 * Legacy compose 의 web 은 image: nginx:1.27-alpine 이었으나,
 * 현재 프로젝트 계약(project.js 의 compose.yaml)은 build: ./nginx 이므로 현재 계약을 우선한다.
 *
 * 범위 통제 (20 §5) — healthcheck · profiles · 다중 compose 파일은 다루지 않는다.
 * Curriculum 의 services / network / environment / volume / depends_on 까지만 다룬다.
 */
const chapter08 = {
  id: 8,
  title: "여러 서비스를 한 번에 실행하기 — Docker Compose",
  coreQuestion: "여러 프로그램을 매번 하나씩 켜지 않고 함께 실행할 수 있을까?",
  placeholder: false,

  intro:
    "Chapter 07에서 요청을 처리하는 쪽의 실행 환경 하나를 만들었습니다. " +
    "그런데 웹 서비스는 그것 하나로 돌지 않습니다. 요청을 받는 입구도, 데이터를 보관하는 쪽도 함께 떠야 합니다. " +
    "이번에는 그 여러 개를 파일 하나로 정의하고 한 번에 실행합니다.",

  whyItMatters: [
    "웹 서비스는 프로그램 하나로 돌지 않습니다. 요청을 받는 입구도, 요청을 처리하는 쪽도, " +
      "데이터를 보관하는 쪽도 함께 떠 있어야 합니다.",
    "그것들을 매번 하나씩 따로 켜고 순서까지 신경 쓰는 것은 번거롭습니다."
  ],

  oneThing: "Compose는 여러 서비스를 함께 실행합니다.",

  objectives: [
    "파일 하나로 여러 서비스를 함께 띄우기",
    "서비스 이름이 곧 서로를 부르는 주소가 된다는 점",
    "바깥으로 열린 서비스와 안에서만 쓰이는 서비스의 차이"
  ],

  codeIntro:
    "파일 전체를 읽지 않아도 됩니다. 이 파일이 하는 일 한 가지만 먼저 확인합니다.",

  codeFocus: {
    lines: ["services:", "  web:      # 서비스 입구", "  backend:  # 요청 처리", "  db:       # 데이터 저장"],
    say:
      "compose.yaml 이 하는 일은 하나입니다 — 여러 프로그램을 한 번에 같이 실행합니다. " +
      "여기 적은 이름(web · backend · db)이 그대로 서로를 부르는 주소가 됩니다.",
    path: "compose.yaml"
  },

  architecture: {
    caption:
      "Compose는 아래 Runtime 서비스들을 실행하고 서로 연결해 주는 환경 설정입니다. " +
      "요청이 Compose를 거쳐 가는 것이 아닙니다.",
    highlight: [],
    axisFocus: ["docker"],
    scopeNotes: {
      nginx: "web 서비스로 실행됩니다. Nginx 설정 자체는 Chapter 10에서 봅니다.",
      flask: "backend 서비스로 실행됩니다. Flask 코드는 Chapter 11에서 봅니다.",
      mysql: "db 서비스로 실행됩니다. SQL은 Chapter 13에서 봅니다."
    },
    scopeNote:
      "이번 Chapter의 학습 범위는 서비스를 어떻게 함께 띄우는가입니다. " +
      "각 계층 안의 코드는 Chapter 09부터 차례로 다룹니다."
  },

  concept: {
    lead:
      "Compose가 하는 일은 한 가지입니다 — 여러 프로그램을 파일 하나로 정의하고 한 번에 같이 실행합니다. " +
      "이것만 먼저 잡고 나면 나머지는 그 위에 붙는 설정입니다.",
    roles: [
      {
        role: "무엇을 함께 띄울지 정하는 목록",
        tech: "services",
        desc:
          "web · backend · db 세 개를 정의합니다. 각각 이미지를 받아 쓰거나(image) " +
          "우리 Dockerfile로 만듭니다(build). 이 세 개가 함께 떠야 서비스가 동작합니다."
      },
      {
        role: "서비스끼리 서로 부를 수 있게 하는 통로",
        tech: "network",
        desc:
          "Compose가 자동으로 만들어 줍니다. 여기 적은 서비스 이름이 그대로 주소가 됩니다. " +
          "요청 처리(backend)는 데이터 저장(db)을, 서비스 입구(Nginx)는 backend를 이름으로 찾아갑니다."
      },
      {
        /* 정확한 통일 표현 (CLAUDE.md §15) — "준비될 때까지 기다린다"고 쓰지 않는다 */
        role: "시작 요청 순서",
        tech: "depends_on",
        desc:
          "어느 서비스를 먼저 시작할지만 정합니다. 이 프로젝트에서는 db → backend → web 순서입니다. " +
          "먼저 시작한다고 해서 사용할 준비까지 끝났다는 뜻은 아닙니다."
      }
    ],
    note:
      "그래서 db가 먼저 떴는데도 backend가 접속에 실패하고 다시 시도하는 일이 생길 수 있습니다. " +
      "이것은 설정이 잘못된 것이 아니라 depends_on이 원래 그만큼만 보장하기 때문입니다.",

    checkpoint:
      "여기까지 보면 이번 Chapter는 충분합니다 — 파일 하나로 여러 서비스를 함께 띄우고, " +
      "서비스 이름이 곧 서로를 부르는 주소가 된다.",

    advanced: [
      {
        label: "비밀번호 같은 값은 어디에 두나?",
        note: "environment · .env",
        body: [
          "비밀번호처럼 사람·환경마다 달라지는 값은 코드에 적지 않습니다. " +
            "compose.yaml에는 ${MYSQL_PASSWORD} 처럼 자리만 만들어 두고, 실제 값은 .env 파일에 둡니다.",
          ".env는 .gitignore에 넣어 저장소에 올리지 않습니다. 대신 이름만 적은 .env.example을 공유하고, " +
            "받은 사람이 각자 복사해 값을 채웁니다."
        ]
      },
      {
        label: "컨테이너를 지워도 데이터가 남게 하려면?",
        note: "volume",
        body: [
          "컨테이너 안의 파일은 컨테이너와 함께 사라집니다. 데이터베이스에 쌓인 데이터가 그대로 없어진다는 뜻입니다.",
          "그래서 db 서비스에는 db_data라는 저장 공간(volume)을 붙여 둡니다. " +
            "컨테이너를 지웠다 다시 띄워도 이 안의 데이터는 남습니다."
        ]
      },
      {
        label: "심화: 준비 완료까지 확인하려면?",
        note: "depends_on 만으로 부족할 때",
        body: [
          "depends_on은 시작 요청 순서만 정합니다. 컨테이너가 떴다는 것과 그 안의 프로그램이 " +
            "요청을 받을 준비를 마쳤다는 것은 다릅니다.",
          "정말로 준비됐는지 주기적으로 확인하고 싶으면 healthcheck 설정을 씁니다. " +
            "이 교안의 기본 범위는 아니며, 이름만 알아 두면 충분합니다.",
          "실무에서는 healthcheck 대신 접속에 실패하면 잠시 뒤 다시 시도하도록 코드 쪽에서 처리하기도 합니다."
        ]
      }
    ]
  },

  code: [
    {
      id: "cp-yaml",
      name: "compose.yaml",
      path: "compose.yaml",
      lang: "yaml",
      desc: "세 서비스를 한 번에 실행하도록 정의한다.",
      lines: [
        { t: "services:", node: null },
        { t: "  web:                        # nginx/ 폴더가 이 서비스가 된다", node: "nginx" },
        { t: "    build: ./nginx", node: "nginx" },
        { t: '    ports: ["80:80"]          # 바깥에 열리는 유일한 포트', node: "nginx" },
        { t: "    depends_on: [backend]", node: "nginx" },
        { t: "", node: null },
        { t: "  backend:                    # backend/ 폴더가 이 서비스가 된다", node: "flask" },
        { t: "    build: ./backend", node: "flask" },
        { t: "    environment:", node: "flask" },
        { t: "      DB_HOST: db             # 서비스 이름이 곧 주소", node: "flask" },
        { t: "      DB_NAME: student_db", node: "flask" },
        { t: "      DB_USER: student_user", node: "flask" },
        { t: "      DB_PASSWORD: ${MYSQL_PASSWORD}", node: "flask" },
        { t: "    depends_on: [db]", node: "flask" },
        { t: "", node: null },
        { t: "  db:                         # database/init.sql 로 표를 만든다", node: "mysql" },
        { t: "    image: mysql:8.0", node: "mysql" },
        { t: "    environment:", node: "mysql" },
        { t: "      MYSQL_DATABASE: student_db", node: "mysql" },
        { t: "      MYSQL_USER: student_user", node: "mysql" },
        { t: "      MYSQL_PASSWORD: ${MYSQL_PASSWORD}", node: "mysql" },
        { t: "      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}", node: "mysql" },
        { t: "    volumes:", node: "mysql" },
        { t: "      - db_data:/var/lib/mysql", node: "mysql" },
        { t: "      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql:ro", node: "mysql" },
        { t: "", node: null },
        { t: "volumes:", node: null },
        { t: "  db_data:", node: "mysql" }
      ]
    },
    {
      id: "cp-env",
      name: ".env.example",
      path: ".env.example",
      lang: "text",
      desc: "실제 비밀번호 대신 예시만 저장소에 올린다. .env는 커밋하지 않는다.",
      lines: [
        { t: "MYSQL_PASSWORD=change-me", node: null },
        { t: "MYSQL_ROOT_PASSWORD=change-root-me", node: null }
      ]
    },
    {
      id: "cp-run",
      name: "실행과 확인",
      path: "터미널 · student-web 폴더에서 실행",
      lang: "bash",
      desc: "세 서비스를 함께 띄우고 상태와 기록을 확인한다.",
      lines: [
        { t: "cp .env.example .env             # 값은 직접 채운다", node: null },
        { t: "docker compose up -d --build     # 빌드하고 백그라운드로 실행", node: null },
        { t: "docker compose ps                # 무엇이 떠 있는지 확인", node: null },
        { t: "docker compose logs -f backend   # 특정 서비스 기록 보기", node: null },
        { t: "docker compose down              # 실행 종료 (volume 데이터는 유지)", node: null }
      ]
    }
  ],

  activity: {
    type: "compose",
    title: "세 서비스를 함께 띄우고 살펴보기",
    cta: "세 서비스를 직접 띄워 보기",
    guide:
      "파일에 적힌 시작 순서대로 데이터 저장 → 요청 처리 → 서비스 입구를 하나씩 켜 봅니다. " +
      "그다음 각 서비스를 눌러 설정과 전체 구조에서의 위치를 볼 수 있습니다."
  },

  errors: [
    {
      id: "e8-notset",
      code: "variable is not set",
      title: "환경 변수 값을 찾지 못한다",
      symptom: "compose up을 실행하면 MYSQL_PASSWORD is not set 경고가 나오고 db가 제대로 뜨지 않는다.",
      cause: ".env 파일이 없어 ${MYSQL_PASSWORD} 자리를 채우지 못했다.",
      fix: "cp .env.example .env 로 파일을 만들고 값을 채운다. .env는 커밋하지 않는다.",
      node: "mysql",
      edge: null
    },
    {
      id: "e8-dbnotready",
      code: "backend가 db 연결 실패 후 재시작",
      title: "순서대로 떴는데도 연결에 실패한다",
      symptom: "db보다 늦게 떴는데도 backend 로그에 connection refused가 찍힌다.",
      cause: "depends_on은 시작 순서만 정한다. db 컨테이너가 떴다고 해서 MySQL이 접속을 받을 준비를 마친 것은 아니다.",
      fix: "잠시 뒤 자동으로 재시도되는지 확인하고, 필요하면 healthcheck나 재시도 처리를 추가한다.",
      node: "mysql",
      edge: "flask-mysql"
    },
    {
      id: "e8-port",
      code: "port is already allocated",
      title: "80번 포트를 이미 다른 것이 쓰고 있다",
      symptom: "web 서비스만 뜨지 않고 포트가 이미 할당됐다는 오류가 난다.",
      cause: "이전 실행이 남아 있거나 다른 프로그램이 80번을 쓰고 있다.",
      fix: "docker compose down으로 이전 실행을 정리하거나 ports를 \"8080:80\"처럼 바꾼다.",
      node: "nginx",
      edge: null
    }
  ],

  summary: {
    remember: [
      "Compose는 여러 서비스를 파일 하나로 정의하고 한 번에 함께 실행한다.",
      "여기 적은 서비스 이름이 그대로 컨테이너끼리의 주소가 된다.",
      "depends_on은 시작 요청 순서만 정한다 — 먼저 시작한다고 준비까지 끝난 것은 아니다."
    ],
    points: [
      "Compose는 여러 서비스를 파일 하나로 정의하고 함께 실행한다.",
      "서비스 이름이 곧 컨테이너끼리의 주소가 된다.",
      "ports를 적은 서비스만 바깥에 열린다.",
      "volume이 있어야 컨테이너를 지워도 데이터가 남는다.",
      "비밀번호는 코드가 아니라 .env로 주입하고 .env는 커밋하지 않는다."
    ],
    keywords: ["services", "build", "ports", "environment", "volumes", "depends_on", "docker compose up"],
    position:
      "실행 환경 축을 마쳤습니다. 이제 이렇게 떠 있는 서비스 안의 코드를 계층별로 봅니다.",
    next:
      "사용자가 가장 먼저 만나는 것은 화면입니다. 다음 Chapter에서는 " +
      "받은 JSON이 어떻게 화면으로 바뀌는지 봅니다."
  }
};

export default chapter08;
