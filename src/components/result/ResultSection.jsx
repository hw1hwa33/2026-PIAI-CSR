import useClipboard from "../../hooks/useClipboard.js";

/*
 * 방금 무슨 일이 일어났나요? — Activity 가 onOutcome 으로 넘긴 값만 그린다.
 * outcome = { status, title, text, rows:[{label, value, node}], raw }
 *
 * Course Identity: GUIDED INTERACTIVE EXPLORATION (CLAUDE.md)
 *   여기는 채점 결과가 아니다. 성공 / 실패 · 정답 / 오답으로 표시하지 않는다.
 *   status 는 "요청이 잘 처리된 경우"와 "그렇지 않은 경우"를 구분할 뿐이고,
 *   문구는 언제나 "이 선택을 하면 이렇게 됩니다" 쪽으로 쓴다.
 *
 *   Activity 를 아직 하지 않았다면 이 구간 자체를 그리지 않는다.
 */
export default function ResultSection({ outcome, onLocate, onNotify }) {
  const copy = useClipboard();

  if (!outcome) return null;

  const rows = outcome.rows || [];
  const ok = outcome.status !== "error";

  const onCopy = async () => {
    const done = await copy(outcome.raw || "");
    onNotify(done ? "응답을 복사했습니다" : "복사하지 못했습니다", done ? "ok" : "error");
  };

  return (
    <section className="section" aria-labelledby="result-heading">
      <h2 className="section-title" id="result-heading">방금 무슨 일이 일어났나요?</h2>

      <div className={"panel result-card" + (ok ? " is-success" : " is-error")} aria-live="polite">
        <p className="result-head">
          <span className={"tag " + (ok ? "tag--done" : "tag--error")}>
            {ok ? "이렇게 됐습니다" : "이 경우엔 이렇게 됩니다"}
          </span>
          <strong className="result-title">{outcome.title}</strong>
        </p>

        {outcome.text ? <p className="result-text">{outcome.text}</p> : null}

        {rows.length ? (
          <ul className="result-rows">
            {rows.map((r) => (
              <li key={r.label} className="result-row">
                <span className="result-label">{r.label}</span>
                <span className="result-value">{r.value}</span>
                {r.node ? (
                  <button type="button" className="btn btn--sm" onClick={() => onLocate(r.node)}>
                    위치 보기
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}

        {outcome.raw ? (
          <div className="result-raw">
            <div className="result-raw-head">
              <span>실제로 오간 응답</span>
              <button type="button" className="btn btn--sm" onClick={onCopy}>복사</button>
            </div>
            <pre><code>{outcome.raw}</code></pre>
          </div>
        ) : null}
      </div>
    </section>
  );
}
