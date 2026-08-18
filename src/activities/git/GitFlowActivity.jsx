import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useClipboard from "../../hooks/useClipboard.js";
import {
  REPO_PATH,
  GIT_FILES,
  FILE_ORDER,
  AREAS,
  fileOf
} from "../../data/git.js";
import { COMMAND_HELP, runCommand } from "../../data/gitCommand.js";

/*
 * Chapter 04 Primary Visualization — Working Directory → Staging → History
 * (11_PROJECT_UI_SPEC §26 / 22_CHAPTER_CURRICULUM Ch04)
 *
 * Chapter 01 Process Scene · 02 Request Builder · 03 Folder Tree 를 복제하지 않는다.
 * 여기서 배우는 것은 "고친 내용이 어떤 자리를 거쳐 기록이 되는가" 하나다.
 *
 * Primary Interaction 은 "사용자가 Git 명령을 직접 타이핑한다" 이다.
 * 화면 우선순위는 다음 순서를 지킨다.
 *
 *   1 현재 목표 → 2 Command Input → 3 Command Output → 4 Git State Board → 5 접힌 도움말
 *
 * 같은 명령을 여러 곳에서 반복해 보여 주지 않는다.
 *   · 입력 이력은 별도 Chip UI 가 아니라 Output 안의 대화 기록으로만 남는다
 *   · 전체 명령 목록은 기본으로 접혀 있고, 버튼이 아니라 읽는 목록이다
 *   · 다음에 칠 명령은 목표 아래 힌트에서 단계적으로만 열린다
 *
 * 실제 OS Shell 이나 Git Process 는 실행하지 않는다.
 * 출력은 전부 지금 상태에서 계산한 값이고, 이 점을 조작부보다 먼저 고지한다.
 * git add 는 업로드가 아니며, GitHub 로 보내는 것은 Chapter 05 이다.
 */
const INITIAL = {
  initialized: false,
  working: GIT_FILES.filter((f) => !f.ignored).map((f) => f.id),
  staged: [],
  commits: [],
  logged: false
};

/* 대화 기록이 끝없이 길어지지 않도록 최근 것만 남긴다 */
const MAX_LOG = 20;

export default function GitFlowActivity({
  activity,
  selectedNode,
  onSelectNode,
  onOutcome,
  onFocus,
  onComplete,
  onNotify
}) {
  const [state, setState] = useState(INITIAL);
  const [log, setLog] = useState([]);
  const [draft, setDraft] = useState("");
  const [histIdx, setHistIdx] = useState(-1);
  const [hintLevel, setHintLevel] = useState(1);
  const [copyState, setCopyState] = useState("idle");
  const doneRef = useRef(false);
  const outRef = useRef(null);
  const seqRef = useRef(0);
  const copy = useClipboard();

  const last = log.length ? log[log.length - 1] : null;

  useEffect(() => {
    if (copyState !== "copied" && copyState !== "copy_error") return undefined;
    const t = setTimeout(() => setCopyState("idle"), 1600);
    return () => clearTimeout(t);
  }, [copyState]);

  /* 실제로 실행해 보고 싶은 사람을 위해 명령 문자열 그대로 복사한다 */
  const copyCmd = useCallback(async () => {
    if (!last) return;
    setCopyState("copying");
    const done = await copy(last.cmd);
    setCopyState(done ? "copied" : "copy_error");
    onNotify(done ? "명령을 복사했습니다" : "복사하지 못했습니다", done ? "ok" : "error");
  }, [last, copy, onNotify]);

  const staged = state.staged;
  const commits = state.commits;

  /* 이 Chapter 는 요청 경로가 아니라 관리 축을 본다 */
  useEffect(() => {
    onFocus({ node: null, edge: null });
  }, [onFocus]);

  const focusGit = useCallback(() => {
    if (selectedNode !== "local-git") onSelectNode("local-git");
  }, [selectedNode, onSelectNode]);

  /* 목표 문구는 Chapter 데이터에 있고, 완료 판정만 현재 상태에서 계산한다 */
  const goals = useMemo(() => {
    const done = {
      init: state.initialized,
      add: staged.length > 0 || commits.length > 0,
      commit: commits.length > 0,
      log: state.logged
    };
    return (activity.goals || []).map((g) => ({ ...g, done: !!done[g.id] }));
  }, [activity.goals, state.initialized, staged.length, commits.length, state.logged]);

  const doneCount = goals.filter((g) => g.done).length;
  const current = goals.find((g) => !g.done) || null;
  const currentId = current ? current.id : null;

  /* 목표가 넘어가면 힌트는 다시 1단계부터 */
  useEffect(() => { setHintLevel(1); }, [currentId]);

  /* 새 결과가 들어오면 대화 기록의 마지막이 보이게 한다 */
  useEffect(() => {
    if (outRef.current) outRef.current.scrollTop = outRef.current.scrollHeight;
  }, [log.length]);

  const apply = useCallback((result) => {
    seqRef.current += 1;
    const entry = { ...result, n: seqRef.current };
    setLog((prev) => [...prev, entry].slice(-MAX_LOG));

    if (!result.next) return;

    setState((prev) => {
      const nextState = { ...prev };
      if (result.next.initialized) nextState.initialized = true;
      if (result.next.add) {
        nextState.staged = [...prev.staged, ...result.next.add];
        nextState.working = prev.working.filter((id) => !result.next.add.includes(id));
      }
      if (result.next.unstage) {
        nextState.staged = prev.staged.filter((id) => !result.next.unstage.includes(id));
        nextState.working = [...prev.working, ...result.next.unstage]
          .sort((a, b) => FILE_ORDER.indexOf(a) - FILE_ORDER.indexOf(b));
      }
      if (result.next.commit) {
        nextState.commits = [...prev.commits, result.next.commit];
        nextState.staged = [];
      }
      if (result.next.logged) nextState.logged = true;
      return nextState;
    });
  }, []);

  /*
   * 마지막 목표까지 마치면 Chapter 를 완료 처리한다.
   *
   * 결과는 compact summary 하나로만 남긴다.
   * 작업 폴더 · 스테이징 · 기록 개수 · 최근 기록은 바로 위 Board 가 이미 보여 주고 있어서,
   * 표로 다시 반복하면 같은 정보를 두 번 읽게 된다. (rows / raw 를 넘기지 않는다)
   */
  useEffect(() => {
    if (!goals.length || doneCount < goals.length || doneRef.current) return;
    doneRef.current = true;

    onOutcome({
      status: "success",
      title: "Local Git 기록 완료",
      text:
        "커밋이 내 컴퓨터의 Local Git History에 남았습니다. 아직 GitHub에는 올라가지 않았습니다. " +
        "Chapter 05에서 이 기록을 Remote Repository로 보내는 과정을 배웁니다."
    });
    onComplete();
    onNotify("변경 기록이 내 컴퓨터에 남았습니다");
  }, [goals.length, doneCount, onOutcome, onComplete, onNotify]);

  const reset = () => {
    doneRef.current = false;
    seqRef.current = 0;
    setState(INITIAL);
    setLog([]);
    setDraft("");
    setHistIdx(-1);
    setHintLevel(1);
    onOutcome(null);
    onNotify("처음 상태로 되돌렸습니다");
  };

  /* ---------- 입력 ---------- */

  const submit = (e) => {
    e.preventDefault();
    const input = draft.trim();
    if (!input) return;

    const result = runCommand(state, input);
    if (!result) return;

    focusGit();
    apply(result);
    setHistIdx(-1);
    setDraft("");
  };

  /* 위/아래 화살표로 방금 친 명령을 다시 꺼낸다 (별도 Chip UI 를 두지 않는다) */
  const onKeyDown = (e) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;

    /* 같은 명령이 이어지면 한 번만 남긴다 */
    const typed = [];
    for (let i = log.length - 1; i >= 0; i -= 1) {
      if (typed[typed.length - 1] !== log[i].cmd) typed.push(log[i].cmd);
    }
    if (!typed.length) return;
    e.preventDefault();

    const nextIdx = e.key === "ArrowUp"
      ? Math.min(histIdx + 1, typed.length - 1)
      : histIdx - 1;

    setHistIdx(nextIdx);
    setDraft(nextIdx < 0 ? "" : typed[nextIdx]);
  };

  const ignored = GIT_FILES.filter((f) => f.ignored);

  const kindTag = (kind) =>
    kind === "error" ? "오류" : kind === "ok" ? "상태 변화" : kind === "note" ? "안내" : "확인";

  const shown = current ? current.hints.slice(0, hintLevel) : [];
  const moreHint = current && hintLevel < current.hints.length;

  return (
    <section className="section" aria-labelledby="activity-heading">
      <h2 className="section-title" id="activity-heading">{activity.title}</h2>
      {activity.guide ? <p className="section-desc">{activity.guide}</p> : null}

      <div className="panel activity-panel">
        {/* Beginner Safety — 실제 실행이 아님을 조작부보다 먼저, 그러나 작게 알린다 */}
        {activity.simTitle ? (
          <p className="sim-notice" role="note">
            <span className="tag tag--warn">학습용 시뮬레이션</span>
            <span className="sim-notice-title">{activity.simTitle}</span>
            <span className="sim-notice-body">{activity.simNote}</span>
          </p>
        ) : null}

        {/* ---------- 1. 지금 할 일 ---------- */}
        <div className="goal-panel">
          {/* 점수처럼 보이는 n / n 대신 "몇 번째 단계"로 표시한다 (CLAUDE.md) */}
          <p className="guided-head" aria-live="polite">
            <span className="guided-step">
              {current ? `${doneCount + 1}단계` : "네 단계 끝"}
            </span>
            <span className="goal-task">{current ? current.task : activity.goalDone}</span>
            {doneCount > 0 ? (
              <button type="button" className="btn btn--sm" onClick={reset}>처음부터</button>
            ) : null}
          </p>

          {current ? (
            <div className="goal-hint">
              <p className="goal-hint-label">힌트</p>
              <ol className="goal-hint-list">
                {shown.map((h, i) => (
                  <li className="goal-hint-item" key={h}>
                    {i === 0 ? h : <code className="goal-hint-cmd">{h}</code>}
                  </li>
                ))}
              </ol>
              {moreHint ? (
                <button
                  type="button"
                  className="btn btn--sm goal-hint-more"
                  onClick={() => setHintLevel((l) => l + 1)}
                >
                  힌트 더 보기
                </button>
              ) : null}
            </div>
          ) : null}

          {activity.goalTip ? <p className="goal-tip">{activity.goalTip}</p> : null}
        </div>

        {/* ---------- 2. 명령 입력 — 이 화면에서 가장 강한 조작 요소 ---------- */}
        <form className="cmd-form" onSubmit={submit}>
          <label className="cmd-form-label" htmlFor="git-cmd">Git 명령 입력</label>

          <div className="cmd-input-row">
            <span className="cmd-prompt" aria-hidden="true">{REPO_PATH} $</span>
            <input
              id="git-cmd"
              className="cmd-input"
              type="text"
              value={draft}
              placeholder="git status"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              aria-describedby="git-cmd-help"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <button type="submit" className="btn btn--primary cmd-run" disabled={!draft.trim()}>
              Enter 실행
            </button>
          </div>

          <p className="cmd-form-help" id="git-cmd-help">
            직접 쳐서 Enter 를 누르면 Git 상태가 어떻게 바뀌는지 계산해서 보여 줍니다.
            위·아래 화살표로 방금 친 명령을 다시 꺼낼 수 있습니다.
          </p>
        </form>

        {/* ---------- 3. 결과 — 입력 바로 아래 ---------- */}
        <div className="cmd-result" aria-live="polite">
          <p className="cmd-output-head">
            <span className="cmd-output-label">
              학습용 시뮬레이션 결과 — 실제 Git이 출력한 내용이 아닙니다.
              {last && last.hasHash ? " 커밋 해시는 예시 값입니다." : ""}
            </span>
            {last ? (
              <button
                type="button"
                className={"btn btn--sm code-copy is-" + copyState}
                onClick={copyCmd}
                disabled={copyState === "copying"}
              >
                {copyState === "copying" ? "복사 중…"
                  : copyState === "copied" ? "복사됨 ✓"
                  : copyState === "copy_error" ? "복사 실패"
                  : "마지막 명령 복사"}
              </button>
            ) : null}
          </p>

          <pre className="cmd-output" tabIndex={0} ref={outRef} aria-label="입력한 명령과 결과">
            {log.map((e) => (
              <span className="cmd-entry" key={e.n}>
                <span className="cmd-echo">
                  <span className="cmd-echo-prompt">{REPO_PATH} $ </span>
                  {e.cmd}
                </span>
                {"\n" + e.output + "\n\n"}
              </span>
            ))}
            <span className="cmd-echo-prompt">{REPO_PATH} $ </span>
            <span className="cmd-caret" aria-hidden="true">_</span>
          </pre>

          {last ? (
            <p className="cmd-note">
              <span className={"tag " + (last.kind === "error" ? "tag--error" : last.kind === "ok" ? "tag--done" : "")}>
                {kindTag(last.kind)}
              </span>
              <span className="cmd-detail">{last.detail}</span>
            </p>
          ) : (
            <p className="cmd-empty">
              위 입력칸에 첫 명령을 쳐 보세요. Enter 를 누르면 여기에 결과가 쌓입니다.
            </p>
          )}
        </div>

        {/* ---------- 4. 상태 보드 — 방금 친 명령이 무엇을 바꿨는지 ---------- */}
        <div className="git-board">
          {AREAS.map((area) => (
            <div className={"git-area is-" + area.id} key={area.id}>
              <p className="git-area-head">
                <span className="git-area-name">{area.name}</span>
                <span className="git-area-ko">{area.ko}</span>
              </p>
              <p className="git-area-desc">{area.desc}</p>

              <ul className="git-items">
                {area.id === "working" && state.working.map((id) => {
                  const f = fileOf(id);
                  return (
                    <li className="git-item" key={id}>
                      <span className="git-item-path">{f.path}</span>
                      <span className="git-item-change">{f.change}</span>
                    </li>
                  );
                })}

                {area.id === "staging" && staged.map((id) => {
                  const f = fileOf(id);
                  return (
                    <li className="git-item is-staged" key={id}>
                      <span className="git-item-path">{f.path}</span>
                      <span className="git-item-change">기록에 넣기로 고름</span>
                    </li>
                  );
                })}

                {area.id === "history" && commits.slice().reverse().map((c, i) => (
                  <li className="git-item is-commit" key={c.hash}>
                    <span className="git-item-hash">
                      {c.hash}
                      <span className="git-item-example">예시 해시</span>
                    </span>
                    <span className="git-item-path">{c.message}</span>
                    <span className="git-item-change">
                      {c.files.map((id) => fileOf(id).path).join(" · ")}
                      {/* 실제 git 출력에 나오는 표시라 그대로 두되, 뜻을 옆에 적어 둔다.
                          설명 없는 첫 등장 금지 (CLAUDE.md §2) */}
                      {i === 0 ? (
                        <span className="git-item-example">가장 최근 기록 · git 출력의 HEAD -&gt; main</span>
                      ) : null}
                    </span>
                  </li>
                ))}

                {((area.id === "working" && !state.working.length) ||
                  (area.id === "staging" && !staged.length) ||
                  (area.id === "history" && !commits.length)) ? (
                  <li className="git-empty">비어 있음</li>
                ) : null}
              </ul>

              {area.id === "working" ? (
                <ul className="git-ignored">
                  {ignored.map((f) => (
                    <li key={f.id}>
                      <span className="git-item-path">{f.path}</span>
                      <span className="git-item-change">{f.note}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {area.id === "history" ? (
                <p className="git-area-foot">
                  여기까지가 내 컴퓨터 안입니다. GitHub 로 보내는 것은 Chapter 05입니다.
                </p>
              ) : null}
            </div>
          ))}
        </div>

        {/* ---------- 5. 도움말 — 필요할 때만 연다 ---------- */}
        <details className="cmd-help">
          <summary className="cmd-help-summary">
            Git 명령어 도움말 펼치기
            <span className="cmd-help-caret" aria-hidden="true">▾</span>
          </summary>
          <dl className="cmd-help-list">
            {COMMAND_HELP.map((h) => (
              <div className="cmd-help-row" key={h.cmd}>
                <dt className="cmd-help-what">{h.what}</dt>
                <dd className="cmd-help-cmd"><code>{h.cmd}</code></dd>
              </div>
            ))}
          </dl>
          {activity.simHint ? <p className="cmd-help-foot">{activity.simHint}</p> : null}
        </details>

        <p className="map-foot">
          git add 는 GitHub 로 보내는 명령이 아닙니다. 이번 Chapter의 모든 동작은 내 컴퓨터 안에서 끝납니다.
        </p>
      </div>
    </section>
  );
}
