/*
 * test/first-screen.cjs — Beginner First-5-Seconds Test
 *
 * 필드가 "있는가"가 아니라, Chapter 에 들어온 직후 실제로 보이는 Copy 만 모아서 검사한다.
 * 첫 화면 = ChapterHero + WhySection 이 렌더하는 텍스트뿐이다.
 *   Hero  : 제목 · 핵심 질문 · 소개 · CTA
 *   Why   : 문제 상황 · 이번에는 이것만 보면 됩니다
 * (tags · objectives · 용어 사전 블록은 렌더되지 않으므로 포함하지 않는다)
 *
 * 검사 기준
 *   A 지금 무슨 상황인지 안다      — 핵심 질문과 소개가 있다
 *   B 왜 이걸 보는지 안다          — 문제 상황 + 이번에 볼 것 하나가 있다
 *   C 뭘 눌러야 하는지 안다        — 행동을 지시하는 CTA 가 있다
 *   D 영어 기술 용어가 몰리지 않는다 — 그 Chapter 의 주제어를 빼고 3개 미만
 *   E 구현 코드가 보이지 않는다     — 코드 조각 · 경로 · 명령이 없다
 *
 *   node test/first-screen.cjs
 */
const { check, load, section, report } = require("./lib.cjs");

/* Hero 와 Why 가 실제로 렌더하는 문자열만 모은다 */
function firstScreenCopy(c) {
  const parts = [c.title, c.coreQuestion, c.intro, c.activity && c.activity.cta];
  parts.push(...(c.whyItMatters || []));
  parts.push(c.oneThing);
  return parts.filter(Boolean);
}

/* Chapter 제목이 밝힌 주제어는 "이번에 볼 것"이므로 새 용어로 세지 않는다 */
function subjectTerms(c) {
  return c.title.match(/[A-Za-z][A-Za-z0-9+.#_-]*/g) || [];
}

/* 한국어 문장에 섞인 영어 토큰. Chapter 는 화면 곳곳에 쓰이는 위치 표시라 제외한다. */
const NEUTRAL = new Set(["Chapter"]);

function englishTokens(text) {
  return (text.match(/[A-Za-z][A-Za-z0-9+.#_-]*/g) || []).filter((t) => !NEUTRAL.has(t));
}

/* 첫 화면에 나오면 안 되는 코드 흔적 */
const CODE_HINTS = [
  [/`/, "백틱 코드"],
  [/\$\{|\$\(/, "코드 치환"],
  [/\w+\(\)/, "함수 호출"],
  [/[{};]/, "코드 기호"],
  [/(?:^|\s)\/[a-z]+\//, "URL 경로"],
  [/=>|->/, "화살표 연산자"],
  [/\b(?:git|docker|npm|curl|SELECT|UPDATE|DELETE|INSERT)\s+[a-z-]+/, "명령/질의"],
  [/@app\.|proxy_pass|try_files|%s/, "설정·코드 조각"]
];

(async () => {
  const course = await load("src/data/course.js");
  const chapters = course.COURSE;

  /* ---------------------------------------------------------- */
  section("A. 지금 무슨 상황인지 안다");

  const noQuestion = chapters.filter((c) => !c.coreQuestion || !c.coreQuestion.includes("?"));
  check("모든 Chapter 가 질문으로 상황을 연다", noQuestion.length === 0, noQuestion.map((c) => c.id).join(", "));

  const longQuestion = chapters.filter((c) => c.coreQuestion.length > 45);
  check("핵심 질문이 한눈에 읽히는 길이다", longQuestion.length === 0,
    longQuestion.map((c) => `Chapter ${c.id}: ${c.coreQuestion.length}자`).join(" | "));

  const techOnlyTitle = chapters.filter((c) => /^[A-Za-z][A-Za-z0-9 /.]*$/.test(c.title));
  check("기술 이름만 단독으로 제목에 쓰지 않는다", techOnlyTitle.length === 0,
    techOnlyTitle.map((c) => `Chapter ${c.id}: ${c.title}`).join(" | "));

  const noKoreanTitle = chapters.filter((c) => !/[가-힣]/.test(c.title));
  check("모든 제목이 한국어 역할 표현을 포함한다", noKoreanTitle.length === 0,
    noKoreanTitle.map((c) => c.id).join(", "));

  /* ---------------------------------------------------------- */
  section("B. 왜 이걸 보는지 안다");

  const noProblem = chapters.filter((c) => !(c.whyItMatters || []).length);
  check("문제 상황이 먼저 나온다", noProblem.length === 0, noProblem.map((c) => c.id).join(", "));

  const tooLongWhy = chapters.filter((c) => (c.whyItMatters || []).length > 2);
  check("문제 상황은 1~2문단이다", tooLongWhy.length === 0,
    tooLongWhy.map((c) => `Chapter ${c.id}: ${c.whyItMatters.length}문단`).join(", "));

  const noOne = chapters.filter((c) => !c.oneThing);
  check("이번에 볼 것 하나가 있다", noOne.length === 0, noOne.map((c) => c.id).join(", "));

  const longOne = chapters.filter((c) => c.oneThing.length > 45);
  check("그 하나가 한 문장으로 끝난다", longOne.length === 0,
    longOne.map((c) => `Chapter ${c.id}: ${c.oneThing.length}자`).join(" | "));

  /* ---------------------------------------------------------- */
  section("C. 뭘 눌러야 하는지 안다");

  const noCta = chapters.filter((c) => !c.activity || !c.activity.cta);
  check("모든 Chapter 에 CTA 가 있다", noCta.length === 0, noCta.map((c) => c.id).join(", "));

  const passiveCta = chapters.filter((c) => !/보기|해 보기|보내 보기|돌려 보기|입력해|열어 보기|시작하기/.test(c.activity.cta));
  check("CTA 가 행동을 지시한다", passiveCta.length === 0,
    passiveCta.map((c) => `Chapter ${c.id}: ${c.activity.cta}`).join(" | "));

  /* ---------------------------------------------------------- */
  section("D. 영어 기술 용어가 한꺼번에 몰리지 않는다");

  for (const c of chapters) {
    const subject = new Set(subjectTerms(c));
    const copy = firstScreenCopy(c).join(" ");
    const tokens = [...new Set(englishTokens(copy))].filter((t) => !subject.has(t));
    check(
      `Chapter ${String(c.id).padStart(2, "0")} — 첫 화면 새 영어 용어 ${tokens.length}개`,
      tokens.length < 3,
      `주제어 제외: ${tokens.join(", ")}`
    );
  }

  /* ---------------------------------------------------------- */
  section("E. 구현 코드가 보이지 않는다");

  for (const c of chapters) {
    const copy = firstScreenCopy(c).join(" ");
    const hits = CODE_HINTS.filter(([re]) => re.test(copy)).map(([, label]) => label);
    check(
      `Chapter ${String(c.id).padStart(2, "0")} — 코드 조각 없음`,
      hits.length === 0,
      hits.join(", ")
    );
  }

  /* ---------------------------------------------------------- */
  section("F. 첫 화면에 렌더되지 않아야 하는 것");

  /* 주석은 규칙 설명이므로 제외하고 실제 렌더 코드만 본다 */
  const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  const read = (p) => strip(require("fs").readFileSync(
    require("path").join(__dirname, "..", p), "utf8"));
  const hero = read("src/components/course/ChapterHero.jsx");
  const why = read("src/components/course/WhySection.jsx");

  check("Hero 가 기술 Tag 목록을 그리지 않는다", !/hero-tags|chapter\.tags/.test(hero), "tags 렌더가 남아 있습니다");
  check("Hero 에 용어 사전 블록이 없다", !/newTerms|처음 나오는 말/.test(hero), "용어 블록이 남아 있습니다");
  check("Why 구간이 학습 목표 목록을 그리지 않는다", !/objectives/.test(why), "objectives 렌더가 남아 있습니다");
  check("Chapter 데이터에 tags 가 남아 있지 않다",
    chapters.every((c) => !c.tags), chapters.filter((c) => c.tags).map((c) => c.id).join(", "));

  report("first-screen");
})().catch((e) => {
  process.stdout.write(`\n실행 오류: ${e && e.stack ? e.stack : e}\n`);
  process.exitCode = 1;
});
