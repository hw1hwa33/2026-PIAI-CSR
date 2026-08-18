import { useCallback, useEffect, useRef, useState } from "react";
import {
  AXES,
  STEPS,
  TOUR,
  STEP_USE,
  SERVICE_NODES,
  INITIAL,
  DANGER,
  FINAL_MESSAGE,
  getStep
} from "../../data/completion.js";

/*
 * Chapter 15 Primary Visualization — Guided Tour
 * (11_PROJECT_UI_SPEC §26 — Chapter 15)
 *
 * 최종 Mission 도, 완료 조건도 아니다. (CLAUDE.md — Activity 는 평가 도구가 아니다)
 *   [다음 단계 보기] 로 한 바퀴를 순서대로 함께 돌아본다.
 *   "완료 조건 포함 / 아님" 같은 판정 용어를 화면에 두지 않고, 각 단계가 언제 쓰는 것인지만 적는다.
 *   단계를 실행할 때마다 세 축 중 어느 것이 움직이는지가 위 보드에서 보인다.
 *
 * docker compose down -v 는 데이터 삭제 위험 명령이라 Tour 에 넣지 않고 경고로만 둔다.
 */
export default function ProjectCompleteActivity({
  activity,
  selectedNode,
  onSelectNode,
  onOutcome,
  onFocus,
  onComplete,
  onNotify
}) {
  const [state, setState] = useState(INITIAL);
  const [step, setStep] = useState(0);   // 지금까지 돌아본 단계 수
  const doneRef = useRef(false);

  useEffect(() => { onFocus({ node: null, edge: null }); }, [onFocus]);

  const done = step >= TOUR.length;
  const current = step > 0 ? getStep(TOUR[step - 1]) : null;
  const next = done ? null : getStep(TOUR[step]);

  const showNext = useCallback(() => {
    if (done) return;
    const s = getStep(TOUR[step]);
    setStep((n) => n + 1);
    setState((prev) => ({ ...prev, ...s.effect, [`seen_${s.id}`]: true }));

    if (s.axis === "runtime" && selectedNode !== "nginx") onSelectNode("nginx");
    if (s.axis === "source" && selectedNode !== "github") onSelectNode("github");
    if (s.axis === "env" && selectedNode !== "docker") onSelectNode("docker");
  }, [done, step, selectedNode, onSelectNode]);

  useEffect(() => {
    if (!done || doneRef.current) return;
    doneRef.current = true;
    onOutcome({
      status: "success",
      title: FINAL_MESSAGE,
      text:
        "받아서 실행하고, 화면과 데이터를 확인하고, 고쳐서 기록을 남기고 다시 공유했습니다. " +
        "코드와 기록 관리, 실행 환경, 실제 요청 경로 — 세 가지가 각각 다른 일을 한다는 것까지 봤습니다."
    });
    onComplete();
    onNotify("한 바퀴를 모두 돌아봤습니다");
  }, [done, onOutcome, onComplete, onNotify]);

  const reset = () => {
    doneRef.current = false;
    setState(INITIAL);
    setStep(0);
    onOutcome(null);
    onNotify("처음부터 다시 봅니다");
  };

  const axisState = {
    source: state.pushed ? "인터넷 기록과 내 기록이 같음"
      : state.committed ? "내 컴퓨터에만 새 기록 있음"
      : state.edited ? "고친 내용이 아직 기록되지 않음"
      : state.cloned ? "코드와 기록을 받아 둠"
      : "아직 코드를 받지 않음",
    env: state.stopped ? "정리됨 · 데이터는 그대로 남음"
      : state.running ? "세 서비스 실행 중"
      : state.envFile ? "값 준비됨 · 아직 실행 전"
      : "아직 준비되지 않음",
    runtime: state.checkedScreen ? "화면과 데이터 모두 확인됨"
      : state.running ? "실행 중 · 아직 확인 전"
      : "아직 요청을 받을 수 없음"
  };

  return (
    <section className="section" aria-labelledby="activity-heading">
      <h2 className="section-title" id="activity-heading">{activity.title}</h2>
      {activity.guide ? <p className="section-desc">{activity.guide}</p> : null}

      <div className="panel activity-panel">
        <p className="sim-notice" role="note">
          <span className="tag tag--warn">학습용 시뮬레이션</span>
          <span className="sim-notice-title">한 바퀴 함께 돌아보기</span>
          <span className="sim-notice-body">
            실제 명령을 실행하지 않습니다. 각 단계가 어느 축을 어떻게 바꾸는지 보여 줍니다.
          </span>
        </p>

        {/* ---------- 지금 단계 ---------- */}
        <div className="guided">
          <p className="guided-head">
            <span className="guided-step">{done ? "한 바퀴 끝" : `${step + 1}번째 단계`}</span>
            <span className="guided-task">
              {done ? "여기까지가 한 바퀴입니다." : next.goal}
            </span>
          </p>
          <p className="guided-why">
            {done
              ? "받아서 실행하고, 확인하고, 고쳐서 다시 공유했습니다. 세 축이 각각 다른 일을 했습니다."
              : STEP_USE[next.id]}
          </p>
          <p className="guided-actions">
            {!done ? (
              <button type="button" className="btn btn--primary" onClick={showNext}>
                다음 단계 보기
              </button>
            ) : null}
            {next && next.cmd ? <code className="guided-cmd">{next.cmd}</code> : null}
            {step > 0 ? (
              <button type="button" className="btn btn--sm" onClick={reset}>처음부터</button>
            ) : null}
          </p>
        </div>

        {/* ---------- 세 축 보드 ---------- */}
        <div className="axis-board">
          {AXES.map((ax) => (
            <div className={"axis-card is-" + ax.id} key={ax.id}>
              <p className="axis-head">
                <span className="axis-ko">{ax.ko}</span>
                <span className="axis-label">{ax.label}</span>
              </p>
              <p className="axis-desc">{ax.desc}</p>

              {ax.id === "runtime" ? (
                <ul className="axis-nodes">
                  {SERVICE_NODES.map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        className={
                          "axis-node" +
                          (state.running ? " is-up" : "") +
                          (selectedNode === n.id ? " is-selected" : "")
                        }
                        aria-pressed={selectedNode === n.id}
                        onClick={() => onSelectNode(n.id)}
                      >
                        <span className="axis-node-name">{n.role}</span>
                        <span className="axis-node-role">{n.name}</span>
                        <span className="axis-node-state">
                          {state.running ? "실행 중" : "멈춤"}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : ax.id === "source" ? (
                <ul className="axis-nodes">
                  <li>
                    <button
                      type="button"
                      className={"axis-node" + (state.cloned ? " is-up" : "") + (selectedNode === "local-git" ? " is-selected" : "")}
                      aria-pressed={selectedNode === "local-git"}
                      onClick={() => onSelectNode("local-git")}
                    >
                      <span className="axis-node-name">내 컴퓨터의 기록</span>
                      <span className="axis-node-role">Local Git</span>
                      <span className="axis-node-state">
                        {state.committed ? "기록 2개" : state.cloned ? "기록 1개" : "없음"}
                      </span>
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className={"axis-node" + (state.pushed ? " is-up" : "") + (selectedNode === "github" ? " is-selected" : "")}
                      aria-pressed={selectedNode === "github"}
                      onClick={() => onSelectNode("github")}
                    >
                      <span className="axis-node-name">인터넷에 둔 기록</span>
                      <span className="axis-node-role">GitHub</span>
                      <span className="axis-node-state">
                        {state.pushed ? "기록 2개" : "기록 1개"}
                      </span>
                    </button>
                  </li>
                </ul>
              ) : (
                <ul className="axis-nodes">
                  <li>
                    <button
                      type="button"
                      className={"axis-node" + (state.running ? " is-up" : "") + (selectedNode === "docker" ? " is-selected" : "")}
                      aria-pressed={selectedNode === "docker"}
                      onClick={() => onSelectNode("docker")}
                    >
                      <span className="axis-node-name">실행 환경</span>
                      <span className="axis-node-role">Docker Compose</span>
                      <span className="axis-node-state">
                        {state.running ? "세 개 실행 중" : state.envFile ? "값 준비됨" : "대기"}
                      </span>
                    </button>
                  </li>
                </ul>
              )}

              <p className="axis-state" aria-live="polite">{axisState[ax.id]}</p>
              <p className="axis-note">{ax.note}</p>
            </div>
          ))}
        </div>

        {/* ---------- 한 바퀴 목록 ---------- */}
        <div className="final-steps">
          <h3 className="builder-title">한 바퀴</h3>
          <ol className="final-list">
            {TOUR.map((id, i) => {
              const s = getStep(id);
              const shown = i < step;
              return (
                <li className={"final-step is-" + s.axis + (shown ? " is-done" : "")} key={s.id}>
                  <span className="final-n">{i + 1}</span>
                  <span className="final-goal">{s.goal}</span>
                  <span className={"final-axis is-" + s.axis}>
                    {s.axis === "source" ? "코드와 기록" : s.axis === "env" ? "실행 환경" : "요청 경로"}
                  </span>
                  <span className="final-use">{STEP_USE[s.id]}</span>
                  {s.cmd ? <code className="final-cmd">{s.cmd}</code> : <span className="final-cmd">직접 확인</span>}
                </li>
              );
            })}
          </ol>
        </div>

        {/* ---------- 방금 단계의 결과 ---------- */}
        {current ? (
          <div className="cmd-result" aria-live="polite">
            <p className="cmd-output-head">
              <span className="cmd-output-label">
                학습용 시뮬레이션 결과 — 실제로 실행한 내용이 아닙니다.
              </span>
            </p>
            <pre className="cmd-output"><code>
              <span className="cmd-echo">
                <span className="cmd-echo-prompt">{(current.cwd || "~") + " $ "}</span>
                {current.cmd || "(직접 확인하는 단계)"}
              </span>
              {"\n" + current.output}
            </code></pre>
            <p className="cmd-detail">{current.detail}</p>
          </div>
        ) : (
          <p className="cmd-empty">다음 단계 보기를 누르면 그 단계가 무엇을 하는지 여기에 표시됩니다.</p>
        )}

        {/* ---------- 위험 명령 ---------- */}
        <div className="danger-note" role="note">
          <p className="danger-head">
            <span className="tag tag--error">주의</span>
            <code className="danger-cmd">{DANGER.cmd}</code>
            <strong className="danger-title">{DANGER.title}</strong>
          </p>
          <p className="danger-body">{DANGER.detail}</p>
        </div>

        {done ? <p className="final-banner" aria-live="polite">{FINAL_MESSAGE}</p> : null}

        <p className="map-foot">
          세 축은 끝까지 다른 일을 합니다. 기록을 남기고 공유하는 것은 실행 중인 서비스를 바꾸지 않고,
          서비스를 띄우는 것은 인터넷 저장소에 아무것도 올리지 않습니다.
        </p>
      </div>
    </section>
  );
}
