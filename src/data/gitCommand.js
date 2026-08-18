/*
 * Chapter 04 — Git Command Parser.
 *
 * 사용자가 직접 입력한 문자열을 해석해서 기존 Git State Engine(src/data/git.js)에 넘긴다.
 *
 *   Git Command Input → 이 파일(Parser) → git.js(State Engine) → 상태 변화 → 상태 기반 출력
 *
 * 실제 OS Shell 이나 Git Process 는 실행하지 않는다.
 * 여기서 만들어지는 출력은 전부 지금 상태에서 계산한 값이며, 미리 적어 둔 대본이 아니다.
 *
 * 범위 (22_CHAPTER_CURRICULUM Ch04 · 24_TECHNICAL_CONTENT_RULES §4)
 *   다룬다   init · status · add · commit · log · restore --staged
 *   Ch05    push · pull · clone · remote
 *   범위 밖  branch · merge · rebase · checkout · switch · stash · tag
 *   실행 안 함  reset · clean · rm · restore(--staged 없이) — 되돌릴 수 없는 명령
 *
 * 잘못된 명령도 그냥 "틀렸습니다"로 끝내지 않고, 실제 Git 이 무엇이라고 말하는지와
 * 다음에 무엇을 하면 되는지를 함께 돌려준다.
 */
import {
  fileByPath,
  notARepo,
  runInit,
  runStatus,
  runAdd,
  runCommit,
  runLog,
  runRestore
} from "./git.js";

/*
 * 접어 둔 도움말에서만 쓰는 Reference List.
 * 버튼이 아니라 읽는 목록이다 — 눌러도 실행되거나 입력칸에 채워지지 않는다.
 * 이 Chapter 의 주 행동은 "직접 타이핑"이므로 명령 목록이 입력칸보다 강해지면 안 된다.
 */
export const COMMAND_HELP = [
  { what: "저장소 시작", cmd: "git init" },
  { what: "현재 상태 확인", cmd: "git status" },
  { what: "파일 스테이징", cmd: "git add <파일>" },
  { what: "모든 변경 스테이징", cmd: "git add ." },
  { what: "기록 남기기", cmd: 'git commit -m "메시지"' },
  { what: "기록 확인", cmd: "git log" },
  { what: "스테이징 취소", cmd: "git restore --staged <파일>" }
];

/* 오타 제안에 쓰는 목록 */
const KNOWN = ["init", "status", "add", "commit", "log", "restore", "diff", "push", "pull", "clone", "branch"];

const LATER = {
  push: "내 컴퓨터의 기록을 원격 저장소로 보내는 명령입니다.",
  pull: "원격 저장소의 기록을 내 컴퓨터로 가져오는 명령입니다.",
  clone: "원격 저장소를 통째로 내려받는 명령입니다.",
  remote: "원격 저장소 주소를 등록하는 명령입니다.",
  fetch: "원격 저장소의 변경을 확인해 오는 명령입니다."
};

const OUT_OF_SCOPE = {
  branch: "작업 가지를 나누는 명령입니다.",
  merge: "나눈 가지를 다시 합치는 명령입니다.",
  rebase: "기록의 순서를 다시 쌓는 명령입니다.",
  checkout: "다른 가지나 시점으로 이동하는 명령입니다.",
  switch: "다른 가지로 이동하는 명령입니다.",
  stash: "작업 중인 내용을 잠시 치워 두는 명령입니다.",
  tag: "특정 기록에 이름표를 붙이는 명령입니다."
};

const DESTRUCTIVE = {
  reset: "기록이나 스테이징을 되감는 명령입니다.",
  clean: "추적하지 않는 파일을 지우는 명령입니다.",
  rm: "파일을 지우면서 Git 에서도 빼는 명령입니다."
};

/* ---------------- 문자열 → 토큰 ----------------
   따옴표 안의 공백은 하나의 토큰으로 묶는다. 커밋 메시지 때문에 필요하다. */
export function tokenize(input) {
  const tokens = [];
  let cur = "";
  let started = false;
  let quote = null;

  for (const ch of String(input)) {
    if (quote) {
      if (ch === quote) quote = null;
      else cur += ch;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      started = true;
      continue;
    }
    if (/\s/.test(ch)) {
      if (started || cur) tokens.push(cur);
      cur = "";
      started = false;
      continue;
    }
    cur += ch;
    started = true;
  }
  if (started || cur) tokens.push(cur);

  return { tokens, unclosed: quote !== null };
}

/* 오타 제안 — 가장 가까운 명령 하나만 고른다 */
function distance(a, b) {
  const rows = [];
  for (let i = 0; i <= a.length; i += 1) rows.push([i]);
  for (let j = 1; j <= b.length; j += 1) rows[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      rows[i][j] = Math.min(
        rows[i - 1][j] + 1,
        rows[i][j - 1] + 1,
        rows[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return rows[a.length][b.length];
}

function nearest(word) {
  let best = null;
  let bestD = 99;
  KNOWN.forEach((k) => {
    const d = distance(word, k);
    if (d < bestD) { bestD = d; best = k; }
  });
  return bestD <= 3 ? best : null;
}

const note = (output, detail) => ({ kind: "note", output, detail });
const fail = (output, detail) => ({ kind: "error", output, detail });

/* ---------------- 입력 한 줄 실행 ----------------
   반환 = { cmd, kind, output, detail, next?, hasHash? } | null(빈 입력) */
export function runCommand(state, input) {
  const cmd = String(input == null ? "" : input).trim();
  if (!cmd) return null;

  const { tokens, unclosed } = tokenize(cmd);
  const wrap = (r) => ({ cmd, ...r });

  if (unclosed) {
    return wrap(fail(
      "error: 따옴표가 닫히지 않았습니다.",
      '따옴표는 열고 닫아야 합니다. 예: git commit -m "fix: 점수 조회 오류 수정"'
    ));
  }
  if (!tokens.length) return null;

  if (tokens[0] !== "git") {
    return wrap(note(
      `이 연습에서 다루는 것은 git 명령입니다. (입력한 첫 낱말: ${tokens[0]})`,
      "모든 명령은 git 으로 시작합니다. 목표 아래의 힌트를 따라가면 다음에 칠 명령을 알 수 있습니다."
    ));
  }

  const sub = tokens[1];
  const args = tokens.slice(2);

  if (!sub) {
    return wrap(note(
      "usage: git <command> [<args>]",
      "git 뒤에 무엇을 할지 함께 적습니다. 예: git status"
    ));
  }

  /* ---------- init ---------- */
  if (sub === "init") return wrap(runInit(state));

  /* ---------- status ---------- */
  if (sub === "status") return wrap(runStatus(state));

  /* ---------- add ---------- */
  if (sub === "add") {
    if (!state.initialized) return wrap(notARepo());

    if (!args.length) {
      return wrap(fail(
        "Nothing specified, nothing added.\nhint: Maybe you wanted to say 'git add .'?",
        "어떤 파일을 고를지 함께 적어야 합니다. 예: git add backend/app.py 또는 git add ."
      ));
    }

    if (args.some((a) => a === "." || a === "-A" || a === "--all")) {
      return wrap(runAdd(state, "."));
    }

    const ids = [];
    for (const p of args) {
      if (p.startsWith("-")) {
        return wrap(fail(
          `error: unknown switch \`${p.replace(/^-+/, "")}'`,
          "이 연습의 git add 는 파일 경로 또는 . 만 받습니다."
        ));
      }

      const f = fileByPath(p);
      if (!f) {
        return wrap(fail(
          `fatal: pathspec '${p}' did not match any files`,
          "그 이름의 파일을 찾지 못했습니다. 경로는 프로젝트 폴더(student-web) 기준이며, " +
          "보드의 작업 폴더에 적힌 경로를 그대로 적으면 됩니다."
        ));
      }

      if (f.ignored) {
        return wrap(fail(
          "The following paths are ignored by one of your .gitignore files:\n" +
          `${f.path}\n` +
          "hint: Use -f if you really want to add them.",
          "Chapter 03에서 .gitignore 에 적어 둔 파일입니다. 실제 비밀번호가 기록에 남지 않도록 " +
          "일부러 제외해 둔 것이라, 이 연습에서는 강제로 추가하지 않습니다."
        ));
      }

      ids.push(f.id);
    }

    return wrap(runAdd(state, ids));
  }

  /* ---------- commit ---------- */
  if (sub === "commit") {
    if (!state.initialized) return wrap(notARepo());

    const mi = args.findIndex((a) => a === "-m" || a === "--message");

    if (mi < 0) {
      const bad = args.find((a) => a.startsWith("-"));
      if (bad) {
        return wrap(note(
          `이 연습의 git commit 은 -m 옵션만 다룹니다. (입력한 옵션: ${bad})`,
          '메시지를 함께 적어 확정합니다. 예: git commit -m "fix: 점수 조회 오류 수정"'
        ));
      }
      return wrap(fail(
        "hint: 메시지를 적을 편집기가 열립니다.\n" +
        "hint: 이 연습에서는 편집기를 열지 않습니다.",
        '메시지 없이 commit 하면 실제 Git 은 편집기를 엽니다. ' +
        '여기서는 -m 으로 메시지를 함께 적습니다. 예: git commit -m "fix: 점수 조회 오류 수정"'
      ));
    }

    const message = args[mi + 1];
    if (message === undefined) {
      return wrap(fail(
        "error: switch `m' requires a value",
        '-m 뒤에 메시지를 적어야 합니다. 예: git commit -m "fix: 점수 조회 오류 수정"'
      ));
    }
    if (!message.trim()) {
      return wrap(fail(
        "Aborting commit due to empty commit message.",
        "메시지가 비어 있습니다. 무엇을 왜 고쳤는지 한 줄로 적습니다."
      ));
    }

    return wrap(runCommit(state, message.trim()));
  }

  /* ---------- log ---------- */
  if (sub === "log") {
    return wrap(runLog(state, { oneline: args.includes("--oneline") }));
  }

  /* ---------- restore ---------- */
  if (sub === "restore") {
    if (!state.initialized) return wrap(notARepo());

    const paths = args.filter((a) => !a.startsWith("-"));

    if (!args.includes("--staged")) {
      return wrap(note(
        "이 연습에서는 --staged 없이 restore 를 실행하지 않습니다.",
        "git restore <파일> 은 고친 내용 자체를 되돌립니다. 되돌린 내용은 다시 살릴 수 없는 경우가 있어 " +
        "이 교안의 기본 흐름에서는 다루지 않습니다. 스테이징에서만 내리려면 " +
        "git restore --staged <파일> 을 씁니다."
      ));
    }

    if (!paths.length) {
      return wrap(fail(
        "fatal: you must specify path(s) to restore",
        "어떤 파일을 내릴지 함께 적어야 합니다. 예: git restore --staged backend/app.py"
      ));
    }

    if (paths.includes(".")) return wrap(runRestore(state, state.staged.slice()));

    const ids = [];
    for (const p of paths) {
      const f = fileByPath(p);
      if (!f) {
        return wrap(fail(
          `fatal: pathspec '${p}' did not match any files`,
          "그 이름의 파일을 찾지 못했습니다. 스테이징에 올라가 있는 경로를 그대로 적어 보세요."
        ));
      }
      ids.push(f.id);
    }

    return wrap(runRestore(state, ids));
  }

  /* ---------- 다음 Chapter / 범위 밖 / 실행하지 않는 명령 ---------- */
  if (LATER[sub]) {
    return wrap(note(
      `git ${sub} — 이 연습에서는 실행하지 않습니다.`,
      `${LATER[sub]} 내 컴퓨터 밖으로 나가는 명령이라 Chapter 05에서 배웁니다. ` +
      "Chapter 04의 모든 동작은 내 컴퓨터 안에서 끝납니다."
    ));
  }

  if (OUT_OF_SCOPE[sub]) {
    return wrap(note(
      `git ${sub} — 이 교안에서 다루지 않습니다.`,
      `${OUT_OF_SCOPE[sub]} 이번 Chapter는 작업 폴더 → 스테이징 → 기록 세 자리를 구분하는 것까지만 다룹니다.`
    ));
  }

  if (DESTRUCTIVE[sub]) {
    return wrap(note(
      `git ${sub} — 이 연습에서는 실행하지 않습니다.`,
      `${DESTRUCTIVE[sub]} 잘못 쓰면 고친 내용이나 기록이 사라져 되돌릴 수 없는 경우가 있어 ` +
      "학습 흐름에서 실행하지 않습니다. 스테이징에서만 내리려면 git restore --staged <파일> 을 씁니다."
    ));
  }

  if (sub === "help" || sub === "--help" || sub === "-h") {
    return wrap(note(
      "usage: git <command> [<args>]",
      "이 연습에서 쓸 수 있는 명령은 init · status · add · commit · log · restore --staged 입니다. " +
      "보드 아래 'Git 명령어 도움말'을 펼치면 전체 목록을 볼 수 있습니다."
    ));
  }

  /* ---------- 알 수 없는 명령 ---------- */
  const near = nearest(sub);
  return wrap(fail(
    `git: '${sub}' is not a git command. See 'git --help'.` +
    (near ? `\n\nThe most similar command is\n\t${near}` : ""),
    near
      ? `Git 에 없는 명령입니다. git ${near} 를 입력하려던 것은 아닌지 확인해 보세요.`
      : "Git 에 없는 명령입니다. 목표 아래의 힌트를 열어 다음에 칠 명령을 확인해 보세요."
  ));
}

export default runCommand;
