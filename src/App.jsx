import { useCallback, useEffect, useRef, useState } from "react";
import CourseHeader from "./components/course/CourseHeader.jsx";
import ChapterPage from "./components/ChapterPage.jsx";
import Toast from "./components/common/Toast.jsx";
import Disclosure from "./components/common/Disclosure.jsx";
import { COURSE, COURSE_SUBTITLE, TOTAL_CHAPTERS, getChapter } from "./data/course.js";
import { readProgress, writeProgress, onChapterChange } from "./data/progress.js";
import useReducedMotion from "./hooks/useReducedMotion.js";

/*
 * 진행 상태 보관 (CLAUDE.md)
 *   현재 Chapter  → URL ?chapter=N  (새로고침 · 뒤로가기에서 같은 Chapter 로 돌아온다)
 *   살펴본 Chapter → localStorage   (새로고침 때 기록이 전부 초기화되지 않는다)
 * 과도한 Persistence Architecture 는 만들지 않는다 — 두 값만 저장한다.
 * 판정 규칙은 src/data/progress.js 에 있고, 테스트가 같은 함수를 쓴다.
 */
const CHAPTER_IDS = COURSE.map((c) => c.id);

function localStore() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage || null;
  } catch {
    return null;
  }
}

function readChapterFromUrl() {
  if (typeof window === "undefined") return 1;
  const raw = new URLSearchParams(window.location.search).get("chapter");
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 && n <= TOTAL_CHAPTERS ? n : 1;
}

export default function App() {
  const [chapterId, setChapterId] = useState(readChapterFromUrl);
  const [progress, setProgress] = useState(() => readProgress(localStore(), CHAPTER_IDS));
  const [motionEnabled, setMotionEnabled] = useState(true);
  const [toast, setToast] = useState(null);
  const prefersReduced = useReducedMotion();
  const motionOn = motionEnabled && !prefersReduced;
  const chapter = getChapter(chapterId);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: motionOn ? "smooth" : "auto" });
  }, [chapterId, motionOn]);

  /*
   * "살펴봄"은 성취가 아니라 방문 기록이다. (CLAUDE.md)
   *
   * 렌더한 순간이 아니라 그 Chapter 를 **떠날 때** 기록한다.
   * 그래서 처음 접속한 사용자는 Chapter 01 화면에서도 0 / 15 로 시작한다.
   * 마운트마다 prevChapterRef 가 현재 Chapter 로 초기화되므로 새로고침해도 중복 증가하지 않는다.
   */
  const prevChapterRef = useRef(chapterId);

  useEffect(() => {
    const prev = prevChapterRef.current;
    if (prev === chapterId) return;
    prevChapterRef.current = chapterId;
    setProgress((p) => onChapterChange(p, prev, chapterId));
  }, [chapterId]);

  /* 현재 Chapter 를 URL 에 반영한다 — 새로고침해도 같은 Chapter 가 열린다 */
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("chapter") === String(chapterId)) return;
    url.searchParams.set("chapter", String(chapterId));
    window.history.pushState({ chapter: chapterId }, "", url);
  }, [chapterId]);

  /* 브라우저 뒤로/앞으로 가기도 Chapter 이동으로 동작한다 */
  useEffect(() => {
    const onPop = () => setChapterId(readChapterFromUrl());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  /* 저장할 수 없는 환경(사생활 보호 모드 등)에서도 학습은 그대로 진행된다 */
  useEffect(() => {
    writeProgress(localStore(), progress);
  }, [progress]);

  const notify = useCallback((text, type = "ok") => setToast({ text, type }), []);

  return (
    <div className={"app" + (motionOn ? "" : " no-motion")}>
      <a className="skip-link" href="#chapter-main">본문으로 건너뛰기</a>
      <CourseHeader
        chapter={chapter}
        chapters={COURSE}
        total={TOTAL_CHAPTERS}
        progress={progress}
        motionOn={motionOn}
        onToggleMotion={() => setMotionEnabled((v) => !v)}
        onSelectChapter={setChapterId}
      />
      <main id="chapter-main">
        <ChapterPage
          key={chapter.id}
          chapter={chapter}
          total={TOTAL_CHAPTERS}
          chapters={COURSE}
          motionOn={motionOn}
          onSelectChapter={setChapterId}
          onNotify={notify}
        />
      </main>
      <footer className="site-footer">
        <div className="site-footer-inner">
          <p className="site-footer-title">학생 성적 조회 웹서비스 만들기</p>
          <p>{COURSE_SUBTITLE}</p>
          <p>화면에 표시되는 학생 이름과 점수는 학습용 예시 데이터이며 실제 개인정보가 아닙니다.</p>

          {/* 학습과 무관한 제작 정보는 기본 Footer 에서 분리한다 (CLAUDE.md §8) */}
          <div className="site-footer-meta">
            <Disclosure tone="quiet" label="제작 정보">
              <p>
                비전공자를 위한 학습 자료입니다. 정부·공공기관이 운영하는 누리집이 아닙니다.
              </p>
              <p>
                화면은 KRDS(대한민국 정부 디자인시스템)의 색상 · 타이포그래피 · 접근성 기준을 참고해 구성했습니다.
              </p>
            </Disclosure>
          </div>
        </div>
      </footer>
      <Toast toast={toast} onDone={() => setToast(null)} />
    </div>
  );
}
