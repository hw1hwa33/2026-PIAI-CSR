# 23_INTERACTIVE_LEARNING_UX

## 목적

교안의 인터랙션은 장식이 아니라
"전체 시스템에서 무엇이 어떻게 연결되어 있는지"를 학습시키기 위해 사용한다.

---

## 1. Persistent Architecture Map

가능한 경우 모든 Chapter에서 동일한 Architecture Map을 유지한다.

```text
DEVELOPMENT
Local Git ↔ GitHub

RUNTIME
USER → Browser/Frontend → Nginx → Flask → MySQL
```

Docker Compose는 Runtime 서비스를 감싸는 실행 환경으로 표현한다.

현재 Chapter의 관련 Node/Edge만 강조한다.

---

## 2. Core Linked Model

하나의 학습 대상을 여러 UI에서 동일하게 연결한다.

`Architecture ↔ Concept ↔ Code ↔ Activity ↔ Result`

예:
Flask Node 선택 시:
- Flask 강조
- 관련 Edge 강조
- Flask 설명 표시
- backend/app.py 표시
- 관련 Activity 표시

---

## 3. Global State

필요 상태 예:

```js
{
  currentChapter,
  selectedNode,
  selectedEdge,
  selectedSnippet,
  detailTab,
  activityState,
  requestStage,
  copyState,
  animationEnabled,
  reducedMotion,
  mobilePanel
}
```

Derived Value를 불필요하게 State로 만들지 않는다.

---

## 4. Node State

- idle
- hover
- focus
- selected
- active
- success
- error
- disabled

Interaction처럼 보이는 Node는 실제로 동작해야 한다.

---

## 5. Request Simulator State Machine

```text
IDLE
→ REQUEST_CREATED
→ NGINX_RECEIVED
→ ROUTE_MATCHED
→ BACKEND_PROCESSING
→ DB_QUERYING
→ DB_RESULT
→ JSON_BUILDING
→ RESPONSE_RETURNING
→ UI_RENDERING
→ SUCCESS
```

오류가 있으면 해당 단계에서 `ERROR`.

---

## 6. Two Playback Modes

### 학습 모드
기본.

`← 이전 | STEP n / total | 다음 →`

사용자가 인과관계를 직접 따라간다.

### 전체 재생
보조.

`▶ 전체 흐름 재생`

Auto-play는 핵심 학습 기능이 아니다.

---

## 7. Code UX

모든 실행 가능 코드 블록:

- 파일명
- 언어
- 코드
- `이 코드의 위치 보기`
- `코드 복사`

Copy State:

`idle → copying → copied`

실패:
`copy_error`

복사 성공은 짧은 Feedback으로 표시.

---

## 8. Activity State

`READY → RUNNING → SUCCESS`

실패:
`RUNNING → ERROR`

Success:
- 무엇이 성공했는가
- 왜 성공했는가

Error:
- 어디에서 끊겼는가
- Architecture에서 해당 Node/Edge 강조
- 사용자가 다음에 확인할 것

---

## 9. Chapter Progress

Chapter:
- NOT_STARTED
- IN_PROGRESS
- COMPLETED

사용자는 항상:
- 현재 Chapter
- 전체 15개 중 위치
- 현재 Activity 상태
- 다음 행동

을 알 수 있어야 한다.

---

## 10. Mobile

Mobile은 Desktop 축소판이 아니다.

권장:
1. Chapter Header
2. Architecture Map
3. Concept
4. Code
5. Activity
6. Result

Wide Architecture는 필요 시 horizontal pan 또는 re-layout.

Hover에 핵심 정보를 숨기지 않는다.

---

## 11. Motion

사용 가능한 목적:
- Request 이동
- Response 이동
- 상태 변화
- Route 분기
- DB Row 선택
- Git commit 이동
- Docker build 단계
- 사용자 Feedback

금지:
- 장식용 무한 Packet
- Floating Card
- 의미 없는 Glow
- 이유 없는 Auto-play

Reduced Motion에서는 위치 이동 대신 단계별 강조 전환을 사용한다.
