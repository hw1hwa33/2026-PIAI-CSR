/*
 * Chapter 06 — 22_CHAPTER_CURRICULUM.md 기준
 *   제목      Docker
 *   핵심 질문  "내 컴퓨터에서는 되는데요"를 어떻게 줄일까?
 *   핵심      Code + Runtime + Dependencies → Image → Container
 *   Activity  서로 다른 PC 환경 위에 동일 Image 를 실행하여 결과 비교
 *
 * Legacy Chapter 06 에서 두 노트북 비교 아이디어 · 명령 · 오류 2건 · summary 를 가져왔다.
 * Legacy 는 한 번에 한 컴퓨터만 보여 줬으나, 대조가 목적이므로 두 대를 나란히 두도록 재설계했다.
 *
 * 범위 통제 (20 §5) — Dockerfile 문법은 Chapter 07, 여러 서비스 실행은 Chapter 08 범위다.
 * 여기서는 "왜 필요한가"와 "Image ≠ Container"까지만 다룬다.
 */
const chapter06 = {
  id: 6,
  title: "어디서나 같은 환경으로 실행하기 — Docker",
  coreQuestion: "\"내 컴퓨터에서는 되는데요\"를 어떻게 줄일까?",
  placeholder: false,

  intro:
    "Chapter 05에서 코드를 GitHub로 공유했습니다. 그런데 같은 코드를 받아도 " +
    "컴퓨터마다 설치된 것이 달라 어떤 곳에서는 실행되고 어떤 곳에서는 오류가 납니다. " +
    "Docker는 실행에 필요한 것을 코드와 함께 묶어, 어느 컴퓨터에서도 같게 실행되도록 만듭니다.",

  whyItMatters: [
    "같은 코드를 받아도 컴퓨터마다 설치된 것이 달라 어떤 곳에서는 실행되고 어떤 곳에서는 오류가 납니다.",
    "Docker는 실행에 필요한 것을 코드와 함께 묶어, 어느 컴퓨터에서도 같게 실행되도록 만듭니다."
  ],

  oneThing: "Docker는 실행 환경을 일정하게 만듭니다.",

  objectives: [
    "같은 코드가 컴퓨터마다 다르게 도는 이유",
    "실행할 준비가 된 틀(Image)과 실제 실행된 것(Container)의 차이",
    "Docker가 요청이 지나가는 길이 아니라는 점"
  ],

  architecture: {
    caption:
      "Docker는 요청이 지나가는 길 위의 한 칸이 아닙니다. 아래 Runtime 서비스들을 " +
      "담아서 실행하는 별도의 축입니다.",
    highlight: [],
    axisFocus: ["docker"],
    scopeNote:
      "이번 Chapter의 학습 범위는 Runtime 계층이 아니라 그 계층들을 실행하는 환경입니다. " +
      "요청은 Docker를 '거쳐' 가는 것이 아니라, Docker 안에서 실행 중인 서비스로 갑니다."
  },

  concept: {
    lead:
      "프로그램 하나를 실행하려면 코드만으로는 부족합니다. 코드를 실행해 줄 프로그램과 " +
      "코드가 빌려 쓰는 라이브러리가 함께 있어야 합니다. 이 셋이 컴퓨터마다 다른 것이 문제의 원인입니다.",
    roles: [
      {
        role: "실행에 필요한 것을 담은 틀",
        tech: "Image (이미지)",
        desc:
          "우리 코드 + 실행기(Python) + 라이브러리를 하나로 묶어 둔 것입니다. " +
          "아직 실행된 상태가 아니라 '실행할 준비가 된 틀'입니다."
      },
      {
        role: "그 틀로 실제 실행된 하나",
        tech: "Container (컨테이너)",
        node: "docker",
        desc:
          "이미지를 실행하면 컨테이너가 됩니다. 이미지 하나로 컨테이너를 여러 개 띄울 수 있고, " +
          "컨테이너를 지워도 이미지는 남습니다."
      },
      {
        role: "실행 환경을 만드는 프로그램",
        tech: "Docker",
        desc:
          "이미지를 만들고 컨테이너로 실행해 주는 도구입니다. " +
          "요청을 중계하거나 데이터를 저장하지 않습니다."
      }
    ],
    note:
      "Git·GitHub가 '코드가 어떻게 관리되는가'의 축이라면, Docker는 '코드가 어떤 환경에서 실행되는가'의 축입니다. " +
      "둘 다 Browser → Nginx → Flask → MySQL 경로 바깥에 있습니다.",

    checkpoint:
      "여기까지 보면 이번 Chapter는 충분합니다 — 같은 코드라도 컴퓨터마다 설치된 것이 다르면 결과가 다르고, " +
      "그 차이를 없애려고 실행에 필요한 것을 하나의 틀(Image)에 담는다.",

    advanced: [
      {
        label: "코드가 빌려 쓰는 프로그램은 무엇인가?",
        note: "Dependency 라는 말이 나오면 이 이야기입니다.",
        body: [
          "우리가 직접 만들지 않고 가져다 쓰는 남의 프로그램을 라이브러리라고 하고, 그중 우리 코드가 없으면 " +
            "동작하지 못하는 것을 의존성(Dependency)이라고 부릅니다.",
          "예를 들어 이 프로젝트의 backend 는 flask 와 mysql-connector-python 두 가지를 빌려 씁니다. " +
            "B 노트북에서 ModuleNotFoundError 가 난 것은 바로 이것이 설치돼 있지 않았기 때문입니다.",
          "이미지에는 이 목록까지 함께 들어갑니다. 그래서 컴퓨터마다 따로 설치할 필요가 없어집니다."
        ]
      }
    ]
  },

  codeIntro:
    "명령을 외우지 않아도 됩니다. 이미지 목록과 컨테이너 목록이 서로 다른 것을 보여 준다는 것만 확인합니다.",

  codeFocus: {
    lines: ["docker images   # 갖고 있는 '틀'", "docker ps       # 지금 돌고 있는 것"],
    say:
      "두 명령이 보여 주는 목록이 다릅니다. 앞은 실행할 준비가 된 틀(Image), " +
      "뒤는 그 틀로 실제 돌고 있는 것(Container)입니다. 이 둘이 다르다는 것이 이번 Chapter의 핵심입니다.",
    path: "터미널 · 어느 폴더에서나"
  },

  code: [
    {
      id: "dk-check",
      name: "설치 확인과 첫 실행",
      path: "터미널 · 어느 폴더에서나",
      lang: "bash",
      desc: "Docker가 설치돼 있는지 확인하고 아주 작은 이미지를 한 번 실행해 본다.",
      lines: [
        { t: "docker --version              # 설치 여부와 버전 확인", node: null },
        { t: "docker run --rm hello-world   # 이미지를 받아 컨테이너로 한 번 실행", node: null },
        { t: "                              # --rm 은 끝나면 컨테이너를 지운다", node: null }
      ]
    },
    {
      id: "dk-list",
      name: "이미지와 컨테이너 확인",
      path: "터미널 · 지금 무엇이 있는지 볼 때",
      lang: "bash",
      desc: "이미지 목록과 컨테이너 목록은 서로 다른 것을 보여 준다.",
      lines: [
        { t: "docker images   # 갖고 있는 '틀' 목록", node: null },
        { t: "docker ps       # 지금 실행 중인 컨테이너", node: null },
        { t: "docker ps -a    # 멈춘 것까지 포함한 컨테이너", node: null }
      ]
    }
  ],

  activity: {
    type: "docker-env",
    title: "같은 코드, 다른 컴퓨터",
    cta: "두 컴퓨터에서 비교해 보기",
    guide:
      "같은 코드를 받은 두 대의 컴퓨터에 같은 실행 방식을 눌러 결과를 나란히 비교해 보세요. " +
      "그다음 틀 하나로 실제 실행을 띄워 보며 둘이 어떻게 다른지 볼 수 있습니다."
  },

  errors: [
    {
      id: "e6-module",
      code: "ModuleNotFoundError",
      title: "다른 컴퓨터에서만 실행되지 않는다",
      symptom: "No module named 'flask' 오류로 시작조차 되지 않는다.",
      cause: "그 컴퓨터에 필요한 라이브러리가 설치돼 있지 않다.",
      fix: "컴퓨터마다 설치하는 대신 라이브러리가 포함된 이미지로 실행한다.",
      node: null,
      edge: null
    },
    {
      id: "e6-daemon",
      code: "Cannot connect to the Docker daemon",
      title: "docker 명령이 아예 동작하지 않는다",
      symptom: "docker ps를 쳐도 데몬에 연결할 수 없다는 메시지가 나온다.",
      cause: "Docker 프로그램 자체가 실행 중이 아니다.",
      fix: "Docker Desktop을 켠 뒤 다시 실행한다. 설치만 하고 실행하지 않은 경우가 가장 흔하다.",
      node: null,
      edge: null
    },
    {
      id: "e6-confuse",
      code: "이미지를 지웠는데 컨테이너가 남아 있다",
      title: "이미지와 컨테이너를 같은 것으로 생각하는 오해",
      symptom: "docker images에는 없는데 docker ps -a에는 뭔가 남아 있다.",
      cause: "이미지는 틀이고 컨테이너는 실행된 결과라 서로 다른 목록으로 관리된다.",
      fix: "docker ps -a로 컨테이너를 확인하고, 필요 없으면 docker rm으로 따로 정리한다.",
      node: null,
      edge: null
    }
  ],

  summary: {
    remember: [
      "같은 코드도 실행기와 라이브러리가 다르면 결과가 달라진다.",
      "Image는 실행할 준비가 된 틀이고, Container는 그 틀로 실제 실행된 하나다.",
      "Docker는 실행 환경 축이며 요청이 지나가는 계층이 아니다."
    ],
    points: [
      "같은 코드도 실행기와 라이브러리가 다르면 결과가 달라진다.",
      "Image는 코드 + 실행기 + 라이브러리를 담은 틀이다.",
      "Container는 그 틀로 실제 실행된 하나이고, 이미지 하나로 여러 개 띄울 수 있다.",
      "Docker는 실행 환경 축이며 요청이 지나가는 계층이 아니다."
    ],
    keywords: ["Image", "Container", "docker run", "docker images", "docker ps"],
    position:
      "코드 관리 축(Ch04~05)을 마치고 실행 환경 축에 들어왔습니다. 요청 경로는 여전히 별개의 축입니다.",
    next:
      "이미지를 쓰려면 먼저 만들어야 합니다. 다음 Chapter에서는 원하는 환경을 " +
      "Docker에게 설명하는 파일을 직접 만들어 봅니다."
  }
};

export default chapter06;
