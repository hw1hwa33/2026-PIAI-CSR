/*
 * 진행 기록 (살펴본 Chapter) — 순수 로직.
 *
 * Course Identity: GUIDED INTERACTIVE EXPLORATION (CLAUDE.md)
 *   이것은 성취율이 아니다. "이 Chapter를 열어 봤다"는 방문 기록일 뿐이다.
 *   내부 저장 값은 "COMPLETED" 를 그대로 쓰지만 의미는 visited / 살펴봄이다.
 *
 * 방문 판정 규칙
 *   Chapter 를 렌더한 순간이 아니라, 사용자가 그 Chapter 를 **떠날 때** 기록한다.
 *   그래서 처음 접속한 사용자는 Chapter 01 화면에서도 0 / 15 로 시작한다.
 *
 * UI 없음 — App 과 테스트가 같은 함수를 쓴다.
 */

export const STORE_KEY = "student-web-course/progress";

/* 내부 값은 유지한다. 의미는 "살펴봄"이다. */
export const VISITED = "COMPLETED";

/* 저장된 문자열 → 안전한 진행 기록. 어떤 입력이 와도 예외를 던지지 않는다. */
export function parseProgress(raw, validIds) {
  if (typeof raw !== "string" || raw.length === 0) return {};

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }

  /* null · 배열 · 숫자 · 문자열은 모두 진행 기록이 아니다 */
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

  const allowed = validIds ? new Set(validIds.map(String)) : null;
  const out = {};
  for (const [key, value] of Object.entries(parsed)) {
    if (value !== VISITED) continue;
    if (allowed && !allowed.has(String(key))) continue;
    out[key] = VISITED;
  }
  return out;
}

/* localStorage 를 읽는다. 저장소를 쓸 수 없는 환경(사생활 보호 모드 등)에서도 학습은 진행된다. */
export function readProgress(storage, validIds) {
  if (!storage) return {};
  try {
    return parseProgress(storage.getItem(STORE_KEY), validIds);
  } catch {
    return {};
  }
}

export function writeProgress(storage, progress) {
  if (!storage) return false;
  try {
    storage.setItem(STORE_KEY, JSON.stringify(progress || {}));
    return true;
  } catch {
    return false;
  }
}

/* 이미 기록된 Chapter 면 같은 객체를 그대로 돌려준다 — 중복 증가가 일어나지 않는다. */
export function markVisited(progress, chapterId) {
  const base = progress || {};
  if (chapterId === null || chapterId === undefined) return base;
  const key = String(chapterId);
  if (base[key] === VISITED) return base;
  return { ...base, [key]: VISITED };
}

export function isVisited(progress, chapterId) {
  return !!progress && progress[String(chapterId)] === VISITED;
}

export function visitedCount(progress) {
  if (!progress) return 0;
  return Object.values(progress).filter((v) => v === VISITED).length;
}

/*
 * Chapter 가 바뀌었을 때 호출한다. 떠난 Chapter(prevId)를 살펴봄으로 기록한다.
 *
 *   첫 렌더        prevId === nextId  → 아무것도 기록하지 않는다 (0 / 15 유지)
 *   새로고침       마운트마다 prevId 가 현재 Chapter 로 초기화되므로 중복 증가가 없다
 *   재방문         이미 기록된 Chapter 면 같은 객체를 돌려준다
 *   뒤로/앞으로    · Dropdown 이동도 결국 Chapter 변경이므로 같은 경로를 탄다
 */
export function onChapterChange(progress, prevId, nextId) {
  if (prevId === null || prevId === undefined) return progress || {};
  if (String(prevId) === String(nextId)) return progress || {};
  return markVisited(progress, prevId);
}

export default { STORE_KEY, VISITED, readProgress, writeProgress, onChapterChange };
