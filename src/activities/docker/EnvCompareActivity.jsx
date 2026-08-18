import { useCallback, useEffect, useRef, useState } from "react";
import {
  HOSTS,
  RUN_MODES,
  IMAGE_PARTS,
  IMAGE_NAME,
  MAX_CONTAINERS,
  containerAt,
  compareNote,
  runOn
} from "../../data/docker.js";

/*
 * Chapter 06 Primary Visualization — Code + Runtime + Dependencies → Image → Container
 * (11_PROJECT_UI_SPEC §26 — Chapter 06)
 *
 * Chapter 01~05 의 Activity 를 복제하지 않는다.
 * 여기서 배우는 것은 "같은 코드가 컴퓨터에 따라 다르게 도는 이유"와
 * "Image 와 Container 는 다른 것" 두 가지다.
 *
 * 두 컴퓨터를 나란히 두고 같은 실행 방식을 동시에 적용하는 대조 실험이 핵심 화면이다.
 * Docker 는 요청이 통과하는 계층이 아니므로 Runtime 경로 위에 올리지 않는다.
 */
export default function EnvCompareActivity({
  activity,
  selectedNode,
  onSelectNode,
  onOutcome,
  onFocus,
  onComplete,
  onNotify
}) {
  const [mode, setMode] = useState(null);
  const [seen, setSeen] = useState({ direct: false, docker: false });
  const [containers, setContainers] = useState([]);
  const doneRef = useRef(false);

  /* 실행 환경 축을 본다 — Runtime 경로의 특정 Node 를 가리키지 않는다 */
  useEffect(() => { onFocus({ node: null, edge: null }); }, [onFocus]);

  const pick = useCallback((id) => {
    setMode(id);
    setSeen((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
    if (selectedNode !== "docker") onSelectNode("docker");
  }, [selectedNode, onSelectNode]);

  const addContainer = () => {
    if (containers.length >= MAX_CONTAINERS) return;
    setContainers((prev) => [...prev, containerAt(prev.length)]);
  };
  const stopContainer = (id) => setContainers((prev) => prev.filter((c) => c.id !== id));

  const bothSeen = seen.direct && seen.docker;
  const madeContainer = containers.length > 0;
  const doneCount = (bothSeen ? 1 : 0) + (madeContainer ? 1 : 0);

  useEffect(() => {
    if (!bothSeen || !madeContainer || doneRef.current) return;
    doneRef.current = true;
    onOutcome({
      status: "success",
      title: "환경을 이미지에 담아 통일했습니다",
      text:
        "직접 실행은 컴퓨터마다 결과가 달랐고, 이미지로 실행하니 같아졌습니다. " +
        "Image는 실행에 필요한 것을 담아 둔 틀이고, Container는 그 틀로 실제 실행된 하나입니다. " +
        "Chapter 07에서는 그 이미지를 무엇으로 만드는지 배웁니다."
    });
    onComplete();
    onNotify("환경 차이와 Image · Container 구분을 모두 확인했습니다");
  }, [bothSeen, madeContainer, onOutcome, onComplete, onNotify]);

  const reset = () => {
    doneRef.current = false;
    setMode(null);
    setSeen({ direct: false, docker: false });
    setContainers([]);
    onOutcome(null);
    onNotify("처음 상태로 되돌렸습니다");
  };

  const spec = RUN_MODES.find((m) => m.id === mode) || null;

  return (
    <section className="section" aria-labelledby="activity-heading">
      <h2 className="section-title" id="activity-heading">{activity.title}</h2>
      {activity.guide ? <p className="section-desc">{activity.guide}</p> : null}

      <div className="panel activity-panel">
        <p className="sim-notice" role="note">
          <span className="tag tag--warn">학습용 시뮬레이션</span>
          <span className="sim-notice-title">실행 환경 비교 실험</span>
          <span className="sim-notice-body">
            실제 Docker를 실행하지 않습니다. 두 컴퓨터의 설치 상태에 따라 결과가 어떻게 달라지는지 학습용으로 계산합니다.
          </span>
        </p>

        {/* 점수 표시 대신 "다음에 눌러 볼 것"만 안내한다 */}
        <p className="explore-hint" aria-live="polite">
          {!bothSeen
            ? "두 가지 실행 방식을 하나씩 눌러 결과를 비교해 보세요."
            : !madeContainer
              ? "이제 아래에서 이미지를 하나 띄워 보세요."
              : "환경 차이와 틀 · 실행된 것의 차이를 모두 봤습니다."}
          {mode || containers.length ? (
            <button type="button" className="btn btn--sm" onClick={reset}>처음부터</button>
          ) : null}
        </p>

        {/* ---------- 1. 실행 방식 고르기 ---------- */}
        <div className="builder-row">
          <span className="builder-label" id="dk-mode">같은 코드를 어떻게 실행할까</span>
          <div className="choice-group" role="group" aria-labelledby="dk-mode">
            {RUN_MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                className={"choice" + (m.id === mode ? " is-picked" : "")}
                aria-pressed={m.id === mode}
                onClick={() => pick(m.id)}
              >
                <span className="choice-main">{m.label}</span>
                <span className="choice-sub">{m.cmd}</span>
              </button>
            ))}
          </div>
          <p className="builder-hint">
            {spec ? spec.desc : "두 컴퓨터에 같은 방식을 동시에 적용해 결과를 나란히 비교합니다."}
          </p>
        </div>

        {/* ---------- 2. 두 컴퓨터 대조 ---------- */}
        <div className="host-board" aria-live="polite">
          {HOSTS.map((h) => {
            const res = mode ? runOn(h, mode) : null;
            return (
              <div className={"host-card" + (res ? (res.ok ? " is-ok" : " is-fail") : "")} key={h.id}>
                <p className="host-head">
                  <span className="host-name">{h.name}</span>
                  <span className={"tag " + (res ? (res.ok ? "tag--done" : "tag--error") : "")}>
                    {res ? (res.ok ? "실행 성공" : "실행 실패") : "대기"}
                  </span>
                </p>
                <p className="host-note">{h.note}</p>

                <ul className="host-env">
                  <li><span className="host-env-key">설치된 Python</span><span className="host-env-val">{h.python}</span></li>
                  <li>
                    <span className="host-env-key">flask 라이브러리</span>
                    <span className="host-env-val">{h.libs ? "설치됨" : "없음"}</span>
                  </li>
                </ul>

                {res ? (
                  <>
                    <p className="host-run">
                      <span className="cmd-echo-prompt">$ </span>{res.cmd}
                    </p>
                    <pre className="host-output"><code>{res.output}</code></pre>
                    <ul className="host-env">
                      <li><span className="host-env-key">쓰인 Python</span><span className="host-env-val">{res.python}</span></li>
                      <li><span className="host-env-key">어디에 있던 것</span><span className="host-env-val">{res.source}</span></li>
                    </ul>
                    <p className="host-verdict">{res.note}</p>
                  </>
                ) : (
                  <p className="host-idle">아직 실행하지 않았습니다.</p>
                )}
              </div>
            );
          })}
        </div>

        {mode ? <p className="compare-note" aria-live="polite">{compareNote(mode)}</p> : null}

        {/* ---------- 3. Image ↔ Container ----------
            두 실행 방식의 차이를 먼저 본 뒤에 용어를 연결한다.
            첫 화면에 Image · Container 를 함께 던지지 않는다. (CLAUDE.md §13) */}
        {!bothSeen ? (
          <p className="learn-note" role="note">
            <span className="tag">다음 단계</span>
            두 가지 실행 방식의 결과를 모두 확인하면, 방금 본 차이를 만들어 낸
            &lsquo;틀&rsquo;과 &lsquo;실행된 것&rsquo;이 무엇인지 이어서 봅니다.
          </p>
        ) : (
        <div className="img-run">
          <h3 className="builder-title">이미지와 컨테이너는 다른 것이다</h3>

          <div className="img-card">
            <p className="img-head">
              <span className="img-kind">Image</span>
              <code className="img-name">{IMAGE_NAME}</code>
              <span className="img-sub">실행에 필요한 것을 담아 둔 틀 · 실행 중인 것이 아니다</span>
            </p>
            <ul className="img-parts">
              {IMAGE_PARTS.map((p) => (
                <li className="img-part" key={p.id}>
                  <span className="img-part-label">{p.label}</span>
                  <code className="img-part-value">{p.value}</code>
                  <span className="img-part-desc">{p.desc}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="img-actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={addContainer}
              disabled={containers.length >= MAX_CONTAINERS}
            >
              docker run 으로 컨테이너 띄우기
            </button>
            <span className="img-hint">
              {containers.length >= MAX_CONTAINERS
                ? "이 연습에서는 3개까지만 띄웁니다. 이미지는 그대로 하나입니다."
                : "같은 이미지 하나로 컨테이너를 여러 개 띄울 수 있습니다."}
            </span>
          </p>

          <ul className="container-list" aria-live="polite">
            {containers.length === 0 ? (
              <li className="container-empty">
                실행 중인 컨테이너가 없습니다. 이미지는 있지만 아직 아무것도 돌지 않는 상태입니다.
              </li>
            ) : (
              containers.map((c) => (
                <li className="container-item" key={c.id}>
                  <span className="container-name">{c.name}</span>
                  <span className="container-from">from {c.image}</span>
                  <span className="tag tag--done">running</span>
                  <button type="button" className="btn btn--sm" onClick={() => stopContainer(c.id)}>
                    docker stop
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
        )}

        <p className="map-foot">
          Docker는 요청이 지나가는 계층이 아니라 서비스 입구 · 요청 처리 · 데이터 저장을 담아 실행하는 환경입니다.
        </p>
      </div>
    </section>
  );
}
