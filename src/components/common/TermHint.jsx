import { useState } from "react";
import { getTerm } from "../../data/glossary.js";

/*
 * BeginnerTerm — "이게 뭐지?" Zero-Tolerance Rule 의 공통 표시.
 *
 *   역할(쉬운 한국어)  ← Primary
 *   기술 이름          ← Secondary
 *   [?]                ← 눌러서 한두 문장 뜻풀이
 *
 * Hover 에만 의존하지 않는다. 눌러서 여는 방식이라 키보드·터치에서도 동일하게 동작한다.
 * Tooltip 이 본문 설명을 대체하지 않는다 — 핵심 의미는 언제나 본문에도 있어야 한다.
 */
export default function TermHint({ term, role, hint, id }) {
  const [open, setOpen] = useState(false);
  const entry = getTerm(term);
  const shownRole = role || (entry ? entry.role : null);
  const shownHint = hint || (entry ? entry.hint : null);
  const panelId = `term-${(id || term).replace(/[^a-zA-Z0-9_-]/g, "-")}`;

  if (!shownHint) {
    return (
      <span className="term">
        {shownRole ? <span className="term-role">{shownRole}</span> : null}
        <span className="term-tech">{term}</span>
      </span>
    );
  }

  return (
    <span className={"term" + (open ? " is-open" : "")}>
      {shownRole ? <span className="term-role">{shownRole}</span> : null}
      <span className="term-tech">{term}</span>
      <button
        type="button"
        className="term-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true">?</span>
        <span className="sr-only">{term} 뜻 보기</span>
      </button>
      {open ? (
        <span className="term-hint" id={panelId} role="note">
          {shownHint}
        </span>
      ) : null}
    </span>
  );
}
