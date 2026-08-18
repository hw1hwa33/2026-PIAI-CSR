/*
 * Progressive Disclosure — 첫 화면 정보량 제한을 위한 공통 접기 블록.
 *
 * 기본 패턴 (CLAUDE.md · 23_INTERACTIVE_LEARNING_UX)
 *   핵심 이해 → 직접 해보기 → 결과 확인 → [자세히 보기 ▾] → 전체 코드 / 내부 동작 / 심화
 *
 * <details>/<summary> 를 그대로 쓴다. JS 없이도 열리고, 키보드·스크린리더에서 기본 동작한다.
 * 핵심 정보를 이 안에 숨기지 않는다. 여기 들어가는 것은 "더 알고 싶을 때"의 내용이다.
 */
export default function Disclosure({ label, note, children, tone = "detail", open = false }) {
  return (
    <details className={"disclosure is-" + tone} open={open || undefined}>
      <summary className="disclosure-summary">
        <span className="disclosure-label">{label}</span>
        {note ? <span className="disclosure-note">{note}</span> : null}
        <span className="disclosure-mark" aria-hidden="true">▾</span>
      </summary>
      <div className="disclosure-body">{children}</div>
    </details>
  );
}
