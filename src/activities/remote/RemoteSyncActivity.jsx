import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Disclosure from "../../components/common/Disclosure.jsx";
import {
  PLACES,
  ACTIONS,
  GUIDE,
  GUIDE_ORDER,
  NAME_NOTES,
  INITIAL,
  runAction,
  syncLabel
} from "../../data/remote.js";

/*
 * Chapter 05 Primary Visualization — Local Repository ↔ Remote Repository
 * (11_PROJECT_UI_SPEC §26 — Chapter 05 → Local Git ↔ GitHub Push)
 *
 * Chapter 04 의 Command Simulator 를 복제하지 않는다.
 * Chapter 04 는 "한 컴퓨터 안에서 파일이 어느 자리로 가는가"였고,
 * 여기서는 "같은 기록이 어느 저장소에 있고 어디에 없는가"를 본다.
 *
 * Beginner Guided Flow (CLAUDE.md §12)
 *   여섯 동작을 처음부터 동시에 보여 주지 않는다.
 *   지금 할 일 하나만 Primary Action 으로 두고, 나머지는 접어 둔다.
 *   push / pull / clone 은 반드시 방향을 글자로도 함께 표시한다.
 *   HEAD 개념은 이 Chapter 의 기본 화면에서 다루지 않는다 — "가장 최근 기록"으로만 표시한다.
 *
 * 상태 엔진(runAction · syncLabel)은 그대로 두고 표현 계층만 다시 구성했다.
 */
export default function RemoteSyncActivity({
  activity,
  selectedNode,
  onSelectNode,
  onOutcome,
  onFocus,
  onComplete,
  onNotify
}) {
  const [state, setState] = useState(INITIAL);
  const [last, setLast] = useState(null);
  const [ran, setRan] = useState([]);
  const doneRef = useRef(false);

  /* 요청 경로가 아니라 관리 축을 본다 */
  useEffect(() => { onFocus({ node: null, edge: null }); }, [onFocus]);

  /* 지금 해야 할 단계 — 실제로 상태를 바꾼 동작만 통과로 센다 */
  const stepIndex = useMemo(() => {
    const i = GUIDE_ORDER.findIndex((id) => !ran.includes(id));
    return i < 0 ? GUIDE.length : i;
  }, [ran]);
  const guide = GUIDE[stepIndex] || null;
  const allDone = stepIndex >= GUIDE.length;

  const commitsOf = useCallback((id) => {
    if (id === "local") return state.local;
    if (id === "github") return state.github;
    return state.other;
  }, [state]);

  const run = useCallback((id) => {
    const result = runAction(state, id);
    if (!result) return;

    setLast(result);
    onFocus({ node: null, edge: null });
    onSelectNode(result.arrow && result.arrow.to === "github" ? "github" : "local-git");

    if (!result.next) return;
    setRan((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setState((prev) => {
      const next = { ...prev };
      if (result.next.remote) next.remote = true;
      if (result.next.local) next.local = result.next.local;
      if (result.next.github) next.github = result.next.github;
      if (result.next.other) next.other = result.next.other;
      if (result.next.done) next.done = { ...prev.done, [result.next.done]: true };
      return next;
    });
  }, [state, onFocus, onSelectNode]);

  /* 여섯 단계를 모두 거치면 완료 */
  useEffect(() => {
    if (!allDone || doneRef.current) return;
    doneRef.current = true;
    onOutcome({
      status: "success",
      title: "같은 기록이 세 곳에 있습니다",
      text:
        "주소를 연결하고, 올리고, 다른 컴퓨터에서 받고, 거기서 새 기록을 만들어 올리고, " +
        "내 컴퓨터로 다시 받아 왔습니다. Git 은 내 컴퓨터의 기록을 관리하고, " +
        "GitHub 는 그 기록을 다른 장소와 잇는 역할만 합니다. " +
        "Chapter 06에서는 코드를 받아도 실행 환경이 다르면 생기는 문제를 다룹니다."
    });
    onComplete();
    onNotify("내 컴퓨터 ↔ GitHub 동기화를 모두 확인했습니다");
  }, [allDone, onOutcome, onComplete, onNotify]);

  const reset = () => {
    doneRef.current = false;
    setState(INITIAL);
    setLast(null);
    setRan([]);
    onOutcome(null);
    onNotify("처음 상태로 되돌렸습니다");
  };

  const arrow = last && last.arrow ? last.arrow : null;
  const kindTag = (kind) =>
    kind === "error" ? "오류" : kind === "ok" ? "상태 변화" : kind === "note" ? "안내" : "변화 없음";
  const currentAction = guide ? ACTIONS.find((a) => a.id === guide.id) : null;
  const otherActions = ACTIONS.filter((a) => !guide || a.id !== guide.id);

  return (
    <section className="section" aria-labelledby="activity-heading">
      <h2 className="section-title" id="activity-heading">{activity.title}</h2>
      {activity.guide ? <p className="section-desc">{activity.guide}</p> : null}

      <div className="panel activity-panel">
        <p className="sim-notice" role="note">
          <span className="tag tag--warn">학습용 시뮬레이션</span>
          <span className="sim-notice-title">저장소 동기화 연습</span>
          <span className="sim-notice-body">
            실제 GitHub에 접속하지 않습니다. 세 저장소의 기록이 어떻게 달라지는지 학습용으로 계산해 보여 줍니다.
          </span>
        </p>

        {/* ---------- 먼저 이해할 관계 ---------- */}
        <div className="repo-model">
          <p className="repo-model-title">먼저 이것 하나만 기억하세요</p>
          <p className="repo-model-row">
            <span className="repo-model-side">
              <span className="repo-model-role">내 컴퓨터의 Git 기록</span>
              <span className="repo-model-tech">Local Repository</span>
            </span>
            <span className="repo-model-link" aria-hidden="true">↕</span>
            <span className="repo-model-side">
              <span className="repo-model-role">인터넷에 둔 Git 기록</span>
              <span className="repo-model-tech">GitHub Remote Repository</span>
            </span>
          </p>
          <p className="repo-model-note">
            같은 기록을 두 곳에 두는 것이 전부입니다. 올리는 것이 push, 받아 오는 것이 pull 입니다.
          </p>
        </div>

        {/* ---------- 지금 할 일 하나 ---------- */}
        <div className="guided">
          {/* 점수처럼 보이는 n / n 대신 "몇 번째 단계"로 표시한다 (CLAUDE.md) */}
          <p className="guided-head">
            <span className="guided-step">
              {allDone ? "한 바퀴 끝" : `${stepIndex + 1}단계`}
            </span>
            <span className="guided-task">
              {allDone ? "세 저장소의 기록이 모두 같아졌습니다." : guide.task}
            </span>
          </p>
          {!allDone ? <p className="guided-why">{guide.why}</p> : null}
          {!allDone && currentAction ? (
            <p className="guided-actions">
              <button type="button" className="btn btn--primary" onClick={() => run(currentAction.id)}>
                {currentAction.label}
              </button>
              <span className="guided-dir">{guide.dir}</span>
              <code className="guided-cmd">{currentAction.cmd}</code>
            </p>
          ) : null}
          {ran.length ? (
            <p className="guided-actions">
              <button type="button" className="btn btn--sm" onClick={reset}>처음부터</button>
            </p>
          ) : null}
        </div>

        {/* ---------- 저장소 세 곳 ---------- */}
        <div className="repo-board">
          {PLACES.map((p, i) => {
            const commits = commitsOf(p.id);
            const link = i > 0 ? PLACES[i - 1] : null;
            const active = arrow && (arrow.from === p.id || arrow.to === p.id);
            const linkActive = arrow && link &&
              ((arrow.from === link.id && arrow.to === p.id) || (arrow.from === p.id && arrow.to === link.id));
            const toRight = arrow && link && arrow.from === link.id && arrow.to === p.id;

            return (
              <div className="repo-cell" key={p.id}>
                {link ? (
                  <div className={"repo-link" + (linkActive ? " is-live" : "")}>
                    <span className="repo-link-arrow" aria-hidden="true">
                      {linkActive ? (toRight ? "→" : "←") : "↔"}
                    </span>
                    <span className="repo-link-label">
                      {linkActive
                        ? `${arrow.label} · ${PLACES.find((x) => x.id === arrow.from).name} → ${PLACES.find((x) => x.id === arrow.to).name}`
                        : link.id === "local" ? "올리기 push / 받기 pull" : "처음 받기 clone / 올리기 push"}
                    </span>
                  </div>
                ) : null}

                <div className={"repo-card" + (active ? " is-live" : "")}>
                  <p className="repo-head">
                    <button
                      type="button"
                      className={"repo-name" + (selectedNode === p.node ? " is-selected" : "")}
                      aria-pressed={selectedNode === p.node}
                      onClick={() => onSelectNode(p.node)}
                    >
                      {p.name}
                    </button>
                    <span className="repo-tech">{p.tech}</span>
                  </p>
                  <p className="repo-desc">{p.desc}</p>

                  <p className="repo-sync">{syncLabel(state, p.id)}</p>

                  <ul className="repo-commits">
                    {commits === null ? (
                      <li className="repo-empty">저장소가 아직 없습니다</li>
                    ) : commits.length === 0 ? (
                      <li className="repo-empty">기록 0개</li>
                    ) : (
                      commits.slice().reverse().map((c, ci) => (
                        <li className="repo-commit" key={c.hash}>
                          <span className="repo-hash">
                            {c.hash}
                            <span className="git-item-example">예시 값</span>
                          </span>
                          <span className="repo-msg">{c.message}</span>
                          {ci === 0 ? <span className="repo-head-tag">가장 최근 기록</span> : null}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* ---------- 결과 ---------- */}
        <div className="cmd-result" aria-live="polite">
          {last ? (
            <>
              <p className="cmd-output-head">
                <span className="cmd-output-label">
                  학습용 시뮬레이션 결과 — 실제 Git이 출력한 내용이 아닙니다. 커밋 해시는 예시 값입니다.
                </span>
              </p>
              <p className="cmd-note">
                <span className={"tag " + (last.kind === "error" ? "tag--error" : last.kind === "ok" ? "tag--done" : "")}>
                  {kindTag(last.kind)}
                </span>
                <strong className="repo-result-title">{last.title}</strong>
              </p>
              <pre className="cmd-output"><code>
                <span className="cmd-echo">
                  <span className="cmd-echo-prompt">{"~/student-web $ "}</span>
                  {last.cmd}
                </span>
                {"\n" + last.output}
              </code></pre>
              <p className="cmd-detail">{last.detail}</p>
              {last.rows ? (
                <ul className="repo-rows">
                  {last.rows.map(([k, v]) => (
                    <li key={k}><span className="repo-row-key">{k}</span><span className="repo-row-val">{v}</span></li>
                  ))}
                </ul>
              ) : null}
            </>
          ) : (
            <p className="cmd-empty">
              위 버튼을 누르면 세 저장소의 기록이 어떻게 달라지는지 여기에 표시됩니다.
            </p>
          )}
        </div>

        {/* ---------- 이름 두 개 ---------- */}
        <Disclosure
          tone="quiet"
          label="origin 과 main 이 무엇인지 보기"
          note="명령에 계속 나오는 두 단어입니다."
        >
          <ul className="guided-rest">
            {NAME_NOTES.map((n) => (
              <li className="termline" key={n.name}>
                <span className="termline-role">{n.role}</span>
                <span className="termline-tech">{n.name}</span>
                <span className="termline-hint">{n.desc}</span>
              </li>
            ))}
          </ul>
        </Disclosure>

        {/* ---------- 다른 동작 직접 고르기 ---------- */}
        <Disclosure
          tone="quiet"
          label="다른 동작도 직접 골라 보기"
          note="순서를 어겼을 때 Git이 무엇이라고 답하는지 확인할 수 있습니다."
        >
          <ul className="repo-action-list">
            {otherActions.map((a) => {
              const place = PLACES.find((p) => p.id === a.where);
              return (
                <li className="repo-action" key={a.id}>
                  <button
                    type="button"
                    className={"btn btn--sm repo-run" + (last && last.cmd === a.cmd ? " is-last" : "")}
                    onClick={() => run(a.id)}
                  >
                    {a.label}
                  </button>
                  <span className="repo-action-where">{place.name}에서</span>
                  <code className="repo-action-cmd">{a.cmd}</code>
                </li>
              );
            })}
          </ul>
        </Disclosure>

        <p className="map-foot">
          GitHub는 코드를 실행하지 않습니다. 요청이 지나가는 길(화면 → 서비스 입구 → 요청 처리 → 데이터 저장)과는 다른 축입니다.
        </p>
      </div>
    </section>
  );
}
