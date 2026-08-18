/*
 * test/beginner.cjs — GUIDED INTERACTIVE EXPLORATION 검사
 *
 * CLAUDE.md 의 Course Identity 와 Beginner Principle 을 실행 가능한 규칙으로 옮긴 것이다.
 *   시험 · 점수 · 합격 개념 없음 (Quiz / KnowledgeCheck 없음)
 *   Chapter 이동은 언제나 자유
 *   왜 필요한가(whyItMatters · oneThing)를 기술 설명보다 먼저
 *   역할 → 쉬운 한국어 → 기술 이름 → 코드
 *   첫 화면 정보량 제한 (Progressive Disclosure)
 *   기억할 것은 1~3개 (summary.remember)
 *   내부 key 를 사용자 화면에 노출 금지
 *
 *   node test/beginner.cjs
 */
const { check, readFile, walk, load, section, report } = require("./lib.cjs");

const JSX = [...walk("src/components", [".jsx"]), ...walk("src/activities", [".jsx"]), "src/App.jsx"];
const DATA = walk("src/data", [".js"]);

(async () => {
  const course = await load("src/data/course.js");
  const glossary = await load("src/data/glossary.js");
  const sqlData = await load("src/data/sql.js");
  const chapters = course.COURSE;

  /* ---------------------------------------------------------- */
  section("1. 용어 사전");

  const terms = Object.keys(glossary.GLOSSARY);
  check("용어 사전에 항목이 충분히 있다", terms.length >= 30, `${terms.length}개`);
  check(
    "모든 항목이 쉬운 역할 이름과 뜻풀이를 함께 가진다",
    terms.every((t) => {
      const e = glossary.GLOSSARY[t];
      return e && /[가-힣]/.test(e.role) && e.hint && e.hint.length > 10;
    }),
    terms.filter((t) => !glossary.GLOSSARY[t].hint).join(", ")
  );

  /* "설명 없이 첫 등장 금지" 대상으로 명시된 용어가 사전에 있어야 한다 */
  const MUST_COVER = [
    "Runtime", "Remote", "origin", "HEAD", "main", "State", "Render", "Route", "Handler",
    "Proxy", "Upstream", "Status Code", "Headers", "Body", "Container", "Image", "Layer",
    "Volume", "Network", "Dependency", "Environment Variable", "AUTO_INCREMENT", "VARCHAR",
    "PRIMARY KEY", "Parameter Binding"
  ];
  const missing = MUST_COVER.filter((t) => !glossary.getTerm(t));
  check("금지 목록의 용어가 모두 사전에 등록되어 있다", missing.length === 0, missing.join(", "));

  /* ---------------------------------------------------------- */
  section("2. GUIDED INTERACTIVE EXPLORATION — 평가 요소 없음");

  /* 파일 자체가 없고, import 도 render 도 없어야 한다. (주석의 언급은 규칙 설명이므로 허용) */
  check(
    "KnowledgeCheck 컴포넌트 파일이 없다",
    !JSX.some((rel) => /KnowledgeCheck/.test(rel)),
    "KnowledgeCheck.jsx 가 남아 있습니다"
  );
  const kcRefs = JSX.filter((rel) => {
    const text = readFile(rel).replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    return /import[^;]*KnowledgeCheck|<KnowledgeCheck/.test(text);
  });
  check("KnowledgeCheck 를 import 하거나 렌더하지 않는다", kcRefs.length === 0, kcRefs.join(", "));

  const withQuiz = chapters.filter((c) => c.quiz);
  check("Chapter 데이터에 quiz 가 없다", withQuiz.length === 0, withQuiz.map((c) => `Chapter ${c.id}`).join(", "));

  const quizMarkup = JSX.filter((rel) => /className="quiz|quiz-list|quiz-choice|quiz-score/.test(readFile(rel)));
  check("Quiz 마크업이 남아 있지 않다", quizMarkup.length === 0, quizMarkup.join(", "));

  const quizCss = walk("src/styles", [".css"]).filter((rel) => /\.quiz-/.test(readFile(rel)));
  check("Quiz 전용 CSS 가 남아 있지 않다", quizCss.length === 0, quizCss.join(", "));

  const gradeWords = [];
  for (const rel of [...JSX, ...DATA]) {
    const text = readFile(rel).replace(/\/\*[\s\S]*?\*\//g, "");
    if (/정답 확인|다시 풀기|문항 중|이해도 확인|점수를 매/.test(text)) gradeWords.push(rel);
  }
  check("평가 UX 문구가 남아 있지 않다", gradeWords.length === 0, gradeWords.join(", "));

  check(
    "결과 구간을 성공 / 실패로 채점하지 않는다",
    !/{ok \? "성공" : "실패"}/.test(readFile("src/components/result/ResultSection.jsx")),
    "성공 / 실패 라벨이 남아 있습니다"
  );

  const header = readFile("src/components/course/CourseHeader.jsx");
  const dropdown = readFile("src/components/ChapterDropdown.jsx");
  /* 성취율 Bar 를 두지 않는다 — Header 는 "지금 어디를 보고 있는가"만 답한다 */
  check("Header 에 진행률 Bar 가 없다", !/progressbar|progress-fill/.test(header), "진행률 Bar 가 남아 있습니다");
  check("Header 가 현재 Chapter 위치를 보여 준다", header.includes("site-header-chip"), "현재 위치 표시가 없습니다");
  check("Chapter 목록이 '살펴봄'으로 표시된다", dropdown.includes("살펴봄"), "완료 문구가 남아 있습니다");
  /* 자세한 판정 규칙은 test/progress.cjs 가 검사한다 */
  check(
    "살펴봄이 Activity 성취가 아니라 방문 기록이다",
    /onChapterChange\(/.test(readFile("src/App.jsx")),
    "떠날 때 기록하는 처리가 없습니다"
  );

  /* Chapter 이동이 어떤 조건으로도 잠기지 않는다 */
  const nav = readFile("src/components/course/ChapterNav.jsx");
  check(
    "이전 / 다음 버튼에 잠금 조건이 없다",
    !/disabled/.test(nav),
    "ChapterNav 에 disabled 가 있습니다"
  );
  check(
    "Chapter Dropdown 항목에 잠금 조건이 없다",
    !/disabled/.test(dropdown),
    "ChapterDropdown 에 disabled 가 있습니다"
  );

  /* ---------------------------------------------------------- */
  section("3. 왜 이걸 보나요? / 딱 하나");

  const noWhy = chapters.filter((c) => !Array.isArray(c.whyItMatters) || c.whyItMatters.length === 0);
  check("15개 Chapter 모두 whyItMatters 가 있다", noWhy.length === 0, noWhy.map((c) => `Chapter ${c.id}`).join(", "));

  const noOne = chapters.filter((c) => !c.oneThing || c.oneThing.length < 10);
  check("15개 Chapter 모두 oneThing 이 있다", noOne.length === 0, noOne.map((c) => `Chapter ${c.id}`).join(", "));

  const evalObjectives = chapters.filter((c) =>
    (c.objectives || []).some((o) => /(설명|구분|답)할 수 있다|안다$/.test(o))
  );
  check(
    "학습 목표가 평가형 문장이 아니다",
    evalObjectives.length === 0,
    evalObjectives.map((c) => `Chapter ${c.id}`).join(", ")
  );

  /* 첫 화면 Copy 자체에 대한 검사는 test/first-screen.cjs 가 담당한다 */
  check(
    "Hero 에 용어 사전 블록도 기술 Tag 목록도 없다",
    !/처음 나오는 말|hero-tags/.test(readFile("src/components/course/ChapterHero.jsx")),
    "Hero 에 용어/Tag 블록이 남아 있습니다"
  );

  /* 제작·설계 용어가 사용자 화면 문자열에 노출되지 않는다 (주석은 허용) */
  const JARGON = /(Role Before Tool|Progressive Disclosure|Guided Exploration|Runtime Path|Mental Model|Acceptance)/;
  const jargonHits = JSX.filter((rel) => {
    const text = readFile(rel).replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    return JARGON.test(text);
  });
  check("제작 규칙 용어가 화면에 노출되지 않는다", jargonHits.length === 0, jargonHits.join(", "));

  check(
    "개념 구간 제목에 제작 규칙 표현이 없다",
    !readFile("src/components/course/ConceptSection.jsx").includes("역할이 먼저다"),
    "'역할이 먼저다'가 화면에 남아 있습니다"
  );
  check(
    "왜 이걸 보나요? 구간이 Activity 보다 앞에 온다",
    (() => {
      const page = readFile("src/components/ChapterPage.jsx");
      return page.indexOf("<WhySection") < page.indexOf("<ActivityRenderer");
    })(),
    "순서가 뒤바뀌었습니다"
  );
  check(
    "Activity 가 Architecture · Concept · Code 보다 앞에 온다",
    (() => {
      const page = readFile("src/components/ChapterPage.jsx");
      return page.indexOf("<ActivityRenderer") < page.indexOf("<ArchitectureSection")
        && page.indexOf("<ArchitectureSection") < page.indexOf("<CodeExplorer");
    })(),
    "Activity First 순서가 아닙니다"
  );

  /* ---------------------------------------------------------- */
  section("4. 이것만 기억하세요 / 다음 Chapter 이유");

  const noRemember = chapters.filter((c) => !c.summary || !Array.isArray(c.summary.remember) || !c.summary.remember.length);
  check("15개 Chapter 모두 remember 가 있다", noRemember.length === 0, noRemember.map((c) => `Chapter ${c.id}`).join(", "));

  const tooManyRemember = chapters.filter((c) => c.summary.remember.length > 3);
  check(
    "기억할 것은 3개를 넘지 않는다",
    tooManyRemember.length === 0,
    tooManyRemember.map((c) => `Chapter ${c.id}: ${c.summary.remember.length}개`).join(", ")
  );

  const noNext = chapters.filter((c) => !c.summary.next);
  check("다음 Chapter를 보는 이유가 있다", noNext.length === 0, noNext.map((c) => `Chapter ${c.id}`).join(", "));

  check(
    "긴 정리는 접기 안으로 내려간다",
    readFile("src/components/course/ChapterSummary.jsx").includes("조금 더 정리해서 보기"),
    "상세 정리가 접히지 않습니다"
  );

  /* ---------------------------------------------------------- */
  section("5. 오류 구간은 기본 접기");

  check(
    "오류 구간이 기본적으로 접혀 있다",
    readFile("src/components/course/ErrorSection.jsx").includes("문제가 생기면 보기"),
    "오류 접기가 없습니다"
  );
  const errorsPrimary = chapters.filter((c) => c.errorsPrimary);
  check(
    "오류가 핵심인 Chapter 만 펼친 채로 둔다",
    errorsPrimary.length >= 1 && errorsPrimary.every((c) => c.id === 2),
    errorsPrimary.map((c) => `Chapter ${c.id}`).join(", ")
  );

  /* ---------------------------------------------------------- */
  section("5-2. Activity De-gamification");

  const ACT = walk("src/activities", [".jsx"]);
  const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

  /* 점수처럼 보이는 n / n 진행률을 Activity 에 두지 않는다.
     Process Animation 의 "STEP n / total" 은 현재 순서 위치라 허용한다. */
  const scoreUi = ACT.filter((rel) => {
    const text = strip(readFile(rel));
    if (/match-count|match-progress/.test(text)) return true;
    /* {x} / {y} 형태의 숫자 진행률 — trace/process 의 STEP 표시는 제외 */
    return /\{\s*\w+\s*\}\s*\/\s*\{/.test(text) && !/STEP \{/.test(text);
  });
  check("Activity 에 점수형 진행률이 없다", scoreUi.length === 0, scoreUi.join(", "));

  check(
    "Process Animation 의 순서 위치 표시는 유지한다",
    /STEP \{/.test(readFile("src/activities/process/ProcessActivity.jsx"))
      && /STEP \{/.test(readFile("src/activities/trace/TraceActivity.jsx")),
    "STEP n / total 표시가 사라졌습니다"
  );

  /* 맞히기 / 채점 구조가 남아 있지 않다 */
  const grading = ACT.filter((rel) => {
    const text = strip(readFile(rel));
    return /is-correct|isSolved|맞히|정답|모두 맞|짝 맞추기|완료 조건/.test(text);
  });
  check("Activity 에 채점 구조가 없다", grading.length === 0, grading.join(", "));

  /* Chapter 03 은 짝 맞히기가 아니라 자유 탐색이다 */
  const folder = strip(readFile("src/activities/folder/FolderMapActivity.jsx"));
  check(
    "Chapter 03 이 위치를 맞히게 하지 않는다",
    !/map-choices|어디에 해당할까요/.test(folder),
    "짝 맞히기 UI 가 남아 있습니다"
  );
  check(
    "Chapter 03 이 누르면 바로 자리를 보여 준다",
    folder.includes("시스템에서의 자리"),
    "즉시 표시가 없습니다"
  );

  /* Chapter 07 은 순서 맞히기가 아니라 Guided Build 다 */
  const df = strip(readFile("src/activities/docker/ImageBuildActivity.jsx"));
  check("Chapter 07 이 다음 줄을 보여 주는 방식이다", df.includes("다음 줄 보기"), "Guided Build 가 아닙니다");
  check("Chapter 07 에 순서 맞히기가 없다", !/checkPlace|남은 줄/.test(df), "배치 Puzzle 이 남아 있습니다");

  /* Chapter 12 는 맞다/틀리다 대신 결과를 보여 준다 */
  const rest = strip(readFile("src/activities/rest/RestMatrixActivity.jsx"));
  check("Chapter 12 에 정답 판정이 없다", !/right|solved/.test(rest), "정답 판정이 남아 있습니다");
  check(
    "Chapter 12 가 고르면 바로 요청을 보여 준다",
    rest.includes("이 조합은 이런 요청이 됩니다"),
    "즉시 표시가 없습니다"
  );

  /* Chapter 08 — 핵심 행동(세 서비스 띄우기)만으로 결과가 나와야 한다.
     서비스 카드를 하나씩 눌러 보는 것까지 요구하면 통과 조건이 하나 더 생긴다. */
  const compose = strip(readFile("src/activities/compose/ComposeMapActivity.jsx"));
  const composeGate = compose.match(/if \(!allUp[^)]*\) return;/);
  check(
    "Chapter 08 이 세 서비스를 띄우면 바로 결과를 낸다",
    !!composeGate && !/seenCount/.test(composeGate[0]),
    composeGate ? composeGate[0] : "완료 조건을 찾지 못했습니다"
  );
  check(
    "Chapter 08 완료 effect 가 seenCount 에 묶여 있지 않다",
    !/\[allUp, seenCount/.test(compose),
    "seenCount 가 완료 조건에 남아 있습니다"
  );
  check(
    "Chapter 08 이 다음에 실행될 명령을 미리 보여 준다",
    compose.includes("지금 실행 대기 중인 명령") && /upOne\(nextId\)/.test(compose),
    "실행 대기 명령 표시가 없습니다"
  );
  check(
    "Chapter 08 이 실행한 명령을 순서대로 쌓아 보여 준다",
    /setLog/.test(compose) && /log\.map/.test(compose),
    "명령 기록이 누적되지 않습니다"
  );

  /* Chapter 15 는 Guided Tour 다 */
  const fin = strip(readFile("src/activities/complete/ProjectCompleteActivity.jsx"));
  check("Chapter 15 가 다음 단계를 보여 주는 방식이다", fin.includes("다음 단계 보기"), "Guided Tour 가 아닙니다");
  check(
    "Chapter 15 에 완료 조건 판정 용어가 없다",
    !/완료 조건|아직 할 수 없음|final-count/.test(fin),
    "완료 조건 UI 가 남아 있습니다"
  );

  /* ---------------------------------------------------------- */
  section("5-3. Activity Guide Role-First");

  /* Activity 시작 설명에서 아직 소개하지 않은 기술 이름을 Primary 로 쓰지 않는다 */
  const GUIDE_BAN = {
    8: /depends_on/,
    10: /backend/,
    11: /\bRoute\b|\bMethod\b/,
    13: /\bSQL\b/
  };
  const guideHits = [];
  for (const c of chapters) {
    const g = (c.activity && c.activity.guide) || "";
    const ban = GUIDE_BAN[c.id];
    if (ban && ban.test(g)) guideHits.push(`Chapter ${c.id}`);
  }
  check("Activity 안내가 역할 표현으로 시작한다", guideHits.length === 0, guideHits.join(", "));

  /* ---------------------------------------------------------- */
  section("6. Activity CTA 표현");

  const badCta = chapters.filter((c) => {
    const cta = c.activity && c.activity.cta;
    return cta && /문제|정답|맞히|풀기|시험/.test(cta);
  });
  check("CTA 에 평가 표현이 없다", badCta.length === 0, badCta.map((c) => `Chapter ${c.id}`).join(", "));

  const noCta = chapters.filter((c) => !c.activity || !c.activity.cta);
  check("모든 Chapter 에 체험 CTA 가 있다", noCta.length === 0, noCta.map((c) => `Chapter ${c.id}`).join(", "));

  /* ---------------------------------------------------------- */
  section("7. 용어 노출 위치");

  const conceptTerms = chapters.filter((c) =>
    c.concept && (c.concept.roles || []).some((r) => glossary.getTerm(r.term || r.tech))
  );
  check(
    "용어는 실제로 필요해지는 개념 구간에서 설명된다",
    conceptTerms.length >= 6,
    `${conceptTerms.length}개 Chapter (최소 6개)`
  );

  /* concept.roles 의 기술 이름이 사전에 있으면 ConceptSection 이 쉬운 말 한 줄을 덧붙인다 */
  check(
    "개념 구간이 사전 뜻풀이를 함께 그린다",
    readFile("src/components/course/ConceptSection.jsx").includes("role-hint"),
    "뜻풀이 렌더가 없습니다"
  );

  /* ---------------------------------------------------------- */
  section("8. Code UX — 전체 코드 첫 노출 금지");

  const noFocus = chapters.filter(
    (c) => !c.codeInActivity && (c.code || []).length > 0 && !c.codeFocus
  );
  check(
    "코드가 있는 모든 Chapter 에 '이번 Chapter에서 볼 코드'가 있다",
    noFocus.length === 0,
    noFocus.map((c) => `Chapter ${c.id}`).join(", ")
  );

  const longFocus = chapters.filter((c) => c.codeFocus && c.codeFocus.lines.length > 5);
  check("첫 노출 코드는 5줄 이하다", longFocus.length === 0, longFocus.map((c) => `Chapter ${c.id}`).join(", "));

  const noSay = chapters.filter((c) => c.codeFocus && (!c.codeFocus.say || c.codeFocus.say.length < 20));
  check("첫 노출 코드에 쉬운 설명이 붙어 있다", noSay.length === 0, noSay.map((c) => `Chapter ${c.id}`).join(", "));

  check(
    "CodeExplorer 가 전체 코드를 접은 채로 시작한다",
    readFile("src/components/code/CodeExplorer.jsx").includes("실제 코드 전체 보기"),
    "전체 코드 보기 토글이 없습니다"
  );
  check(
    "Chapter 와 맞지 않는 고정 안내 문구가 남아 있지 않다",
    !readFile("src/components/code/CodeExplorer.jsx").includes("네 파일이 각각"),
    "고정 문구가 남아 있습니다"
  );
  check(
    "Chapter 별 코드 안내를 데이터에서 받는다",
    readFile("src/components/code/CodeExplorer.jsx").includes("chapter.codeIntro"),
    "codeIntro 를 읽지 않습니다"
  );

  /* ---------------------------------------------------------- */
  section("9. 방금 무슨 일이 일어났나요 — 실습 전 빈 결과 금지");

  const result = readFile("src/components/result/ResultSection.jsx");
  check(
    "결과가 없으면 이 구간을 그리지 않는다",
    result.includes("if (!outcome) return null;"),
    "빈 결과 안내가 여전히 렌더됩니다"
  );
  check(
    "구간 제목이 '방금 무슨 일이 일어났나요?' 다",
    result.includes("방금 무슨 일이 일어났나요?"),
    "제목이 다릅니다"
  );

  /* ---------------------------------------------------------- */
  section("10. Mock 용어 정리");

  const mockTag = JSX.filter((rel) => /<span className="tag">Mock<\/span>/.test(readFile(rel)));
  check("초보자 화면에서 Mock 을 기본 단어로 쓰지 않는다", mockTag.length === 0, mockTag.join(", "));

  const mockCopy = DATA.filter((rel) => /Mock(?!\s*(?:데이터를|API))/.test(readFile(rel).replace(/\/\*[\s\S]*?\*\//g, "")));
  check("Chapter 데이터 본문에 Mock 이 남아 있지 않다", mockCopy.length === 0, mockCopy.join(", "));

  /* ---------------------------------------------------------- */
  section("11. 내부 key 노출 금지");

  const rawKey = JSX.filter((rel) => /\{cur\.node\}\s*위치 보기/.test(readFile(rel)));
  check("Chapter 14 가 내부 node key 를 그대로 노출하지 않는다", rawKey.length === 0, rawKey.join(", "));
  check(
    "사용자용 Label 로 바꾸는 함수가 있다",
    readFile("src/activities/trace/TraceActivity.jsx").includes("function nodeLabel"),
    "nodeLabel 이 없습니다"
  );

  /* ---------------------------------------------------------- */
  section("12. 데이터 변환 표현 정확성");

  const trace = await load("src/data/trace.js");
  const sqlStep = trace.TRACE_STEPS.find((s) => s.dataKind === "sql");
  check(
    "'HTTP 요청이 SQL 질의가 되었다'로 단순화하지 않는다",
    !/HTTP 요청이 SQL 질의가 되었습니다/.test(sqlStep.detail),
    sqlStep.detail
  );
  check(
    "요청 처리 계층이 새 질문을 만든다는 점이 드러난다",
    /새로 만들어|새로 만들|질문을 새로/.test(sqlStep.detail),
    sqlStep.detail
  );

  /* ---------------------------------------------------------- */
  section("13. 진행 상태 보관 / URL 동기화");

  const app = readFile("src/App.jsx");
  check("현재 Chapter 를 URL 과 동기화한다", app.includes('searchParams.set("chapter"'), "URL 동기화 없음");
  check("새로고침 시 URL 에서 Chapter 를 복구한다", app.includes("readChapterFromUrl"), "복구 로직 없음");
  check("뒤로/앞으로 가기를 처리한다", app.includes("popstate"), "popstate 처리 없음");
  check("완료 Chapter 를 localStorage 에 보관한다", app.includes("localStorage"), "보관 로직 없음");

  /* ---------------------------------------------------------- */
  section("14. Progressive Disclosure 부품");

  check(
    "공통 접기 부품이 <details> 기반이다",
    readFile("src/components/common/Disclosure.jsx").includes("<details"),
    "details 를 쓰지 않습니다"
  );
  const users = JSX.filter((rel) => /from ".*Disclosure\.jsx"/.test(readFile(rel)));
  check("접기 부품이 실제로 여러 화면에서 쓰인다", users.length >= 5, `${users.length}곳`);

  const withAdvanced = chapters.filter((c) => c.concept && (c.concept.advanced || []).length > 0);
  check("심화 내용을 분리한 Chapter 가 있다", withAdvanced.length >= 5, `${withAdvanced.length}개 Chapter`);

  const withCheckpoint = chapters.filter((c) => c.concept && c.concept.checkpoint);
  check("학습 완료 지점을 알려 주는 Chapter 가 있다", withCheckpoint.length >= 5, `${withCheckpoint.length}개 Chapter`);

  check(
    "용어 뜻풀이 부품이 화면에서 실제로 쓰인다",
    JSX.some((rel) => /from ".*TermHint\.jsx"/.test(readFile(rel))),
    "TermHint 를 쓰는 화면이 없습니다"
  );
  check(
    "뜻풀이가 Hover 가 아니라 클릭으로 열린다",
    /onClick=\{\(\) => setOpen/.test(readFile("src/components/common/TermHint.jsx")),
    "클릭 토글이 아닙니다"
  );

  /* ---------------------------------------------------------- */
  section("16. 개발자 리뷰 반영 (Targeted Review Fix)");

  const hero = strip(readFile("src/components/course/ChapterHero.jsx"));

  /* 1. Hero CTA 는 바로 다음에 오는 "왜 이걸 보나요?"를 건너뛰게 만든다 */
  check("Hero 에 Activity 로 건너뛰는 CTA 가 없다",
    !/#activity-heading/.test(hero), "CTA Anchor 가 남아 있습니다");
  check("Hero 에 hero-cta-note 가 없다",
    !/hero-cta/.test(hero), "hero-cta 마크업이 남아 있습니다");
  check("Hero CTA CSS 도 함께 제거됐다",
    !walk("src/styles", [".css"]).some((rel) => /\.hero-cta/.test(readFile(rel))),
    "hero-cta CSS 가 남아 있습니다");

  /* 2. Hero → 왜 이걸 보나요 → Activity 순서 (건너뛰기 없이 읽어 내려간다) */
  const pageOrder = readFile("src/components/ChapterPage.jsx");
  check("WhySection 이 Hero 와 Activity 사이에 있다",
    pageOrder.indexOf("<ChapterHero") < pageOrder.indexOf("<WhySection")
      && pageOrder.indexOf("<WhySection") < pageOrder.indexOf("<ActivityRenderer"),
    "순서가 어긋났습니다");

  /* 3 · 4. 처리 결과 번호는 참고표에서 한 행씩 */
  const statusRef = strip(readFile("src/components/course/StatusCodeReference.jsx"));
  check("처리 결과 번호 공통 참고표가 있다",
    statusRef.includes("자주 보는 처리 결과 번호"), "참고표 제목이 없습니다");
  check("번호 · 이름 · 의미가 각각 다른 칸이다",
    /status-ref-code/.test(statusRef) && /status-ref-name/.test(statusRef)
      && /status-ref-meaning/.test(statusRef),
    "칸이 분리되어 있지 않습니다");
  check("Chapter 02 가 참고표를 쓴다",
    Array.isArray(chapters[1].statusCodes) && chapters[1].statusCodes.includes(200),
    "Chapter 02 statusCodes 없음");
  check("Chapter 12 가 참고표를 쓴다",
    Array.isArray(chapters[11].statusCodes) && chapters[11].statusCodes.includes(405),
    "Chapter 12 statusCodes 없음");
  check("용어 사전이 한 문장에 여러 번호를 몰아넣지 않는다",
    !/200[^"]*404|404[^"]*500/.test(glossary.getTerm("Status Code").hint),
    glossary.getTerm("Status Code").hint);

  const crammed = chapters.filter((c) =>
    ((c.concept && c.concept.roles) || []).some(
      (r) => r.tech === "Status Code" && /200[^.]*40\d|20\d[^.]*20\d/.test(r.desc)));
  check("Chapter 설명에도 번호를 몰아넣지 않는다", crammed.length === 0,
    crammed.map((c) => `Chapter ${c.id}`).join(", "));

  /* 5. REST 를 처음 보는 사람에게 주는 설명 */
  const restPrimer = chapters[11].concept.primer;
  check("Chapter 12 에 REST 첫 설명이 있다",
    !!restPrimer && /설계 방법/.test(restPrimer.body.join(" ")), "primer 없음");
  check("REST 설명 직후에 구체 예가 온다",
    !!restPrimer && restPrimer.examples.length >= 2
      && restPrimer.examples.some(([, how]) => how.startsWith("GET "))
      && restPrimer.examples.some(([, how]) => how.startsWith("PATCH ")),
    "GET / PATCH 예가 없습니다");
  check("이 Chapter 의 범위를 명시한다",
    !!restPrimer && /전체 이론이 아니라/.test(restPrimer.scope), "범위 문장이 없습니다");
  check("REST 를 JSON 으로 정의하지 않는다",
    !/REST\s*(는|=)\s*JSON/.test(JSON.stringify(chapters[11])), "REST = JSON 표현이 있습니다");

  /* 7. 설정 파일이 아니라 그 안의 비밀값이 문제다 */
  const sec = chapters[4].security;
  check("비밀값 경고 Callout 이 있다", !!sec && !!sec.safe && !!sec.unsafe, "security 데이터 없음");
  check("YAML 자체를 금지하지 않는다",
    !!sec && /올려도 됩니다/.test(sec.title + sec.body.join(" ")), "설정 파일 자체를 금지하고 있습니다");
  check("SAFE 예가 값이 아닌 자리만 담는다",
    !!sec && /secrets\./.test(sec.safe.code) && /\$\{/.test(sec.safe.code),
    "SAFE 예에 자리 표시가 없습니다");
  check("UNSAFE 예가 무엇이 위험한지 보여 준다",
    !!sec && /private_key|password|token|API_KEY/.test(sec.unsafe.code),
    "UNSAFE 예가 없습니다");
  check("Secret 관리 기능을 안내한다",
    !!sec && /Secrets/.test(sec.body.join(" ")), "Secrets 안내가 없습니다");
  const callout = strip(readFile("src/components/course/SecurityCallout.jsx"));
  check("경고를 색상만으로 표현하지 않는다",
    /⚠/.test(callout) && /SAFE/.test(callout) && /UNSAFE/.test(callout),
    "아이콘 또는 SAFE / UNSAFE 라벨이 없습니다");

  /* 실제 비밀값을 코드에 넣지 않는다 */
  const realSecret = [...DATA, ...JSX].filter((rel) => {
    const t = readFile(rel);
    return /-----BEGIN [A-Z ]*PRIVATE KEY-----[A-Za-z0-9+/=]{20,}/.test(t)
      || /(?:AIza[0-9A-Za-z_-]{30,}|ghp_[0-9A-Za-z]{30,}|sk-[0-9A-Za-z]{30,})/.test(t);
  });
  check("실제 Secret 문자열이 저장소에 없다", realSecret.length === 0, realSecret.join(", "));

  /* 8. 코드 주석 표현 */
  const awkward = [...DATA, ...JSX].filter((rel) => /처지/.test(readFile(rel)));
  check("'처지' 같은 어색한 상태 표현이 없다", awkward.length === 0, awkward.join(", "));
  check("React 주석이 무엇을 저장하는지 밝힌다",
    chapters[8].codeFocus.lines.join(" ").includes("받은 학생 데이터를 저장한다"),
    "주석이 교정되지 않았습니다");
  const typo = [...DATA, ...JSX].filter((rel) => /susses|succes[^s]/.test(readFile(rel)));
  check("success 철자가 온전하다", typo.length === 0, typo.join(", "));

  /* 9. Frontend ↔ DB 를 웹 전체의 절대 규칙처럼 쓰지 않는다 */
  const absolute = [...DATA, ...JSX].filter((rel) => {
    const t = strip(readFile(rel));
    return /(MySQL에 직접 접속하지 않는다|MySQL에 직접 연결하지 않습니다|API를 통해서만 데이터를 얻)/.test(t);
  });
  check("Frontend / DB 를 절대 규칙으로 쓰지 않는다", absolute.length === 0, absolute.join(", "));
  check("이 프로젝트의 구조임을 명시한다",
    /이 프로젝트에서는 화면이 API에 데이터를 요청하고/.test(chapters[8].concept.note),
    "프로젝트 한정 표현이 없습니다");

  /* 10. SQL Schema 키워드를 하나씩 분해하고 마지막에 다시 조합한다 */
  const idCol = sqlData.COLUMNS.find((c) => c.id === "id");
  const keywords = idCol.parts.map(([k]) => k);
  for (const k of ["INT", "AUTO_INCREMENT", "PRIMARY KEY"]) {
    check(`${k} 가 별도 항목으로 설명된다`, keywords.includes(k), keywords.join(" · "));
  }
  check("VARCHAR(100) 도 별도 항목이다",
    sqlData.COLUMNS.find((c) => c.id === "name").parts.some(([k]) => k.startsWith("VARCHAR")),
    "VARCHAR 항목 없음");
  check("NOT NULL 도 별도 항목이다",
    sqlData.COLUMNS.find((c) => c.id === "name").parts.some(([k]) => k === "NOT NULL"),
    "NOT NULL 항목 없음");
  check("PRIMARY KEY 가 중복되지 않음을 설명한다",
    /중복되지 않게/.test(idCol.parts.find(([k]) => k === "PRIMARY KEY")[1]),
    "중복 설명이 없습니다");
  check("마지막에 한 줄로 다시 조합해 설명한다",
    !!idCol.combine && idCol.combine.code === "id INT AUTO_INCREMENT PRIMARY KEY"
      && /고유한 정수 번호/.test(idCol.combine.say),
    "조합 설명이 없습니다");
  check("조합 설명이 화면에 그려진다",
    /sql-schema-combine/.test(readFile("src/activities/sql/SqlTableActivity.jsx")),
    "combine 렌더가 없습니다");

  /* ---------------------------------------------------------- */
  section("15. Course Copy");

  check("교안 제목이 만들 결과를 먼저 말한다", /[가-힣]/.test(course.COURSE_TITLE), course.COURSE_TITLE);
  check(
    "제작 정보가 기본 학습 Footer 에서 분리되어 있다",
    app.includes("제작 정보") && app.includes("site-footer-meta"),
    "제작 정보 분리 없음"
  );

  report("beginner");
})().catch((e) => {
  process.stdout.write(`\n실행 오류: ${e && e.stack ? e.stack : e}\n`);
  process.exitCode = 1;
});
