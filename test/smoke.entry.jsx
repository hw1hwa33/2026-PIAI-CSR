/*
 * test/smoke.entry.jsx — 15개 Chapter 를 실제로 렌더해 런타임 오류를 잡는다.
 *
 * 브라우저를 띄우지 않고 react-dom/server 로 렌더하므로, 렌더 단계에서 나는 오류는 전부 잡힌다.
 * (이벤트 처리 이후의 상호작용은 실화면 확인이 필요하다.)
 *
 *   npm run test:render
 */
import { renderToString } from "react-dom/server";
import CourseHeader from "../src/components/course/CourseHeader.jsx";
import ChapterPage from "../src/components/ChapterPage.jsx";
import ActivityRenderer from "../src/activities/ActivityRenderer.jsx";
import { COURSE, TOTAL_CHAPTERS } from "../src/data/course.js";

const noop = () => {};
let failures = 0;

for (const chapter of COURSE) {
  try {
    const header = renderToString(
      <CourseHeader
        chapter={chapter}
        chapters={COURSE}
        total={TOTAL_CHAPTERS}
        progress={{ 1: "COMPLETED" }}
        motionOn
        onToggleMotion={noop}
        onSelectChapter={noop}
      />
    );
    const page = renderToString(
      <ChapterPage
        chapter={chapter}
        total={TOTAL_CHAPTERS}
        chapters={COURSE}
        progress={{}}
        motionOn
        onComplete={noop}
        onSelectChapter={noop}
        onNotify={noop}
      />
    );
    const activity = renderToString(
      <ActivityRenderer
        activity={chapter.activity}
        motionOn
        selectedNode="flask"
        onSelectNode={noop}
        onOutcome={noop}
        onFocus={noop}
        onComplete={noop}
        onLocate={noop}
        onShowCode={noop}
        onNotify={noop}
      />
    );

    const problems = [];
    if (page.includes("등록되지 않은 Activity")) problems.push("미등록 Activity");
    if (page.includes("아직 준비 중")) problems.push("placeholder 문구");
    if (!header.includes(chapter.title)) problems.push("Header 에 Chapter 제목 없음");
    if (page.length < 3000) problems.push(`본문이 너무 짧음(${page.length})`);
    if (activity.length < 500) problems.push(`Activity 렌더 결과가 너무 짧음(${activity.length})`);
    /* 내부 key 가 그대로 노출되면 안 된다 */
    if (/>\s*(browser|flask|mysql|nginx)\s*위치 보기/.test(page)) problems.push("내부 node key 노출");

    if (problems.length) {
      failures += 1;
      console.log(`  FAIL Chapter ${chapter.id} ${chapter.title} — ${problems.join(", ")}`);
    } else {
      console.log(`  ok   Chapter ${chapter.id} ${chapter.title} (본문 ${page.length}자 · 실습 ${activity.length}자)`);
    }
  } catch (e) {
    failures += 1;
    console.log(`  FAIL Chapter ${chapter.id} ${chapter.title} — ${e && e.message}`);
    console.log(e && e.stack);
  }
}

console.log(`\nsmoke: ${COURSE.length - failures}/${COURSE.length} Chapter 렌더 성공`);
if (failures) process.exitCode = 1;
