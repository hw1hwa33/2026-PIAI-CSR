/*
 * Chapter 03 — 22_CHAPTER_CURRICULUM.md 기준
 *   제목      프로젝트 파일과 폴더
 *   핵심 질문  왜 frontend/backend/nginx/database 폴더를 나누는가?
 *   Activity  Folder Tree ↔ Architecture Node 매칭
 *
 * 목적은 구조를 외우는 것이 아니라 "폴더 분리 = 역할 분리"를 이해하는 것이다.
 * Compose 세부 문법은 Chapter 08, Git 사용법은 Chapter 04 범위다. (20 §5 Scope Control)
 */
const chapter03 = {
  id: 3,
  title: "역할에 따라 파일 나누기",
  coreQuestion: "왜 파일을 역할에 따라 나눠서 둘까?",
  placeholder: false,

  intro:
    "지금까지 요청이 지나가는 길과 오가는 내용을 봤습니다. 그 길 위의 프로그램들은 " +
    "실제로 하나의 폴더 안에 뒤섞여 있지 않습니다. 역할이 다르면 폴더도 나뉘어 있고, " +
    "그 나눔은 정리 취향이 아니라 시스템 구조를 그대로 따릅니다.",

  whyItMatters: [
    "파일이 아무 데나 섞여 있으면 무엇이 화면이고 무엇이 서버인지 알 수 없습니다.",
    "이 프로젝트의 폴더는 정리 취향으로 나뉜 것이 아니라, Chapter 01에서 본 역할 분리를 그대로 옮긴 것입니다."
  ],

  oneThing: "폴더는 시스템의 역할에 따라 나뉩니다.",

  objectives: [
    "폴더 이름과 시스템 자리의 대응",
    "요청 경로가 아닌 것 — compose.yaml · .env",
    "실제 비밀번호를 저장소에 올리지 않는 이유"
  ],

  architecture: {
    caption:
      "폴더 하나하나가 이 지도의 어느 자리에 놓이는지 확인합니다. " +
      "구조 자체는 Chapter 01에서 본 것과 같습니다.",
    highlight: ["browser", "nginx", "flask", "mysql"],
    scopeNotes: {
      user:
        "USER는 프로젝트 폴더가 아니라 시스템을 사용하는 사람입니다. " +
        "이번 Chapter는 코드가 놓이는 자리만 다룹니다."
    }
  },

  concept: {
    lead:
      "폴더를 나누는 기준은 '파일 개수'가 아니라 '역할'입니다. " +
      "역할이 다르면 고치는 사람도, 다시 실행하는 시점도, 배포되는 방식도 달라집니다.",
    roles: [
      {
        role: "화면을 만드는 코드가 있는 곳",
        tech: "frontend/",
        node: "browser",
        desc: "사용자가 보는 화면과 요청을 만드는 코드. 빌드하면 정적 파일이 됩니다."
      },
      {
        role: "서비스 입구 설정이 있는 곳",
        tech: "nginx/",
        node: "nginx",
        desc: "어떤 주소를 어디로 보낼지 정하는 설정 파일이 들어갑니다."
      },
      {
        role: "요청을 처리하는 코드가 있는 곳",
        tech: "backend/",
        node: "flask",
        desc: "주소에 맞는 함수를 실행하고 JSON을 만드는 코드가 들어갑니다."
      },
      {
        role: "데이터 구조를 정의하는 곳",
        tech: "database/",
        node: "mysql",
        desc: "어떤 표에 어떤 값을 저장할지 적어 둔 파일이 들어갑니다."
      }
    ],
    note:
      "compose.yaml은 이 네 폴더를 각각 어떤 서비스로 띄울지 적어 둔 실행 설정이고, " +
      ".env.example은 사람마다 다른 값의 이름만 적어 둔 예시입니다. " +
      "둘 다 요청이 통과하는 계층이 아닙니다. .gitignore는 Git이 기록하지 않을 목록으로, " +
      "이 역시 별도의 관리 축에 속합니다."
  },

  /*
   * 이 Chapter 의 코드 경험은 Activity 의 Folder Tree → File Preview 가 담당한다.
   * 같은 코드를 상단 Code Explorer 에서 한 번 더 보여 주지 않는다. (공통 컴포넌트는 그대로 둔다)
   */
  codeInActivity: true,
  code: [],

  activity: {
    type: "folder",
    title: "폴더를 하나씩 열어 보기",
    cta: "폴더를 직접 열어 보기",
    guide:
      "폴더를 누르면 그 폴더가 무슨 일을 하는지, 시스템의 어느 자리인지가 바로 나옵니다. " +
      "위 지도도 함께 강조됩니다. 안의 파일을 누르면 실제 코드도 볼 수 있습니다. " +
      "순서 없이 아무거나 눌러 비교해 보세요."
  },

  errors: [
    {
      id: "e3-build",
      code: "build path not found",
      title: "compose.yaml의 build 경로가 폴더 이름과 다르다",
      symptom: "docker compose up 을 하면 경로를 찾을 수 없다는 오류가 난다.",
      cause: "build: ./backend 인데 실제 폴더 이름이 다르거나 위치가 다르다.",
      fix: "compose.yaml의 build 경로와 실제 폴더 이름을 그대로 맞춘다.",
      node: "flask",
      edge: "nginx-flask"
    },
    {
      id: "e3-secret",
      code: ".env 를 커밋함",
      title: "실제 비밀번호가 저장소에 올라갔다",
      symptom: "저장소에서 .env 파일과 그 안의 비밀번호가 그대로 보인다.",
      cause: ".gitignore 에 .env 를 넣지 않은 상태에서 전체를 커밋했다.",
      fix:
        ".gitignore 에 .env 를 추가하고, 이미 올라간 비밀번호는 값 자체를 바꾼다. " +
        "공유할 것은 이름만 적은 .env.example 이다.",
      node: "mysql",
      edge: "flask-mysql"
    },
    {
      id: "e3-mix",
      code: "역할 섞임",
      title: "폴더만 나누면 저절로 분리 실행된다는 오해",
      symptom: "폴더는 나눴는데 여전히 하나로만 실행된다.",
      cause:
        "폴더 분리는 코드의 자리를 나눈 것일 뿐입니다. 실제로 각각을 별도 서비스로 띄우는 것은 " +
        "compose.yaml 이 합니다.",
      fix: "각 폴더에 Dockerfile 을 두고 compose.yaml 의 services 에 등록한다. (Chapter 07~08)",
      node: "browser",
      edge: "browser-nginx"
    }
  ],

  summary: {
    remember: [
      "폴더 분리는 정리 취향이 아니라 시스템의 역할 분리를 그대로 옮긴 것이다.",
      "frontend/ → 화면, nginx/ → 서비스 입구, backend/ → 요청 처리, database/ → 데이터 저장.",
      "실제 비밀번호가 든 .env는 저장소에 올리지 않고, 이름만 적은 .env.example을 공유한다."
    ],
    points: [
      "폴더 분리는 정리 취향이 아니라 시스템의 역할 분리를 그대로 옮긴 것이다.",
      "frontend/ → Browser, nginx/ → Nginx, backend/ → Flask, database/ → MySQL 로 대응한다.",
      "compose.yaml과 .env.example은 요청 경로가 아니라 실행 환경 쪽이다.",
      "실제 비밀번호는 .gitignore로 제외하고, 이름만 적은 .env.example을 공유한다."
    ],
    keywords: ["frontend/", "backend/", "nginx/", "database/", "compose.yaml", ".env.example"],
    position:
      "요청의 길(Ch01)과 오가는 내용(Ch02)에 이어, 그 일을 하는 코드가 어디에 놓이는지까지 확인했습니다.",
    next:
      "이제 코드가 놓일 자리를 알았습니다. 다음 Chapter에서는 그 코드를 고치기 전에 " +
      "변경 기록을 남기는 방법(Git)을 배웁니다."
  }
};

export default chapter03;
