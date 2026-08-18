# CLAUDE.md

## Project Identity

이 프로젝트는 **비전공자를 위한 Git / GitHub / Docker / Web Architecture 인터랙티브 교안**이다.

Course 유형은 다음과 같이 확정한다.

> **GUIDED INTERACTIVE EXPLORATION**
>
> NOT: Assessment Course / Quiz Course / 숙련도 평가

목적은 시험·자격증·숙련도 평가가 아니라, 웹 개발 경험이 전혀 없는 사람이
Git / GitHub / Docker / React / Nginx / Flask / MySQL이 **대략 무엇이고 서로 어떻게 연결되는지**
직접 움직여 보며 감을 잡는 것이다.

최종 산출물은 단순 문서가 아니라 사용자가:

1. 왜 이 기술을 보는지 먼저 이해하고
2. 전체 웹 시스템 구조를 보고
3. 노드와 데이터 흐름을 직접 조작하고
4. Activity를 실행해 결과를 확인하고
5. 그 결과가 실제 코드의 어느 줄과 연결되는지 보고
6. Request → Response 흐름을 단계별로 이해하는

학습용 Web Application이어야 한다.

### Course Hard Rules

- Quiz / Score / Pass-Fail을 기본 학습 흐름에 넣지 않는다.
- Chapter 이동을 정답 여부로 잠그지 않는다. 이동은 언제나 자유다.
- Activity는 이해를 돕는 체험이며 평가 도구가 아니다.
- 잘못된 선택을 "오답"으로 채점하지 않는다. "이 선택을 하면 이렇게 됩니다"처럼 결과를 설명한다.

### Activity Rules

Activity의 기본 흐름은 다음 하나뿐이다.

```text
직접 눌러 보기 → 무엇이 바뀌는지 보기 → 왜 그런지 읽기 → 다른 선택도 눌러 비교하기
```

- 사용자가 **정답을 추론하게 만들지 않는다.** 맞히기 · 짝 맞추기 · 순서 맞히기를 두지 않는다.
- 누르면 결과가 **즉시** 보인다. 맞혀야 다음으로 넘어가는 구조를 만들지 않는다.
- 사용자가 틀릴 수 있는 Activity가 아니라, 여러 선택의 결과를 관찰하는 Activity여야 한다.
- **Progress of Process는 허용, Score / Completion Count는 금지.**
  - 허용: `STEP 4 / 11` (Process Animation의 현재 순서 위치)
  - 금지: `0 / 6` · `3 / 5` · `상황 2 / 4` · `모두 맞힘` · `연결 완료` · `완료 조건 포함 / 아님`
  - 단계를 세야 한다면 `1단계` · `2번째 줄`처럼 순서로만 적는다.
- Activity 시작 설명(`activity.guide`)에서 아직 소개하지 않은 기술 이름을 Primary 단어로 쓰지 않는다.
  결과를 본 뒤에 "이것을 …라고 부릅니다"로 이름을 붙인다.
  (`depends_on` · `backend` · `Route` · `Method` · `SQL`)
- "왜 필요한가"를 기술 설명보다 먼저 제공한다. (`whyItMatters` · `oneThing`)
- 한 Chapter에서 사용자가 기억해야 할 핵심은 1~3개로 제한한다. (`summary.remember`)
- 사용자에게 보이는 Copy에서 완료 / 통과 뉘앙스를 뺀다. "완료"가 아니라 "살펴봄"이다.
- 학습 목표를 "설명할 수 있다 / 구분할 수 있다" 같은 평가형 문장으로 쓰지 않는다.
  "이번 Chapter에서 볼 것"의 목록으로 쓴다.

### Chapter Story

```text
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

Quiz 구간은 없다. 모든 Chapter를 억지로 동일하게 만들 필요는 없지만
사용자는 `왜 → 직접 보기 → 이해 → 실제 연결` 순서를 느껴야 한다.

### First Impression Rules

Chapter에 들어온 **첫 5초** 동안 아직 배우지 않은 기술 이름을 먼저 마주치지 않게 한다.
첫 화면은 `ChapterHero + WhySection`이 그리는 텍스트가 전부다.

- Hero에 기술 Tag 목록도, 용어 사전 블록도 두지 않는다.
- Chapter 제목은 역할 우선이다 — `코드 변경 기록 남기기 — Git`.
  기술 이름만 단독으로 제목에 쓰지 않는다. Dropdown도 같은 제목을 쓴다.
- 핵심 질문도 상황 표현을 쓴다. `Browser` · `Server` · `Container` · `Local Git` 같은 말을
  아직 배우기 전에 질문에 넣지 않는다.
- WhySection은 문제 상황과 `oneThing`까지만 그린다. `objectives`는 데이터로만 둔다.
- Header에 진행률 Bar를 두지 않는다. `Chapter 04 / 15`와 제목이면 충분하다.
- "살펴봄"은 Activity 성취가 아니라 **그 Chapter를 열어 봤다**는 방문 기록이다.
- 아키텍처 지도의 기본 Edge는 쉬운 말이다 — `클릭 · 요청 · 전달 · 데이터 요청 · 결과 · 응답`.
  `proxy_pass backend:5000` · `SQL` · `HTTP 요청` 같은 구현 문자열은
  그것을 배우는 Chapter에서만 `architecture.edgeLabels`로 덮어쓴다.
- 지도 제목에서 `Runtime`을 필수 용어로 요구하지 않는다.
- 다음 제작·설계 용어는 사용자 화면에 노출하지 않는다 (코드 주석에서는 사용 가능):
  `Role Before Tool` · `Primary` · `Secondary` · `Progressive Disclosure` ·
  `Guided Exploration` · `Runtime Path` · `Mental Model` · `Acceptance` · `Scope`

검사는 `node test/first-screen.cjs`가 담당한다. 필드 존재 여부가 아니라
실제 첫 노출 Copy를 모아 영어 용어 밀도와 코드 노출까지 본다.

---

## Project Harness Location

이 프로젝트의 하네스 문서는 루트가 아니라 `docs/harness/` 아래에 역할별로 분리한다.

기존 단일 HTML 교안은 `docs/reference/` 아래에 Content / Code Migration Reference로 둔다.

```text
docs/
├─ harness/
│  ├─ design/
│  │  ├─ 00_DESIGN_ORCHESTRATOR.md
│  │  ├─ 01_WEB_DESIGNER_EXECUTION_CORE.md
│  │  ├─ 02_UIUX_CORE.md
│  │  ├─ 03_VISUAL_STORYTELLING.md
│  │  ├─ 04_RESPONSIVE_RULES.md
│  │  ├─ 05_MOTION_INTERACTION.md
│  │  ├─ 06_COMPONENT_SYSTEM.md
│  │  ├─ 07_DESIGN_ANTIPATTERNS.md
│  │  ├─ 08_DESIGN_QA.md
│  │  ├─ 09_WEB_DESIGNER_PERSONA_FULL.md
│  │  ├─ 10_DESIGN_TOKENS.md
│  │  └─ 11_PROJECT_UI_SPEC.md
│  │
│  ├─ course/
│  │  ├─ 12_COURSE_PROJECT_SPEC.md
│  │  ├─ 20_COURSE_ORCHESTRATOR.md
│  │  ├─ 21_COURSE_CONTENT_CORE.md
│  │  ├─ 22_CHAPTER_CURRICULUM.md
│  │  ├─ 23_INTERACTIVE_LEARNING_UX.md
│  │  ├─ 24_TECHNICAL_CONTENT_RULES.md
│  │  └─ 25_COURSE_QA.md
│  │
│  └─ process/
│     └─ PROCESS_ANIMATION_SPEC.md
│
└─ reference/
   └─ LEGACY_COURSE_CONTENT.html
```

`CLAUDE.md`만 프로젝트 루트에 둔다.

하네스와 Reference 문서를 참조할 때는 반드시 위 경로를 사용한다.

---

## Core UX Principle

이 프로젝트의 기본 화면 원칙은 다음과 같다.

> **ONE CHAPTER = ONE PAGE**

- 한 화면에는 현재 Chapter 하나만 표시한다.
- 15개 Chapter 본문을 한 화면에 동시에 펼쳐놓지 않는다.
- Chapter 목록을 상시 Sidebar로 노출하지 않는다.
- Chapter 목록은 Header의 Dropdown / Menu를 통해 필요할 때만 연다.
- 사용자는 항상 현재 Chapter, 전체 진행 위치, 다음 행동을 알 수 있어야 한다.
- 각 Chapter는 `읽기 → 구조 이해 → 코드 확인 → Activity → 결과 → 요약` 순으로 자연스럽게 진행한다.

---

## Master Routing

작업 요청을 먼저 다음 네 축으로 분류한다.

### A. 교안 내용 / 학습 구조 / 기술 설명 / Activity 설계

다음 순서로 참조한다.

1. `docs/harness/course/20_COURSE_ORCHESTRATOR.md`
2. `docs/harness/course/21_COURSE_CONTENT_CORE.md`
3. 필요 시 `docs/harness/course/22_CHAPTER_CURRICULUM.md`
4. 인터랙션이 포함되면 `docs/harness/course/23_INTERACTIVE_LEARNING_UX.md`
5. 기술·코드·명령어가 포함되면 `docs/harness/course/24_TECHNICAL_CONTENT_RULES.md`
6. 완료 전 `docs/harness/course/25_COURSE_QA.md`

### B. HTML / CSS / JavaScript / JSX / SVG / React / UI / Motion / Responsive 구현

교안의 내용 구조를 먼저 확정한 뒤 다음 디자인 하네스를 호출한다.

1. `docs/harness/design/00_DESIGN_ORCHESTRATOR.md`
2. `docs/harness/design/01_WEB_DESIGNER_EXECUTION_CORE.md`
3. 필요한 `docs/harness/design/02_UIUX_CORE.md` ~ `docs/harness/design/06_COMPONENT_SYSTEM.md`
4. `docs/harness/design/10_DESIGN_TOKENS.md`
5. `docs/harness/design/11_PROJECT_UI_SPEC.md`
6. 구현 완료 후 `docs/harness/design/07_DESIGN_ANTIPATTERNS.md`
7. 구현 완료 후 `docs/harness/design/08_DESIGN_QA.md`
8. 판단 충돌 시에만 `docs/harness/design/09_WEB_DESIGNER_PERSONA_FULL.md`

React 재구축 시 역할은 다음처럼 분리한다.

- `index.html` → 최소 React Shell
- `.css` → Design / Layout / Responsive / Motion
- `.js` → Course Data / Architecture Data / Activity Config / Utility / Pure Logic
- `.jsx` → React Component / Rendering / Interaction

Chapter 콘텐츠를 JSX에 15번 반복 하드코딩하지 않는다.

### C. Process Animation / Request → Response 공정 애니메이션

다음 작업이 포함되면 **반드시 `docs/harness/process/PROCESS_ANIMATION_SPEC.md`를 참조한다.**

- 컴퓨터 → 서버 → DB → 서버 → 컴퓨터 애니메이션
- Request Packet 이동
- Response Packet 이동
- Browser / Nginx / Flask / MySQL 처리 흐름
- SQL Query 이동
- DB Row → JSON Response 변화
- Step Mode
- Play Once
- 공정형 SVG 애니메이션
- Request / Response 단계별 Highlight
- Chapter 01 또는 Chapter 14의 전체 요청 흐름 시각화

이 경우 기본 참조 순서는 다음과 같다.

1. `docs/harness/course/23_INTERACTIVE_LEARNING_UX.md`
2. `docs/harness/process/PROCESS_ANIMATION_SPEC.md`
3. `docs/harness/design/03_VISUAL_STORYTELLING.md`
4. `docs/harness/design/05_MOTION_INTERACTION.md`
5. `docs/harness/design/04_RESPONSIVE_RULES.md`
6. 필요 시 `docs/harness/design/06_COMPONENT_SYSTEM.md`
7. 구현 후 `docs/harness/design/07_DESIGN_ANTIPATTERNS.md`
8. 구현 후 `docs/harness/design/08_DESIGN_QA.md`

`docs/harness/process/PROCESS_ANIMATION_SPEC.md`는 공정형 Request / Response 애니메이션의 **프로젝트 전용 구현 명세**다.

일반적인 Motion / Visualization 규칙보다 구체적인 항목에 대해서는 `docs/harness/process/PROCESS_ANIMATION_SPEC.md`를 우선 적용한다. 단, Course의 기술 정확성 규칙보다 우선하지 않는다.

### D. 기존 교안 콘텐츠 / 코드 마이그레이션

Chapter 구현, 기존 코드 예제 재사용, 파일별 예제 코드 작성, 기존 교안 콘텐츠 누락 확인이 포함되면 반드시 다음 파일을 참조한다.

`docs/reference/LEGACY_COURSE_CONTENT.html`

이 파일은 **Content / Code Migration Reference**다.

다음 목적으로 사용한다.

- 기존 Chapter 설명 확인
- 기존 예제 코드 확인
- 기존 파일별 코드 확인
- 기존 학습 흐름에서 유용한 설명 추출
- React 재구축 과정에서 누락된 콘텐츠 확인

다만 이 파일의 다음 요소는 현재 구현의 설계 기준으로 사용하지 않는다.

- HTML Layout
- CSS
- Dashboard 구조
- Sidebar
- Panel 배치
- Responsive 방식
- Motion 방식

기존 콘텐츠를 현재 React 구조에 옮길 때는 다음 순서로 처리한다.

`LEGACY_COURSE_CONTENT.html`
→ 콘텐츠 / 코드 추출
→ 현재 Chapter 학습 목적에 맞는지 검증
→ `24_TECHNICAL_CONTENT_RULES.md` 기준으로 기술 정확성 검증
→ 현재 Harness 기준으로 재구성
→ React Data / Component 구조에 통합

기존 HTML을 그대로 복사하여 React에 삽입하지 않는다.

---

## Process Animation Hard Rules

공정 애니메이션을 구현할 때는 다음을 반드시 지킨다.

### 정확한 Runtime 흐름

`USER → Browser / Frontend → Nginx → Flask API → MySQL`

응답:

`MySQL → Flask → JSON → Nginx → Browser / Frontend → USER`

### 별도 축

- Source Management: `Local Git ↔ GitHub`
- Runtime Environment: `Docker / Docker Compose`

### 금지

- Docker를 Request가 통과하는 중간 Layer처럼 표현하지 않는다.
- GitHub를 Runtime Request 경로에 포함하지 않는다.
- Browser / Frontend가 MySQL에 직접 연결되는 기본 구조를 만들지 않는다.
- Nginx와 Flask의 역할을 하나로 합치지 않는다.
- Request와 Response를 색상만으로 구분하지 않는다.
- 무한 Packet Animation을 기본값으로 사용하지 않는다.
- 실제 상태와 관계없는 장식 Animation을 만들지 않는다.

### 기본 Animation Mode

기본은 **Step Mode**다.

`← 이전 | STEP n / total | 다음 →`

형태로 사용자가 직접 흐름을 따라갈 수 있어야 한다.

`▶ 전체 흐름 보기`는 보조 기능이며 **한 번 재생 후 멈춰야 한다.**

### Process Metaphor

이 프로젝트의 핵심 시각적 은유는 다음과 같다.

> 후판 공정 애니메이션에서 슬래브 한 장이 설비를 통과하듯,  
> 이 웹 교안에서는 Request Packet 한 장이 웹 시스템을 통과한다.

Request Packet은 처리 단계에 따라 의미가 변할 수 있다.

`HTTP Request → SQL Query → DB Result → JSON Response`

최종적으로 Response가 Computer로 돌아오고 Frontend 화면이 실제로 변경되어야 한다.

---

## Legacy Course Content Reference

기존 단일 HTML 교안의 콘텐츠 원본은 다음 파일에 있다.

`docs/reference/LEGACY_COURSE_CONTENT.html`

이 파일은 현재 React Application의 UI / Layout 구현 원본이 아니다.

### 사용 목적

- 기존 Chapter 설명 참고
- 기존 예제 코드 참고
- 파일별 코드 예제 참고
- 기존 학습 콘텐츠 누락 여부 확인
- React 재구축 과정에서 콘텐츠 마이그레이션

### 금지

- 기존 HTML Layout 복제
- 기존 Dashboard 구조 복원
- 기존 CSS 복사
- 기존 Sidebar / Panel UI 복구
- 이 HTML을 Runtime Application으로 다시 사용

### 충돌 시

콘텐츠 의미와 기존 예제 코드:

`LEGACY_COURSE_CONTENT.html`을 참고할 수 있다.

기술 정확성 / 현재 코드 계약:

`docs/harness/course/24_TECHNICAL_CONTENT_RULES.md`를 우선한다.

UI / UX / Layout / Responsive / Motion:

현재 Design Harness와 React 구현을 우선한다.

### Chapter 구현 전 확인 규칙

새 Chapter를 구현하기 전에 Legacy HTML에 동일 주제의 기존 콘텐츠 또는 코드가 있는지 먼저 확인한다.

유효한 내용이 있으면 새로 임의 작성하기 전에 우선 재사용 가능성을 검토한다.

단, 현재 Curriculum / Technical Rules / Project Contract와 충돌하는 내용은 그대로 복사하지 않는다.

---

## Combined Task Rule

교안 내용 작성과 웹 구현이 동시에 요청되면 반드시:

`교안 구조 확정`
→ `필요 시 Legacy 콘텐츠 / 코드 확인`
→ `기술 정확성 검증`
→ `상태 / Activity 정의`
→ `필요 시 PROCESS_ANIMATION_SPEC 적용`
→ `디자인 설계`
→ `구현`
→ `Course QA`
→ `Design QA`

순서로 진행한다.

디자인이 콘텐츠를 결정하게 하지 않는다.

Animation이 기술 구조를 왜곡하게 하지 않는다.

Legacy HTML이 현재 기술 계약이나 UI 구조를 역으로 결정하게 하지 않는다.

---

## Priority

우선순위는 다음과 같다.

1. 사용자 명시 요구사항
2. `docs/harness/course/12_COURSE_PROJECT_SPEC.md`
3. `docs/harness/course/20_COURSE_ORCHESTRATOR.md`
4. `docs/harness/course/21_COURSE_CONTENT_CORE.md`
5. `docs/harness/course/22_CHAPTER_CURRICULUM.md`
6. `docs/harness/course/23_INTERACTIVE_LEARNING_UX.md`
7. `docs/harness/course/24_TECHNICAL_CONTENT_RULES.md`
8. `docs/reference/LEGACY_COURSE_CONTENT.html` — 기존 콘텐츠 / 코드 확인 시 참고
9. `docs/harness/process/PROCESS_ANIMATION_SPEC.md` — Process Animation 작업일 때 강제 적용
10. `docs/harness/design/11_PROJECT_UI_SPEC.md`
11. `docs/harness/design/00_DESIGN_ORCHESTRATOR.md`
12. 선택된 디자인 세부 규칙
13. `docs/harness/course/25_COURSE_QA.md`
14. `docs/harness/design/07_DESIGN_ANTIPATTERNS.md`
15. `docs/harness/design/08_DESIGN_QA.md`

특정 Process Animation 구현에서는 `docs/harness/process/PROCESS_ANIMATION_SPEC.md`의 구체적 애니메이션 명세를 일반 Motion / Visualization 세부 규칙보다 우선 적용한다.

Legacy HTML의 코드와 현재 Technical Rules가 충돌하면 현재 Technical Rules를 우선한다.

---

## Hard Rules

- 기술 이름을 먼저 암기시키지 않는다. 역할과 데이터 흐름을 먼저 이해시킨다.
- Git / GitHub / Docker를 Request → Response 경로의 계층처럼 표현하지 않는다.
- Docker는 실행 환경, Git / GitHub는 소스·버전 관리 축으로 분리한다.
- Browser → Nginx → Flask → MySQL의 데이터 흐름을 일관되게 유지한다.
- Production 구조와 Development 구조가 다르면 명확히 구분한다.
- 실행되지 않는 버튼, 가짜 Terminal, 가짜 Filter, 가짜 데이터 흐름을 만들지 않는다.
- 코드 예제는 서로 독립된 장난감 예제가 아니라 최종 프로젝트로 합쳐질 수 있어야 한다.
- 모든 Chapter는 전체 Architecture에서 현재 위치를 이해할 수 있어야 한다.
- 모든 실행 가능한 코드에는 복사 기능과 `이 코드의 위치 보기` 연결을 제공한다.
- 파괴적 명령은 기본 학습 흐름에서 실행시키지 않는다.
- `.env` 실제 비밀번호·Secret을 Git에 Commit하도록 안내하지 않는다.
- 한 화면에는 한 Chapter만 표시한다.
- Chapter 목록은 기본적으로 숨기고 Dropdown / Menu로 접근한다.
- 동일한 Chapter Page Layout을 15개의 JSX 파일로 복제하지 않는다.
- Chapter Data와 UI Renderer를 분리한다.
- Architecture / Chapter / Activity 데이터는 가능한 한 Single Source of Truth로 관리한다.
- Mobile은 Desktop UI의 단순 축소판으로 만들지 않는다.
- 핵심 기능을 Hover에만 의존하지 않는다.
- `prefers-reduced-motion`을 지원한다.
- 기존 `LEGACY_COURSE_CONTENT.html`의 유용한 콘텐츠와 예제 코드는 마이그레이션할 수 있지만 기존 UI / Layout은 복원하지 않는다.
- 새 Chapter를 구현하기 전에 Legacy HTML에 동일 주제의 기존 콘텐츠 또는 코드가 있는지 먼저 확인하고, 유효한 내용은 현재 기술 계약과 Harness에 맞게 재사용한다.
- Legacy HTML과 현재 기술 규칙이 충돌하면 현재 `24_TECHNICAL_CONTENT_RULES.md`를 우선한다.
- Legacy HTML에 콘텐츠가 없다는 이유만으로 학습 범위를 임의로 확대하지 않는다.
- 기존 React Application이 정상 동작하는 경우 Harness 준수를 이유로 불필요한 전면 Rewrite를 하지 않는다.
- Quiz · 점수 · 정답률 · 합격 판정을 다시 도입하지 않는다.
- Activity의 특정 성공 상태를 Chapter 이동의 필수 조건으로 사용하지 않는다.
- Activity에 맞히기 · 짝 맞추기 · 순서 맞히기 · 완료 점수를 두지 않는다.
- Dropdown의 미방문 Chapter에 `아직` 같은 Tag를 붙이지 않는다.
- 내부 State 변수명(`matches` · `solved` · `progress`)은 그대로 둘 수 있다.
  사용자 화면과 학습 Gate만 평가형이 아니면 된다.
- 모든 Chapter는 `whyItMatters`와 `oneThing`을 가진다.
- 모든 Chapter의 `summary.remember`는 1~3문장으로 제한한다.
- 전체 파일 코드를 첫 노출하지 않는다. `codeFocus`(1~5줄)를 먼저 보여 준다.

---

## React Architecture Principle

React 구현에서는 다음 구조를 우선한다.

`Course Data`
→ `ChapterPage Renderer`
→ `Reusable Components`
→ `Activity Engine`
→ `State`
→ `Feedback`

Chapter는 데이터 중심으로 구성하고, 공통 UI는 재사용한다.

권장 개념:

```text
CourseApp
├─ CourseHeader
│  ├─ CourseProgress        살펴본 Chapter n / 15 (완료 · 통과 아님)
│  └─ ChapterDropdown       언제나 자유 이동
│
└─ ChapterPage
   ├─ ChapterHero
   ├─ WhySection            whyItMatters · oneThing · 이번 Chapter에서 볼 것
   ├─ ActivitySection       Activity First
   ├─ ResultSection         방금 무슨 일이 일어났나요? (결과 있을 때만)
   ├─ ArchitectureSection
   ├─ ConceptSection        concept.advanced 는 접기
   ├─ CodeExplorer          codeFocus 먼저, 전체 코드는 접기
   ├─ ErrorSection          기본은 접기 (errorsPrimary 일 때만 펼침)
   ├─ ChapterSummary        summary.remember 1~3문장
   └─ ChapterNav
```

KnowledgeCheck / Quiz 컴포넌트는 두지 않는다.

Process Animation이 필요한 Chapter에서는 다음 구조를 우선 검토한다.

```text
ActivitySection
└─ ProcessAnimationSection
   ├─ ProcessScene
   │  ├─ UserActor
   │  ├─ ComputerNode
   │  ├─ ServerNode
   │  │  ├─ NginxNode
   │  │  ├─ FlaskNode
   │  │  └─ MySqlNode
   │  ├─ PacketLayer
   │  └─ FlowPath
   ├─ ProcessStepDescription
   ├─ ProcessStepController
   └─ ProcessResultPreview
```

---

## Shared Architecture Principle

전체 Runtime Mental Model은 Chapter마다 유지한다.

```text
USER
→ Browser / Frontend
→ Nginx
→ Flask API
→ MySQL
```

응답:

```text
MySQL
→ Flask API
→ Nginx
→ Browser / Frontend
→ USER
```

Chapter별 학습 범위가 다르더라도 전체 Architecture Node를 임의로 삭제하지 않는다.

현재 Chapter의 범위는 `focus`, 아직 다루지 않는 영역은 `muted / future`로 표현한다.

예:

```text
Chapter 02

USER → Browser → Nginx → Flask → MySQL
       focus     focus    focus    muted
```

범위 밖 Node는 다음을 만족해야 한다.

- 전체 시스템에는 존재함을 보여준다.
- 현재 Chapter의 학습 범위 밖임을 텍스트로 설명한다.
- 색상만으로 범위를 구분하지 않는다.
- 현재 Chapter 범위를 넘어가는 불필요한 Code Link를 강제하지 않는다.

별도 축:

```text
Source Management
Local Git ↔ GitHub

Runtime Environment
Docker / Docker Compose
```

GitHub와 Docker / Docker Compose를 Runtime Request Hop으로 표현하지 않는다.

---

## Reference Chapter Principle

완료되어 Freeze된 Chapter는 이후 Chapter의 공통 UI / UX Reference로 사용한다.

Reference Chapter의 다음 요소는 재사용할 수 있다.

- Header / ChapterDropdown
- ChapterPage 기본 Story 구조
- Reading Width / Visualization Width
- Typography hierarchy
- Card 사용 원칙
- Code UX
- Result / Error / Summary 구조
- Responsive 원칙
- Accessibility 원칙
- Reduced Motion
- QA 기준

다만 각 Chapter의 Primary Visualization과 Activity는 해당 Chapter의 학습 목적에 맞게 별도로 설계한다.

금지:

- Chapter 01 Process Scene을 다른 Chapter에 그대로 복제
- Chapter 02 Request Builder를 다른 Chapter에 그대로 복제
- 기존 Chapter 화면을 복사하고 텍스트만 바꾸는 방식
- 공통 구조와 Chapter 전용 Interaction을 구분하지 않는 구현

---

## QA Routing

### Course QA

교안 내용, 학습 흐름, 기술 정확성:

`docs/harness/course/25_COURSE_QA.md`

### Design QA

UI / Responsive / Accessibility / Interaction:

`docs/harness/design/08_DESIGN_QA.md`

### Process Animation QA

Process Animation이 포함되면 추가로:

`docs/harness/process/PROCESS_ANIMATION_SPEC.md`의 QA Checklist

를 반드시 통과해야 한다.

특히 다음을 확인한다.

- Request 방향이 정확한가?
- Response 방향이 정확한가?
- Nginx / Flask / MySQL 역할이 분리되는가?
- Packet의 의미가 단계에 따라 정확히 변하는가?
- Step Mode가 실제로 동작하는가?
- Play Once가 끝난 뒤 멈추는가?
- Browser UI가 최종 Response에 따라 실제로 변경되는가?
- Reduced Motion에서도 같은 의미를 이해할 수 있는가?
- Mobile에서도 Process 흐름을 이해할 수 있는가?

### Legacy Migration QA

Legacy 콘텐츠 또는 코드를 사용한 Chapter는 추가로 확인한다.

- Legacy HTML을 실제로 확인했는가?
- 기존 유용한 콘텐츠가 누락되지 않았는가?
- 오래된 코드 계약을 그대로 복사하지 않았는가?
- 현재 Technical Rules와 일치하는가?
- 기존 Dashboard / Sidebar / Layout이 복원되지 않았는가?
- 현재 React Data / Component 구조에 맞게 마이그레이션되었는가?

---

## Final Product Principle

사용자가 마지막에 다음을 설명할 수 있어야 한다.

> "Git은 변경 기록을 관리하고, GitHub는 그 기록을 원격에서 공유한다.  
> Docker는 실행 환경을 통일한다.  
> 사용자의 웹 요청은 Browser에서 만들어져 Nginx를 거쳐 Flask API로 전달되고,  
> Flask가 필요한 데이터를 MySQL에서 조회한 뒤 JSON으로 반환한다.  
> 그 응답이 다시 Computer로 돌아오면 Frontend가 상태를 변경하고 화면을 다시 그린다."

그리고 사용자는 이 과정을 **글로만 읽는 것이 아니라 공정 애니메이션을 직접 단계별로 조작하며 볼 수 있어야 한다.**
