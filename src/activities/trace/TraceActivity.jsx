import { useCallback, useEffect, useRef, useState } from "react";
import {
  TRACE_STEPS,
  LAST_STEP,
  PLAY_DURATION,
  DATA_KIND_LABEL,
  SHAPE_CHAIN,
  TARGET,
  REQUEST_PATH
} from "../../data/trace.js";
import { getNode } from "../../data/architecture.js";

/* 내부 key(browser · flask · mysql …)를 사용자 화면에 그대로 노출하지 않는다. (CLAUDE.md §22) */
function nodeLabel(id) {
  const n = getNode(id);
  if (!n) return null;
  return `${n.role} / ${n.name}`;
}

/*
 * Chapter 14 Primary Visualization — Full Request → Response Trace
 * (11_PROJECT_UI_SPEC §26 · PROCESS_ANIMATION_SPEC 적용)
 *
 * Chapter 01 의 Process Scene 을 복사하지 않는다.
 *   Chapter 01  요청 한 장이 시스템을 통과하는 공정 장면 (가로 SVG)
 *   Chapter 14  학습을 마친 뒤의 종합 추적 —
 *               각 단계에서 기술 · 파일 · 코드 · 데이터 모양 · Architecture 위치를 함께 잇는다
 *
 * PROCESS_ANIMATION_SPEC 준수
 *   §5 단계 모델 · §6 Packet 의 의미 변화 · §8 기본 Step Mode / 보조 Play Once(한 번 재생 후 정지)
 *   §9 Reduced Motion · §10.4 재생 중 사용자 조작 우선 · §18 aria-live · 키보드
 */
export default function TraceActivity({
  activity,
  motionOn,
  selectedNode,
  onSelectNode,
  onOutcome,
  onFocus,
  onComplete,
  onNotify
}) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reached, setReached] = useState(false);
  const timerRef = useRef(null);
  const doneRef = useRef(false);

  const cur = TRACE_STEPS[step];

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  /* 단계가 바뀌면 지도의 강조도 같이 바뀐다 */
  useEffect(() => {
    onFocus({ node: cur.node, edge: cur.edge });
  }, [cur.node, cur.edge, onFocus]);

  useEffect(() => {
    if (step === LAST_STEP) setReached(true);
  }, [step]);

  const stop = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    setPlaying(false);
  }, []);

  /* Play Once — 끝나면 멈춘다. 무한 반복하지 않는다. */
  useEffect(() => {
    if (!playing) return undefined;
    if (step >= LAST_STEP) { setPlaying(false); return undefined; }
    const hold = motionOn ? (TRACE_STEPS[step].hold || 600) : 200;
    timerRef.current = setTimeout(() => setStep((s) => Math.min(s + 1, LAST_STEP)), hold);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, step, motionOn]);

  const go = (n) => { stop(); setStep(Math.max(0, Math.min(n, LAST_STEP))); };

  const play = () => {
    if (playing) { stop(); return; }
    setStep(0);
    setPlaying(true);
  };

  const pickNode = (id) => {
    if (!id) return;
    stop();
    onSelectNode(id);
  };

  /* 마지막 단계까지 도달하면 완료 */
  useEffect(() => {
    if (!reached || doneRef.current) return;
    doneRef.current = true;
    onOutcome({
      status: "success",
      title: "요청 한 건이 지나온 길을 모두 이었습니다",
      text:
        `${TARGET.name} 학생 조회 요청이 화면 → 서비스 입구 → 요청 처리 → 데이터 저장을 지나 되돌아왔습니다. ` +
        "같은 '2번 학생을 알고 싶다'는 작업이 각 처리 단계에서 그 단계의 방식으로 다시 표현되었습니다 — " +
        "HTTP Request · SQL Query · DB Row · JSON Response · 화면. " +
        "Chapter 15에서는 이 시스템을 직접 가져와 실행하고 고쳐 다시 공유합니다."
    });
    onComplete();
    onNotify("전체 추적을 끝까지 확인했습니다");
  }, [reached, onOutcome, onComplete, onNotify]);

  const shape = SHAPE_CHAIN.filter((s) => s.at <= step);

  return (
    <section className="section" aria-labelledby="activity-heading">
      <h2 className="section-title" id="activity-heading">{activity.title}</h2>
      {activity.guide ? <p className="section-desc">{activity.guide}</p> : null}

      <div className="panel activity-panel">
        <p className="learn-note" role="note">
          <span className="tag">학습용</span>
          학습용 예시 데이터로 추적합니다. 실제 서버에 요청하지 않지만 각 단계의 코드와 파일은 실제 프로젝트의 것입니다.
        </p>

        {/* ---------- 단계 조작 (기본 모드) ---------- */}
        <div className="trace-controls">
          <button type="button" className="btn" onClick={() => go(step - 1)} disabled={step === 0}>
            ← 이전
          </button>
          <span className="trace-count" aria-live="polite">
            STEP {step} / {LAST_STEP}
          </span>
          <button type="button" className="btn" onClick={() => go(step + 1)} disabled={step === LAST_STEP}>
            다음 →
          </button>
        </div>

        <p className="trace-foot">
          <button
            type="button"
            className="btn btn--sm"
            aria-pressed={playing}
            onClick={play}
          >
            {playing ? "재생 멈춤" : "▶ 전체 흐름 보기"}
          </button>
          <span className="trace-foot-note">
            {playing
              ? "재생 중입니다. 이전·다음을 누르거나 단계를 고르면 멈춥니다."
              : `한 번만 재생하고 멈춥니다 (약 ${Math.round(PLAY_DURATION / 1000)}초).`}
          </span>
          {step > 0 ? (
            <button type="button" className="btn btn--sm" onClick={() => go(0)}>처음으로</button>
          ) : null}
        </p>

        {/* ---------- 데이터 모양의 변화 ---------- */}
        <p className="shape-chain-lead">
          같은 &lsquo;{TARGET.id}번 학생을 알고 싶다&rsquo;는 작업이 각 처리 단계에서 다른 형태로 표현됩니다.
        </p>
        <div className="shape-chain" aria-label="단계별 표현 형태">
          {SHAPE_CHAIN.map((s, i) => (
            <span key={s.kind} className="shape-item">
              {i > 0 ? <span className="shape-arrow" aria-hidden="true">→</span> : null}
              <span className={"shape-badge is-" + s.kind + (shape.some((x) => x.kind === s.kind) ? " is-on" : "")}>
                {s.label}
              </span>
            </span>
          ))}
        </div>

        {/* ---------- Trace Timeline ---------- */}
        <div className="trace-board">
          <ol className="trace-list">
            {TRACE_STEPS.map((s) => {
              const state = s.n < step ? "done" : s.n === step ? "now" : "todo";
              return (
                <li key={s.n}>
                  <button
                    type="button"
                    className={"trace-step is-" + state + (s.dir ? " is-" + s.dir : "")}
                    aria-current={state === "now" ? "step" : undefined}
                    onClick={() => go(s.n)}
                  >
                    <span className="trace-n">{s.n}</span>
                    <span className="trace-title">{s.title}</span>
                    <span className="trace-tech">{s.tech || "—"}</span>
                    <span className="trace-dir">
                      {s.dir === "req" ? "요청 방향 →" : s.dir === "res" ? "← 응답 방향" : "대기"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="trace-detail" aria-live="polite">
            <p className="trace-detail-head">
              <span className="trace-detail-n">STEP {cur.n}</span>
              <strong className="trace-detail-title">{cur.title}</strong>
              {cur.dir ? (
                <span className={"trace-badge is-" + cur.dir}>
                  {cur.dir === "req" ? "요청" : "응답"}
                </span>
              ) : null}
            </p>

            <p className="trace-what">{cur.what}</p>
            <p className="trace-why">{cur.detail}</p>

            <ul className="trace-facts">
              <li>
                <span className="trace-fact-key">기술</span>
                <span className="trace-fact-val">{cur.tech || "아직 없음"}</span>
              </li>
              <li>
                <span className="trace-fact-key">파일</span>
                <span className="trace-fact-val">{cur.file || "해당 없음"}</span>
              </li>
              <li>
                <span className="trace-fact-key">코드</span>
                <span className="trace-fact-val trace-fact-code">{cur.code || "해당 없음"}</span>
              </li>
              <li>
                <span className="trace-fact-key">전체 구조에서</span>
                <span className="trace-fact-val">
                  {cur.node ? (
                    <button type="button" className="btn btn--sm" onClick={() => pickNode(cur.node)}>
                      {nodeLabel(cur.node)} 위치 보기
                    </button>
                  ) : "아직 아무 계층도 일하지 않음"}
                </span>
              </li>
            </ul>

            <div className="trace-data">
              <p className="trace-data-head">
                이 단계에서의 표현 형태
                <span className={"shape-badge is-" + cur.dataKind + " is-on"}>
                  {DATA_KIND_LABEL[cur.dataKind]}
                </span>
              </p>
              <pre className="trace-data-body"><code>{cur.data || "(아직 데이터가 없습니다)"}</code></pre>
            </div>
          </div>
        </div>

        {/* ---------- 사용자 화면 ---------- */}
        <div className="render-screen">
          <p className="render-screen-head">사용자가 보는 화면</p>
          <div className={"mini-screen is-" + cur.ui}>
            <p className="mini-title">학생 성적 조회</p>
            {cur.ui === "success" ? (
              <>
                <p className="mini-name">{TARGET.name}</p>
                <p className="mini-score">{TARGET.score}점</p>
                <p className="mini-sub">학생 번호 {TARGET.id}</p>
              </>
            ) : cur.ui === "loading" ? (
              <p className="mini-body">불러오는 중…</p>
            ) : (
              <>
                <p className="mini-body">학생 번호 {TARGET.id}</p>
                <span className="mini-btn">조회</span>
              </>
            )}
          </div>
          <p className="render-note">
            {cur.ui === "success"
              ? "응답이 상태로 들어가 화면이 실제로 바뀌었습니다."
              : `요청 주소는 ${REQUEST_PATH} 입니다. 응답이 도착해야 화면이 바뀝니다.`}
          </p>
        </div>

        <p className="map-foot">
          Git · GitHub · Docker는 이 경로에 없습니다. 코드를 관리하고 실행 환경을 만들 뿐입니다.
        </p>
      </div>
    </section>
  );
}
