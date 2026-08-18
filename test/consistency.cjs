/*
 * test/consistency.cjs — 교안 기술 일관성 검사
 *
 * 24_TECHNICAL_CONTENT_RULES §10 Code Consistency Gate 와 CLAUDE.md Hard Rules 를
 * 실제로 실행 가능한 형태로 옮긴 것이다.
 *
 *   node test/consistency.cjs
 */
const { check, equal, readFile, walk, load, section, report } = require("./lib.cjs");

const DATA = walk("src/data", [".js"]);
const SRC = [...DATA, ...walk("src/components", [".jsx"]), ...walk("src/activities", [".jsx", ".js"])];

(async () => {
  /* ---------------------------------------------------------- */
  section("1. Chapter 구성");

  const course = await load("src/data/course.js");
  const chapters = course.COURSE;

  equal("Chapter 는 15개다", chapters.length, 15);
  equal("TOTAL_CHAPTERS 가 목록 길이와 같다", course.TOTAL_CHAPTERS, chapters.length);
  check(
    "Chapter id 가 1~15 로 중복 없이 이어진다",
    chapters.every((c, i) => c.id === i + 1),
    chapters.map((c) => c.id).join(",")
  );
  check(
    "모든 Chapter 에 핵심 질문이 있다",
    chapters.every((c) => typeof c.coreQuestion === "string" && c.coreQuestion.length > 0),
    "coreQuestion 누락"
  );
  check(
    "모든 Chapter 에 Activity 가 등록되어 있다",
    chapters.every((c) => c.activity && typeof c.activity.type === "string"),
    "activity.type 누락"
  );
  check(
    "placeholder Chapter 가 남아 있지 않다",
    chapters.every((c) => c.placeholder === false),
    "placeholder: true 인 Chapter 가 있습니다"
  );

  /* ---------------------------------------------------------- */
  section("2. Architecture 계약");

  const arch = await load("src/data/architecture.js");
  check(
    "Runtime 경로가 USER → Browser → Nginx → Flask → MySQL 이다",
    arch.RUNTIME_PATH.join(">") === "user>browser>nginx>flask>mysql",
    arch.RUNTIME_PATH.join(">")
  );
  check(
    "GitHub · Docker 는 Runtime 축이 아니다",
    arch.NODES.filter((n) => ["github", "local-git", "docker"].includes(n.id))
      .every((n) => n.axis !== "runtime"),
    "관리/실행 환경 Node 가 runtime 축으로 들어가 있습니다"
  );
  check(
    "Runtime Node 는 모두 한글 역할 이름을 가진다",
    arch.RUNTIME_PATH.every((id) => {
      const n = arch.getNode(id);
      return n && typeof n.role === "string" && /[가-힣]/.test(n.role);
    }),
    "role 이 비었거나 한글이 아닙니다"
  );

  /* ---------------------------------------------------------- */
  section("3. Route · 서비스 이름 · Table 계약");

  const forbiddenRoutes = [];
  for (const rel of SRC) {
    const text = readFile(rel);
    /* 학생 자원의 주소는 /api/students 형태만 쓴다 */
    const m = text.match(/\/api\/(?!students)[a-zA-Z]+/g);
    if (m) forbiddenRoutes.push(`${rel}: ${[...new Set(m)].join(", ")}`);
  }
  check(
    "학생 자원 Route 는 /api/students 계열만 쓴다",
    /* Chapter 11 의 '등록되지 않은 주소' 예시(/api/teachers)와
       Chapter 12 의 안티패턴 예시(/api/deleteStudent)만 예외로 허용한다 */
    forbiddenRoutes.every((line) => /teachers|deleteStudent|getStudent/.test(line)),
    forbiddenRoutes.join(" | ")
  );

  const compose = await load("src/data/compose.js");
  equal("Compose 서비스는 web · backend · db 다", compose.SERVICES.map((s) => s.id).join(","), "web,backend,db");
  equal("시작 순서는 db → backend → web 이다", compose.START_ORDER.join(","), "db,backend,web");
  check(
    "바깥으로 포트를 여는 서비스는 web 하나뿐이다",
    compose.SERVICES.filter((s) => s.external).length === 1 && compose.getService("web").external === "80",
    compose.SERVICES.map((s) => `${s.id}:${s.external}`).join(" ")
  );
  check(
    "backend 는 서비스 이름 db 를 주소로 쓴다",
    compose.getService("backend").yaml.includes("DB_HOST: db"),
    "DB_HOST 가 db 가 아닙니다"
  );
  /* 화면에 "실행 대기 중인 명령"으로 보여 주는 문자열이 실제로 쓸 수 있는 명령이어야 한다 */
  check(
    "서비스별 실행 명령이 compose 서비스 이름을 그대로 쓴다",
    compose.START_ORDER.every((id) => compose.upOne(id) === `docker compose up -d ${id}`),
    compose.START_ORDER.map((id) => compose.upOne(id)).join(" | ")
  );
  check(
    "그 서비스 이름이 모두 실제 정의된 서비스다",
    compose.START_ORDER.every((id) => !!compose.getService(id)),
    compose.START_ORDER.filter((id) => !compose.getService(id)).join(", ")
  );
  check(
    "상태 확인 명령이 docker compose ps 다",
    compose.PS_CMD === "docker compose ps",
    compose.PS_CMD
  );

  const sql = await load("src/data/sql.js");
  equal("표 이름은 students 다", sql.TABLE, "students");
  equal("표의 칸은 id · name · score 다", sql.COLUMNS.map((c) => c.id).join(","), "id,name,score");

  /* ---------------------------------------------------------- */
  section("4. SQL 안전성 — 파라미터 바인딩");

  const rest = await load("src/data/rest.js");
  const restSql = ["collection", "item"].flatMap((r) =>
    ["GET", "POST", "PATCH", "DELETE"].map((m) => rest.cellOf(r, m).sql)
  );
  check(
    "REST Activity 의 SQL 에 값이 직접 박혀 있지 않다",
    restSql.every((s) => !/VALUES\s*\(\s*'/.test(s) && !/=\s*'/.test(s)),
    restSql.filter((s) => /'/.test(s)).join(" | ")
  );
  check(
    "쓰기 계열 SQL 은 %s 자리를 쓴다",
    restSql.filter((s) => /^(INSERT|UPDATE|DELETE)/.test(s)).every((s) => s.includes("%s")),
    restSql.filter((s) => /^(INSERT|UPDATE|DELETE)/.test(s)).join(" | ")
  );
  check(
    "SQL Activity 의 조건절도 %s 자리를 쓴다",
    sql.QUERIES.filter((q) => q.target).every((q) => q.sql.includes("%s")),
    sql.QUERIES.map((q) => q.sql).join(" | ")
  );

  const concatSql = [];
  for (const rel of DATA) {
    const text = readFile(rel);
    /* 문자열 이어붙이기 SQL. Chapter 11 의 "이렇게 쓰지 않는다" 반례는 주석(#)으로만 존재한다. */
    const lines = text.split("\n");
    lines.forEach((line, i) => {
      if (/"SELECT[^"]*"\s*\+/.test(line) && !line.includes("# ") && !line.trim().startsWith("//")) {
        concatSql.push(`${rel}:${i + 1}`);
      }
    });
  }
  check("실행되는 예제에 문자열 이어붙이기 SQL 이 없다", concatSql.length === 0, concatSql.join(", "));

  /* ---------------------------------------------------------- */
  section("5. Secret 취급");

  const leaked = [];
  for (const rel of DATA) {
    const text = readFile(rel);
    /* .env.example 예시 값(change-me 계열)과 ${VAR} 자리 표시자만 허용한다 */
    const m = text.match(/MYSQL_(?:ROOT_)?PASSWORD\s*[:=]\s*([^\s,'"]+)/g) || [];
    for (const hit of m) {
      if (!/\$\{|change-/.test(hit)) leaked.push(`${rel}: ${hit}`);
    }
  }
  check("실제 비밀번호 값이 데이터에 들어 있지 않다", leaked.length === 0, leaked.join(" | "));

  check(
    ".env 를 커밋하라고 안내하지 않는다",
    !DATA.some((rel) => /git add\s+\.env(?!\.example)/.test(readFile(rel))),
    "git add .env 안내가 있습니다"
  );

  const danger = [];
  for (const rel of DATA) {
    const text = readFile(rel);
    /* 파괴적 명령은 경고 · 예고로만 등장해야 하고 실행 단계로 들어가면 안 된다 */
    if (/down\s+-v/.test(text) && !/(?:쓰지 않|주의|위험|지워|삭제)/.test(text)) danger.push(rel);
  }
  check("docker compose down -v 는 경고와 함께만 등장한다", danger.length === 0, danger.join(", "));

  /* ---------------------------------------------------------- */
  section("6. Chapter 15 Guided Tour 정합성");

  const completion = await load("src/data/completion.js");
  check(
    "Tour 순서의 모든 단계가 실제로 정의되어 있다",
    completion.TOUR.every((id) => !!completion.getStep(id)),
    completion.TOUR.filter((id) => !completion.getStep(id)).join(", ")
  );
  check(
    "Tour 가 받기 → 실행 → 확인 → 수정 → 기록 → 공유 순서를 담는다",
    ["clone", "up", "check", "edit", "commit", "push"].every((id) => completion.TOUR.includes(id)),
    completion.TOUR.join(" → ")
  );
  check(
    "모든 단계에 '언제 쓰는지' 설명이 있다",
    completion.TOUR.every((id) => (completion.STEP_USE[id] || "").length > 5),
    completion.TOUR.filter((id) => !completion.STEP_USE[id]).join(", ")
  );
  check(
    "완료 조건 / 성취 Gate 개념이 데이터에 남아 있지 않다",
    completion.REQUIRED === undefined && completion.canRun === undefined,
    "REQUIRED 또는 canRun 이 아직 export 되어 있습니다"
  );
  check(
    "위험 명령은 Tour 에 들어가지 않는다",
    !completion.TOUR.some((id) => (completion.getStep(id).cmd || "").includes("-v")),
    "down -v 가 Tour 에 있습니다"
  );
  check(
    "완료 문구가 영어 대문자 문장이 아니다",
    /[가-힣]/.test(completion.FINAL_MESSAGE),
    completion.FINAL_MESSAGE
  );

  /* ---------------------------------------------------------- */
  section("7. depends_on 표현 통일");

  const badDepends = [];
  for (const rel of SRC) {
    const text = readFile(rel);
    /* 금지: "준비되면 뜬다" · "준비 완료까지 기다린다" 계열 */
    if (/depends_on[^\n]*기다려\s*준다/.test(text)) badDepends.push(`${rel} (기다려 준다)`);
    if (/db가?\s*준비되면[^\n]*(뜬다|시작)/.test(text)) badDepends.push(`${rel} (준비되면 뜬다)`);
  }
  check("depends_on 을 '준비 완료까지 기다린다'로 설명하지 않는다", badDepends.length === 0, badDepends.join(", "));

  const ch08 = chapters[7];
  const dependsRole = ch08.concept.roles.find((r) => r.tech === "depends_on");
  check("Chapter 08 이 depends_on 을 '시작 요청 순서'로 설명한다", !!dependsRole && dependsRole.role.includes("시작"), "역할 표기가 다릅니다");
  check(
    "'먼저 시작 ≠ 준비 완료' 를 명시한다",
    !!dependsRole && dependsRole.desc.includes("준비까지 끝났다는 뜻은 아닙니다"),
    "명시 문구가 없습니다"
  );

  /* ---------------------------------------------------------- */
  section("8. Process Animation 계약");

  const process = await load("src/data/process.js");
  const trace = await load("src/data/trace.js");
  check("Chapter 01 Step Mode 단계가 정의되어 있다", process.PROCESS_STEPS.length >= 10, `${process.PROCESS_STEPS.length}단계`);
  check(
    "Chapter 01 마지막 단계에서 화면이 성공 상태가 된다",
    process.PROCESS_STEPS[process.PROCESS_STEPS.length - 1].ui === "success",
    "마지막 단계의 ui 가 success 가 아닙니다"
  );
  check(
    "Chapter 14 는 요청 방향과 응답 방향을 모두 가진다",
    trace.TRACE_STEPS.some((s) => s.dir === "req") && trace.TRACE_STEPS.some((s) => s.dir === "res"),
    "req/res 단계 누락"
  );
  check(
    "Chapter 14 응답 마지막 단계에서 화면이 실제로 바뀐다",
    trace.TRACE_STEPS[trace.LAST_STEP].ui === "success",
    "마지막 단계의 ui 가 success 가 아닙니다"
  );
  check(
    "Chapter 01 과 Chapter 14 의 시나리오 학생이 다르다",
    process.STUDENT.id !== trace.TARGET.id,
    "같은 학생을 쓰고 있습니다"
  );

  report("consistency");
})().catch((e) => {
  process.stdout.write(`\n실행 오류: ${e && e.stack ? e.stack : e}\n`);
  process.exitCode = 1;
});
