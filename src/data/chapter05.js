/*
 * Chapter 05 — 22_CHAPTER_CURRICULUM.md 기준
 *   제목      GitHub
 *   핵심 질문  Local Git 기록을 다른 장소와 어떻게 공유할까?
 *   핵심      Local Repository ↔ Remote Repository
 *   Activity  Local commit 을 Push 하여 GitHub Timeline 동기화
 *
 * Legacy Chapter 05 에서 명령 · 출력 · 오류 2건 · summary 를 가져왔다.
 * Legacy 의 터미널 입력형 Activity 는 Chapter 04 와 겹치므로 채택하지 않고,
 * 세 저장소의 커밋 비교로 재설계했다. (CLAUDE.md Reference Chapter Principle)
 *
 * 범위 통제 (20 §5) — branch 전략 · Pull Request · merge 충돌은 다루지 않는다.
 * Curriculum 에 있는 remote / push / clone 과, pull 이 필요해지는 이유까지만 다룬다.
 */
const chapter05 = {
  id: 5,
  title: "내 기록을 인터넷에 공유하기 — GitHub",
  coreQuestion: "내 컴퓨터에 남긴 기록을 다른 컴퓨터와 어떻게 나눌까?",
  placeholder: false,

  intro:
    "Chapter 04에서 남긴 기록은 아직 내 컴퓨터 안에만 있습니다. 컴퓨터가 고장 나면 함께 사라지고, " +
    "다른 사람은 볼 수도 없습니다. GitHub는 그 기록을 인터넷의 같은 저장소에 한 벌 더 두어 " +
    "다른 장소·다른 사람과 잇는 곳입니다.",

  whyItMatters: [
    "내 컴퓨터 안의 기록만으로는 다른 사람과 공유할 수 없습니다. 컴퓨터가 고장 나면 기록도 함께 사라집니다.",
    "GitHub는 같은 기록을 인터넷에 한 벌 더 두어, 다른 장소·다른 사람과 잇는 곳입니다."
  ],

  oneThing: "GitHub는 Git 기록을 인터넷에서 공유하는 곳입니다.",

  objectives: [
    "내 컴퓨터 기록과 GitHub 기록의 차이",
    "기록을 보내는 push",
    "기록을 받아오는 pull / clone"
  ],

  codeIntro:
    "명령을 외우기 전에, 지금 기록이 '어느 컴퓨터에서 어느 컴퓨터로' 가는지만 보면 됩니다.",

  codeFocus: {
    lines: ["git push -u origin main"],
    say:
      "내 컴퓨터의 기록을 GitHub 로 보내는 명령입니다. " +
      "origin 은 GitHub 저장소 주소에 붙인 별명이고, main 은 이 교안에서 쓰는 기본 기록 줄의 이름입니다.",
    path: "터미널 · student-web 폴더에서 실행",
    node: "github"
  },

  architecture: {
    caption:
      "GitHub도 요청이 지나가는 길 위에 있지 않습니다. Chapter 04에서 본 코드 관리 축의 " +
      "오른쪽 끝이 이번 Chapter입니다.",
    highlight: [],
    axisFocus: ["local-git", "github"],
    scopeNote:
      "이번 Chapter의 학습 범위는 Runtime 계층이 아니라 코드 기록을 주고받는 축입니다. " +
      "GitHub에 올린다고 해서 서비스가 실행되지는 않습니다."
  },

  concept: {
    lead:
      "Git과 GitHub는 이름이 비슷하지만 하는 일이 다릅니다. " +
      "기록을 만드는 것은 Git이고, 그 기록을 다른 장소와 나누는 것이 GitHub입니다.",
    roles: [
      {
        role: "내 컴퓨터 안의 기록",
        tech: "Local Repository (Git)",
        node: "local-git",
        desc:
          "Chapter 04에서 만든 .git 폴더입니다. 인터넷이 없어도 커밋할 수 있습니다."
      },
      {
        role: "인터넷에 둔 같은 저장소",
        tech: "Remote Repository (GitHub)",
        node: "github",
        desc:
          "같은 기록을 한 벌 더 보관합니다. 여러 사람이 같은 저장소를 바라보게 만드는 것이 목적입니다."
      },
      {
        role: "기록을 보내고 받는 동작",
        tech: "push / clone / pull",
        desc:
          "push는 내 기록을 원격으로, clone은 원격 저장소를 통째로 처음 받아올 때, " +
          "pull은 이미 받아 둔 저장소에 새 기록만 이어 붙일 때 씁니다."
      }
    ],
    note:
      "GitHub는 코드를 보관하고 공유하는 곳이지 실행하는 곳이 아닙니다. " +
      "실행 환경 문제는 Chapter 06부터 다룹니다."
  },

  /*
   * 설정 파일(YAML 등) 자체를 올리지 말라고 설명하지 않는다.
   * 올리면 안 되는 것은 그 안에 "직접 적은 비밀값"이다. (CLAUDE.md · 개발자 리뷰 §7)
   */
  security: {
    title: "설정 파일은 올려도 됩니다. 그 안의 비밀값이 문제입니다.",
    body: [
      "YAML·설정 파일 자체는 Git에 올려도 됩니다. 다른 사람이 같은 방식으로 실행하려면 오히려 있어야 합니다.",
      "절대 올리면 안 되는 것은 그 파일 안에 직접 적어 둔 비밀번호·키·토큰입니다. " +
        "한 번 올라가면 파일을 지워도 기록에는 남습니다.",
      "실제 값은 GitHub Secrets 같은 비밀값 관리 기능에 넣고, 파일에는 그 값을 불러오는 자리만 남깁니다."
    ],
    safe: {
      label: "자리만 적는다",
      /* 실제 배포 워크플로가 쓰는 참조 방식 그대로다. 값이 아니라 이름만 적는다. */
      code: [
        "# 워크플로 설정 · 값이 아니라 '어디서 가져올지'만 적는다",
        "- uses: FirebaseExtended/action-hosting-deploy@v0",
        "  with:",
        "    repoToken: ${{ secrets.GITHUB_TOKEN }}",
        "    firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_<PROJECT> }}",
        "",
        "# 이 프로젝트의 compose.yaml 도 같은 방식이다",
        "MYSQL_PASSWORD: ${MYSQL_PASSWORD}"
      ].join("\n"),
      note:
        "이 파일은 저장소에 올라가도 됩니다. ${{ secrets.… }} 는 값이 아니라 " +
        "\"저장해 둔 비밀값을 이름으로 불러온다\"는 표시이기 때문입니다."
    },
    unsafe: {
      label: "값을 그대로 적는다",
      code: [
        "# 이렇게 적으면 저장소에 비밀값이 그대로 남는다",
        "private_key: \"-----BEGIN PRIVATE KEY-----...\"",
        "password: \"실제 비밀번호\"",
        "token: \"실제 토큰\"",
        "API_KEY: \"실제 비밀키\""
      ].join("\n"),
      note: "지워도 기록에 남습니다. 이미 올렸다면 그 값 자체를 즉시 바꿔야 합니다."
    },
    foot:
      "정리하면 — 설정 파일은 공유하고, 비밀값은 분리합니다. " +
      "이 교안에서는 .env.example만 올리고 실제 값이 든 .env는 올리지 않는 것이 같은 원칙입니다."
  },

  code: [
    {
      id: "gh-first",
      name: "처음 올릴 때",
      path: "터미널 · student-web 폴더에서 실행",
      lang: "bash",
      desc: "원격 저장소 주소를 등록하고 기록을 처음 올린다.",
      lines: [
        { t: "git remote add origin <REPOSITORY_URL>   # 원격 주소를 origin 으로 등록", node: null },
        { t: "git remote -v                            # 등록된 주소 확인", node: null },
        { t: "git branch -M main                       # 줄기 이름을 main 으로 맞춤", node: null },
        { t: "git push -u origin main                  # 기록 올리기 + 기본 대상 기억", node: null }
      ]
    },
    {
      id: "gh-share",
      name: "다른 컴퓨터에서",
      path: "터미널 · 코드를 처음 받거나 새 기록을 받아올 때",
      lang: "bash",
      desc: "clone 은 처음 한 번, pull 은 그 뒤로 계속 쓴다.",
      lines: [
        { t: "git clone <REPOSITORY_URL>   # 저장소를 통째로 받아 온다 (처음 한 번)", node: null },
        { t: "cd student-web", node: null },
        { t: "", node: null },
        { t: "git pull                     # 원격에 새로 올라온 기록만 받아 온다", node: null }
      ]
    }
  ],

  activity: {
    type: "remote",
    title: "기록을 공유하고 다시 받아 오기",
    cta: "한 단계씩 따라 해 보기",
    guide:
      "한 번에 하나씩만 합니다. 지금 할 일이 위에 하나만 표시되고, " +
      "누를 때마다 기록이 어느 컴퓨터에서 어느 컴퓨터로 갔는지 화살표와 글자로 함께 나타납니다."
  },

  errors: [
    {
      id: "e5-uptodate",
      code: "Everything up-to-date",
      title: "push했는데 아무 일도 일어나지 않는다",
      symptom: "git push를 실행하면 Everything up-to-date만 나오고 GitHub가 그대로다.",
      cause: "올릴 새 커밋이 없다. 파일을 고치기만 하고 commit을 하지 않은 경우가 가장 흔하다.",
      fix: "git status로 확인하고 git add · git commit을 먼저 실행한 뒤 다시 push한다.",
      node: null,
      edge: null
    },
    {
      id: "e5-rejected",
      code: "rejected (fetch first)",
      title: "push가 거부됐다",
      symptom: "! [rejected] main -> main (fetch first) 메시지와 함께 실패한다.",
      cause: "원격에 내가 갖고 있지 않은 커밋이 있다. 다른 사람이 먼저 올렸거나 다른 컴퓨터에서 올린 경우다.",
      fix: "git pull로 원격 기록을 먼저 받아 온 뒤 다시 push한다. --force는 남의 기록을 지울 수 있어 기본 흐름에서 쓰지 않는다.",
      node: null,
      edge: null
    },
    {
      id: "e5-secret",
      code: ".env가 올라감",
      title: "비밀번호 파일이 원격 저장소에 올라갔다",
      symptom: "GitHub 저장소에서 .env 파일이 보인다.",
      cause: ".gitignore에 .env가 없었거나, 이미 추적 중인 상태에서 커밋됐다.",
      fix:
        "지우는 것만으로는 기록에 남습니다. 그 비밀번호 값 자체를 즉시 바꾸고, " +
        ".gitignore에 .env를 넣은 뒤 .env.example만 공유합니다.",
      node: null,
      edge: null
    }
  ],

  summary: {
    remember: [
      "Git은 내 컴퓨터에 기록을 만들고, GitHub는 그 기록을 인터넷에서 공유한다.",
      "push는 내 컴퓨터 → GitHub, pull은 GitHub → 내 컴퓨터 방향이다.",
      "GitHub는 코드를 보관·공유할 뿐 실행하지 않는다."
    ],
    points: [
      "Git은 내 컴퓨터의 기록을 만들고, GitHub는 그 기록을 다른 장소와 잇는다.",
      "push는 내 컴퓨터 → 원격, pull은 원격 → 내 컴퓨터 방향이다.",
      "clone은 저장소를 처음 통째로 받아 올 때 한 번 쓴다.",
      "원격이 나보다 앞서 있으면 pull로 먼저 맞춘 뒤 push한다.",
      "GitHub는 코드를 보관·공유할 뿐 실행하지 않는다."
    ],
    keywords: ["git remote add", "git push", "git clone", "git pull", "origin", "main"],
    position:
      "코드 관리 축(Local Git ↔ GitHub)을 끝냈습니다. 요청이 지나가는 길은 아직 Chapter 01~02에서 본 상태 그대로입니다.",
    next:
      "코드를 받아도 컴퓨터마다 설치된 것이 달라 실행 결과가 달라집니다. " +
      "다음 Chapter에서는 실행 환경을 통일하는 방법을 배웁니다."
  }
};

export default chapter05;
