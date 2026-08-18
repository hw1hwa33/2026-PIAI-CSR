import ChapterDropdown from "../ChapterDropdown.jsx";
import { COURSE_TITLE } from "../../data/course.js";

/*
 * 상단 고정 Header — 교안 제목 · 지금 어느 Chapter인지 · 모션 토글 · Chapter 선택 Dropdown.
 *
 * Course Identity: GUIDED INTERACTIVE EXPLORATION (CLAUDE.md)
 *   성취율 Bar 를 두지 않는다. "n / 15 완료" 같은 표시는 다 끝내야 한다는 압박을 만든다.
 *   Header 가 답해야 하는 것은 "지금 어디를 보고 있는가" 하나다.
 *   진행 기록은 localStorage 에 남지만 Dropdown 안에서만 조용히 표시한다.
 */
export default function CourseHeader({
  chapter,
  chapters,
  total,
  progress,
  motionOn,
  onToggleMotion,
  onSelectChapter
}) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <div className="site-header-brand">
          <p className="site-header-title">{COURSE_TITLE}</p>
          <p className="site-header-now">
            <span className="site-header-chip">
              Chapter {String(chapter.id).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
            <span className="site-header-chapter">{chapter.title}</span>
          </p>
        </div>

        <div className="site-header-tools">
          <button
            type="button"
            className="btn btn--sm"
            aria-pressed={motionOn}
            onClick={onToggleMotion}
          >
            움직임 {motionOn ? "켬" : "끔"}
          </button>

          <ChapterDropdown
            chapters={chapters}
            currentId={chapter.id}
            progress={progress}
            onSelect={onSelectChapter}
          />
        </div>
      </div>
    </header>
  );
}
