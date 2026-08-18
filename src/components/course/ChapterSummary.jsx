import Disclosure from "../common/Disclosure.jsx";
import TermHint from "../common/TermHint.jsx";
import { getTerm } from "../../data/glossary.js";

/*
 * 이것만 기억하세요 — Chapter 마지막 구간.
 *
 * Course Identity: GUIDED INTERACTIVE EXPLORATION (CLAUDE.md)
 *   한 Chapter에서 기억해야 할 것은 1~3개로 제한한다.
 *   summary.remember 가 Primary 이고, 기존의 긴 정리(points · keywords · position)는
 *   "조금 더 정리해서 보기 ▾" 안으로 내린다.
 *
 * 키워드는 사전에 등록된 것만 [?] 로 뜻을 다시 열 수 있게 한다.
 */
export default function ChapterSummary({ chapter }) {
  const summary = chapter.summary;
  if (!summary) return null;

  const remember = summary.remember || [];
  const points = summary.points || [];
  const keywords = summary.keywords || [];
  const hasMore = points.length > 0 || keywords.length > 0 || summary.position;

  return (
    <section className="section" aria-labelledby="summary-heading">
      <h2 className="section-title" id="summary-heading">이것만 기억하세요</h2>

      {remember.length ? (
        <ol className="remember-list">
          {remember.map((r, i) => (
            <li className="remember-item" key={r}>
              <span className="remember-num" aria-hidden="true">{i + 1}</span>
              <span className="remember-text">{r}</span>
            </li>
          ))}
        </ol>
      ) : null}

      {hasMore ? (
        <Disclosure tone="quiet" label="조금 더 정리해서 보기" note="지금 읽지 않아도 됩니다.">
          {points.length ? (
            <ol className="summary-list">
              {points.map((p, i) => (
                <li key={p}>
                  <span className="summary-num" aria-hidden="true">{i + 1}</span>
                  <span>{p}</span>
                </li>
              ))}
            </ol>
          ) : null}

          {keywords.length ? (
            <ul className="summary-keywords">
              {keywords.map((k) => (
                <li key={k}>
                  {getTerm(k)
                    ? <TermHint term={k} id={`ch${chapter.id}-${k}`} />
                    : <span className="tag">{k}</span>}
                </li>
              ))}
            </ul>
          ) : null}

          {summary.position ? (
            <p className="summary-position">
              <span className="summary-position-label">전체에서 지금 위치</span>
              {summary.position}
            </p>
          ) : null}
        </Disclosure>
      ) : null}

      {summary.next ? (
        <p className="summary-next">
          <span className="summary-next-label">다음 Chapter를 보는 이유</span>
          {summary.next}
        </p>
      ) : null}
    </section>
  );
}
