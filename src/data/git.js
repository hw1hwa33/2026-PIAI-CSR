/*
 * Chapter 04 — Git 실습 데이터.
 *
 * docs/reference/LEGACY_COURSE_CONTENT.html 의 Chapter 04(kind:"terminal") 에서
 * 명령 · 출력 · 설명 · 상태 표(rows) 를 가져와 현재 구조에 맞게 옮긴 것이다.
 *
 * 명령은 사용자가 직접 입력하고(src/data/gitCommand.js 파서), 결과는 이 파일의
 * 상태 엔진이 지금 상태에서 계산해 만든다.
 *   · CLAUDE.md Hard Rules — 가짜 Terminal 금지.
 *     여기서 말하는 가짜 Terminal 은 "미리 적어 둔 출력을 재생하면서 실제로 실행한 척하는 것"이다.
 *     이 엔진은 어떤 출력도 미리 적어 두지 않고, UI 는 실제 실행이 아님을 먼저 고지한다.
 *   · 11_PROJECT_UI_SPEC §26 — Chapter 04 의 Primary Visualization 은
 *     Working Directory → Staging → Commit 이동이다. 입력은 그 이동을 일으키는 수단이다.
 *   · 파괴적 명령(reset --hard, restore <file>, clean)은 시뮬레이션하지 않고 설명으로 돌린다.
 *
 * 24_TECHNICAL_CONTENT_RULES §4 — Git 은 내 컴퓨터의 기록, GitHub 는 원격 공유.
 * git add 를 업로드로 설명하지 않는다. push 는 Chapter 05 범위다.
 */

export const REPO_PATH = "~/student-web";

/* Chapter 03 에서 만든 폴더 구조의 파일을 그대로 쓴다. */
export const GIT_FILES = [
  {
    id: "app-py",
    path: "backend/app.py",
    change: "점수 조회 오류 수정",
    stat: { insert: 2, delete: 1 }
  },
  {
    id: "app-jsx",
    path: "frontend/src/app.jsx",
    change: "조회 버튼 문구 수정",
    stat: { insert: 1, delete: 1 }
  },
  {
    id: "env",
    path: ".env",
    ignored: true,
    change: "비밀번호 값 입력",
    note: ".gitignore 에 있어 Git 이 목록에 올리지 않는다"
  }
];

/* 커밋 해시는 학습용 고정값이다. 무작위 값을 만들지 않는다. */
export const COMMIT_HASHES = ["a1b2c3d", "b4d5e6f", "c7a8b9e"];

/* git log 전체 형식에 필요한 예시 값. 실제 값이 아님을 UI 가 함께 표시한다. */
export const COMMIT_AUTHOR = "student <student@example.com>";
export const COMMIT_DATE = "Mon Jan 6 10:24:11 2025 +0900";

export const AREAS = [
  {
    id: "working",
    name: "Working Directory",
    ko: "작업 폴더",
    desc: "지금 고치고 있는 곳"
  },
  {
    id: "staging",
    name: "Staging Area",
    ko: "스테이징",
    desc: "이번 기록에 넣을 것을 골라 두는 곳"
  },
  {
    id: "history",
    name: "History",
    ko: "기록",
    desc: "확정된 기록이 쌓이는 곳 (내 컴퓨터 안)"
  }
];

/* 커밋 메시지는 무엇을 고쳤는지에 맞춰 고른다. */
export function commitMessageFor(stagedIds) {
  if (stagedIds.includes("app-py")) return "fix: 점수 조회 오류 수정";
  if (stagedIds.includes("app-jsx")) return "feat: 조회 버튼 문구 수정";
  return "chore: 변경 사항 기록";
}

/* ---------------- 명령별 결과 계산 ----------------
   state = { initialized, working:[id], staged:[id], commits:[{hash,message,files}] }
   반환   = { kind, output, detail, next, hasHash }

   kind   ok(상태가 바뀜) · info(확인만) · error(실제 Git 도 실패) · note(이 연습에서 다루지 않음)
   next   { initialized, add:[id], unstage:[id], commit:{}, logged }
   hasHash  출력에 예시 해시가 들어 있음 — UI 가 "예시 값" 안내를 덧붙인다              */

/* git init 전에는 어떤 명령도 같은 오류로 끝난다. 한 곳에서만 만든다. */
export function notARepo() {
  return {
    kind: "error",
    output: "fatal: not a git repository (or any of the parent directories): .git",
    detail: "아직 이 폴더에서 기록을 시작하지 않았습니다. git init 을 먼저 실행합니다."
  };
}

export function runInit(state) {
  if (state.initialized) {
    return {
      kind: "info",
      output: `Reinitialized existing Git repository in ${REPO_PATH}/.git/`,
      detail: "이미 기록을 시작한 폴더입니다. 다시 실행해도 기존 기록은 사라지지 않습니다."
    };
  }
  return {
    kind: "ok",
    output: `Initialized empty Git repository in ${REPO_PATH}/.git/`,
    detail: "이 폴더에서 변경 기록을 남기기 시작합니다. 숨김 폴더 .git 이 만들어집니다.",
    next: { initialized: true }
  };
}

export function runStatus(state) {
  if (!state.initialized) return notARepo();

  const lines = ["On branch main", ""];

  if (state.staged.length) {
    lines.push("Changes to be committed:");
    lines.push('  (use "git restore --staged <file>..." to unstage)');
    state.staged.forEach((id) => lines.push(`        modified:   ${fileOf(id).path}`));
    lines.push("");
  }

  if (state.working.length) {
    lines.push("Changes not staged for commit:");
    lines.push('  (use "git add <file>..." to update what will be committed)');
    state.working.forEach((id) => lines.push(`        modified:   ${fileOf(id).path}`));
    lines.push("");
  }

  if (!state.staged.length && !state.working.length) {
    lines.push("nothing to commit, working tree clean");
  } else if (!state.staged.length) {
    lines.push('no changes added to commit (use "git add")');
  }

  return {
    kind: "info",
    output: lines.join("\n"),
    detail:
      "확인만 하는 명령입니다. git status 는 아무것도 옮기지 않고 기록하지도 않습니다. " +
      ".env 는 .gitignore 에 있어 목록에 나타나지 않습니다."
  };
}

/* target = "." | fileId | [fileId] */
export function runAdd(state, target) {
  if (!state.initialized) return notARepo();

  const wanted = target === "." ? state.working.slice()
    : Array.isArray(target) ? target
    : [target];
  /* 이미 스테이징에 있는 것은 다시 옮기지 않는다 */
  const targets = wanted.filter((id) => state.working.includes(id));

  if (!targets.length) {
    return {
      kind: "info",
      output: "(출력 없음)",
      detail: "옮길 파일이 없습니다. 이미 스테이징에 올라가 있거나 바뀐 내용이 없습니다."
    };
  }

  return {
    kind: "ok",
    output: "(출력 없음 — 성공하면 아무 메시지도 나오지 않습니다)",
    detail:
      "고른 파일이 Staging Area 로 옮겨집니다. 아직 기록이 확정된 것도 아니고, " +
      "GitHub 와도 아무 관계가 없습니다.",
    next: { add: targets }
  };
}

/* message 를 넘기지 않으면 무엇을 골랐는지에 맞춰 자동으로 정한다. */
export function runCommit(state, message) {
  if (!state.initialized) return notARepo();

  if (!state.staged.length) {
    const lines = ["On branch main"];
    if (state.working.length) {
      lines.push("Changes not staged for commit:");
      state.working.forEach((id) => lines.push(`        modified:   ${fileOf(id).path}`));
      lines.push('no changes added to commit (use "git add")');
    } else {
      lines.push("nothing to commit, working tree clean");
    }
    return {
      kind: "error",
      output: lines.join("\n"),
      detail:
        "Staging Area 가 비어 있어서 확정할 것이 없습니다. " +
        "git add 로 이번 기록에 넣을 파일을 먼저 골라야 합니다."
    };
  }

  const msg = (message && message.trim()) || commitMessageFor(state.staged);
  const hash = COMMIT_HASHES[Math.min(state.commits.length, COMMIT_HASHES.length - 1)];
  const insert = state.staged.reduce((n, id) => n + fileOf(id).stat.insert, 0);
  const del = state.staged.reduce((n, id) => n + fileOf(id).stat.delete, 0);
  const count = state.staged.length;

  return {
    kind: "ok",
    hasHash: true,
    output:
      `[main ${hash}] ${msg}\n` +
      ` ${count} file${count > 1 ? "s" : ""} changed, ${insert} insertion(+), ${del} deletion(-)`,
    detail:
      "Staging Area 에 있던 것만 하나의 기록으로 확정됩니다. " +
      "따옴표 안의 메시지에는 무엇을 왜 고쳤는지 적습니다.",
    next: { commit: { hash, message: msg, files: state.staged.slice() } }
  };
}

/* git restore --staged <파일> — 스테이징에서만 내린다. 파일 내용은 건드리지 않는다. */
export function runRestore(state, fileIds) {
  if (!state.initialized) return notARepo();

  const ids = fileIds.filter((id) => state.staged.includes(id));
  if (!ids.length) {
    return {
      kind: "info",
      output: "(출력 없음)",
      detail: "스테이징에 올라가 있지 않은 파일이라 아무것도 바뀌지 않았습니다."
    };
  }

  return {
    kind: "ok",
    output: "(출력 없음 — 성공하면 아무 메시지도 나오지 않습니다)",
    detail:
      "스테이징에서만 내려놓습니다. 고친 내용은 작업 폴더에 그대로 남아 있어서 " +
      "다시 git add 로 고를 수 있습니다.",
    next: { unstage: ids }
  };
}

/* opts.oneline 이면 한 줄 요약, 아니면 실제 git log 의 기본 형식 */
export function runLog(state, opts) {
  if (!state.initialized) return notARepo();

  if (!state.commits.length) {
    return {
      kind: "error",
      output: "fatal: your current branch 'main' does not have any commits yet",
      detail: "아직 확정된 기록이 없습니다. git commit 을 먼저 실행합니다."
    };
  }

  const newestFirst = state.commits.slice().reverse();
  const oneline = !!(opts && opts.oneline);

  const output = oneline
    ? newestFirst.map((c, i) => `${c.hash}${i === 0 ? " (HEAD -> main)" : ""} ${c.message}`).join("\n")
    : newestFirst
        .map((c, i) =>
          [
            `commit ${c.hash}${i === 0 ? " (HEAD -> main)" : ""}`,
            `Author: ${COMMIT_AUTHOR}`,
            `Date:   ${COMMIT_DATE}`,
            "",
            `    ${c.message}`
          ].join("\n"))
        .join("\n\n");

  return {
    kind: "ok",
    hasHash: true,
    output,
    detail:
      (oneline
        ? "--oneline 은 기록을 한 줄로 줄여서 보여 줍니다. "
        : "기본 형식은 누가 언제 무엇을 고쳤는지 함께 보여 줍니다. 작성자와 날짜는 예시 값입니다. ") +
      "확정된 기록이 순서대로 쌓여 있습니다. 이 기록은 아직 내 컴퓨터 안에만 있습니다. " +
      "다른 곳과 나누는 방법은 Chapter 05에서 배웁니다.",
    next: { logged: true }
  };
}

export const fileOf = (id) => GIT_FILES.find((f) => f.id === id) || null;

export const fileByPath = (path) =>
  GIT_FILES.find((f) => f.path === String(path).replace(/^\.\//, "")) || null;

/* 작업 폴더 표시 순서는 항상 GIT_FILES 순서를 따른다 (unstage 후 되돌아올 때) */
export const FILE_ORDER = GIT_FILES.map((f) => f.id);

export default GIT_FILES;
