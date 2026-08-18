import { useCallback, useEffect, useRef, useState } from "react";
import {
  STATES,
  EVENTS,
  CODE_LINES,
  FILE_PATH,
  getState,
  canFire
} from "../../data/frontendState.js";

/*
 * Chapter 09 Primary Visualization — React State / Event / Render
 * (11_PROJECT_UI_SPEC §26 — Chapter 09)
 *
 * Chapter 01 의 Process Scene 을 축소 복제하지 않는다.
 * Chapter 01 은 "요청이 시스템을 통과하는 경로"였고,
 * 여기서는 컴퓨터 안쪽 한 곳(Browser)에서 "무엇이 일어나면 어느 상태로 가는가"만 본다.
 *
 * 화면의 주인공은 네 상태를 잇는 전이 지도와, 그 상태에 따라 실제로 바뀌는 화면 미리보기다.
 */
export default function StateMachineActivity({
  activity,
  selectedNode,
  onSelectNode,
  onOutcome,
  onFocus,
  onComplete,
  onNotify
}) {
  const [state, setState] = useState("idle");
  const [last, setLast] = useState(null);
  const [seen, setSeen] = useState({ success: false, error: false });
  const doneRef = useRef(false);

  /* 이번 Chapter 의 무대는 Browser 안쪽이다 */
  useEffect(() => { onFocus({ node: "browser", edge: null }); }, [onFocus]);

  const fire = useCallback((ev) => {
    if (!canFire(state, ev)) return;
    setState(ev.to);
    setLast(ev);
    if (ev.to === "success" || ev.to === "error") {
      setSeen((prev) => (prev[ev.to] ? prev : { ...prev, [ev.to]: true }));
    }
    if (selectedNode !== "browser") onSelectNode("browser");
    onFocus(
      ev.kind === "server"
        ? { node: "browser", edge: "nginx-browser" }
        : { node: "browser", edge: null }
    );
  }, [state, selectedNode, onSelectNode, onFocus]);

  useEffect(() => {
    if (!seen.success || !seen.error || doneRef.current) return;
    doneRef.current = true;
    onOutcome({
      status: "success",
      title: "상태가 바뀌어서 화면이 바뀝니다",
      text:
        "성공 경로와 실패 경로를 모두 확인했습니다. 화면은 데이터를 직접 갖고 있지 않고, " +
        "status와 student 상태에 따라 다시 그려질 뿐입니다. " +
        "Chapter 10에서는 이 요청이 도착하는 첫 서버, 입구를 봅니다."
    });
    onComplete();
    onNotify("성공과 실패 상태를 모두 확인했습니다");
  }, [seen, onOutcome, onComplete, onNotify]);

  const reset = () => {
    doneRef.current = false;
    setState("idle");
    setLast(null);
    setSeen({ success: false, error: false });
    onOutcome(null);
    onNotify("처음 상태로 되돌렸습니다");
  };

  const cur = getState(state);
  const screen = cur.screen;
  const doneCount = (seen.success ? 1 : 0) + (seen.error ? 1 : 0);

  return (
    <section className="section" aria-labelledby="activity-heading">
      <h2 className="section-title" id="activity-heading">{activity.title}</h2>
      {activity.guide ? <p className="section-desc">{activity.guide}</p> : null}

      <div className="panel activity-panel">
        <p className="learn-note" role="note">
          <span className="tag">학습용</span>
          응답 값은 학습용 예시입니다. 실제 서버에 요청하지 않고, 어떤 응답이 왔을 때 화면이 어떻게 바뀌는지만 봅니다.
        </p>

        <p className="explore-hint" aria-live="polite">
          {!seen.success
            ? "아래에서 일어날 수 있는 일을 하나 눌러 보세요. 데이터를 잘 받은 경우부터 보면 쉽습니다."
            : !seen.error
              ? "이번에는 데이터를 찾지 못한 경우도 눌러 보세요."
              : "잘 받은 경우와 못 찾은 경우를 모두 봤습니다. 다시 눌러 비교해 봐도 됩니다."}
          {last ? <button type="button" className="btn btn--sm" onClick={reset}>처음부터</button> : null}
        </p>

        {/* ---------- 상태 전이 지도 ---------- */}
        <div className="fsm">
          <ol className="fsm-states" aria-label="화면 상태">
            {STATES.map((s) => (
              <li key={s.id}>
                <div
                  className={
                    "fsm-state is-" + s.id +
                    (s.id === state ? " is-now" : "") +
                    (seen[s.id] ? " is-seen" : "")
                  }
                  aria-current={s.id === state ? "true" : undefined}
                >
                  {/* 한글 역할이 Primary, 기술 이름이 Secondary (CLAUDE.md §1) */}
                  <span className="fsm-state-ko">{s.ko}</span>
                  <span className="fsm-state-label">{s.label}</span>
                  {s.id === state ? <span className="fsm-now">지금 상태</span> : null}
                </div>
              </li>
            ))}
          </ol>
          <p className="fsm-desc" aria-live="polite">{cur.desc}</p>
        </div>

        {/* ---------- 무슨 일이 일어나는가 ---------- */}
        <div className="fsm-events">
          <h3 className="builder-title">무슨 일이 일어나는가</h3>
          <ul className="fsm-event-list">
            {EVENTS.map((ev) => {
              const able = canFire(state, ev);
              return (
                <li className="fsm-event" key={ev.id}>
                  <button
                    type="button"
                    className={"btn btn--sm fsm-event-btn is-" + ev.kind}
                    disabled={!able}
                    onClick={() => fire(ev)}
                  >
                    {ev.label}
                  </button>
                  <span className="fsm-event-kind">
                    {ev.kind === "user" ? "사용자 행동" : "서버 응답"}
                  </span>
                  <span className="fsm-event-to">
                    {able
                      ? `→ ${getState(ev.to) ? getState(ev.to).ko : ev.to} (${ev.to})`
                      : `${ev.from.join(" · ")} 상태에서만 일어난다`}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ---------- 화면 + 코드 ---------- */}
        <div className="render-board">
          <div className="render-screen" aria-live="polite">
            <p className="render-screen-head">사용자가 보는 화면</p>
            <div className={"mini-screen is-" + screen.kind}>
              <p className="mini-title">{screen.title}</p>
              {screen.kind === "success" ? (
                <>
                  <p className="mini-name">{screen.name}</p>
                  <p className="mini-score">{screen.score}</p>
                  <p className="mini-sub">{screen.sub}</p>
                </>
              ) : screen.kind === "idle" ? (
                <>
                  <p className="mini-body">{screen.body}</p>
                  <span className="mini-btn">{screen.action}</span>
                </>
              ) : (
                <p className={"mini-body" + (screen.kind === "error" ? " is-error" : "")}>{screen.body}</p>
              )}
            </div>
            <p className="render-note">
              화면이 바뀐 이유는 데이터가 도착해서가 아니라 <strong>상태가 바뀌었기 때문</strong>입니다.
            </p>
          </div>

          <div className="render-code">
            <p className="render-screen-head">{FILE_PATH}</p>
            <pre className="dockerfile-code"><code>
              {CODE_LINES.map((l, i) => (
                <span
                  className={"dockerfile-line" + (l.at.includes(state) ? " is-hot" : "")}
                  key={i}
                >
                  {l.t || " "}
                </span>
              ))}
            </code></pre>
            <p className="render-note">지금 상태와 관련된 줄이 강조됩니다.</p>
          </div>
        </div>

        {/* ---------- 방금 일어난 일 ---------- */}
        <div className="cmd-result" aria-live="polite">
          {last ? (
            <>
              <p className="cmd-note">
                <span className={"tag " + (last.to === "error" ? "tag--error" : "tag--done")}>
                  {last.kind === "user" ? "사용자 행동" : "서버 응답"}
                </span>
                <strong className="repo-result-title">
                  {last.label} → {getState(last.to) ? getState(last.to).ko : last.to} 상태
                </strong>
              </p>
              <p className="cmd-detail">{last.detail}</p>
              {last.request ? (
                <pre className="cmd-output"><code>{last.request}</code></pre>
              ) : null}
              {last.body ? (
                <pre className="cmd-output"><code>{last.body}</code></pre>
              ) : null}
            </>
          ) : (
            <p className="cmd-empty">위에서 일어날 수 있는 일을 하나 고르면 상태와 화면이 함께 바뀝니다.</p>
          )}
        </div>

        <p className="map-foot">
          화면은 데이터를 직접 갖고 있지 않습니다. 이 프로젝트에서는 화면이 API에 데이터를 요청하고,
          데이터베이스 접근은 서버가 담당합니다.
        </p>
      </div>
    </section>
  );
}
