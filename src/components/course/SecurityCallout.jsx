/*
 * 보안 주의 — Safe / Unsafe 대조 Callout.
 *
 * 색상만으로 구분하지 않는다. ⚠ 아이콘 + 제목 + SAFE / UNSAFE 예를 함께 둔다.
 * (CLAUDE.md · 08_DESIGN_QA — 색 이외의 단서)
 *
 * 설정 파일 자체를 올리지 말라고 설명하지 않는다.
 * 올리면 안 되는 것은 그 안에 직접 적은 비밀값이다.
 */
export default function SecurityCallout({ data }) {
  if (!data) return null;

  return (
    <section className="security-callout" role="note" aria-labelledby="security-callout-title">
      <p className="security-head">
        <span className="security-icon" aria-hidden="true">⚠</span>
        <strong className="security-title" id="security-callout-title">{data.title}</strong>
      </p>

      {(data.body || []).map((line) => (
        <p className="security-body" key={line}>{line}</p>
      ))}

      <div className="security-compare">
        <div className="security-case is-safe">
          <p className="security-case-head">
            <span className="security-badge is-safe">SAFE</span>
            <span className="security-case-label">{data.safe.label}</span>
          </p>
          <pre className="security-code"><code>{data.safe.code}</code></pre>
          <p className="security-case-note">{data.safe.note}</p>
        </div>

        <div className="security-case is-unsafe">
          <p className="security-case-head">
            <span className="security-badge is-unsafe">UNSAFE</span>
            <span className="security-case-label">{data.unsafe.label}</span>
          </p>
          <pre className="security-code"><code>{data.unsafe.code}</code></pre>
          <p className="security-case-note">{data.unsafe.note}</p>
        </div>
      </div>

      {data.foot ? <p className="security-foot">{data.foot}</p> : null}
    </section>
  );
}
