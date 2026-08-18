import { useCallback, useEffect, useRef, useState } from "react";
import Disclosure from "../../components/common/Disclosure.jsx";
import {
  ROUTES,
  INCOMING,
  CODE,
  APP_PATH,
  testRoute,
  handle
} from "../../data/flask.js";

/*
 * Chapter 11 Primary Visualization — Flask Route → DB → JSON
 * (11_PROJECT_UI_SPEC §26 — Chapter 11)
 *
 * Chapter 10 의 규칙 평가와 겉모습이 겹치지 않게 한다.
 * Chapter 10 은 "주소 앞부분을 보고 어디로 보낼지"였고,
 * 여기서는 "등록된 함수 목록 중 어느 것이 실행되고, 주소의 값이 어떻게 인자가 되는가"를 본다.
 *
 * 화면의 주인공은 Route 표와 그 위에서 일어나는 매칭 · 인자 바인딩이다.
 */
export default function RouteMatchActivity({
  activity,
  selectedNode,
  onSelectNode,
  onOutcome,
  onFocus,
  onComplete,
  onNotify
}) {
  const [reqId, setReqId] = useState(null);
  const [result, setResult] = useState(null);
  const [seen, setSeen] = useState({ ok: false, none: false });
  const doneRef = useRef(false);

  useEffect(() => { onFocus({ node: "flask", edge: "nginx-flask" }); }, [onFocus]);

  const send = useCallback((id) => {
    const res = handle(id);
    setReqId(id);
    setResult(res);
    if (selectedNode !== res.node) onSelectNode(res.node);
    onFocus(
      res.ok
        ? { node: res.node, edge: res.edge }
        : { node: "flask", edge: "nginx-flask", error: true, errorNode: "flask", errorEdge: "nginx-flask" }
    );
    const key = res.ok ? "ok" : "none";
    setSeen((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  }, [selectedNode, onSelectNode, onFocus]);

  const doneCount = (seen.ok ? 1 : 0) + (seen.none ? 1 : 0);

  useEffect(() => {
    if (doneCount < 2 || doneRef.current) return;
    doneRef.current = true;
    onOutcome({
      status: "success",
      title: "주소와 함수가 어떻게 이어지는지 확인했습니다",
      text:
        "Route는 주소 모양과 Method를 함께 보고 실행할 함수를 고릅니다. " +
        "주소의 값은 함수 인자로 전달되고, SQL에는 문자열로 이어붙이지 않고 인자로 넘깁니다. " +
        "Chapter 12에서는 같은 주소를 Method로 나누는 방법을 봅니다."
    });
    onComplete();
    onNotify("매칭 성공과 실패를 모두 확인했습니다");
  }, [doneCount, onOutcome, onComplete, onNotify]);

  const reset = () => {
    doneRef.current = false;
    setReqId(null);
    setResult(null);
    setSeen({ ok: false, none: false });
    onOutcome(null);
    onNotify("처음 상태로 되돌렸습니다");
  };

  const req = reqId ? INCOMING.find((r) => r.id === reqId) : null;
  const hotRoute = result && result.match.route ? result.match.route.id : null;

  return (
    <section className="section" aria-labelledby="activity-heading">
      <h2 className="section-title" id="activity-heading">{activity.title}</h2>
      {activity.guide ? <p className="section-desc">{activity.guide}</p> : null}

      <div className="panel activity-panel">
        <p className="learn-note" role="note">
          <span className="tag">학습용</span>
          실제 서버를 실행하지 않습니다. 등록된 주소 규칙대로 어떤 함수가 골라지는지 학습용으로 계산합니다.
        </p>

        <p className="explore-hint" aria-live="polite">
          {!seen.ok
            ? "아래 요청 중 아무거나 눌러 보세요. 어떤 함수가 골라지는지 바로 보여 줍니다."
            : !seen.none
              ? "짝이 맞지 않는 주소도 눌러 보세요. 그때는 어떻게 되는지 볼 수 있습니다."
              : "짝이 맞는 경우와 맞지 않는 경우를 모두 봤습니다."}
          {result ? <button type="button" className="btn btn--sm" onClick={reset}>처음부터</button> : null}
        </p>

        {/* ---------- 들어온 요청 고르기 ---------- */}
        <div className="builder-row">
          <span className="builder-label" id="fl-req">들어온 요청</span>
          <div className="choice-group" role="group" aria-labelledby="fl-req">
            {INCOMING.map((r) => (
              <button
                key={r.id}
                type="button"
                className={"choice" + (r.id === reqId ? " is-picked" : "")}
                aria-pressed={r.id === reqId}
                onClick={() => send(r.id)}
              >
                <span className="choice-main">{r.method} {r.path}</span>
                <span className="choice-sub">{r.label}</span>
              </button>
            ))}
          </div>
          <p className="builder-hint">
            요청을 고르면 아래에 미리 적어 둔 주소 규칙을 위에서부터 하나씩 살펴봅니다.
          </p>
        </div>

        {/* ---------- 등록해 둔 주소 규칙 ---------- */}
        <div className="route-table">
          <p className="route-table-head">
            {/* 아직 배우지 않은 Route 를 Primary 로 쓰지 않는다 (CLAUDE.md) */}
            <span className="route-table-title">
              등록해 둔 주소 규칙
              <span className="route-table-tech">Route</span>
            </span>
            <span className="route-table-file">{APP_PATH}</span>
          </p>

          <ul className="route-rows">
            {ROUTES.map((r) => {
              const t = req ? testRoute(r, req) : null;
              const win = hotRoute === r.id && result && result.match.kind === "match";
              const partial = hotRoute === r.id && result && result.match.kind === "method";
              return (
                <li
                  className={"route-row" + (win ? " is-win" : "") + (partial ? " is-partial" : "")}
                  key={r.id}
                >
                  <code className="route-decorator">{r.decorator}</code>
                  <span className="route-fn">{r.fn}</span>
                  <span className="route-desc">{r.desc}</span>
                  {t ? (
                    <span className="route-test">
                      <span className={"route-flag" + (t.path ? " is-ok" : " is-no")}>
                        주소 모양 {t.path ? "일치" : "불일치"}
                      </span>
                      <span className={"route-flag" + (t.method ? " is-ok" : " is-no")}>
                        요청 종류 {t.method ? "일치" : "불일치"}
                      </span>
                      <span className="route-why">{t.why}</span>
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>

          {result && result.match.kind === "none" ? (
            <p className="route-none">짝이 맞는 Route가 없습니다 → 404</p>
          ) : null}
        </div>

        {/* ---------- 연결 결과 (이번 Chapter의 핵심) ---------- */}
        <div className="cmd-result" aria-live="polite">
          {result ? (
            <>
              <p className="result-plain">
                {result.match.kind === "match"
                  ? "주소와 짝이 맞는 함수를 찾아 실행했습니다."
                  : result.match.kind === "method"
                    ? "주소 모양은 맞지만, 그 주소가 받는 방식이 아니어서 실행하지 못했습니다."
                    : "짝이 맞는 함수를 찾지 못해 아무 함수도 실행하지 못했습니다."}
              </p>

              {/* 주소 → 등록된 주소 모양 → 실행된 함수 (CLAUDE.md §18) */}
              <div className="bind-chain" aria-label="주소와 함수가 연결되는 과정">
                <span className="bind-node">
                  <span className="bind-role">들어온 주소</span>
                  <code className="bind-value">{req ? `${req.method} ${req.path}` : "—"}</code>
                </span>
                <span className="bind-arrow" aria-hidden="true">→</span>
                <span className={"bind-node" + (result.match.route ? " is-hit" : " is-miss")}>
                  <span className="bind-role">짝이 맞은 주소 규칙</span>
                  <code className="bind-value">
                    {result.match.route ? result.match.route.pattern : "짝이 없음"}
                  </code>
                </span>
                <span className="bind-arrow" aria-hidden="true">→</span>
                <span className={"bind-node" + (result.match.kind === "match" ? " is-hit" : " is-miss")}>
                  <span className="bind-role">실행된 함수</span>
                  <code className="bind-value">
                    {result.match.kind === "match" ? result.match.route.fn : "실행되지 않음"}
                  </code>
                </span>
              </div>

              {result.bind && result.bind.length ? (
                <p className="bind-note">
                  주소에서 숫자 하나를 받아 <code>{result.bind[0][0]}</code> 라는 이름으로 함수에 넘겼습니다 —
                  {" "}<code>{result.bind.map(([k, v]) => `${k} = ${v}`).join(", ")}</code>
                </p>
              ) : null}

              <p className={"status-line is-" + (result.ok ? "ok" : "error")}>
                <span className="status-code">{result.status}</span>
                <span className="status-text">{result.statusText}</span>
                <span className="status-meaning">{result.verdict}</span>
              </p>

              <p className="cmd-detail">{result.hint}</p>

              {/* 여기까지가 이번 Chapter 핵심이라는 것을 명시한다 */}
              {result.match.kind === "match" ? (
                <p className="checkpoint">
                  <span className="checkpoint-mark" aria-hidden="true">✓</span>
                  <span className="checkpoint-text">
                    여기까지 보면 이번 Chapter는 충분합니다 —
                    주소를 보고 실행할 함수를 고르는 것이 이 자리가 하는 일입니다.
                    이렇게 주소와 함수를 연결해 두는 규칙을 Route, 요청 종류를 Method라고 부릅니다.
                  </span>
                </p>
              ) : null}

              {/* ---------- 함수 안쪽은 심화 (Progressive Disclosure) ---------- */}
              {result.match.kind === "match" ? (
                <Disclosure
                  label="함수 안에서는 무슨 일이 생길까?"
                  note="데이터를 물어보고, 받은 결과를 돌려줄 형식으로 바꿉니다."
                >
                  <ul className="repo-rows">
                    {result.sql ? (
                      <li>
                        <span className="repo-row-key">데이터 저장소에 물어본 것</span>
                        <span className="repo-row-val">
                          {result.sql}{result.sqlParams ? `  전달한 값 ${result.sqlParams}` : ""}
                        </span>
                      </li>
                    ) : null}
                    <li>
                      <span className="repo-row-key">돌려준 형식</span>
                      <span className="repo-row-val">JSON</span>
                    </li>
                  </ul>

                  <pre className="wire-block wire-block--res"><code>
                    <span className="wire-line wire-line--dim">Content-Type: application/json</span>
                    <span className="wire-line wire-line--body">{"\n" + result.body}</span>
                  </code></pre>

                  <p className="cmd-detail">
                    값은 SQL 문장에 이어붙이지 않고 <code>%s</code> 자리에 인자로 따로 넘깁니다.
                    그래야 입력한 문자가 명령의 일부로 해석되지 않습니다. SQL 자체는 Chapter 13에서 자세히 봅니다.
                  </p>

                  <div className="render-code">
                    <p className="render-screen-head">{APP_PATH}</p>
                    <pre className="dockerfile-code"><code>
                      {CODE.map((l, i) => (
                        <span
                          className={"dockerfile-line" + (hotRoute && l.hot.includes(hotRoute) ? " is-hot" : "")}
                          key={i}
                        >
                          {l.t || " "}
                        </span>
                      ))}
                    </code></pre>
                    <p className="render-note">방금 실행된 함수와 연결된 줄이 강조됩니다.</p>
                  </div>
                </Disclosure>
              ) : null}
            </>
          ) : (
            <p className="cmd-empty">요청을 고르면 어느 함수가 골라지는지 표시됩니다.</p>
          )}
        </div>

        <p className="map-foot">
          이 계층은 요청을 처리해 돌려줄 형식(JSON)을 만들 뿐, 데이터를 보관하지 않습니다. 보관은 데이터 저장소의 일입니다.
        </p>
      </div>
    </section>
  );
}
