/*
 * Chapter 07 — 22_CHAPTER_CURRICULUM.md 기준
 *   제목      Dockerfile
 *   핵심 질문  원하는 실행 환경을 Docker에게 어떻게 설명할까?
 *   Activity  Dockerfile 각 줄 실행 → Image Layer / 환경 변화 시각화
 *
 * Legacy Chapter 07 에서 Dockerfile 7줄 · 각 줄 설명 · Layer 목록 · build 출력 ·
 * 오류 2건 · summary 를 가져왔다. Legacy 의 터미널 입력형은 Chapter 04·05 와 겹쳐 채택하지 않았다.
 *
 * 파일 계약: backend/Dockerfile 은 Chapter 03 File Preview 및 Chapter 08 compose 의 build 대상과 일치한다.
 * 범위 통제 (20 §5) — multi-stage build · ENTRYPOINT · ARG · 이미지 최적화는 다루지 않는다.
 */
const chapter07 = {
  id: 7,
  title: "실행 환경 만드는 순서표 — Dockerfile",
  coreQuestion: "원하는 실행 환경을 어떻게 적어 둘까?",
  placeholder: false,

  intro:
    "Chapter 06에서 이미지로 실행하면 컴퓨터가 달라도 결과가 같다는 것을 봤습니다. " +
    "그러면 그 이미지는 누가 만들까요? Dockerfile은 '이 환경을 이렇게 만들어라'를 " +
    "한 줄씩 적어 둔 설명서입니다.",

  whyItMatters: [
    "Chapter 06에서 이미지로 실행하면 컴퓨터가 달라도 결과가 같다는 것을 봤습니다. 그러면 그 이미지는 누가 만들까요?",
    "Docker에게 \"이 환경을 이렇게 만들어라\"를 알려 줄 파일이 필요합니다. 그것이 Dockerfile입니다."
  ],

  oneThing: "Dockerfile은 실행 환경을 만드는 순서표입니다.",

  objectives: [
    "각 줄이 무엇을 하는지 — 시작 · 폴더 · 복사 · 설치 · 실행",
    "위에서 아래로 한 줄씩 실행된다는 점",
    "(심화) 왜 설치를 소스 복사보다 앞에 두는지"
  ],

  codeIntro:
    "먼저 다섯 줄이 각각 무엇을 하는지만 순서대로 봅니다. 층이나 캐시는 지금 몰라도 됩니다.",

  codeFocus: {
    lines: [
      "FROM python:3.11-slim   # 무엇 위에서 시작할지",
      "WORKDIR /app            # 어느 폴더에서 일할지",
      "COPY requirements.txt . # 무엇을 가져올지",
      "RUN pip install ...     # 무엇을 설치할지",
      'CMD ["flask", ...]      # 시작할 때 무엇을 실행할지'
    ],
    say:
      "위에서 아래로 한 줄씩 실행됩니다. 각 줄은 '무엇 위에서 시작할지 → 어느 폴더에서 → " +
      "무엇을 가져와 → 무엇을 설치하고 → 시작할 때 무엇을 실행할지' 순서로 이어집니다.",
    path: "backend/Dockerfile"
  },

  architecture: {
    caption:
      "Dockerfile은 backend 서비스의 실행 환경을 만드는 설명서입니다. " +
      "만들어진 이미지는 Flask API가 실행될 자리를 준비할 뿐, 요청 경로를 바꾸지 않습니다.",
    highlight: [],
    axisFocus: ["docker"],
    scopeNotes: {
      flask: "이번에 만드는 이미지가 실행되면 그 안에서 Flask API가 동작합니다. Flask 코드 자체는 Chapter 11에서 봅니다."
    },
    scopeNote:
      "이번 Chapter의 학습 범위는 실행 환경을 만드는 축입니다. 요청이 지나가는 계층은 그대로입니다."
  },

  concept: {
    lead:
      "Dockerfile은 위에서 아래로 한 줄씩 실행됩니다. 한 줄이 끝나면 그 결과가 하나의 층으로 남고, " +
      "다음 줄은 그 위에 쌓입니다. 이 층 구조가 '왜 이 순서인가'를 설명해 줍니다.",
    roles: [
      {
        role: "환경을 만드는 설명서",
        tech: "Dockerfile",
        desc:
          "무엇 위에서 시작할지, 무엇을 설치할지, 무엇을 복사할지, 시작할 때 무엇을 실행할지를 적습니다."
      },
      {
        role: "설명서대로 만든 틀",
        tech: "Image",
        desc:
          "각 줄의 결과가 층으로 쌓여 하나의 이미지가 됩니다. 바뀐 층부터 그 위쪽만 다시 만들어집니다."
      },
    ],
    note:
      "EXPOSE와 CMD는 파일을 더하지 않는 설정입니다. EXPOSE는 '이 포트를 쓴다'는 표시일 뿐 " +
      "그 줄만으로 바깥에서 접속할 수 있게 되지는 않습니다.",

    checkpoint:
      "여기까지 보면 이번 Chapter는 충분합니다 — Dockerfile은 실행 환경을 만드는 순서를 " +
      "한 줄씩 적어 둔 파일이고, 위에서 아래로 실행된다.",

    advanced: [
      {
        label: "왜 두 번째 빌드는 빨라질까?",
        note: "순서를 왜 그렇게 두는지 궁금할 때만 열어 보세요.",
        body: [
          "한 줄이 끝나면 그 결과가 한 겹(Layer)으로 남고, 다음 줄은 그 위에 쌓입니다. " +
            "다시 빌드할 때 Docker는 바뀌지 않은 겹을 그대로 재사용합니다.",
          "어떤 겹의 입력이 바뀌면 그 겹과 그 위의 겹이 모두 다시 실행됩니다. " +
            "그래서 자주 바뀌는 것(우리 소스)은 뒤쪽에, 잘 안 바뀌는 것(설치 목록)은 앞쪽에 둡니다.",
          "이것이 COPY requirements.txt . 를 COPY . . 보다 먼저 두는 이유입니다. " +
            "코드만 고쳤을 때 설치 단계를 다시 하지 않아도 됩니다."
        ]
      }
    ]
  },

  code: [
    {
      id: "df-file",
      name: "backend/Dockerfile",
      path: "backend/Dockerfile",
      lang: "dockerfile",
      desc: "Flask API를 실행할 환경을 만드는 설명서다.",
      lines: [
        { t: "FROM python:3.11-slim                          # 바탕이 될 실행 환경", node: null },
        { t: "WORKDIR /app                                   # 이후 명령의 기본 폴더", node: null },
        { t: "COPY requirements.txt .                        # 설치 목록만 먼저", node: null },
        { t: "RUN pip install --no-cache-dir -r requirements.txt", node: null },
        { t: "COPY . .                                       # 소스는 나중에", node: null },
        { t: "EXPOSE 5000                                    # 쓰는 포트 표시 (층 아님)", node: null },
        { t: 'CMD ["flask", "--app", "app", "run", "--host=0.0.0.0"]', node: null }
      ]
    },
    {
      id: "df-req",
      name: "backend/requirements.txt",
      path: "backend/requirements.txt",
      lang: "text",
      desc: "이미지를 만들 때 설치할 라이브러리 목록이다.",
      lines: [
        { t: "flask==3.0.3", node: null },
        { t: "mysql-connector-python==9.0.0", node: null }
      ]
    },
    {
      id: "df-build",
      name: "이미지 만들기",
      path: "터미널 · student-web 폴더에서 실행",
      lang: "bash",
      desc: "설명서대로 이미지를 만들고 목록에서 확인한다.",
      lines: [
        { t: "docker build -t student-backend ./backend   # ./backend 안의 Dockerfile 로 빌드", node: null },
        { t: "docker images                               # 만들어진 이미지 확인", node: null }
      ]
    }
  ],

  activity: {
    type: "dockerfile",
    title: "설명서를 한 줄씩 따라가 보기",
    cta: "한 줄씩 따라가 보기",
    guide:
      "다음 줄 보기를 누르면 실제 파일 순서대로 한 줄씩 나타납니다. " +
      "그때마다 그 줄이 무엇을 하는지, 이미지에 무엇이 쌓이는지 오른쪽에서 함께 볼 수 있습니다. " +
      "맞혀야 넘어가는 것이 아니라 그냥 따라가면 됩니다."
  },

  errors: [
    {
      id: "e7-copy",
      code: "COPY failed: file not found",
      title: "복사할 파일을 찾지 못한다",
      symptom: "build 도중 COPY 단계에서 파일이 없다는 오류로 멈춘다.",
      cause: "docker build 뒤에 적은 폴더(build context) 안에 그 파일이 없다.",
      fix: "docker build -t student-backend ./backend 의 ./backend 안에 requirements.txt가 있는지 확인한다.",
      node: null,
      edge: null
    },
    {
      id: "e7-host",
      code: "컨테이너에 접속되지 않음",
      title: "실행은 됐는데 바깥에서 닿지 않는다",
      symptom: "로그에는 Running on http://127.0.0.1:5000 이라고 나오는데 Nginx가 502를 낸다.",
      cause: "컨테이너 안에서만 유효한 주소로 실행됐다.",
      fix: "CMD에 --host=0.0.0.0 이 있는지 확인한다.",
      node: null,
      edge: null
    },
    {
      id: "e7-rebuild",
      code: "코드를 고쳤는데 반영되지 않는다",
      title: "이미지를 다시 만들지 않았다",
      symptom: "소스를 수정했는데 컨테이너의 동작이 그대로다.",
      cause: "이미지는 만들어진 시점의 코드를 담고 있다. 다시 빌드하지 않으면 옛 코드가 그대로 실행된다.",
      fix: "docker compose up -d --build 처럼 다시 빌드하는 옵션을 함께 쓴다.",
      node: null,
      edge: null
    }
  ],

  summary: {
    remember: [
      "Dockerfile은 실행 환경을 만드는 순서를 한 줄씩 적어 둔 파일이다.",
      "위에서 아래로 한 줄씩 실행되고, 그 결과가 하나의 Image가 된다.",
      "build는 이미지를 만들 뿐이고, 실행하면 그때 Container가 된다."
    ],
    points: [
      "Dockerfile은 실행 환경을 만드는 설명서이고, 한 줄이 하나의 단계가 된다.",
      "각 줄의 결과가 층으로 쌓여 하나의 Image가 된다.",
      "바뀐 층부터 위쪽이 다시 만들어지므로, 잘 안 바뀌는 것을 앞에 둔다.",
      "EXPOSE와 CMD는 파일을 더하지 않는 설정이다.",
      "build는 이미지를 만들 뿐, 실행하면 그때 Container가 된다."
    ],
    keywords: ["FROM", "WORKDIR", "COPY", "RUN", "EXPOSE", "CMD", "docker build"],
    position:
      "실행 환경 축에서 서비스 하나(backend)의 환경을 직접 만들었습니다.",
    next:
      "그런데 웹 서비스는 backend 하나로 돌지 않습니다. Nginx와 MySQL도 함께 떠야 합니다. " +
      "다음 Chapter에서는 여러 서비스를 한 번에 실행하는 방법을 배웁니다."
  }
};

export default chapter07;
