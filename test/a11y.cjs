/*
 * test/a11y.cjs — 접근성 · 반응형 정적 점검
 *
 * 08_DESIGN_QA · 04_RESPONSIVE_RULES 의 항목 중 정적으로 확인 가능한 것만 검사한다.
 * 브라우저를 띄우지 않으므로 "실화면 확인이 필요한 항목"을 대체하지는 않는다.
 *
 *   node test/a11y.cjs
 */
const { check, readFile, walk, section, report } = require("./lib.cjs");

const JSX = [...walk("src/components", [".jsx"]), ...walk("src/activities", [".jsx"]), "src/App.jsx"];
const CSS = walk("src/styles", [".css"]);
const allCss = CSS.map((rel) => readFile(rel)).join("\n");

/* ---------- 색 대비 (WCAG) ---------- */

function srgb(c) {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
}

function ratio(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/* tokens.css 에서 --변수: #hex 를 뽑는다 */
function tokens() {
  const text = readFile("src/styles/tokens.css");
  const map = {};
  const re = /(--[a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g;
  let m;
  while ((m = re.exec(text))) map[m[1]] = m[2];
  return map;
}

section("0. CSS 구조");

for (const rel of CSS) {
  const t = readFile(rel);
  const open = (t.match(/\{/g) || []).length;
  const close = (t.match(/\}/g) || []).length;
  check(`${rel} 중괄호가 맞는다`, open === close, `{ ${open} · } ${close}`);
}

section("1. 색 대비 (WCAG AA · 본문 4.5:1)");

const T = tokens();
const PAIRS = [
  ["--text", "--bg", 4.5],
  ["--text-strong", "--bg", 4.5],
  ["--text-muted", "--bg", 4.5],
  ["--text-subtle", "--bg", 4.5],
  ["--text-on-fill", "--gray-5", 4.5],
  ["--text-on-fill-soft", "--gray-5", 4.5],
  ["--text-link", "--bg", 4.5],
  ["--success", "--success-light", 4.5],
  ["--danger", "--danger-light", 4.5],
  ["--warning", "--bg", 4.5],
  ["--primary-dark", "--primary-light", 4.5],
  ["--request", "--request-light", 4.5],
  ["--response", "--response-light", 4.5],
  ["--sql", "--sql-light", 4.5],
  ["--db-result", "--db-result-light", 4.5],
  ["--text-inverse", "--primary", 4.5]
];

for (const [fg, bg, min] of PAIRS) {
  if (!T[fg] || !T[bg]) {
    check(`${fg} on ${bg}`, false, "토큰을 찾지 못했습니다");
    continue;
  }
  const r = ratio(T[fg], T[bg]);
  check(`${fg} on ${bg} — ${r.toFixed(2)}:1`, r >= min, `${r.toFixed(2)}:1 (최소 ${min}:1)`);
}

/* ---------- 모션 ---------- */

section("2. 모션");

check("prefers-reduced-motion 을 지원한다", /prefers-reduced-motion/.test(allCss), "미디어 쿼리 없음");
check(
  "Reduced Motion 에서 애니메이션을 사실상 제거한다",
  /prefers-reduced-motion[\s\S]{0,600}animation[^;]*(none|0\.01ms|1ms)/.test(allCss),
  "animation 무력화 규칙을 찾지 못했습니다"
);
check(
  "사용자가 직접 모션을 끌 수 있다",
  readFile("src/App.jsx").includes("onToggleMotion"),
  "모션 토글 없음"
);
check(
  "전체 재생은 한 번만 하고 멈춘다 (Chapter 01)",
  /if \(index >= last\) \{\s*setPlaying\(false\)/.test(readFile("src/activities/process/ProcessActivity.jsx")),
  "Play Once 정지 로직을 찾지 못했습니다"
);
check(
  "전체 재생은 한 번만 하고 멈춘다 (Chapter 14)",
  /if \(step >= LAST_STEP\) \{ setPlaying\(false\)/.test(readFile("src/activities/trace/TraceActivity.jsx")),
  "Play Once 정지 로직을 찾지 못했습니다"
);

/* ---------- 조작 ---------- */

section("3. 조작 · 포커스");

check("포커스 링을 정의한다", /:focus-visible\s*\{[\s\S]{0,200}outline/.test(allCss), "focus-visible 규칙 없음");
check("포커스 링을 전부 제거하지 않는다", !/outline:\s*none\s*!important/.test(allCss), "outline:none !important 발견");
check("본문 바로가기 링크가 있다", readFile("src/App.jsx").includes("skip-link"), "skip-link 없음");
check("버튼 최소 높이가 44px 이상이다", /\.btn\s*\{[\s\S]{0,400}min-height:\s*44px/.test(allCss), "min-height 44px 없음");
check(
  "접기 요약도 충분한 터치 영역을 가진다",
  /\.disclosure-summary\s*\{[\s\S]{0,400}min-height:\s*44px/.test(allCss),
  "disclosure-summary min-height 없음"
);

const hoverOnly = [];
for (const rel of JSX) {
  const text = readFile(rel);
  /* 핵심 기능을 onMouseEnter 로만 여는 곳이 없어야 한다 */
  if (/onMouseEnter/.test(text) && !/onClick|onFocus/.test(text)) hoverOnly.push(rel);
}
check("핵심 기능이 Hover 에만 의존하지 않는다", hoverOnly.length === 0, hoverOnly.join(", "));

const liveRegions = JSX.filter((rel) => /aria-live/.test(readFile(rel)));
check("상태 변화를 aria-live 로 알린다", liveRegions.length >= 8, `${liveRegions.length}곳`);

/* ---------- 반응형 ---------- */

section("4. 반응형");

for (const bp of [1024, 768, 480]) {
  check(`${bp}px 분기가 있다`, allCss.includes(`max-width: ${bp}px`), "분기 없음");
}
check(
  "Desktop 다열 구조를 모바일에서 위아래로 다시 잇는다",
  /@media \(max-width: 768px\)[\s\S]{0,2000}grid-template-columns:\s*minmax\(0, 1fr\)/.test(allCss),
  "1열 재배치 규칙을 찾지 못했습니다"
);
check(
  "REST 표는 모바일에서 축소하지 않고 재구성한다",
  /\.rest-matrix\s*\{\s*display:\s*flex/.test(allCss),
  "모바일 재구성 규칙 없음"
);
check(
  "넓은 표는 뭉개지 않고 가로 스크롤한다",
  /\.sql-table-wrap\s*\{\s*overflow-x:\s*auto/.test(allCss),
  "가로 스크롤 규칙 없음"
);
check(
  "375px 대역까지 헤더가 대응된다",
  allCss.includes("max-width: 400px"),
  "400px 이하 분기 없음"
);
check(
  "새 부품도 모바일 재배치 규칙을 가진다",
  /\.role-hint\s*\{\s*grid-column:\s*1/.test(allCss) && /\.guided-task\s*\{\s*flex-basis:\s*100%/.test(allCss),
  "새 부품 반응형 규칙 없음"
);

/* ---------- 색만으로 구분하지 않기 ---------- */

section("5. 색 이외의 단서");

check(
  "요청/응답을 방향 글자로도 구분한다",
  /요청 방향|← 응답 방향/.test(readFile("src/activities/trace/TraceActivity.jsx")),
  "방향 라벨 없음"
);
check(
  "범위 밖 Node 를 글자로도 표시한다",
  readFile("src/components/architecture/ArchitectureSection.jsx").includes("이번 Chapter 범위 밖"),
  "범위 밖 라벨 없음"
);
check(
  "저장소 동기화 상태를 글자로 표시한다",
  /syncLabel/.test(readFile("src/activities/remote/RemoteSyncActivity.jsx")),
  "동기화 상태 라벨 없음"
);

report("a11y");
