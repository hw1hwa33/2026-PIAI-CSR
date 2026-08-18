/* 이전 / 다음 Chapter 이동 */
export default function ChapterNav({ chapter, chapters, onSelect }) {
  const i = chapters.findIndex((c) => c.id === chapter.id);
  const prev = i > 0 ? chapters[i - 1] : null;
  const next = i >= 0 && i < chapters.length - 1 ? chapters[i + 1] : null;

  return (
    <nav className="section chapter-nav" aria-label="Chapter 이동">
      {prev ? (
        <button type="button" className="btn chapter-nav-btn" onClick={() => onSelect(prev.id)}>
          <span className="chapter-nav-dir">← 이전 Chapter</span>
          <span className="chapter-nav-title">
            {String(prev.id).padStart(2, "0")} {prev.title}
          </span>
        </button>
      ) : (
        <span className="chapter-nav-empty">첫 Chapter입니다</span>
      )}

      {next ? (
        <button
          type="button"
          className="btn chapter-nav-btn chapter-nav-btn--next"
          onClick={() => onSelect(next.id)}
        >
          <span className="chapter-nav-dir">다음 Chapter →</span>
          <span className="chapter-nav-title">
            {String(next.id).padStart(2, "0")} {next.title}
          </span>
        </button>
      ) : (
        <span className="chapter-nav-empty">마지막 Chapter입니다</span>
      )}
    </nav>
  );
}
