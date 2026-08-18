# 11_PROJECT_UI_SPEC

## 1. Project

프로젝트명:
`GitHub · Docker · Web Architecture Interactive Course`

목적:
`비전공자를 위한 조작형 웹 아키텍처 교안`

주 사용자:
- 비전공자
- 웹 개발 입문자
- Git / Docker / Web Architecture를 처음 연결해서 이해하는 학습자

사용 환경:
`Desktop / Tablet / Mobile`

---

## 2. Primary Message

> 웹 프로젝트는 여러 프로그램의 집합이 아니라, 사용자의 요청과 데이터가 역할별 계층을 지나며 움직이는 하나의 시스템이다.

보조 메시지:

> GitHub는 이 시스템의 코드를 관리하고, Docker는 이 시스템을 같은 방식으로 실행하게 만든다.

시각적 우선순위:
`역할 → 연결 → 데이터 흐름 → 상태 변화 → 결과`

---

## 3. Core UX Principle

> **ONE CHAPTER = ONE PAGE**

- 한 번에 현재 Chapter 하나의 본문만 렌더링한다.
- 15개 Chapter 본문을 한 화면에 동시에 펼쳐놓지 않는다.
- Chapter 목록을 Persistent Sidebar로 노출하지 않는다.
- Chapter 목록은 Header의 `Chapter 선택 ▼` Dropdown/Menu를 통해 필요할 때만 연다.
- 사용자는 항상 현재 Chapter, 전체 진행 위치, 다음 행동을 알 수 있어야 한다.
- 한 Chapter는 위에서 아래로 하나의 Learning Story로 읽혀야 한다.
- Desktop에서도 Dashboard형 다중 패널 화면을 기본 구조로 사용하지 않는다.

금지되는 기본 Layout:

```text
Chapter Navigation | Architecture | Detail / Code
-----------------------------------------------
Activity            | Result
```

또는:

```text
map map
activity result
detail detail
```

형태의 상시 Dashboard Grid.

---

## 4. Course Story Structure

`전체 보기`
→ `Request / Response`
→ `프로젝트 구조`
→ `Git`
→ `GitHub`
→ `Docker`
→ `Dockerfile`
→ `Docker Compose`
→ `Frontend / React`
→ `Nginx`
→ `Flask`
→ `REST API`
→ `SQL / Database`
→ `전체 Request 추적`
→ `프로젝트 완성`

각 Chapter는 독립된 글 15개처럼 끊기지 않고, 이전 Chapter의 결과가 다음 Chapter의 학습 이유가 되도록 연결한다.

---

## 5. Chapter Page Story

```text
Course Header
↓
Chapter Hero
↓
핵심 질문
↓
Learning Goals
↓
전체 시스템에서 현재 위치
↓
핵심 개념 / 설명
↓
실제 코드
↓
Interactive Activity
↓
Result / Feedback
↓
대표 오류 / 오해
↓
Knowledge Check
↓
Chapter Summary
↓
Previous / Next Chapter
```

필요하지 않은 Section은 데이터에 따라 생략할 수 있다.

기본 학습 흐름:
`읽기 → 구조 이해 → 코드 확인 → 직접 조작 → 결과 확인 → 요약`

---

## 6. Header & Chapter Navigation

### Header

최소 표시:
- Course 이름
- `CH 01 / 15`
- 현재 Chapter 제목
- 전체 Progress
- `Chapter 선택 ▼`

Header는 필요하면 Sticky를 사용할 수 있지만 본문의 세로 공간을 과도하게 차지하지 않는다.

### Chapter Dropdown

Chapter 목록은 기본적으로 숨긴다.

필수 상태:
- closed
- open
- current
- completed
- available
- focus

필수 동작:
- 현재 Chapter 표시
- 완료 Chapter 표시
- Chapter 선택 시 해당 Chapter로 이동
- 선택 후 자동 닫기
- Outside Click으로 닫기
- `Escape`로 닫기
- Keyboard Navigation
- 내부 목록 Scroll
- Mobile 대응

금지:
- Persistent Sidebar
- 왼쪽 슬라이드 Chapter Drawer를 기본 Navigation으로 사용
- Hamburger Menu를 Chapter Navigation의 기본 UX로 사용

Mobile에서는 넓은 Overlay/Sheet 형태로 확장할 수 있으나 역할은 여전히 `Chapter Selector`다.

---

## 7. Visual Concept

> **Interactive Learning Page + Context Visualization + Process Simulation**

핵심은 기술 로고 전시가 아니다.

사용자가:
- 현재 학습 위치를 보고
- 시스템 구조를 이해하고
- Node / Edge를 선택하고
- 실제 Code를 확인하고
- Activity를 실행하고
- 상태 변화와 Result를 확인하는

학습 경험을 만든다.

일반 설명 영역은 문서처럼 자연스럽게 읽혀야 한다.

시각적으로 강한 요소는 다음에 집중한다.
1. Architecture Context Visualization
2. 해당 Chapter의 핵심 Interactive Activity
3. 결과 변화
4. 코드와 시스템 위치의 연결

---

## 8. Architecture Model

### Shared Architecture

```text
DEVELOPMENT
Local Git ↔ GitHub

RUNTIME
USER → Browser / Frontend → Nginx → Flask API → MySQL
```

Docker / Docker Compose는 Runtime Service를 실행하는 환경으로 표현한다.

Docker를 HTTP Request가 통과하는 중간 Node로 표현하지 않는다.

### Architecture는 Context Visualization이다

Architecture Map은 모든 화면에 고정된 Dashboard Panel이 아니다.

각 Chapter 안에서:

> "지금 배우는 기술이 전체 시스템 어디에 있는가?"

를 설명하는 **Context Visualization**으로 사용한다.

Chapter에 따라:
- focusNodes
- focusEdges
- selectedNode
- activeEdge
- errorNode
- errorEdge

를 이용해 관련 부분을 강조한다.

### Architecture와 Activity의 역할 구분

Architecture Visualization:
> 전체 시스템 구조가 어떻게 연결되는가?

Process / Activity Visualization:
> 실제 행동 또는 데이터 한 건이 이 구조를 어떻게 통과하는가?

두 시각화를 억지로 하나의 그림으로 합치지 않는다.

---

## 9. Chapter 01 Primary Activity

Chapter 01의 핵심 Activity는 단순 Architecture Map이 아니라 **Request / Response Process Simulation**이다.

`PROCESS_ANIMATION_SPEC.md`를 반드시 적용한다.

핵심 은유:

> 후판 공정에서 슬래브 한 장이 설비를 통과하듯, 웹 시스템에서는 Request Packet 한 장이 시스템을 통과한다.

기본 Scene:

```text
USER → COMPUTER / Browser ─────────→ SERVER
                                     ├ Nginx
                                     ├ Flask API
                                     └ MySQL

Updated Browser UI ←────────────── RESPONSE
```

Computer는 모니터 / Browser UI처럼 보여야 한다.

Server는 내부에:
- Nginx
- Flask API
- MySQL

이 분리되어 보이는 시스템 Scene이어야 한다.

단순 박스 나열만으로 끝내지 않는다.

---

## 10. Process State Transformation

```text
HTTP Request
GET /api/students/1

↓

SQL Query
SELECT id, name, score
FROM students
WHERE id = 1

↓

DB Result
1 | 김철수 | 93

↓

JSON Response
{
  "id": 1,
  "name": "김철수",
  "score": 93
}

↓

Frontend Render
김철수
93점
```

같은 점 하나가 왕복하는 Animation만으로 끝내지 않는다.

Packet의 위치, 의미, 라벨, 방향, 관련 Node, 관련 Edge, Browser UI State가 단계에 따라 동기화되어야 한다.

---

## 11. Process Playback

기본 Playback Mode:
> **Step Mode**

```text
[← 이전]   STEP 4 / 11   [다음 →]
```

보조 기능:
`▶ 전체 흐름 보기`

전체 재생은 한 번 실행한 후 멈춘다.

자동 재생 중 사용자가 이전/다음/Node 선택 등 직접 조작을 수행하면 Auto-play를 중지하고 사용자 입력을 우선한다.

---

## 12. Primary Interaction

- Chapter Dropdown
- Previous / Next Chapter
- Architecture Node 선택
- Architecture ↔ Code 연결
- Request / Response Step 실행
- Git file → staging → commit 이동
- GitHub push 흐름
- Docker code → image → container 흐름
- Compose Service ↔ Architecture Cross Highlight
- Nginx Route 분기
- Flask Route Matching
- SQL Row 선택
- Database Row → JSON 변환
- Code Tab
- 코드 복사
- `이 코드의 위치 보기`
- Knowledge Check
- Success / Error Feedback

Interaction처럼 보이는 요소는 실제로 동작해야 한다.

---

## 13. Linked Interaction

```text
Architecture
↕
Concept
↕
Code
↕
Activity
↕
Result
```

예:
Flask Node 선택
→ Flask 강조
→ 관련 Edge 강조
→ 역할 설명 표시
→ 관련 `backend/app.py` Code 표시 또는 연결
→ 관련 Activity 상태와 연결

단, 사용자가 읽는 흐름을 방해할 정도로 모든 Section을 동시에 강제 전환하지 않는다.

---

## 14. Key States

일반 UI State:
- idle
- hover
- focus
- selected
- active
- loading
- success
- warning
- error
- empty
- disabled
- completed

프로젝트 특수 State:
- currentChapter
- chapterProgress
- selectedNode
- selectedSnippet
- activityState
- requestStage
- copyState
- serviceStatus
- reducedMotion
- isPlaying

계산 가능한 값은 가능한 한 Derived State로 처리한다.

---

## 15. Content Width & Layout

### Desktop

Desktop에서도 하나의 세로형 Learning Story를 유지한다.

권장 폭:
- 일반 Text / Reading: 약 `760 ~ 840px`
- Code / Activity / Visualization: 약 `1000 ~ 1200px`

필요한 Section만 넓게 확장한다.

### Tablet

- Reading Width 유지
- 넓은 Visualization은 Re-layout 또는 제한적 Horizontal Pan
- Code 영역은 가로 Overflow 자체 처리
- Header 정보 밀도를 줄일 수 있음
- Chapter Dropdown은 화면 폭에 맞춰 확장 가능

### Mobile

기본 순서:
1. Course / Chapter Header
2. Chapter Hero
3. Learning Goals
4. Architecture Context
5. Concept
6. Code
7. Activity
8. Result
9. Error / Misconception
10. Knowledge Check
11. Summary
12. Previous / Next

Desktop Multi-column을 억지로 축소하지 않는다.

---

## 16. Process Responsive Layout

### Desktop

```text
USER → COMPUTER ─────────→ SERVER
                           ├ Nginx
                           ├ Flask
                           └ MySQL
```

### Tablet

필요하면 2단으로 재구성한다.

### Mobile

Desktop SVG를 축소해서 끼워 넣지 않는다.

```text
USER
 ↓
COMPUTER
 ↓
NETWORK
 ↓
SERVER
 ├ Nginx
 ├ Flask
 └ MySQL
 ↑
RESPONSE
 ↑
COMPUTER
```

최소 검토 Width:
- 375px
- 768px
- 1024px
- 1440px

---

## 17. Card Usage

모든 것을 Card로 만들지 않는다.

일반 설명은 Typography, Whitespace, Divider, Section Heading으로 구조화한다.

Card / Panel을 우선 사용할 수 있는 영역:
- Interactive Activity
- Code Block / Code Explorer
- Result
- Warning / Error
- Knowledge Check
- 독립적인 상태 Preview

금지:
- 모든 문단을 Rounded Card에 넣기
- Hero / Goals / Concept / Summary를 전부 같은 Card 스타일로 반복
- Card Grid가 페이지 Story보다 앞서는 구성

---

## 18. Code UX

모든 실행 가능한 Code Block은 최소 다음을 가진다.
- 파일명
- 언어
- 코드
- 한 줄 목적
- `이 코드의 위치 보기`
- `코드 복사`

Copy State:
`idle → copying → copied`

실패:
`copy_error`

Chapter 01 예:
`Frontend | Nginx | Flask API | MySQL`

---

## 19. Result & Feedback

기본 인과관계:
`USER ACTION → STATE CHANGE → UI CHANGE → FEEDBACK`

Result는 단순히 "성공" 텍스트만 표시하지 않는다.

가능하면:
- 무엇이 변경되었는가
- 데이터가 어떻게 변했는가
- 화면이 어떻게 바뀌었는가
- 왜 그 결과가 나왔는가

를 보여준다.

Chapter 01에서는:

```text
Initial Browser UI
→ Loading
→ 김철수 / 93점
```

변화가 실제로 보여야 한다.

---

## 20. Motion Notes

허용 목적:
- Request 이동
- Response 이동
- 상태 변경
- Route 분기
- Git Commit 이동
- Docker Build 단계
- DB Row → JSON 변환
- Success / Error Feedback
- 공간적 인과관계 설명

금지:
- 무한 Packet Animation
- 장식용 Particle
- 목적 없는 Glow
- Floating Card
- 이유 없는 Auto-play
- Scroll Hijacking
- 강제 Scroll Snap
- 지속적으로 시선을 빼앗는 LED / Pulse

---

## 21. Reduced Motion

`prefers-reduced-motion`을 반드시 지원한다.

Process Scene에서는 긴 이동 Animation 대신:
- 현재 Node Highlight
- 현재 Edge Highlight
- Packet 즉시 위치 변경
- State Label 변경
- 설명 Text 갱신
- Result Preview 변경

으로 동일한 정보를 전달한다.

---

## 22. Accessibility

필수:
- Keyboard Navigation
- Focus Visible
- Semantic HTML
- 적절한 ARIA
- 색상만으로 상태를 구분하지 않음
- 충분한 Contrast
- Button / Tap Target 확보
- 현재 Step 설명 `aria-live` 검토
- Auto-play 상태 표시
- Hover-only 핵심 기능 금지

SVG Node가 조작 가능하면 Click / Keyboard / Focus로 선택 가능해야 한다.

---

## 23. Design Constraints

- Fake UI 금지
- Fake Data는 반드시 Mock임을 표시
- 기술 로고보다 역할 / 흐름 우선
- 모든 것을 Card로 만들지 않음
- Persistent Chapter Sidebar 금지
- Dashboard 3-column 기본 Layout 금지
- Mobile 독립 설계
- Keyboard / Focus
- Reduced Motion
- 높은 대비
- 긴 코드 가독성
- Wide Visualization은 Pan / Zoom / Re-layout 검토
- 현재 Chapter / 선택 / Step / Progress 상태 명확히 표시
- 의미 없는 Glow / Gradient / Particle / 3D 남용 금지
- 클릭할 수 있어 보이는 비동작 요소 금지
- Desktop Layout의 단순 축소형 Mobile 금지

---

## 24. React UI Structure Principle

Course Identity는 **GUIDED INTERACTIVE EXPLORATION**이다. (CLAUDE.md)
시험·점수·합격 개념이 없으므로 KnowledgeCheck / Quiz 구간을 두지 않는다.
Story 순서는 `왜 → 직접 보기 → 이해 → 실제 연결`이다.

```text
CourseApp
├─ CourseHeader
│  ├─ CourseProgress        살펴본 Chapter n / 15 (완료 · 통과 아님)
│  └─ ChapterDropdown       언제나 자유 이동 · 잠금 없음
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

Chapter UI를 15개의 거의 동일한 JSX 파일로 복제하지 않는다.

권장:
`Chapter Data → ChapterPage Renderer → Reusable Components`

Activity는 유형에 따라 Renderer/Registry 방식으로 확장 가능하게 한다.

---

## 25. Process Component Principle

```text
ProcessAnimationSection
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

실제 파일 분리는 현재 코드 구조에 맞춰 조정할 수 있다.

중요한 것은 Scene Rendering / Process State / Controls / Description / Result 책임이 뒤섞이지 않는 것이다.

---

## 26. Primary Visualization by Chapter

- Chapter 01 → Request / Response Process Scene
- Chapter 02 → Request Builder / Response Inspector
- Chapter 03 → Folder Tree ↔ Architecture
- Chapter 04 → Working Directory → Staging → Commit
- Chapter 05 → Local Git ↔ GitHub Push
- Chapter 06 → Code + Runtime + Dependencies → Image → Container
- Chapter 07 → Dockerfile Build Sequence
- Chapter 08 → Compose Service Map
- Chapter 09 → React State / Event / Render
- Chapter 10 → Nginx Route Branch
- Chapter 11 → Flask Route → DB → JSON
- Chapter 12 → REST Method / Resource Interaction
- Chapter 13 → SQL Table / Row → JSON
- Chapter 14 → Full Request → Response Trace
- Chapter 15 → Project Completion Flow

Architecture는 각 Chapter의 Context를 유지하는 공통 기준점이다.

---

## 27. Acceptance Criteria

### Navigation
- [ ] 한 번에 현재 Chapter 하나만 본문 렌더링
- [ ] Header에서 현재 Chapter / 전체 15개 위치 확인 가능
- [ ] Chapter Dropdown 실제 동작
- [ ] Outside Click / Escape / Keyboard 지원
- [ ] Previous / Next Chapter 동작
- [ ] Persistent Sidebar 없음

### Learning Flow
- [ ] 핵심 질문이 첫 화면에서 명확함
- [ ] 전체 Architecture에서 현재 위치 확인 가능
- [ ] 실제 코드와 학습 대상이 연결됨
- [ ] Activity가 실제 State를 변경함
- [ ] Result가 Activity의 원인/결과를 보여줌
- [ ] Chapter Summary가 존재함

### Process Animation
- [ ] `PROCESS_ANIMATION_SPEC.md` 준수
- [ ] Computer → Server → DB → Server → Computer 흐름이 보임
- [ ] Nginx / Flask / MySQL 역할이 분리됨
- [ ] HTTP Request → SQL → DB Result → JSON 변화가 보임
- [ ] Response가 Computer로 돌아옴
- [ ] Browser UI가 실제로 변경됨
- [ ] Step Mode 실제 동작
- [ ] Play Once 종료 후 멈춤
- [ ] Node Interaction 실제 동작
- [ ] 자동 재생 중 사용자 입력 우선

### Design
- [ ] Dashboard 3-column 구조를 기본 Layout으로 사용하지 않음
- [ ] 모든 것을 Card로 만들지 않음
- [ ] Motion이 의미와 연결됨
- [ ] Fake UI 없음
- [ ] 현재 State가 명확함

### Responsive / Accessibility
- [ ] 375px
- [ ] 768px
- [ ] 1024px
- [ ] 1440px
- [ ] Mobile Process Scene 별도 Re-layout
- [ ] Keyboard
- [ ] Focus Visible
- [ ] Reduced Motion
- [ ] 색상만으로 의미 전달하지 않음
- [ ] 핵심 Activity가 Mobile에서도 사용 가능

### QA
- [ ] `25_COURSE_QA.md` Hard Gate 통과
- [ ] `08_DESIGN_QA.md` 80점 이상
- [ ] Process Animation이 있으면 `PROCESS_ANIMATION_SPEC.md` QA 통과

---

## 28. Final Product Principle

사용자가 각 Chapter를 학습한 뒤 다음 질문에 답할 수 있어야 한다.

> "지금 무엇을 배우고 있는가?"

> "이 기술은 전체 시스템 어디에 있는가?"

> "사용자가 행동하면 어떤 상태가 바뀌는가?"

> "데이터는 어디를 지나고 어떤 형태로 바뀌는가?"

> "결과가 왜 이렇게 나왔는가?"

최종 전체 흐름:

```text
Git은 변경 기록을 관리한다.
GitHub는 그 기록을 원격에서 공유한다.
Docker는 실행 환경을 통일한다.

웹 요청은:

USER
→ Browser / Frontend
→ Nginx
→ Flask API
→ MySQL

로 전달되고,

MySQL
→ Flask
→ JSON
→ Nginx
→ Browser / Frontend
→ USER

순으로 응답이 돌아온다.
```

이 과정은 글로만 읽는 것이 아니라 사용자가 직접 선택하고 단계별로 조작하며 확인할 수 있어야 한다.
