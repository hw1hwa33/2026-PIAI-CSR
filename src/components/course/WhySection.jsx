/*
 * 왜 이걸 보나요? — Chapter 본문보다 먼저 나오는 구간.
 *
 * Course Identity: GUIDED INTERACTIVE EXPLORATION (CLAUDE.md)
 *   이 교안은 시험이 아니다. 기술 설명보다 "왜 필요한가"를 먼저 준다.
 *
 * 첫 노출 정보량 제한
 *   문제 상황 1~2문장 → 이번에 볼 것 하나. 여기까지만 보여 준다.
 *   chapter.objectives 는 데이터에는 남기지만 기본 화면에서는 그리지 않는다 —
 *   입장 직후 목록이 하나 더 늘면 "읽을 것이 많다"는 인상부터 준다.
 *
 * 기술 이름을 몰라도 이 구간만 읽으면 왜 이 Chapter가 필요한지 알 수 있어야 한다.
 */
export default function WhySection({ chapter }) {
  const why = chapter.whyItMatters || [];
  const oneThing = chapter.oneThing;

  if (!why.length && !oneThing) return null;

  return (
    <section className="section why-section" aria-labelledby="why-heading">
      <h2 className="section-title" id="why-heading">왜 이걸 보나요?</h2>

      {why.map((line, i) => (
        <p className={"why-line" + (i === 0 ? " is-problem" : "")} key={line}>{line}</p>
      ))}

      {oneThing ? (
        <p className="one-thing">
          <span className="one-thing-label">
            <span className="one-thing-star" aria-hidden="true">★</span>
            이번에는 이것만 보면 됩니다
          </span>
          <span className="one-thing-text">{oneThing}</span>
        </p>
      ) : null}
    </section>
  );
}
