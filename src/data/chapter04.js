/*
 * Chapter 04 — 22_CHAPTER_CURRICULUM.md 기준
 *   제목      Git
 *   핵심 질문  코드를 망치기 전에 변경 기록을 어떻게 남길까?
 *   핵심      Working Directory → git add → Staging → git commit → History
 *   Activity  파일 변경 → Stage → Commit 이동
 *   대표 오해  git add 는 GitHub 로 보내는 명령이 아니다
 *
 * Legacy(docs/reference/LEGACY_COURSE_CONTENT.html) Chapter 04 에서
 *   명령 · 출력 · 설명 · 오류 2건 · summary 를 가져와 현재 구조에 맞게 옮겼다.
 *   가짜 터미널 입력 방식은 채택하지 않았다. (CLAUDE.md Hard Rules)
 *
 * 범위 통제 (20 §5) — branch · merge · rebase · reflog 는 다루지 않는다.
 * push / clone 은 Chapter 05 범위다.
 */
const chapter04 = {
  id: 4,
  title: "코드 변경 기록 남기기 — Git",
  coreQuestion: "코드를 망치기 전에 변경 기록을 어떻게 남길까?",
  placeholder: false,

  intro:
    "Chapter 03에서 코드를 담을 폴더를 만들었습니다. 이제 그 코드를 고치기 시작하면 " +
    "곧 이런 순간이 옵니다 — \"어제까지는 됐는데 지금은 안 된다.\" " +
    "Git은 언제 무엇을 바꿨는지 내 컴퓨터에 기록해 두어, 잘못 고쳐도 되돌릴 수 있게 합니다.",

  whyItMatters: [
    "코드를 고쳤다가 망치면 이전 상태로 돌아가고 싶을 때가 옵니다. \"어제까지는 됐는데 지금은 안 된다\"는 순간입니다.",
    "Git은 코드가 언제 어떻게 바뀌었는지 내 컴퓨터에 기록으로 남겨 줍니다."
  ],

  oneThing: "Git은 변경을 기록으로 남깁니다.",

  objectives: [
    "파일이 지나가는 세 자리 — 작업 폴더 · 골라 둔 곳 · 기록",
    "골라 두는 git add, 확정하는 git commit",
    "git add는 GitHub로 보내는 것이 아니라는 점"
  ],

  codeIntro:
    "명령을 외우지 않아도 됩니다. 아래 한 줄이 무엇을 하는지만 알면 나머지는 순서일 뿐입니다.",

  codeFocus: {
    lines: ['git commit -m "fix: 점수 조회 오류 수정"'],
    say:
      "골라 둔 변경을 하나의 기록으로 확정하는 명령입니다. " +
      "따옴표 안에는 무엇을 고쳤는지 적습니다. 이 기록은 내 컴퓨터 안에만 남습니다.",
    path: "터미널 · student-web 폴더에서 실행"
  },

  /*
   * 이번 Chapter 는 요청이 지나가는 길이 아니라 코드 관리 축을 배운다.
   * Runtime Node 를 지우지 않고 전부 muted 로 두고, DEVELOPMENT 축을 focus 로 표시한다.
   */
  architecture: {
    caption:
      "Git은 요청이 지나가는 길 위에 있지 않습니다. 아래 Runtime 구조는 그대로 두고, " +
      "이번에는 코드 관리 축을 봅니다.",
    highlight: [],
    axisFocus: ["local-git"],
    scopeNote:
      "이번 Chapter의 학습 범위는 Runtime 계층이 아니라 코드 변경을 기록하는 축입니다. " +
      "Git 명령은 실행 중인 서비스에 아무 영향을 주지 않습니다."
  },

  concept: {
    lead:
      "Git을 쓰면 파일이 세 자리를 지나갑니다. 이 세 자리를 구분하는 것이 Git 이해의 전부라고 해도 됩니다. " +
      "명령 이름보다 '지금 이 파일이 어느 자리에 있는가'를 먼저 봅니다.",
    roles: [
      {
        role: "지금 고치고 있는 곳",
        tech: "Working Directory (작업 폴더)",
        desc:
          "편집기에서 파일을 고치면 여기에 있습니다. 저장만 해서는 Git에 아무것도 남지 않습니다."
      },
      {
        role: "이번 기록에 넣을 것을 골라 두는 곳",
        tech: "Staging Area (스테이징)",
        desc:
          "git add로 파일을 여기에 올립니다. 고친 것 전부가 아니라 이번에 기록할 것만 고를 수 있습니다. " +
          "아직 확정된 기록은 아닙니다."
      },
      {
        role: "확정된 기록이 쌓이는 곳",
        tech: "History (Local Repository)",
        node: "local-git",
        desc:
          "git commit을 하면 스테이징에 있던 것이 하나의 기록으로 확정됩니다. " +
          "이 기록은 내 컴퓨터 안에 남습니다."
      }
    ],
    note:
      "여기까지가 전부 내 컴퓨터 안에서 일어납니다. 인터넷이 끊겨 있어도 동작합니다. " +
      "이 기록을 다른 곳과 나누는 일(GitHub)은 Chapter 05에서 다룹니다."
  },

  code: [
    {
      id: "git-basic",
      name: "기록 남기기",
      path: "터미널 · student-web 폴더에서 실행",
      lang: "bash",
      desc: "고친 내용을 골라 하나의 기록으로 묶는 기본 흐름이다.",
      lines: [
        { t: "git init                                   # 이 폴더에서 기록 시작", node: null },
        { t: "git status                                 # 무엇이 바뀌었는지 확인만", node: null },
        { t: "git add backend/app.py                     # 이번 기록에 넣을 파일 고르기", node: null },
        { t: 'git commit -m "fix: 점수 조회 오류 수정"     # 하나의 기록으로 확정', node: null },
        { t: "git log --oneline                          # 남은 기록 확인", node: null }
      ]
    },
    {
      id: "git-undo",
      name: "고르기 취소",
      path: "터미널 · 실수로 골랐을 때",
      lang: "bash",
      desc: "스테이징에서 빼는 것뿐이라 파일 내용은 그대로 남는다.",
      lines: [
        { t: "git status                                 # 무엇이 올라가 있는지 먼저 확인", node: null },
        { t: "git restore --staged .env                  # 스테이징에서만 내린다", node: null },
        { t: "", node: null },
        { t: "# 파일 내용을 되돌리는 명령은 되돌릴 수 없는 경우가 있어", node: null },
        { t: "# 이 교안의 기본 흐름에서는 사용하지 않습니다.", node: null }
      ]
    }
  ],

  activity: {
    type: "git",
    title: "고친 내용을 기록으로 남기기",
    cta: "명령을 직접 입력해 보기",
    guide:
      "아래 입력칸에 Git 명령을 직접 쳐 보세요. 오타나 순서가 틀린 명령에도 " +
      "무엇이 잘못됐는지 함께 알려 줍니다.",

    /* Beginner Safety — 실제 Git 프로세스를 실행하지 않는다는 점을 먼저 알린다.
       (25_COURSE_QA §5 · CLAUDE.md Hard Rules — 가짜 Terminal 금지)
       다만 Activity 에서 가장 큰 시각 요소가 되지 않도록 compact note 로만 둔다. */
    simTitle: "Git 명령 연습 시뮬레이터",
    simNote:
      "실제 Git을 실행하지 않습니다. 입력한 명령에 따른 Git 상태 변화를 연습합니다.",
    simHint:
      "화면에 보이는 명령은 실제로 쓰는 명령 그대로입니다. 복사해서 내 터미널에 붙여 넣으면 실제로 실행할 수 있습니다.",

    /*
     * 한 번에 하나씩만 제시하는 학습 목표.
     * 정답 명령을 처음부터 보여 주지 않는다 — hints 는 Progressive Disclosure 로,
     *   0 무엇을 하는 명령인지 → 1 앞글자 → 2 전체 명령
     * 순서로만 열린다. 도움말을 한 번도 열지 않고도 이 힌트만으로 흐름을 마칠 수 있어야 한다.
     *
     * id 는 Activity 가 상태에서 완료 여부를 판단하는 키다. 상태 엔진은 바뀌지 않는다.
     *   init   .git 폴더가 만들어졌는가
     *   add    스테이징에 올라간 것이 있었는가
     *   commit 확정된 기록이 있는가
     *   log    기록을 확인했는가
     */
    goals: [
      {
        id: "init",
        task: "이 폴더에서 Git 기록을 시작해 보세요.",
        hints: [
          "지금 폴더에 변경 기록을 남길 준비를 하는 명령입니다. 숨김 폴더 .git 이 만들어집니다.",
          "git i…",
          "git init"
        ]
      },
      {
        id: "add",
        task: "고친 파일 중 이번 기록에 넣을 것을 골라 보세요.",
        hints: [
          "작업 폴더에 있는 파일을 스테이징으로 옮기는 명령입니다. 파일 경로를 함께 적습니다.",
          "git a… backend/app.py",
          "git add backend/app.py"
        ]
      },
      {
        id: "commit",
        task: "골라 둔 파일을 하나의 기록으로 확정해 보세요.",
        hints: [
          "스테이징에 있는 것을 기록으로 확정하는 명령입니다. -m 뒤 따옴표 안에 무엇을 고쳤는지 적습니다.",
          'git c… -m "…"',
          'git commit -m "fix: 점수 조회 오류 수정"'
        ]
      },
      {
        id: "log",
        task: "남은 기록을 확인해 보세요.",
        hints: [
          "확정된 기록이 순서대로 쌓였는지 확인하는 명령입니다.",
          "git l…",
          "git log"
        ]
      }
    ],
    goalTip: "막히면 git status 로 지금 상태를 언제든 확인할 수 있습니다.",
    goalDone: "네 단계를 모두 마쳤습니다. 아래 결과를 확인하세요."
  },

  errors: [
    {
      id: "e4-nothing",
      code: "nothing to commit",
      title: "고치기는 했는데 커밋할 것이 없다고 나온다",
      symptom: "git commit 을 실행하면 커밋할 것이 없다는 메시지가 나온다.",
      cause: "바뀐 내용을 git add 로 고르지 않아 스테이징이 비어 있다.",
      fix: "git status 로 변경된 파일을 확인하고 git add 를 먼저 실행한다.",
      node: null,
      edge: null
    },
    {
      id: "e4-env",
      code: "실수로 .env 를 add 함",
      title: "비밀번호 파일이 기록에 포함되려 한다",
      symptom: "git status 에 .env 가 커밋 대상으로 올라와 있다.",
      cause: ".gitignore 에 .env 가 없거나, 이미 추적 중인 상태에서 고쳤다.",
      fix:
        "git restore --staged .env 로 스테이징에서 내리고 .gitignore 에 .env 를 추가한다. " +
        "이미 올라간 비밀번호는 값 자체를 바꾼다.",
      node: null,
      edge: null
    },
    {
      id: "e4-typo",
      code: "is not a git command",
      title: "명령 이름을 잘못 적었다",
      symptom: "git stats 처럼 적으면 git 명령이 아니라는 메시지가 나온다.",
      cause: "Git 은 정해진 명령 이름만 알아듣습니다. 한 글자만 달라도 실행되지 않습니다.",
      fix:
        "메시지에 함께 나오는 The most similar command 를 보고 철자를 고칩니다. " +
        "명령이 실행되지 않은 것이므로 상태는 아무것도 바뀌지 않습니다.",
      node: null,
      edge: null
    },
    {
      id: "e4-push",
      code: "커밋했는데 GitHub에 안 보인다",
      title: "커밋과 업로드를 같은 것으로 생각하는 오해",
      symptom: "commit 을 했는데 GitHub 저장소에는 아무 변화가 없다.",
      cause:
        "commit 은 내 컴퓨터 안에 기록을 확정하는 것까지입니다. 원격 저장소로 보내는 동작은 별도입니다.",
      fix: "내 컴퓨터 밖으로 보내는 방법은 Chapter 05에서 배웁니다.",
      node: null,
      edge: null
    }
  ],

  summary: {
    remember: [
      "Git은 코드의 변경 기록을 내 컴퓨터에 남긴다.",
      "add는 기록할 것을 고르고, commit은 기록으로 확정한다.",
      "GitHub로 보내는 것은 다음 Chapter에서 본다."
    ],
    points: [
      "고친 내용은 작업 폴더 → git add → 스테이징 → git commit → 기록 순서로 확정된다.",
      "git status는 확인만 하고 아무것도 옮기지 않는다.",
      "git add는 '이번 기록에 넣을 것 고르기'이지 업로드가 아니다.",
      "잘못 골랐다면 git restore --staged로 스테이징에서만 내릴 수 있고, 고친 내용은 그대로 남는다.",
      "커밋한 기록은 내 컴퓨터 안에만 있고, 인터넷 없이도 동작한다."
    ],
    keywords: [
      "git init", "git status", "git add", "git commit -m",
      "git log", "git restore --staged", ".gitignore"
    ],
    position:
      "요청이 지나가는 길(Ch01~02)과 코드가 놓이는 자리(Ch03)를 본 뒤, 이제 코드 관리 축의 왼쪽인 Local Git까지 왔습니다.",
    next:
      "기록은 남겼지만 아직 내 컴퓨터 안에만 있습니다. 컴퓨터가 고장 나면 함께 사라지고, " +
      "다른 사람과 나눌 수도 없습니다. 다음 Chapter에서는 이 기록을 원격 저장소로 보내는 방법을 배웁니다."
  }
};

export default chapter04;
