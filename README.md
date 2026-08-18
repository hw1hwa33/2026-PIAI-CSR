# 학생 성적 조회 웹서비스 만들기 — 인터랙티브 교안 (React)

Git · GitHub · Docker · 웹 구조를 **하나의 프로젝트**로 이해하도록 만든 학습용 React 애플리케이션입니다.
15개 Chapter가 **하나의 Chapter Page 렌더러**를 공유합니다.

## Course 성격

> **GUIDED INTERACTIVE EXPLORATION** — NOT Assessment / Quiz Course

시험·자격증·숙련도 평가용 교안이 아닙니다. 웹 개발 경험이 전혀 없는 사람이
Git / GitHub / Docker / React / Nginx / Flask / MySQL이 **대략 무엇이고 서로 어떻게 연결되는지**
직접 움직여 보며 감을 잡는 것이 목적입니다.

- Quiz · 점수 · 정답률 · 합격 판정이 **없습니다.**
- Chapter 이동은 **언제나 자유**입니다. 어떤 조건으로도 잠기지 않습니다.
- 잘못된 선택을 "오답"으로 채점하지 않고 `이 선택을 하면 이렇게 됩니다`처럼 결과를 설명합니다.
- 성취율 Bar가 없습니다. Chapter 목록에만 **"살펴봄"**이 조용히 표시되며,
  이는 Activity를 끝냈다는 뜻이 아니라 **그 Chapter를 보고 떠났다**는 뜻입니다.
  처음 접속하면 Chapter 01 화면에서도 **0 / 15**로 시작하고,
  다음 Chapter로 넘어갈 때 비로소 이전 Chapter가 기록됩니다.
  아직 열어 보지 않은 Chapter에는 아무 Tag도 붙이지 않습니다.
  판정 규칙은 `src/data/progress.js`에 있고 `node test/progress.cjs`가 검사합니다.
- 한 Chapter에서 기억할 것은 **1~3개**로 제한합니다.

### Activity 규칙

```
직접 눌러 보기 → 무엇이 바뀌는지 보기 → 왜 그런지 읽기 → 다른 선택도 눌러 비교하기
```

- 맞히기 · 짝 맞추기 · 순서 맞히기가 **없습니다.** 누르면 결과가 즉시 보입니다.
- 사용자가 틀릴 수 있는 Activity가 아니라, 여러 선택의 결과를 관찰하는 Activity입니다.
- **Progress of Process는 허용, Score는 금지**
  - 허용: `STEP 4 / 11` — Process Animation의 현재 순서 위치
  - 금지: `0 / 6` · `상황 2 / 4` · `모두 맞힘` · `완료 조건 포함 / 아님`
  - 단계를 세야 하면 `1단계` · `2번째 줄`처럼 순서로만 적습니다.
- Activity 시작 설명에서 아직 소개하지 않은 기술 이름을 먼저 쓰지 않습니다.
  결과를 본 뒤에 `이것을 depends_on 이라고 부릅니다`처럼 이름을 붙입니다.

## 실행

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ 생성
npm run preview  # 빌드 결과 확인
```

## 화면 원칙

- **ONE CHAPTER = ONE PAGE** — 한 화면에는 현재 Chapter 하나만 존재합니다.
- Chapter 목록은 기본적으로 숨겨져 있고 Header의 `Chapter 선택` Dropdown으로만 엽니다.
- `?chapter=4` 형태로 URL과 동기화되어 새로고침해도 현재 Chapter가 복구됩니다.
  브라우저 뒤로/앞으로 가기도 Chapter 이동으로 동작합니다.
- 살펴본 Chapter는 `localStorage`에 저장되어 새로고침해도 남습니다.

### Chapter Story

```
Hero                 번호 · 제목 · 핵심 질문 · 짧은 소개 · CTA
왜 이걸 보나요?        문제 상황 1~2문장 → ★ 이번에는 이것만 보면 됩니다
직접 해보기            Activity (Activity First)
방금 무슨 일이…        Activity 결과가 있을 때만
지금 어디를 보고 있나    전체 시스템에서의 위치
조금 더 알아보기        개념 · 역할
실제 프로젝트에서는      코드 (핵심 줄 먼저, 전체는 접기)
문제가 생기면           오류 (기본은 접기)
이것만 기억하세요        1~3문장
이전 / 다음
```

### 첫 화면 규칙

Chapter에 들어온 첫 5초 동안 아직 배우지 않은 기술 이름을 먼저 마주치지 않게 합니다.

- Hero에 **기술 Tag 목록도, 용어 사전 블록도 두지 않습니다.**
- Chapter 제목은 역할 우선입니다 — `코드 변경 기록 남기기 — Git`.
  기술 이름만 단독으로 제목에 쓰지 않습니다.
- 핵심 질문도 상황 표현을 씁니다 — `내 컴퓨터에 남긴 기록을 다른 컴퓨터와 어떻게 나눌까?`
- Header에 진행률 Bar를 두지 않습니다. `Chapter 04 / 15`와 제목이면 충분합니다.
- 아키텍처 지도의 기본 Edge는 쉬운 말입니다 — `클릭 · 요청 · 전달 · 데이터 요청`.
  `proxy_pass backend:5000` 같은 구현 문자열은 그것을 배우는 Chapter에서만
  `architecture.edgeLabels`로 덮어씁니다.
- 제작·설계 용어(Role Before Tool · Progressive Disclosure · Mental Model 등)는
  코드 주석에서만 쓰고 화면에 노출하지 않습니다.

`node test/first-screen.cjs`가 실제 첫 노출 Copy만 모아 이 규칙을 검사합니다.

## 초보자 명료성 원칙

이 교안은 **왜 → 직접 보기 → 이해 → 실제 연결** 순서와
**역할 → 쉬운 한국어 → 기술 이름 → 코드** 순서를 강제합니다.

- 기술 설명보다 `whyItMatters`(왜 이걸 보나요)와 `oneThing`(딱 하나)이 먼저 나옵니다.
- 화면의 Primary 라벨은 한글 역할입니다. 기술 이름은 그 아래 Secondary로 붙습니다.
  (`서비스 입구 / Nginx`, `요청 처리 / Flask API`, `데이터 저장 / MySQL`)
- Hero에 용어 사전 블록을 두지 않습니다. 용어는 실제로 필요해지는 자리에서 설명하고,
  뜻풀이의 Single Source of Truth는 `src/data/glossary.js`입니다.
- 전체 파일 코드를 첫 노출하지 않습니다. `chapter.codeFocus`의 1~5줄 + 쉬운 설명을 먼저 보여 주고,
  전체 코드는 `실제 코드 전체 보기 ▾`로 접어 둡니다.
- 내부 동작 · 예외 · 심화는 `concept.advanced`로 내려 `<details>` 안에서만 엽니다.
- 오류 구간은 기본적으로 접혀 있습니다. 오류 자체가 핵심인 Chapter만 `errorsPrimary`로 펼칩니다.
- 실습을 하기 전에는 빈 결과 섹션을 그리지 않습니다.

## 디렉터리

```
src/
├─ data/            Chapter · Architecture · 학습용 데이터 (UI 없음)
│  ├─ course.js         15개 Chapter 조립 · 제목
│  ├─ progress.js       살펴본 Chapter 판정 · localStorage 읽기/쓰기 (순수 로직)
│  ├─ glossary.js       초보자 용어 사전 (역할 · 뜻풀이)
│  ├─ architecture.js   Runtime / 관리 축 / 실행 환경 Node (Single Source of Truth)
│  └─ chapter01.js ~ chapter15.js
├─ components/      화면 컴포넌트
│  ├─ course/           Hero · Why · Concept · Error · Summary · Nav · Header
│  ├─ architecture/     현재 위치 지도
│  ├─ code/             CodeExplorer (핵심 줄 → 전체 코드)
│  ├─ result/           ResultSection (방금 무슨 일이 일어났나요?)
│  └─ common/           Toast · Disclosure · TermHint
├─ activities/      Activity Engine (ActivityRenderer + Chapter별 Activity)
├─ hooks/           useClipboard · useReducedMotion · useMediaQuery · useOutsideClick
└─ styles/          tokens · base · layout · components · responsive · motion
docs/
├─ harness/         course · design · process 하네스
└─ reference/
   └─ LEGACY_COURSE_CONTENT.html   재구축 이전 단일 HTML 교안 (콘텐츠/코드 참고용)
test/
├─ lib.cjs          공용 유틸 (외부 의존성 없음)
├─ consistency.cjs  교안 기술 일관성
├─ progress.cjs     살펴본 Chapter 판정 · localStorage 복원/방어
├─ first-screen.cjs 첫 5초에 실제로 보이는 Copy 검사
├─ beginner.cjs     Course 성격 · 초보자 명료성
├─ a11y.cjs         접근성 · 반응형 · 색 대비
└─ smoke.entry.jsx  15개 Chapter 실제 렌더 (react-dom/server)
```

## Chapter 추가·수정 방법

1. `src/data/chapterNN.js` 파일 하나만 만들거나 고칩니다.
2. `src/data/course.js`의 목록에 import 후 추가합니다.
3. 컴포넌트는 수정하지 않습니다. `ChapterPage`가 데이터를 읽어 렌더링합니다.

Chapter 데이터에서 쓰는 초보자 관련 필드:

| 필드 | 역할 |
| --- | --- |
| `whyItMatters` | 왜 이걸 보는지 (문제 상황 → 이 기술이 하는 일). 1~2문단 |
| `oneThing` | ★ 이번에는 이것만 보면 됩니다 — 한 문장 |
| `objectives` | 데이터로만 유지합니다. **기본 화면에 렌더하지 않습니다** (첫 노출 정보량 제한) |
| `architecture.edgeLabels` | 그 Chapter에서만 보여 줄 Edge 구현 문자열 override |
| `codeIntro` | 코드 섹션의 Chapter별 안내 문구 |
| `codeFocus` | 방금 본 동작과 연결된 1~5줄 + 쉬운 설명 (`lines` · `say` · `path` · `node`) |
| `concept.checkpoint` | "여기까지 보면 이번 Chapter는 충분합니다" 안내 |
| `concept.advanced` | 심화 내용 (`label` · `note` · `body[]`) — 접힌 채로 시작 |
| `errorsPrimary` | 오류가 핵심인 Chapter만 `true` (현재 Chapter 02) |
| `summary.remember` | 이것만 기억하세요 — 1~3문장 |

`quiz` 필드는 없습니다. 다시 추가하지 않습니다.

Activity 유형을 늘리려면 `src/activities/`에 컴포넌트를 만들고
`ActivityRenderer.jsx`의 `REGISTRY`에 등록하면 됩니다.

## 검증

추가 설치 없이 이미 있는 의존성(Node · Vite · React)만으로 실행됩니다.

```bash
npm test                    # 아래 여섯 가지를 모두 실행

node test/consistency.cjs   # 교안 기술 일관성 (Route · 서비스명 · SQL 바인딩 · Secret · Tour)
node test/progress.cjs      # 살펴본 Chapter 판정 (0부터 시작 · 떠날 때 기록 · 새로고침 · 잘못된 값)
node test/first-screen.cjs  # 첫 5초 Copy (제목 · 질문 · 문제 상황 · CTA · 영어 용어 밀도 · 코드 노출)
node test/beginner.cjs      # Course 성격 (Quiz 없음 · 이동 자유 · why/oneThing/remember · 코드 UX)
node test/a11y.cjs          # CSS 구조 · 접근성 · 반응형 · 색 대비(WCAG AA)
npm run test:render       # 15개 Chapter 를 실제로 렌더해 런타임 오류 확인 (.smoke/ 에 임시 빌드)
```

`npm test`가 통과해도 다음은 실제 브라우저에서 사람이 확인해야 합니다.

- 375 / 768 / 1024 / 1440 실화면 레이아웃
- 키보드만으로 Dropdown · Activity · 접기 블록 조작
- 스크린리더 낭독 순서
- 애니메이션 체감 속도

## 교안 기준

요청 경로는 `USER → Browser/Frontend → Nginx → Flask API → MySQL`,
응답은 반대 방향입니다.
코드와 기록 관리 축은 `Local Git ↔ GitHub`, 실행 환경 축은 `Docker / Docker Compose`입니다.
GitHub와 Docker는 HTTP 요청이 통과하는 계층으로 표현하지 않습니다.

`depends_on`은 **시작 요청 순서**만 정합니다. 먼저 시작한다고 해서
사용할 준비까지 끝났다는 뜻이 아니라는 점을 화면에서도 그대로 설명합니다.

모든 SQL 예제는 파라미터 바인딩(`%s` + 인자 전달)을 사용합니다.
값을 문자열로 이어붙이는 예제는 기본 흐름에 두지 않습니다.
