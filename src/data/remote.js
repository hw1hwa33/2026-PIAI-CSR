/*
 * Chapter 05 — Local Repository ↔ Remote Repository.
 *
 * Legacy(docs/reference/LEGACY_COURSE_CONTENT.html) Chapter 05 에서
 *   명령(remote add · remote -v · branch -M · push -u · clone) · 출력 · 오류 2건 · summary 를 가져왔다.
 * Legacy 는 Chapter 04 와 같은 터미널 입력형이었으나, 그대로 쓰면 Chapter 04 의 복제가 된다.
 * 여기서는 "명령을 어떻게 치는가"가 아니라 "기록이 어느 저장소에 있는가"를 본다.
 *
 * 24_TECHNICAL_CONTENT_RULES §4 — Git 은 Local, GitHub 는 Remote hosting.
 * GitHub 는 Runtime Request 경로가 아니다. (CLAUDE.md Hard Rules)
 */

export const REPO_URL = "https://github.com/<사용자>/student-web.git";

/* 세 저장소. 같은 기록이 어디에 있고 어디에 없는지를 비교하는 것이 이 Chapter 의 전부다. */
export const PLACES = [
  {
    id: "local",
    name: "내 컴퓨터",
    tech: "Local Repository",
    desc: "Chapter 04에서 남긴 기록이 있는 곳",
    node: "local-git"
  },
  {
    id: "github",
    name: "GitHub",
    tech: "Remote Repository",
    desc: "인터넷에 있는 같은 저장소",
    node: "github"
  },
  {
    id: "other",
    name: "다른 컴퓨터",
    tech: "Local Repository",
    desc: "같이 작업하는 사람의 컴퓨터",
    node: "local-git"
  }
];

/* Chapter 04 에서 만든 기록을 그대로 이어받는다. 해시는 학습용 고정 예시 값이다. */
export const BASE_COMMITS = [
  { hash: "a1b2c3d", message: "fix: 점수 조회 오류 수정" },
  { hash: "b4d5e6f", message: "feat: 조회 버튼 문구 수정" }
];

export const TEAM_COMMIT = { hash: "e9f0a1b", message: "docs: README 실행 방법 보완" };

export const INITIAL = {
  remote: false,      // origin 을 등록했는가
  local: BASE_COMMITS,
  github: [],
  other: null,        // null = 아직 코드를 받지 않았다
  done: {}            // push / clone / pull 을 거쳤는가
};

/*
 * 사용자가 고르는 동작.
 * where 는 이 명령을 어느 컴퓨터에서 치는지다 — 같은 명령도 어디서 치느냐에 따라 방향이 다르다.
 */
/*
 * Guided Flow (CLAUDE.md §12)
 * 여섯 동작을 처음부터 동시에 보여 주지 않는다. 지금 할 일 하나만 Primary 로 두고
 * 나머지는 접어 둔다. 순서는 실제 협업에서 일어나는 순서 그대로다.
 *
 *   1 GitHub 저장소 주소 연결
 *   2 내 기록 올리기
 *   3 다른 컴퓨터에서 처음 받기
 *   4 다른 컴퓨터에서 새 기록 만들기
 *   5 GitHub 에 올리기
 *   6 내 컴퓨터에서 새 기록 받아오기
 */
export const GUIDE = [
  {
    id: "remote",
    task: "GitHub 저장소 주소를 내 저장소에 연결하세요.",
    why: "보낼 곳을 모르면 아무것도 올릴 수 없습니다. 먼저 주소부터 등록합니다.",
    dir: "방향 없음 · 주소만 등록"
  },
  {
    id: "push",
    task: "내 컴퓨터의 기록을 GitHub 로 올리세요.",
    why: "같은 기록이 두 곳에 생깁니다. 내 컴퓨터가 고장 나도 GitHub 에 남습니다.",
    dir: "내 컴퓨터 → GitHub"
  },
  {
    id: "clone",
    task: "다른 컴퓨터에서 저장소를 처음 받아 오세요.",
    why: "처음 받을 때는 폴더 자체가 없으므로 저장소를 통째로 만듭니다.",
    dir: "GitHub → 다른 컴퓨터"
  },
  {
    id: "team",
    task: "다른 컴퓨터에서 파일을 고치고 기록을 하나 남기세요.",
    why: "다른 사람이 먼저 작업한 상황을 만듭니다. 아직 그 컴퓨터 안에만 있습니다.",
    dir: "다른 컴퓨터 안에서만"
  },
  {
    id: "team-push",
    task: "그 기록을 GitHub 로 올리세요.",
    why: "이제 GitHub 가 내 컴퓨터보다 앞서게 됩니다.",
    dir: "다른 컴퓨터 → GitHub"
  },
  {
    id: "pull",
    task: "내 컴퓨터로 새 기록을 받아 오세요.",
    why: "이미 저장소가 있으므로 clone 이 아니라 새 기록만 이어 붙입니다.",
    dir: "GitHub → 내 컴퓨터"
  }
];

/* 이 동작이 실제로 상태를 바꾸면 다음 단계로 넘어간다 */
export const GUIDE_ORDER = GUIDE.map((g) => g.id);

export const getGuide = (id) => GUIDE.find((g) => g.id === id) || null;

/* 초보자가 가장 자주 막히는 두 단어 — 기본 화면에서 먼저 풀어 준다 */
export const NAME_NOTES = [
  {
    name: "origin",
    role: "GitHub 저장소 주소에 붙인 별명",
    desc: "긴 주소를 매번 적지 않으려고 붙여 둔 이름입니다. 다른 이름으로 바꿔도 동작합니다."
  },
  {
    name: "main",
    role: "이 교안에서 사용하는 기본 기록 줄",
    desc: "커밋이 순서대로 쌓이는 한 줄의 이름입니다. 이 교안에서는 이 한 줄만 사용합니다."
  }
];

export const ACTIONS = [
  {
    id: "remote",
    label: "원격 저장소 연결하기",
    cmd: `git remote add origin ${REPO_URL}`,
    where: "local",
    desc: "내 저장소에 원격 저장소 주소를 origin 이라는 이름으로 등록한다."
  },
  {
    id: "push",
    label: "내 기록 올리기",
    cmd: "git push -u origin main",
    where: "local",
    arrow: { from: "local", to: "github", label: "push" },
    desc: "내 컴퓨터의 커밋을 GitHub 로 보낸다."
  },
  {
    id: "clone",
    label: "다른 컴퓨터에서 받기",
    cmd: `git clone ${REPO_URL}`,
    where: "other",
    arrow: { from: "github", to: "other", label: "clone" },
    desc: "GitHub 의 코드와 기록을 통째로 내려받아 저장소를 새로 만든다."
  },
  {
    id: "team",
    label: "다른 컴퓨터에서 고치고 커밋",
    cmd: 'git commit -m "docs: README 실행 방법 보완"',
    where: "other",
    desc: "같이 작업하는 사람이 자기 컴퓨터에서 기록을 하나 더 남긴다."
  },
  {
    id: "team-push",
    label: "다른 컴퓨터에서 올리기",
    cmd: "git push",
    where: "other",
    arrow: { from: "other", to: "github", label: "push" },
    desc: "그 기록을 GitHub 로 보낸다. 이제 GitHub 가 내 컴퓨터보다 앞서 있다."
  },
  {
    id: "pull",
    label: "내 컴퓨터로 받아오기",
    cmd: "git pull",
    where: "local",
    arrow: { from: "github", to: "local", label: "pull" },
    desc: "GitHub 에 새로 올라온 기록을 내 컴퓨터로 가져온다."
  }
];

export const getAction = (id) => ACTIONS.find((a) => a.id === id) || null;

const same = (a, b) =>
  !!a && !!b && a.length === b.length && a.every((c, i) => c.hash === b[i].hash);

/* 두 저장소를 비교해 "같다 / 앞선다 / 뒤처진다"를 계산한다 — 색이 아니라 글자로 표시한다. */
export function syncLabel(state, id) {
  if (id === "github") {
    if (!state.remote) return "아직 연결되지 않음";
    if (!state.github.length) return "비어 있음";
    if (same(state.github, state.local)) return "내 컴퓨터와 같음";
    return state.github.length > state.local.length ? "내 컴퓨터보다 앞섬" : "내 컴퓨터보다 뒤처짐";
  }
  if (id === "other") {
    if (!state.other) return "아직 저장소 없음";
    if (same(state.other, state.github)) return "GitHub와 같음";
    return "GitHub와 다름";
  }
  if (!state.github.length) return "아직 공유되지 않음";
  return same(state.local, state.github) ? "GitHub와 같음" : "GitHub와 다름";
}

/* ---------------- 동작 실행 ----------------
   반환 = { kind, title, output, detail, rows, next, arrow }
   kind : ok(상태 변화) · info(변화 없음) · error(실제 Git 도 거부) · note(순서가 아직 아님) */
export function runAction(state, id) {
  const action = getAction(id);
  if (!action) return null;
  const base = { cmd: action.cmd, where: action.where, arrow: action.arrow || null };

  if (id === "remote") {
    if (state.remote) {
      return {
        ...base,
        kind: "error",
        title: "이미 등록되어 있다",
        output: "error: remote origin already exists.",
        detail: "origin 이라는 이름은 이미 쓰이고 있습니다. 주소를 바꾸려면 git remote set-url 을 씁니다.",
        rows: [["원격 이름", "origin"], ["주소", REPO_URL]]
      };
    }
    return {
      ...base,
      kind: "ok",
      title: "원격 저장소를 연결했다",
      output: "(출력 없음 — 성공하면 아무 메시지도 나오지 않습니다)",
      detail:
        "주소만 등록했을 뿐 아직 아무것도 올라가지 않았습니다. " +
        "origin 은 원격 저장소에 붙이는 기본 이름이고, 바꿀 수도 있습니다.",
      rows: [
        ["원격 이름", "origin"],
        ["주소", REPO_URL],
        ["GitHub 커밋", "0개 (아직 올린 것 없음)"]
      ],
      next: { remote: true }
    };
  }

  if (id === "push") {
    if (!state.remote) {
      return {
        ...base,
        kind: "error",
        title: "보낼 곳을 모른다",
        output: "fatal: No configured push destination.",
        detail: "원격 저장소 주소를 먼저 등록해야 합니다. git remote add origin <주소> 를 먼저 실행합니다.",
        rows: [["원격 이름", "없음"]]
      };
    }
    if (state.github.length > state.local.length) {
      return {
        ...base,
        kind: "error",
        title: "원격에 내가 모르는 기록이 있다",
        output:
          "To " + REPO_URL + "\n" +
          " ! [rejected]        main -> main (fetch first)\n" +
          "error: failed to push some refs",
        detail:
          "GitHub 에 내가 갖고 있지 않은 커밋이 있습니다. 그대로 올리면 그 기록이 지워지므로 Git 이 거부합니다. " +
          "git pull 로 먼저 받아 온 뒤 다시 올립니다.",
        rows: [
          ["내 컴퓨터 커밋", `${state.local.length}개`],
          ["GitHub 커밋", `${state.github.length}개`],
          ["다음에 할 일", "git pull"]
        ]
      };
    }
    if (same(state.local, state.github)) {
      return {
        ...base,
        kind: "info",
        title: "올릴 것이 없다",
        output: "Everything up-to-date",
        detail:
          "새로 만든 커밋이 없으면 push 는 아무 일도 하지 않습니다. " +
          "먼저 git commit 으로 기록을 만들어야 올릴 것이 생깁니다.",
        rows: [["내 컴퓨터 커밋", `${state.local.length}개`], ["GitHub 커밋", `${state.github.length}개`]]
      };
    }
    return {
      ...base,
      kind: "ok",
      title: "기록이 GitHub 로 올라갔다",
      output:
        "Enumerating objects: 12, done.\n" +
        "Writing objects: 100% (12/12), 1.84 KiB, done.\n" +
        "To " + REPO_URL + "\n" +
        " * [new branch]      main -> main\n" +
        "branch 'main' set up to track 'origin/main'.",
      detail:
        "이제 같은 기록이 두 곳에 있습니다. 내 컴퓨터가 고장 나도 GitHub 에 남습니다. " +
        "-u 는 다음부터 git push 만 쳐도 되도록 기본 대상을 기억시키는 옵션입니다.",
      rows: [
        ["보낸 방향", "내 컴퓨터 → GitHub"],
        ["내 컴퓨터 커밋", `${state.local.length}개`],
        ["GitHub 커밋", `${state.local.length}개`],
        ["추적 설정", "main → origin/main"]
      ],
      next: { github: state.local.slice(), done: "push" }
    };
  }

  if (id === "clone") {
    if (!state.github.length) {
      return {
        ...base,
        kind: "error",
        title: "받아올 것이 없다",
        output: "warning: You appear to have cloned an empty repository.",
        detail: "GitHub 저장소가 비어 있습니다. 먼저 내 컴퓨터에서 push 로 기록을 올려야 합니다.",
        rows: [["GitHub 커밋", "0개"]]
      };
    }
    if (state.other) {
      return {
        ...base,
        kind: "error",
        title: "이미 폴더가 있다",
        output: "fatal: destination path 'student-web' already exists and is not an empty directory.",
        detail: "이미 받아 둔 폴더가 있습니다. 새 기록을 가져오려면 clone 이 아니라 git pull 을 씁니다.",
        rows: [["다른 컴퓨터 커밋", `${state.other.length}개`]]
      };
    }
    return {
      ...base,
      kind: "ok",
      title: "다른 컴퓨터가 코드와 기록을 받았다",
      output:
        "Cloning into 'student-web'...\n" +
        "remote: Enumerating objects: 12, done.\n" +
        "Receiving objects: 100% (12/12), done.",
      detail:
        "clone 은 파일만 내려받는 것이 아니라 커밋 기록까지 통째로 가져옵니다. " +
        "받은 폴더는 그 자체로 완전한 Local Repository 가 됩니다.",
      rows: [
        ["보낸 방향", "GitHub → 다른 컴퓨터"],
        ["받은 것", "소스 코드 + 커밋 기록"],
        ["다른 컴퓨터 커밋", `${state.github.length}개`]
      ],
      next: { other: state.github.slice(), done: "clone" }
    };
  }

  if (id === "team") {
    if (!state.other) {
      return {
        ...base,
        kind: "note",
        title: "아직 그 컴퓨터에는 코드가 없다",
        output: "(이 단계는 아직 실행할 수 없습니다)",
        detail: "먼저 다른 컴퓨터가 git clone 으로 저장소를 받아야 거기서 작업할 수 있습니다.",
        rows: [["다른 컴퓨터", "저장소 없음"]]
      };
    }
    if (state.other.some((c) => c.hash === TEAM_COMMIT.hash)) {
      return {
        ...base,
        kind: "info",
        title: "이미 만든 기록이다",
        output: "nothing to commit, working tree clean",
        detail: "그 컴퓨터에는 더 고친 내용이 없습니다.",
        rows: [["다른 컴퓨터 커밋", `${state.other.length}개`]]
      };
    }
    return {
      ...base,
      kind: "ok",
      title: "다른 컴퓨터에 새 기록이 생겼다",
      output:
        `[main ${TEAM_COMMIT.hash}] ${TEAM_COMMIT.message}\n` +
        " 1 file changed, 4 insertions(+)",
      detail:
        "이 기록은 아직 그 컴퓨터 안에만 있습니다. GitHub 에도, 내 컴퓨터에도 없습니다. " +
        "Chapter 04에서 본 것과 똑같은 일이 다른 사람의 컴퓨터에서 일어난 것뿐입니다.",
      rows: [
        ["다른 컴퓨터 커밋", `${state.other.length + 1}개`],
        ["GitHub 커밋", `${state.github.length}개`],
        ["내 컴퓨터 커밋", `${state.local.length}개`]
      ],
      next: { other: [...state.other, TEAM_COMMIT] }
    };
  }

  if (id === "team-push") {
    if (!state.other) {
      return {
        ...base,
        kind: "note",
        title: "아직 그 컴퓨터에는 저장소가 없다",
        output: "(이 단계는 아직 실행할 수 없습니다)",
        detail: "먼저 git clone 으로 저장소를 받아야 합니다.",
        rows: [["다른 컴퓨터", "저장소 없음"]]
      };
    }
    if (same(state.other, state.github)) {
      return {
        ...base,
        kind: "info",
        title: "올릴 것이 없다",
        output: "Everything up-to-date",
        detail: "그 컴퓨터에 새로 만든 커밋이 없습니다.",
        rows: [["다른 컴퓨터 커밋", `${state.other.length}개`], ["GitHub 커밋", `${state.github.length}개`]]
      };
    }
    return {
      ...base,
      kind: "ok",
      title: "GitHub 가 내 컴퓨터보다 앞서게 됐다",
      output:
        "Enumerating objects: 5, done.\n" +
        "To " + REPO_URL + "\n" +
        `   ${state.github[state.github.length - 1].hash}..${TEAM_COMMIT.hash}  main -> main`,
      detail:
        "이제 GitHub 에는 내 컴퓨터에 없는 커밋이 있습니다. " +
        "이 상태에서 내가 그냥 push 하면 Git 이 거부합니다.",
      rows: [
        ["보낸 방향", "다른 컴퓨터 → GitHub"],
        ["GitHub 커밋", `${state.other.length}개`],
        ["내 컴퓨터 커밋", `${state.local.length}개 (뒤처짐)`]
      ],
      next: { github: state.other.slice() }
    };
  }

  if (id === "pull") {
    if (!state.remote) {
      return {
        ...base,
        kind: "error",
        title: "받아올 곳을 모른다",
        output: "fatal: no remote repository specified.",
        detail: "원격 저장소를 먼저 등록해야 합니다.",
        rows: [["원격 이름", "없음"]]
      };
    }
    if (same(state.local, state.github)) {
      return {
        ...base,
        kind: "info",
        title: "받아올 것이 없다",
        output: "Already up to date.",
        detail: "GitHub 에 내가 갖고 있지 않은 커밋이 없습니다.",
        rows: [["내 컴퓨터 커밋", `${state.local.length}개`], ["GitHub 커밋", `${state.github.length}개`]]
      };
    }
    return {
      ...base,
      kind: "ok",
      title: "다른 사람의 기록이 내 컴퓨터로 들어왔다",
      output:
        "remote: Enumerating objects: 5, done.\n" +
        "Updating " + state.local[state.local.length - 1].hash + ".." + TEAM_COMMIT.hash + "\n" +
        "Fast-forward\n README.md | 4 ++++",
      detail:
        "pull 은 원격의 새 기록을 받아 내 기록 뒤에 이어 붙입니다. " +
        "세 저장소의 기록이 다시 같아졌습니다.",
      rows: [
        ["보낸 방향", "GitHub → 내 컴퓨터"],
        ["내 컴퓨터 커밋", `${state.github.length}개`],
        ["GitHub 커밋", `${state.github.length}개`],
        ["다른 컴퓨터 커밋", `${(state.other || []).length}개`]
      ],
      next: { local: state.github.slice(), done: "pull" }
    };
  }

  return null;
}

export default ACTIONS;
