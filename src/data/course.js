import chapter01 from "./chapter01.js";
import chapter02 from "./chapter02.js";
import chapter03 from "./chapter03.js";
import chapter04 from "./chapter04.js";
import chapter05 from "./chapter05.js";
import chapter06 from "./chapter06.js";
import chapter07 from "./chapter07.js";
import chapter08 from "./chapter08.js";
import chapter09 from "./chapter09.js";
import chapter10 from "./chapter10.js";
import chapter11 from "./chapter11.js";
import chapter12 from "./chapter12.js";
import chapter13 from "./chapter13.js";
import chapter14 from "./chapter14.js";
import chapter15 from "./chapter15.js";

/*
 * 제목은 기술 목록이 아니라 "사용자가 만들 결과"를 먼저 보여 준다. (CLAUDE.md §8)
 * 기술 이름은 부제로 내린다 — 역할 → 기술 이름 순서를 제목에서도 지킨다.
 */
export const COURSE_TITLE = "학생 성적 조회 웹서비스 만들기";
export const COURSE_SUBTITLE = "Git · GitHub · Docker · 웹 구조를 하나의 프로젝트로 이해하기";

/*
 * 22_CHAPTER_CURRICULUM.md 의 15개 Chapter 를 모두 구현했다.
 * Chapter 는 데이터로만 정의하고, 화면은 ChapterPage 하나가 그린다.
 * Activity 유형은 src/activities/ActivityRenderer.jsx 의 REGISTRY 로 확장한다.
 */
export const COURSE = [
  chapter01, chapter02, chapter03, chapter04, chapter05,
  chapter06, chapter07, chapter08, chapter09, chapter10,
  chapter11, chapter12, chapter13, chapter14, chapter15
];

export const TOTAL_CHAPTERS = COURSE.length;

export function getChapter(id) {
  const n = Number(id);
  return COURSE.find((c) => c.id === n) || COURSE[0];
}

export function getChapterIndex(id) {
  const n = Number(id);
  const i = COURSE.findIndex((c) => c.id === n);
  return i < 0 ? 0 : i;
}

export function countCompleted(progress) {
  if (!progress) return 0;
  return Object.values(progress).filter((v) => v === "COMPLETED").length;
}

export default COURSE;
