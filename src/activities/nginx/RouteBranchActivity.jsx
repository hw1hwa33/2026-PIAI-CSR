import { useCallback, useEffect, useRef, useState } from "react";
import {
  LOCATIONS,
  REQUESTS,
  BACKEND_STATES,
  CONF_PATH,
  matchLocation,
  resolve
} from "../../data/nginx.js";

/*
 * Chapter 10 Primary Visualization — Nginx Route Branch
 * (11_PROJECT_UI_SPEC §26 — Chapter 10)
 *
 * Chapter 02 의 Request Builder 를 복제하지 않는다.
 * Chapter 02 는 "요청이 무엇으로 이루어지는가"였고,
 * 여기서는 "도착한 요청을 규칙이 어떻게 골라 어디로 보내는가"만 본다.
 *
 * 화면의 주인공은 두 갈래로 갈라지는 분기 그림과, 규칙이 평가되는 과정이다.
 * Nginx 와 Flask 를 하나로 합치지 않는다 — 502 는 Flask 가 보지도 못한 요청이다.
 */
export default function RouteBranchActivity({
  activity,
  selectedNode,
  onSelectNode,
  onOutcome,
  onFocus,
  onComplete,
  onNotify
}) {
  const [reqId, setReqId] = useState("root");
  const [backend, setBackend] = useState("up");
  const [result, setResult] = useState(null);
  const [seen, setSeen] = useState({ static: false, api: false, fail: false });
  const doneRef = useRef(false);

  useEffect(() => { onFocus({ node: "nginx", edge: "browser-nginx" }); }, [onFocus]);

  const clear = () => setResult(null);
  const changeReq = (id) => { clear(); setReqId(id); };
  const changeBackend = (id) => { clear(); setBackend(id); };

  const send = useCallback(() => {
    const res = resolve(reqId, backend);
    setResult(res);
    if (selectedNode !== res.node) onSelectNode(res.node);
    onFocus(
      res.ok
        ? { node: res.node, edge: res.edge }
        : { node: res.node, edge: res.edge, error: true, errorNode: "nginx", errorEdge: "nginx-flask" }
    );
    const key = !res.usesBackend ? "static" : res.ok ? "api" : "fail";
    setSeen((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  }, [reqId, backend, selectedNode, onSelectNode, onFocus]);

  const doneCount = ["static", "api", "fail"].filter((k) => seen[k]).length;

  useEffect(() => {
    if (doneCount < 3 || doneRef.current) return;
    doneRef.current = true;
    onOutcome({
      status: "success",
      title: "입구가 요청을 나누는 방식을 확인했습니다",
      text:
        "같은 서버 주소로 들어와도 /api/ 로 시작하는지에 따라 가는 곳이 달라집니다. " +
        "502는 Nginx가 만든 응답이고, Flask는 그 요청을 본 적도 없습니다. " +
        "Chapter 11에서는 넘겨진 요청을 실제로 처리하는 Flask를 봅니다."
    });
    onComplete();
    onNotify("정적 분기 · API 분기 · 502를 모두 확인했습니다");
  }, [doneCount, onOutcome, onComplete, onNotify]);

  const reset = () => {
    doneRef.current = false;
    setResult(null);
    setSeen({ static: false, api: false, fail: false });
    onOutcome(null);
    onNotify("처음 상태로 되돌렸습니다");
  };

  const req = REQUESTS.find((r) => r.id === reqId);
  const willMatch = matchLocation(req.path);

  const remaining = !seen.static ? "화면을 달라는 요청"
    : !seen.api ? "데이터를 달라는 요청"
    : !seen.fail ? "뒤쪽 서버가 멈춘 상태에서의 데이터 요청" : null;

  return (
    <section className="section" aria-labelledby="activity-heading">
      <h2 className="section-title" id="activity-heading">{activity.title}</h2>
      {activity.guide ? <p className="section-desc">{activity.guide}</p> : null}

      <div className="panel activity-panel">
        <p className="learn-note" role="note">
          <span className="tag">학습용</span>
          실제 서버에 요청하지 않습니다. {CONF_PATH}의 규칙대로 어디로 갈라지는지 학습용으로 계산합니다.
        </p>

        <p className="explore-hint" aria-live="polite">
          {remaining ? `${remaining}도 눌러 보세요.` : "세 가지 경우를 모두 봤습니다. 다시 눌러 비교해 봐도 됩니다."}
          {result || doneCount ? (
            <button type="button" className="btn btn--sm" onClick={reset}>처음부터</button>
          ) : null}
        </p>

        {/* ---------- 조건 고르기 ---------- */}
        <div className="builder-row">
          <span className="builder-label" id="ng-path">들어온 요청 주소</span>
          <div className="choice-group" role="group" aria-labelledby="ng-path">
            {REQUESTS.map((r) => (
              <button
                key={r.id}
                type="button"
                className={"choice" + (r.id === reqId ? " is-picked" : "")}
                aria-pressed={r.id === reqId}
                onClick={() => changeReq(r.id)}
              >
                <span className="choice-main">{r.path}</span>
                <span className="choice-sub">{r.label.replace(`${r.path} `, "")}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 아직 배우지 않은 서비스 이름을 Primary 로 쓰지 않는다 (CLAUDE.md) */}
        <div className="builder-row">
          <span className="builder-label" id="ng-be">
            뒤쪽 요청 처리 서버 상태
            <span className="builder-label-tech">backend</span>
          </span>
          <div className="choice-group" role="group" aria-labelledby="ng-be">
            {BACKEND_STATES.map((b) => (
              <button
                key={b.id}
                type="button"
                className={"choice" + (b.id === backend ? " is-picked" : "")}
                aria-pressed={b.id === backend}
                onClick={() => changeBackend(b.id)}
              >
                <span className="choice-main">{b.id === "up" ? "켜져 있음" : "멈춰 있음"}</span>
                <span className="choice-sub">{b.label}</span>
              </button>
            ))}
          </div>
          <p className="builder-hint">
            화면을 달라는 요청은 뒤쪽 서버가 멈춰 있어도 잘 옵니다. 어느 쪽이 영향을 받는지 눌러 보세요.
          </p>
        </div>

        <p className="send-row">
          <button type="button" className="btn btn--primary" onClick={send}>이 요청 보내기</button>
          <span className="send-note">
            {result ? "아래에서 규칙이 어떻게 평가됐는지 볼 수 있습니다." : "규칙 평가 과정이 아래에 표시됩니다."}
          </span>
        </p>

        {/* ---------- 규칙 평가 ---------- */}
        <div className="branch-board">
          <p className="branch-in">
            <span className="branch-in-label">들어온 요청</span>
            <code className="branch-in-path">GET {req.path}</code>
          </p>

          <ul className="rule-list" aria-label="location 규칙">
            {LOCATIONS.map((l) => {
              const hit = req.path.startsWith(l.prefix);
              const win = willMatch && willMatch.id === l.id;
              return (
                <li
                  className={"rule" + (hit ? " is-hit" : "") + (win ? " is-win" : "")}
                  key={l.id}
                >
                  <span className="rule-head">
                    <code className="rule-prefix">location {l.prefix}</code>
                    <span className="rule-state">
                      {win ? "이 규칙이 이긴다 (가장 길게 일치)" : hit ? "일치하지만 더 긴 규칙이 있다" : "일치하지 않음"}
                    </span>
                  </span>
                  <code className="rule-body">{l.body}</code>
                  <span className="rule-role">{l.role}</span>
                </li>
              );
            })}
          </ul>

          <div className="branch-split">
            <div className={"branch-arm" + (willMatch && willMatch.kind === "static" ? " is-taken" : "")}>
              <span className="branch-arm-label">화면 파일로 응답</span>
              <span className="branch-arm-sub">Nginx가 직접 답한다 · backend 사용 안 함</span>
            </div>
            <div className={"branch-arm" + (willMatch && willMatch.kind === "proxy" ? " is-taken" : "")}>
              <span className="branch-arm-label">backend:5000 으로 전달</span>
              <span className="branch-arm-sub">Flask가 답을 만들고 Nginx는 전달만 한다</span>
            </div>
          </div>
        </div>

        {/* ---------- 결과 ---------- */}
        <div className="cmd-result" aria-live="polite">
          {result ? (
            <>
              {/* 무슨 일이 일어났는지를 먼저, 숫자 이름은 그 다음 (CLAUDE.md §17) */}
              <p className="result-plain">{result.plain}</p>

              <p className={"status-line is-" + (result.ok ? "ok" : "error")}>
                <span className="status-code">{result.status}</span>
                <span className="status-text">{result.statusText}</span>
                <span className="status-meaning">{result.verdict}</span>
              </p>

              <ol className="branch-steps">
                {result.steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>

              <pre className="wire-block wire-block--res"><code>
                {result.headers.map(([k, v]) => (
                  <span className="wire-line wire-line--dim" key={k}>{k}: {v}</span>
                ))}
                <span className="wire-line wire-line--body">{"\n" + result.body}</span>
              </code></pre>

              <p className="cmd-detail">{result.why}</p>
            </>
          ) : (
            <p className="cmd-empty">요청을 보내면 어떤 규칙이 이겼고 무엇이 돌아왔는지 표시됩니다.</p>
          )}
        </div>

        <p className="map-foot">
          Nginx는 입구이고 Flask는 처리하는 곳입니다. 둘은 서로 다른 서비스이며 하나로 합쳐지지 않습니다.
        </p>
      </div>
    </section>
  );
}
