/*
 * test/progress.cjs — 진행 기록(살펴본 Chapter) 검사
 *
 * 요구 동작
 *   새 브라우저(빈 localStorage)로 처음 접속하면 0 / 15 로 시작한다.
 *   Chapter 를 렌더한 순간이 아니라 **떠날 때** 이전 Chapter 를 살펴봄으로 기록한다.
 *
 * App.jsx 와 같은 함수(src/data/progress.js)를 그대로 쓴다.
 * 아래 Session 은 App 의 useEffect 흐름을 그대로 옮긴 것이고,
 * App 이 실제로 그 흐름을 쓰는지는 §7 정적 검사가 확인한다.
 *
 *   node test/progress.cjs
 */
const { check, equal, readFile, load, section, report } = require("./lib.cjs");

/* ---------- 테스트용 localStorage ---------- */
function fakeStorage(initial) {
  const store = { ...(initial || {}) };
  return {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    dump: () => ({ ...store })
  };
}

/* 저장소를 쓸 수 없는 환경(사생활 보호 모드 등) */
const brokenStorage = {
  getItem() { throw new Error("access denied"); },
  setItem() { throw new Error("access denied"); }
};

(async () => {
  const P = await load("src/data/progress.js");
  const course = await load("src/data/course.js");
  const IDS = course.COURSE.map((c) => c.id);

  /*
   * App.jsx 의 흐름을 그대로 옮긴 세션.
   *   생성       = 페이지 로드 (readProgress + prevChapterRef 초기화)
   *   go(id)     = Chapter 이동 (URL · Dropdown · 뒤로가기 모두 여기로 수렴)
   *   reload()   = 같은 저장소로 새 세션 (새로고침)
   */
  function openSession(storage, startChapter) {
    let progress = P.readProgress(storage, IDS);
    let prev = startChapter;                 // prevChapterRef = 현재 Chapter
    P.writeProgress(storage, progress);      // App 의 저장 effect

    return {
      go(next) {
        if (prev !== next) {
          progress = P.onChapterChange(progress, prev, next);
          prev = next;
          P.writeProgress(storage, progress);
        }
        return this;
      },
      count: () => P.visitedCount(progress),
      progress: () => progress,
      visited: (id) => P.isVisited(progress, id)
    };
  }

  /* ---------------------------------------------------------- */
  section("1. localStorage 없음 → progress {}");

  const s1 = fakeStorage();
  equal("빈 저장소에서 읽으면 빈 객체다", JSON.stringify(P.readProgress(s1, IDS)), "{}");
  equal("저장소 자체가 없어도 빈 객체다", JSON.stringify(P.readProgress(null, IDS)), "{}");
  equal("저장소 접근이 막혀도 빈 객체다", JSON.stringify(P.readProgress(brokenStorage, IDS)), "{}");
  check("저장이 막혀도 예외를 던지지 않는다", P.writeProgress(brokenStorage, { 1: "COMPLETED" }) === false, "예외 발생");

  /* ---------------------------------------------------------- */
  section("2. 최초 Chapter 01 렌더 → 여전히 progress {}");

  const s2 = fakeStorage();
  const first = openSession(s2, 1);
  equal("첫 접속 진행 수는 0 이다", first.count(), 0);
  equal("Chapter 01 이 기록되지 않았다", first.visited(1), false);
  /* 같은 Chapter 로의 재호출(리렌더)도 아무것도 기록하지 않는다 */
  first.go(1);
  equal("같은 Chapter 재렌더에도 0 이다", first.count(), 0);

  /* ---------------------------------------------------------- */
  section("3. Chapter 01 → 02 이동 → Chapter 01만 기록");

  first.go(2);
  equal("진행 수가 1 이다", first.count(), 1);
  equal("Chapter 01 이 살펴봄이다", first.visited(1), true);
  equal("지금 보고 있는 Chapter 02 는 아직 아니다", first.visited(2), false);

  /* ---------------------------------------------------------- */
  section("4. Chapter 02 → 03 이동 → 01 · 02 기록");

  first.go(3);
  equal("진행 수가 2 이다", first.count(), 2);
  equal("Chapter 01 살펴봄", first.visited(1), true);
  equal("Chapter 02 살펴봄", first.visited(2), true);
  equal("Chapter 03 은 아직 아니다", first.visited(3), false);

  /* ---------------------------------------------------------- */
  section("5. 이미 방문한 Chapter 재방문 → 증가 없음");

  first.go(1);                       // 03 을 떠나 01 로 (03 이 기록됨)
  equal("떠난 Chapter 03 이 기록되어 3 이다", first.count(), 3);
  first.go(2);                       // 01 을 다시 떠남 — 이미 기록되어 있다
  equal("이미 살펴본 Chapter 를 다시 떠나도 3 그대로", first.count(), 3);
  first.go(1);
  first.go(2);
  equal("01 ↔ 02 를 오가도 3 그대로", first.count(), 3);

  const before = first.progress();
  const after = P.onChapterChange(before, 1, 2);
  check("변화가 없으면 같은 객체를 돌려준다", before === after, "새 객체가 만들어졌습니다");

  /* ---------------------------------------------------------- */
  section("6. 새로고침 → 저장 상태 복원");

  const s6 = fakeStorage();
  const a = openSession(s6, 1);
  a.go(2).go(3);                     // 01 · 02 기록
  equal("새로고침 전 진행 수", a.count(), 2);

  const b = openSession(s6, 3);      // 같은 저장소로 다시 로드 (Chapter 03 에서 새로고침)
  equal("새로고침 후에도 진행 수가 유지된다", b.count(), 2);
  equal("Chapter 01 기록 유지", b.visited(1), true);
  equal("Chapter 02 기록 유지", b.visited(2), true);
  equal("새로고침만으로 Chapter 03 이 기록되지 않는다", b.visited(3), false);
  b.go(3);
  equal("새로고침 직후 같은 Chapter 재렌더도 증가 없다", b.count(), 2);

  /* ---------------------------------------------------------- */
  section("7. localStorage 삭제 후 재접속 → 다시 0");

  s6.removeItem(P.STORE_KEY);
  const c = openSession(s6, 1);
  equal("기록을 지우면 다시 0 이다", c.count(), 0);
  equal("Chapter 01 도 지워졌다", c.visited(1), false);

  /* ---------------------------------------------------------- */
  section("8. 잘못된 localStorage 값 → 안전하게 0부터");

  const BAD = [
    ["JSON 이 아님", "not json at all"],
    ["빈 문자열", ""],
    ["null", "null"],
    ["배열", "[1,2,3]"],
    ["숫자", "42"],
    ["문자열", '"COMPLETED"'],
    ["중첩 객체", '{"1":{"deep":true}}'],
    ["다른 값", '{"1":"IN_PROGRESS","2":true}'],
    ["존재하지 않는 Chapter", '{"99":"COMPLETED","0":"COMPLETED","abc":"COMPLETED"}']
  ];

  for (const [label, raw] of BAD) {
    const s = fakeStorage({ [P.STORE_KEY]: raw });
    const sess = openSession(s, 1);
    equal(`${label} → 0 부터 시작`, sess.count(), 0);
  }

  /* 유효한 값은 그대로 살린다 */
  const okStore = fakeStorage({ [P.STORE_KEY]: '{"1":"COMPLETED","3":"COMPLETED","99":"COMPLETED"}' });
  const okSess = openSession(okStore, 2);
  equal("유효한 기록만 복원한다 (99번은 버린다)", okSess.count(), 2);
  equal("Chapter 01 복원", okSess.visited(1), true);
  equal("Chapter 03 복원", okSess.visited(3), true);

  /* ---------------------------------------------------------- */
  section("9. App.jsx 가 이 규칙을 실제로 쓰는가");

  const app = readFile("src/App.jsx");
  const appCode = app.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

  check(
    "App 이 progress.js 의 판정 함수를 쓴다",
    /from "\.\/data\/progress\.js"/.test(appCode) && /onChapterChange\(/.test(appCode),
    "onChapterChange 를 쓰지 않습니다"
  );
  /* 지금 보고 있는 Chapter 를 그대로 기록하는 코드가 있으면 첫 접속에 1 / 15 가 된다 */
  check(
    "렌더 시점에 현재 Chapter 를 기록하지 않는다",
    !/\[chapterId\]\s*:/.test(appCode) && !/markVisited\([^)]*chapterId/.test(appCode),
    "chapterId 를 직접 기록하는 코드가 남아 있습니다"
  );
  check(
    "떠난 Chapter 를 기록하기 위해 이전 Chapter 를 기억한다",
    /prevChapterRef/.test(appCode),
    "이전 Chapter 추적이 없습니다"
  );
  check(
    "뒤로 / 앞으로 가기도 같은 경로를 탄다",
    /popstate/.test(appCode) && /setChapterId\(readChapterFromUrl\(\)\)/.test(appCode),
    "popstate 처리가 Chapter 변경으로 이어지지 않습니다"
  );
  check(
    "Activity 완료가 진행 기록을 올리지 않는다",
    !/onComplete=\{complete\}/.test(appCode),
    "Activity 완료가 아직 진행 기록에 연결되어 있습니다"
  );

  const page = readFile("src/components/ChapterPage.jsx")
    .replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  check(
    "ChapterPage 도 Activity 완료를 진행 기록으로 쓰지 않는다",
    !/onComplete\(chapter\.id\)/.test(page),
    "ChapterPage 가 아직 Chapter 를 기록합니다"
  );

  report("progress");
})().catch((e) => {
  process.stdout.write(`\n실행 오류: ${e && e.stack ? e.stack : e}\n`);
  process.exitCode = 1;
});
