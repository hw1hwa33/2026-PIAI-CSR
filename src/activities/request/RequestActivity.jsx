import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  METHODS,
  RESOURCE,
  TARGET_IDS,
  STATUS_TEXT,
  STATUS_MEANING,
  REQUEST_PARTS,
  RESPONSE_PARTS,
  buildRequest,
  buildResponse
} from "../../data/http.js";

/*
 * Chapter 02 Primary Visualization — Request Builder / Response Inspector
 * (11_PROJECT_UI_SPEC §26)
 *
 * Chapter 01 의 Process Scene 을 복제하지 않는다. 여기서 배우는 것은
 * "요청 한 건이 어떤 부분으로 이루어져 있고, 응답이 그에 어떻게 답하는가" 다.
 *
 * Activity State (23_INTERACTIVE_LEARNING_UX §8): READY → RUNNING → SUCCESS | ERROR
 * 성공 응답과 오류 응답을 모두 확인해야 Chapter 완료로 본다.
 */
export default function RequestActivity({
  activity,
  motionOn,
  onOutcome,
  onFocus,
  onComplete,
  onLocate,
  onNotify
}) {
  const [method, setMethod] = useState("GET");
  const [targetId, setTargetId] = useState(1);
  const [phase, setPhase] = useState("READY");
  const [response, setResponse] = useState(null);
  const [part, setPart] = useState(null);
  const [seen, setSeen] = useState({ ok: false, error: false });
  const seenRef = useRef({ ok: false, error: false });
  const timerRef = useRef(null);

  const spec = METHODS.find((m) => m.id === method) || METHODS[0];
  const needsId = spec.target === "item";
  const request = useMemo(() => buildRequest(method, targetId), [method, targetId]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  /* 아직 보내지 않은 상태에서는 요청을 만드는 쪽(Browser)을 가리킨다 */
  useEffect(() => {
    if (phase === "READY") onFocus({ node: "browser", edge: null });
  }, [phase, onFocus, method, targetId]);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase("READY");
    setResponse(null);
    setPart(null);
    onOutcome(null);
  }, [onOutcome]);

  /* 조립 값을 바꾸면 이전 응답은 더 이상 이 요청의 결과가 아니다 */
  const changeMethod = (id) => { reset(); setMethod(id); };
  const changeId = (id) => { reset(); setTargetId(id); };

  const send = useCallback(() => {
    const res = buildResponse(request);
    setPhase("RUNNING");
    onFocus({ node: "nginx", edge: "browser-nginx" });

    const finish = () => {
      setResponse(res);
      setPhase(res.ok ? "SUCCESS" : "ERROR");

      onFocus(
        res.ok
          ? { node: "browser", edge: res.edge }
          : { node: res.node, edge: res.edge, error: true, errorNode: res.node, errorEdge: res.edge }
      );

      onOutcome({
        status: res.ok ? "success" : "error",
        title: `${res.status} ${STATUS_TEXT[res.status]} — ${STATUS_MEANING[res.status]}`,
        text: res.summary,
        rows: [
          { label: "보낸 Method", value: request.method, node: "browser" },
          { label: "보낸 주소", value: request.path, node: "nginx" },
          { label: "받은 Status", value: `${res.status} ${STATUS_TEXT[res.status]}`, node: res.node },
          { label: "받은 데이터 형식", value: "application/json", node: "browser" }
        ],
        raw:
          `${request.line}\n` +
          request.headers.map(([k, v]) => `${k}: ${v}`).join("\n") +
          (request.body ? `\n\n${request.body}` : "") +
          `\n\n---\n\nHTTP/1.1 ${res.status} ${STATUS_TEXT[res.status]}\n` +
          res.headers.map(([k, v]) => `${k}: ${v}`).join("\n") +
          `\n\n${res.body}`
      });

      /* 부모 state 변경(onComplete)을 updater 안에서 호출하면 렌더 중 setState 가 된다.
         ref 로 이전 값을 읽고 updater 바깥에서 호출한다. */
      const prev = seenRef.current;
      const nextSeen = res.ok ? { ...prev, ok: true } : { ...prev, error: true };
      seenRef.current = nextSeen;
      setSeen(nextSeen);

      if (nextSeen.ok && nextSeen.error && !(prev.ok && prev.error)) {
        onComplete();
        onNotify("성공 응답과 오류 응답을 모두 확인했습니다");
      }
    };

    if (!motionOn) { finish(); return; }
    timerRef.current = setTimeout(finish, 420);
  }, [request, motionOn, onFocus, onOutcome, onComplete, onNotify]);

  const partInfo = part
    ? [...REQUEST_PARTS, ...RESPONSE_PARTS].find((p) => p.id === part.id && p.label === part.label)
    : null;

  const remaining = !seen.ok ? "잘 처리된 응답" : !seen.error ? "찾지 못했다는 응답" : null;

  return (
    <section className="section" aria-labelledby="activity-heading">
      <h2 className="section-title" id="activity-heading">{activity.title}</h2>
      {activity.guide ? <p className="section-desc">{activity.guide}</p> : null}

      <div className="panel activity-panel">
        {activity.mockNote ? (
          <p className="learn-note" role="note">
            <span className="tag">학습용</span>
            {activity.mockNote}
          </p>
        ) : null}

        {/* ---------- 1. Request Builder ---------- */}
        <div className="builder">
          <h3 className="builder-title">1. 요청 조립하기</h3>

          <div className="builder-row">
            <span className="builder-label" id="rb-method">Method · 무엇을 할까</span>
            <div className="choice-group" role="group" aria-labelledby="rb-method">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={"choice" + (m.id === method ? " is-picked" : "")}
                  aria-pressed={m.id === method}
                  onClick={() => changeMethod(m.id)}
                >
                  <span className="choice-main">{m.id}</span>
                  <span className="choice-sub">{m.role}</span>
                </button>
              ))}
            </div>
            <p className="builder-hint">{spec.desc}</p>
          </div>

          <div className="builder-row">
            <span className="builder-label" id="rb-res">Resource · 무엇을 대상으로</span>
            <div className="choice-group" role="group" aria-labelledby="rb-res">
              <button type="button" className="choice is-picked" aria-pressed="true" disabled>
                <span className="choice-main">{RESOURCE.label}</span>
                <span className="choice-sub">{RESOURCE.desc}</span>
              </button>
            </div>
            <p className="builder-hint">이 교안은 학생 데이터 하나만 사용합니다.</p>
          </div>

          <div className={"builder-row" + (needsId ? "" : " is-off")}>
            <span className="builder-label" id="rb-id">ID · 어느 학생을</span>
            <div className="choice-group" role="group" aria-labelledby="rb-id">
              {TARGET_IDS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={"choice" + (needsId && t.id === targetId ? " is-picked" : "")}
                  aria-pressed={needsId && t.id === targetId}
                  disabled={!needsId}
                  onClick={() => changeId(t.id)}
                >
                  <span className="choice-main">{t.id}</span>
                  <span className="choice-sub">{t.note}</span>
                </button>
              ))}
            </div>
            <p className="builder-hint">{spec.hint}</p>
          </div>
        </div>

        {/* ---------- 2. 조립된 Request ---------- */}
        <div className="wire-view" aria-live="polite">
          <h3 className="builder-title">2. 이렇게 조립되었습니다</h3>

          {/* 칸 이름을 외우지 않아도 되도록 역할을 먼저 붙여 둔다 (CLAUDE.md §10) */}
          <ul className="part-legend">
            {[
              ["무엇을 할지", "Method"],
              ["어디에 요청할지", "URL"],
              ["추가 정보", "Headers"],
              ["보낼 내용", "Body"],
              ["처리 결과 번호", "Status Code"],
              ["결과 데이터", "JSON"]
            ].map(([role, tech]) => (
              <li className="part-legend-item" key={tech}>
                <span className="part-legend-role">{role}</span>
                <span className="part-legend-tech">{tech}</span>
              </li>
            ))}
          </ul>

          <pre className="wire-block wire-block--req"><code>
            <span className="wire-line">
              <button type="button" className="part part--method" onClick={() => setPart(REQUEST_PARTS[0])}>{request.method}</button>
              {" "}
              <button type="button" className="part part--path" onClick={() => setPart(REQUEST_PARTS[1])}>{request.path}</button>
              {" HTTP/1.1"}
            </span>
            {request.headers.map(([k, v]) => (
              <span className="wire-line wire-line--dim" key={k}>{k}: {v}</span>
            ))}
            {request.body ? <span className="wire-line wire-line--body">{"\n" + request.body}</span> : null}
          </code></pre>

          <div className="send-row">
            <button
              type="button"
              className="btn btn--primary"
              onClick={send}
              disabled={phase === "RUNNING"}
            >
              {phase === "RUNNING" ? "보내는 중…" : "요청 보내기"}
            </button>
            {phase !== "READY" ? (
              <button type="button" className="btn btn--sm" onClick={reset}>다시 조립</button>
            ) : null}
            <span className="send-note">
              {remaining
                ? `${remaining}이 돌아오는 경우도 눌러 볼 수 있습니다.`
                : "잘 처리된 경우와 찾지 못한 경우를 모두 봤습니다."}
            </span>
          </div>
        </div>

        {/* ---------- 3. Response Inspector ---------- */}
        <div className="wire-view" aria-live="polite">
          <h3 className="builder-title">3. 돌아온 응답 살펴보기</h3>

          {phase === "READY" ? (
            <p className="inspector-empty">아직 요청을 보내지 않았습니다. 위에서 조립한 뒤 보내 보세요.</p>
          ) : phase === "RUNNING" ? (
            <p className="inspector-empty">서버로 보내는 중입니다…</p>
          ) : (
            <>
              <p className={"status-line is-" + (response.ok ? "ok" : "error")}>
                <button type="button" className="status-code" onClick={() => setPart(RESPONSE_PARTS[0])}>
                  {response.status}
                </button>
                <span className="status-text">{STATUS_TEXT[response.status]}</span>
                <span className="status-meaning">{STATUS_MEANING[response.status]}</span>
              </p>

              <pre className="wire-block wire-block--res"><code>
                {response.headers.map(([k, v]) => (
                  <span className="wire-line wire-line--dim" key={k}>{k}: {v}</span>
                ))}
                <span className="wire-line wire-line--body">{"\n" + response.body}</span>
              </code></pre>

              <p className="inspector-summary">{response.summary}</p>

              <p className="inspector-actions">
                <button type="button" className="btn btn--sm" onClick={() => setPart(RESPONSE_PARTS[2])}>
                  Body 가 무엇인지 보기
                </button>
                <button type="button" className="btn btn--sm" onClick={() => onLocate(response.node)}>
                  이 응답을 만든 곳 보기
                </button>
              </p>
            </>
          )}
        </div>

        {/* ---------- 부분 설명 ---------- */}
        <div className="part-detail" aria-live="polite">
          {partInfo ? (
            <p>
              <strong>{partInfo.label}</strong>
              <span className="part-detail-role">{partInfo.role}</span>
              {partInfo.id === "status" && response
                ? STATUS_MEANING[response.status]
                : partInfo.id === "body"
                  ? "요청·응답이 실제로 실어 나르는 데이터입니다. 이 교안에서는 JSON 형식을 씁니다."
                  : partInfo.id === "method"
                    ? spec.desc
                    : partInfo.id === "path"
                      ? "서버 안에서 어떤 데이터를 가리키는지 알려주는 주소입니다."
                      : "요청·응답에 대한 부가 정보입니다."}
            </p>
          ) : (
            <p className="part-detail-empty">
              위 요청·응답에서 밑줄 친 부분을 누르면 그 부분이 무슨 역할인지 설명이 나옵니다.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
