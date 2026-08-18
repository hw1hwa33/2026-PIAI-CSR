import Disclosure from "../common/Disclosure.jsx";

/*
 * 문제가 생기면 — 자주 만나는 오류.
 *
 * Course Identity: GUIDED INTERACTIVE EXPLORATION (CLAUDE.md)
 *   초보자에게 502 · 404 · DB Connection Error 를 매 Chapter 기본으로 크게 보여 주면
 *   핵심보다 오류가 더 크게 느껴진다. 기본은 접어 둔다.
 *   단 오류 자체가 그 Chapter 의 핵심인 경우(Chapter 02 의 404)에는 펼친 채로 둔다 —
 *   chapter.errorsPrimary 로 지정한다.
 *
 * 항목을 고르면 onSelectError(err) 로 알리고,
 * ChapterPage 가 errorFocus 를 만들어 아키텍처 지도에 같은 지점을 표시한다.
 */
export default function ErrorSection({ chapter, errorFocus, onSelectError }) {
  const errors = chapter.errors || [];
  if (!errors.length) return null;

  const primary = !!chapter.errorsPrimary;

  const list = (
    <>
      <p className="section-desc">오류를 고르면 위 지도에서 어느 구간이 끊겼는지 표시됩니다.</p>
      <ul className="error-list">
        {errors.map((err) => {
          const open = !!errorFocus && errorFocus.id === err.id;
          return (
            <li key={err.id} className={"panel error-item" + (open ? " is-open" : "")}>
              <button
                type="button"
                className="error-head"
                aria-expanded={open}
                onClick={() => onSelectError(err)}
              >
                <span className="tag tag--error">{err.code}</span>
                <span className="error-title">{err.title}</span>
                <span className="error-toggle" aria-hidden="true">{open ? "▲" : "▼"}</span>
              </button>

              {open ? (
                <dl className="error-body">
                  <dt>증상</dt>
                  <dd>{err.symptom}</dd>
                  <dt>원인</dt>
                  <dd>{err.cause}</dd>
                  <dt>해결</dt>
                  <dd>{err.fix}</dd>
                </dl>
              ) : null}
            </li>
          );
        })}
      </ul>
    </>
  );

  if (primary) {
    return (
      <section className="section" aria-labelledby="error-heading">
        <h2 className="section-title" id="error-heading">이 Chapter에서 함께 볼 오류</h2>
        {list}
      </section>
    );
  }

  return (
    <section className="section" aria-labelledby="error-heading">
      <h2 className="section-title sr-only" id="error-heading">문제가 생기면</h2>
      <Disclosure
        tone="quiet"
        label="문제가 생기면 보기"
        note="지금 당장 필요하지는 않습니다. 실제로 막혔을 때 열어 보세요."
      >
        {list}
      </Disclosure>
    </section>
  );
}
