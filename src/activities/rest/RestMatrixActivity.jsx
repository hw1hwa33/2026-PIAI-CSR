import { useCallback, useEffect, useRef, useState } from "react";
import Disclosure from "../../components/common/Disclosure.jsx";
import { RESOURCES, METHODS, MISSIONS, cellOf } from "../../data/rest.js";

/*
 * Chapter 12 Primary Visualization — 대상 · 동작을 골라 요청이 만들어지는 것을 보기
 * (11_PROJECT_UI_SPEC §26 — Chapter 12)
 *
 * 정답 맞히기가 아니다. (CLAUDE.md — Activity 는 평가 도구가 아니다)
 *   대상을 누르면 주소가, 동작을 누르면 Method 가 즉시 붙어 요청 한 줄이 완성된다.
 *   어떤 조합을 골라도 "맞다 / 틀리다"로 채점하지 않고 그 조합이 하는 일을 설명한다.
 *   상황 카드는 "지금 무엇을 해 볼지" 알려 주는 예시일 뿐 통과 조건이 아니다.
 *
 * 표(Matrix)는 자유롭게 눌러보는 Reference 로만 둔다.
 */
export default function RestMatrixActivity({
  activity,
  selectedNode,
  onSelectNode,
  onOutcome,
  onFocus,
  onComplete,
  onNotify
}) {
  const [situation, setSituation] = useState(0);
  const [target, setTarget] = useState(null);   // collection | item
  const [action, setAction] = useState(null);   // GET | POST | PATCH | DELETE
  const [tried, setTried] = useState([]);
  const doneRef = useRef(false);

  useEffect(() => { onFocus({ node: "flask", edge: "nginx-flask" }); }, [onFocus]);

  const mission = MISSIONS[situation] || null;
  const cell = target && action ? cellOf(target, action) : null;
  const resource = target ? RESOURCES.find((r) => r.id === target) : null;
  /* 지금 조합이 상황 카드가 말한 것과 같은지 — 채점이 아니라 비교용이다 */
  const sameAsSituation = !!mission && mission.resource === target && mission.method === action;

  const show = useCallback((resourceId, method) => {
    if (!resourceId || !method) return;
    const c = cellOf(resourceId, method);
    if (c.node && selectedNode !== c.node) onSelectNode(c.node);
    onFocus(
      c.ok
        ? { node: c.node, edge: c.edge }
        : { node: "flask", edge: "nginx-flask" }
    );
    setTried((prev) => {
      const key = `${resourceId}:${method}`;
      return prev.includes(key) ? prev : [...prev, key];
    });
  }, [selectedNode, onSelectNode, onFocus]);

  const chooseTarget = (id) => { setTarget(id); show(id, action); };
  const chooseAction = (m) => { setAction(m); show(target, m); };

  const otherSituation = () => {
    setSituation((s) => (s + 1) % MISSIONS.length);
    setTarget(null);
    setAction(null);
  };

  /* 서로 다른 조합을 세 번 이상 눌러 보면 정리를 보여 준다 — 통과 판정이 아니다 */
  useEffect(() => {
    if (tried.length < 3 || doneRef.current) return;
    doneRef.current = true;
    onOutcome({
      status: "success",
      title: "주소는 대상을, 동작은 하는 일을 나타냅니다",
      text:
        "여러 조합을 눌러 보니 규칙이 보입니다 — 주소는 '무엇을'만 가리키고, " +
        "'어떻게 하겠다'는 앞에 붙는 동작이 나타냅니다. " +
        "전체를 가리키는 주소와 한 명을 가리키는 주소가 받는 동작도 다릅니다. " +
        "Chapter 13에서는 이 동작들이 실제로 데이터를 바꾸는 곳을 봅니다."
    });
    onComplete();
    onNotify("여러 조합의 결과를 확인했습니다");
  }, [tried.length, onOutcome, onComplete, onNotify]);

  const reset = () => {
    doneRef.current = false;
    setSituation(0);
    setTarget(null);
    setAction(null);
    setTried([]);
    onOutcome(null);
    onNotify("처음 상태로 되돌렸습니다");
  };

  return (
    <section className="section" aria-labelledby="activity-heading">
      <h2 className="section-title" id="activity-heading">{activity.title}</h2>
      {activity.guide ? <p className="section-desc">{activity.guide}</p> : null}

      <div className="panel activity-panel">
        <p className="learn-note" role="note">
          <span className="tag">학습용</span>
          실제 데이터를 바꾸지 않습니다. 고른 조합이 어떤 요청이 되는지 보여 줍니다.
        </p>

        {/* ---------- 예시 상황 ---------- */}
        <div className="guided">
          <p className="guided-head">
            <span className="guided-step">예를 들면</span>
            <span className="guided-task">{mission ? mission.task : ""}</span>
          </p>
          <p className="guided-why">
            아래에서 대상과 동작을 눌러 보세요. 무엇을 고르든 그 조합이 어떤 요청이 되는지 바로 보여 줍니다.
          </p>
          <p className="guided-actions">
            <button type="button" className="btn btn--sm" onClick={otherSituation}>다른 상황 보기</button>
            {tried.length ? (
              <button type="button" className="btn btn--sm" onClick={reset}>처음부터</button>
            ) : null}
          </p>
        </div>

        {/* ---------- 대상 고르기 ---------- */}
        <div className="builder-row">
          <span className="builder-label" id="rest-target">누구를 대상으로</span>
          <div className="choice-group" role="group" aria-labelledby="rest-target">
            {RESOURCES.map((r) => (
              <button
                key={r.id}
                type="button"
                className={"choice" + (r.id === target ? " is-picked" : "")}
                aria-pressed={r.id === target}
                onClick={() => chooseTarget(r.id)}
              >
                <span className="choice-main">{r.means}</span>
                <span className="choice-sub">{r.path}</span>
              </button>
            ))}
          </div>
          <p className="builder-hint">
            주소는 &lsquo;무엇을&rsquo;만 가리킵니다. 주소에 동사를 넣지 않습니다.
          </p>
        </div>

        {/* ---------- 동작 고르기 ---------- */}
        <div className="builder-row">
          <span className="builder-label" id="rest-action">무엇을 하나</span>
          <div className="choice-group" role="group" aria-labelledby="rest-action">
            {METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                className={"choice" + (m.id === action ? " is-picked" : "")}
                aria-pressed={m.id === action}
                onClick={() => chooseAction(m.id)}
              >
                <span className="choice-main">{m.ko}</span>
                <span className="choice-sub">{m.id}</span>
              </button>
            ))}
          </div>
          <p className="builder-hint">
            {action ? METHODS.find((m) => m.id === action).means : "하는 일은 Method로 표현합니다."}
          </p>
        </div>

        {/* ---------- 만들어진 요청 ---------- */}
        <div className="cmd-result" aria-live="polite">
          {cell ? (
            <>
              <p className="rest-built">
                <span className="rest-built-label">이 조합은 이런 요청이 됩니다</span>
                <code className="rest-built-line">{action} {resource.path}</code>
              </p>

              <p className="result-plain">
                {cell.allowed
                  ? `${resource.means}에 ${METHODS.find((m) => m.id === action).ko}를 요청했습니다.`
                  : `${resource.means}는 이 동작을 받지 않습니다.`}
              </p>

              <p className={"status-line is-" + (cell.ok ? "ok" : "error")}>
                <span className="status-code">{cell.status}</span>
                <span className="status-text">{cell.statusText}</span>
                <span className="status-meaning">
                  {sameAsSituation
                    ? `위 상황이 원한 것이 이것입니다 — ${mission.done}`
                    : mission
                      ? "위 상황과 비교하면 이 선택은 다른 일을 합니다."
                      : ""}
                </span>
              </p>

              <p className="cmd-detail">{cell.why}</p>

              <Disclosure
                label="이 요청이 실제로 주고받는 내용 보기"
                note="보낸 내용 · 돌아온 내용 · 데이터 저장소에 실행된 SQL"
              >
                <pre className="wire-block wire-block--req"><code>
                  <span className="wire-line">{action} {resource.path} HTTP/1.1</span>
                  {cell.reqBody ? (
                    <span className="wire-line wire-line--body">{"\n" + cell.reqBody}</span>
                  ) : null}
                </code></pre>

                <ul className="repo-rows">
                  <li>
                    <span className="repo-row-key">이 동작의 뜻</span>
                    <span className="repo-row-val">
                      {METHODS.find((m) => m.id === action).means}
                    </span>
                  </li>
                  <li>
                    <span className="repo-row-key">실행된 SQL</span>
                    <span className="repo-row-val">
                      {cell.sql}{cell.sqlParams ? `  전달한 값 ${cell.sqlParams}` : ""}
                    </span>
                  </li>
                </ul>

                <pre className="wire-block wire-block--res"><code>
                  {cell.headers.map(([k, v]) => (
                    <span className="wire-line wire-line--dim" key={k}>{k}: {v}</span>
                  ))}
                  <span className="wire-line wire-line--body">{"\n" + cell.body}</span>
                </code></pre>
              </Disclosure>
            </>
          ) : (
            <p className="cmd-empty">
              대상과 동작을 하나씩 고르면 어떤 요청이 만들어지는지 여기에 표시됩니다.
              받지 않는 조합도 눌러 볼 수 있습니다.
            </p>
          )}
        </div>

        {/* ---------- 조합 표 (자유 참고) ---------- */}
        <Disclosure
          label="조합을 표로 한눈에 보기"
          note="아무 칸이나 눌러 결과를 비교해 볼 수 있습니다."
        >
          <div className="rest-matrix" role="group" aria-label="주소와 동작 조합">
            <div className="rest-corner">
              <span className="rest-corner-x">무엇을 하나</span>
              <span className="rest-corner-y">누구를 대상으로</span>
            </div>
            {METHODS.map((m) => (
              <div className="rest-col-head" key={m.id}>
                <span className="rest-method-ko">{m.ko}</span>
                <span className="rest-method">{m.id}</span>
              </div>
            ))}

            {RESOURCES.map((r) => (
              <div className="rest-row" key={r.id}>
                <div className="rest-row-head">
                  <span className="rest-row-means">{r.means}</span>
                  <code className="rest-path">{r.path}</code>
                  <span className="rest-row-label">{r.label}</span>
                </div>
                {METHODS.map((m) => {
                  const c = cellOf(r.id, m.id);
                  const isPicked = target === r.id && action === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      className={
                        "rest-cell" +
                        (c.allowed ? " is-allowed" : " is-blocked") +
                        (isPicked ? " is-picked" : "")
                      }
                      aria-pressed={isPicked}
                      onClick={() => { setTarget(r.id); setAction(m.id); show(r.id, m.id); }}
                    >
                      <span className="rest-cell-status">{c.status}</span>
                      <span className="rest-cell-note">
                        {c.allowed ? c.statusText : "받지 않음"}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <p className="rest-legend">
            칸 안의 숫자는 그 조합을 보냈을 때 돌아오는 처리 결과 번호입니다.
            405는 그 주소가 그 동작을 받지 않는다는 뜻입니다.
          </p>
        </Disclosure>

        <p className="map-foot">
          JSON을 쓴다고 REST가 되는 것은 아닙니다. 주소로 대상을, Method로 하는 일을 나타내는 것이 핵심입니다.
        </p>
      </div>
    </section>
  );
}
