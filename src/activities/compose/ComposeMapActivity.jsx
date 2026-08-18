import { useCallback, useEffect, useRef, useState } from "react";
import {
  SERVICES,
  START_ORDER,
  UP_CMD,
  PS_CMD,
  PS_OUTPUT,
  COMPOSE_PATH,
  NETWORK_LINE,
  upOne,
  startLine,
  getService
} from "../../data/compose.js";

/*
 * Chapter 08 Primary Visualization — Compose Service Map
 * (11_PROJECT_UI_SPEC §26 — Chapter 08)
 *
 * 앞 Chapter 들의 Activity 를 복제하지 않는다.
 * 여기서 배우는 것은 "여러 서비스가 하나의 묶음으로 뜨고, 서비스 이름이 곧 주소가 된다" 이다.
 *
 * 화면의 주인공은 바깥 경계선(호스트) 안에 놓인 서비스 지도다.
 * 바깥으로 열린 것은 web 하나뿐이라는 점이 그림으로 보여야 한다.
 * Compose 자체를 Request 가 통과하는 Hop 으로 그리지 않는다.
 */
export default function ComposeMapActivity({
  activity,
  selectedNode,
  onSelectNode,
  onOutcome,
  onFocus,
  onComplete,
  onNotify
}) {
  const [started, setStarted] = useState([]);
  /* 실제로 실행한 명령과 그 출력 — 터미널에 그대로 쌓아 보여 준다 */
  const [log, setLog] = useState([]);
  const [picked, setPicked] = useState(null);
  const [seen, setSeen] = useState({});
  const doneRef = useRef(false);

  useEffect(() => { onFocus({ node: null, edge: null }); }, [onFocus]);

  const allUp = started.length === START_ORDER.length;
  const seenCount = SERVICES.filter((s) => seen[s.id]).length;

  /* 다음에 실행될 것 — 버튼 옆 "실행 대기 중인 명령"에 그대로 쓴다 */
  const nextId = allUp ? null : START_ORDER[started.length];
  const nextService = nextId ? getService(nextId) : null;

  const step = () => {
    if (allUp) return;
    const id = START_ORDER[started.length];
    const first = started.length === 0;
    setStarted((prev) => [...prev, id]);
    setLog((prev) => [
      ...prev,
      { cmd: upOne(id), lines: first ? [NETWORK_LINE, startLine(id)] : [startLine(id)] }
    ]);
  };

  const upAll = () => {
    /* 남은 것을 한 번에 띄운다 — 이때는 명령 하나로 전부 시작된다 */
    const rest = START_ORDER.filter((id) => !started.includes(id));
    if (!rest.length) return;
    const first = started.length === 0;
    setStarted(START_ORDER.slice());
    setLog((prev) => [
      ...prev,
      { cmd: UP_CMD, lines: [...(first ? [NETWORK_LINE] : []), ...rest.map((id) => startLine(id))] }
    ]);
  };

  const pick = useCallback((id) => {
    setPicked(id);
    setSeen((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
    const s = getService(id);
    if (s && selectedNode !== s.node) onSelectNode(s.node);
  }, [selectedNode, onSelectNode]);

  /*
   * 이 Chapter 의 핵심 행동은 "여러 서비스를 함께 띄운다" 하나다.
   * 그러니 세 서비스가 모두 뜨면 그 자리에서 결과를 보여 준다.
   *
   * 예전에는 서비스 카드를 하나씩 눌러 본 것(seenCount)까지 함께 요구했는데,
   * 그것은 추가로 통과해야 하는 조건이 되어 버린다. (CLAUDE.md — Activity 는 평가 도구가 아니다)
   * 서비스별 설정 보기는 그 뒤에 자유롭게 하는 탐색이지 완료 조건이 아니다.
   */
  useEffect(() => {
    if (!allUp || doneRef.current) return;
    doneRef.current = true;
    onOutcome({
      status: "success",
      title: "세 서비스가 하나의 묶음으로 떴습니다",
      text:
        "파일 하나로 데이터 저장 · 요청 처리 · 서비스 입구를 함께 실행했습니다. " +
        "바깥으로 열린 것은 서비스 입구 하나뿐이고, 나머지는 서비스 이름을 주소로 삼아 안에서만 서로 부릅니다. " +
        "각 서비스를 눌러 설정을 더 볼 수도 있습니다. " +
        "Chapter 09부터는 이렇게 뜬 서비스 안의 코드를 계층별로 봅니다."
    });
    onComplete();
    onNotify("세 서비스가 모두 떴습니다");
  }, [allUp, onOutcome, onComplete, onNotify]);

  const reset = () => {
    doneRef.current = false;
    setStarted([]);
    setLog([]);
    setPicked(null);
    setSeen({});
    onOutcome(null);
    onNotify("처음 상태로 되돌렸습니다");
  };

  const detail = picked ? getService(picked) : null;

  return (
    <section className="section" aria-labelledby="activity-heading">
      <h2 className="section-title" id="activity-heading">{activity.title}</h2>
      {activity.guide ? <p className="section-desc">{activity.guide}</p> : null}

      <div className="panel activity-panel">
        <p className="sim-notice" role="note">
          <span className="tag tag--warn">학습용 시뮬레이션</span>
          <span className="sim-notice-title">여러 서비스를 한 번에 띄우기</span>
          <span className="sim-notice-body">
            실제 컨테이너를 띄우지 않습니다. compose.yaml의 설정대로 무엇이 어떤 순서로 시작되는지 학습용으로 보여 줍니다.
          </span>
        </p>

        {/* 아직 배우지 않은 depends_on 을 먼저 쓰지 않는다 — 결과를 본 뒤에 이름을 붙인다 (CLAUDE.md) */}
        <p className="explore-hint" aria-live="polite">
          {!allUp
            ? "파일에 적힌 시작 순서대로 데이터 저장 → 요청 처리 → 서비스 입구를 켜 봅니다."
            : seenCount < SERVICES.length
              ? "모두 떴습니다. 서비스를 눌러 보면 각각의 설정과 전체 구조에서의 위치도 볼 수 있습니다."
              : "시작 순서와 서비스별 설정을 모두 봤습니다."}
          {started.length || picked ? (
            <button type="button" className="btn btn--sm" onClick={reset}>처음부터</button>
          ) : null}
        </p>

        {/* ---------- Service Map ---------- */}
        <div className="compose-map">
          <p className="compose-outside">
            <span className="compose-outside-label">바깥 (내 컴퓨터 · 브라우저)</span>
            <span className={"compose-port" + (started.includes("web") ? " is-open" : "")}>
              {started.includes("web") ? "80번 포트 열림" : "80번 포트 닫힘"}
            </span>
          </p>

          <div className="compose-net">
            <p className="compose-net-label">
              compose 가 만든 네트워크 — 서비스 이름이 곧 주소가 된다
            </p>

            <ul className="compose-services">
              {SERVICES.map((s) => {
                const up = started.includes(s.id);
                /* 다음에 켜질 서비스는 지도 위에서도 대기 중임을 표시한다 */
                const waiting = s.id === nextId;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      className={
                        "compose-service" +
                        (up ? " is-up" : "") +
                        (waiting ? " is-waiting" : "") +
                        (picked === s.id ? " is-picked" : "")
                      }
                      aria-pressed={picked === s.id}
                      onClick={() => pick(s.id)}
                    >
                      <span className="compose-service-head">
                        <span className="compose-service-name">{s.name}</span>
                        <span className="compose-service-tech">{s.tech}</span>
                        {waiting ? <span className="compose-waiting">실행 대기</span> : null}
                      </span>
                      <span className="compose-service-role">{s.role}</span>
                      <span className="compose-service-addr">{s.address}</span>
                      <span className="compose-service-state">
                        {up ? "실행 중 · running" : waiting ? "다음 차례" : "아직 뜨지 않음"}
                      </span>
                      {s.volume ? (
                        <span className="compose-volume">volume {s.volume} · 데이터 보존</span>
                      ) : null}
                    </button>

                    {/* depends_on 은 "시작 요청 순서"만 정한다 — 준비 완료를 기다린다고 쓰지 않는다.
                        (CLAUDE.md §15 · 24_TECHNICAL_CONTENT_RULES) */}
                    {s.dependsOn.length ? (
                      <p className="compose-dep">
                        <span aria-hidden="true">↑</span>
                        시작 요청 순서 — {s.dependsOn.join(", ")}를 먼저 시작합니다
                        <span className="compose-dep-tech">depends_on: [{s.dependsOn.join(", ")}]</span>
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>

          <p className="compose-foot">
            바깥에서 직접 닿을 수 있는 것은 web 하나입니다. backend와 db는 이 네트워크 안에서만 서로 부릅니다.
          </p>
        </div>

        {/* ---------- 실행 ---------- */}
        <div className="compose-run">
          {/* 지금 누르면 무엇이 실행되는지 버튼 옆에 그대로 보여 준다 */}
          <p className="pending-cmd" aria-live="polite">
            <span className="pending-label">
              {allUp ? "대기 중인 명령 없음" : "지금 실행 대기 중인 명령"}
            </span>
            {allUp ? (
              <span className="pending-note">
                세 서비스가 모두 떴습니다. 상태를 다시 보려면 <code>{PS_CMD}</code> 를 씁니다.
              </span>
            ) : (
              <>
                <code className="pending-code">{upOne(nextId)}</code>
                <span className="pending-note">
                  {nextService.role} 을(를) 켭니다 · 서비스 이름 {nextService.name}
                </span>
              </>
            )}
          </p>

          <p className="img-actions">
            <button type="button" className="btn btn--primary" onClick={step} disabled={allUp}>
              {allUp ? "세 서비스 모두 실행됨" : `다음 서비스 켜기 (${nextService.role})`}
            </button>
            {!allUp ? (
              <button type="button" className="btn btn--sm" onClick={upAll}>
                한 번에 모두 띄우기 · {UP_CMD}
              </button>
            ) : null}
            <span className="img-hint">
              {allUp
                ? "이렇게 정해 둔 시작 순서를 적는 항목의 이름이 depends_on 입니다. " +
                  "시작된 것과 사용할 준비가 끝난 것은 다릅니다."
                : "데이터 저장 → 요청 처리 → 서비스 입구 순서로 하나씩 시작합니다."}
            </span>
          </p>

          <div className="cmd-result" aria-live="polite">
            <p className="cmd-output-head">
              <span className="cmd-output-label">
                학습용 시뮬레이션 결과 — 실제 docker가 출력한 내용이 아닙니다.
              </span>
            </p>
            <pre className="cmd-output"><code>
              {log.length === 0 ? (
                <>
                  <span className="cmd-echo">
                    <span className="cmd-echo-prompt">{"~/student-web $ "}</span>
                    {upOne(nextId)}
                  </span>
                  {"\n(아직 실행하지 않았습니다)"}
                </>
              ) : (
                log.map((entry, i) => (
                  <span className="cmd-block" key={entry.cmd + i}>
                    <span className="cmd-echo">
                      <span className="cmd-echo-prompt">{"~/student-web $ "}</span>
                      {entry.cmd}
                    </span>
                    {"\n" + entry.lines.join("\n") + (i < log.length - 1 ? "\n\n" : "")}
                  </span>
                ))
              )}
              {allUp ? `\n\n~/student-web $ ${PS_CMD}\n${PS_OUTPUT}` : ""}
            </code></pre>
          </div>
        </div>

        {/* ---------- 서비스 상세 ---------- */}
        <div className="compose-detail" aria-live="polite">
          {detail ? (
            <>
              <p className="cmd-note">
                <span className="tag tag--done">{detail.name}</span>
                <strong className="repo-result-title">{detail.tech} — {detail.role}</strong>
              </p>
              <p className="cmd-detail">{detail.note}</p>
              <pre className="dockerfile-code"><code>
                <span className="dockerfile-path-inline">{COMPOSE_PATH}</span>
                {"\n" + detail.yaml}
              </code></pre>
              <ul className="repo-rows">
                {detail.rows.map(([k, v]) => (
                  <li key={k}><span className="repo-row-key">{k}</span><span className="repo-row-val">{v}</span></li>
                ))}
              </ul>
            </>
          ) : (
            <p className="cmd-empty">서비스를 누르면 compose.yaml의 해당 부분과 설정 내용이 여기에 표시됩니다.</p>
          )}
        </div>

        <p className="map-foot">
          Compose는 요청이 지나가는 계층이 아닙니다. 요청은 여전히 Browser → Nginx → Flask → MySQL로 갑니다.
        </p>
      </div>
    </section>
  );
}
