# PROCESS_ANIMATION_SPEC.md

## 1. 문서 목적

이 문서는 인터랙티브 교안의 핵심 시각화인  
**“컴퓨터 → 서버 → DB → 서버 → 컴퓨터” 요청/응답 공정 애니메이션**을
Claude가 일관되고 정확하게 구현하도록 하기 위한 구현 명세다.

이 애니메이션의 목표는 단순한 장식이 아니라,
비전공자가 다음 흐름을 **눈으로 이해**하도록 만드는 것이다.

- 사용자가 버튼을 누른다.
- 브라우저가 요청을 만든다.
- 요청이 서버로 이동한다.
- 서버 내부에서 Nginx → Flask → MySQL 순서로 처리된다.
- DB 결과가 다시 Flask를 거쳐 JSON 응답이 된다.
- 응답이 컴퓨터로 돌아온다.
- Frontend가 화면을 업데이트한다.

---

## 2. 핵심 원칙

### 2.1 시각적 비유

이 애니메이션은 **“웹 요청이 시스템 공정을 통과하는 장면”**이다.

후판 공정 애니메이션에서 슬래브 한 장이 설비들을 통과하듯,
여기서는 **Request Packet 하나가 시스템을 통과**한다.

### 2.2 학습 중심

애니메이션은 멋있어 보이기 위한 장식이 아니라 다음 인과관계를 학습시키기 위해 존재한다.

`사용자 행동 → 요청 생성 → 이동 → 처리 → 데이터 조회 → 응답 생성 → 화면 변화`

### 2.3 한 화면 한 Chapter

이 애니메이션은 Chapter 페이지 안에 포함되는 핵심 Activity다.

한 화면에는 현재 Chapter 하나만 표시한다.

### 2.4 무한 반복 금지

기본적으로 애니메이션은 자동 무한 반복하지 않는다.

- 기본 모드: Step Mode
- 보조 모드: Play Once

사용자가 직접 단계 이동 또는 전체 재생을 요청해야 한다.

### 2.5 Reduced Motion 필수

`prefers-reduced-motion` 사용자는 위치 이동 애니메이션 없이도 동일한 의미를 이해할 수 있어야 한다.

---

## 3. 애니메이션이 설명해야 하는 시스템 구조

Runtime 구조는 반드시 아래와 같다.

`USER → Browser / Frontend → Nginx → Flask API → MySQL`

응답은 다음과 같이 되돌아온다.

`MySQL → Flask → JSON → Nginx → Browser / Frontend → USER`

별도 축:

- Source Management: `Local Git ↔ GitHub`
- Runtime Environment: `Docker / Docker Compose`

### 금지

다음과 같은 잘못된 시각화는 금지한다.

- Docker를 Request가 지나가는 중간 계층처럼 표현
- GitHub를 Runtime 요청 흐름에 넣기
- Frontend가 DB에 직접 연결되는 것으로 표현
- Nginx와 Flask를 하나의 박스로 합쳐 역할 구분을 없애기

---

## 4. 씬(Scene) 구성

### 4.1 전체 장면 구조

애니메이션 장면은 크게 네 구역으로 구성한다.

1. 사용자 영역
2. 컴퓨터 영역
3. 서버 영역
4. 결과/화면 반영 영역

기본 배치:

```text
[USER] → [COMPUTER / Browser] ─────────→ [SERVER]
                                          ├ Nginx
                                          ├ Flask API
                                          └ MySQL
[Updated UI] ←────────────────────────────
```

### 4.2 주요 오브젝트

#### A. User
- 단순 인물 실루엣 또는 사용자 아이콘
- 클릭 행위의 출발점
- “학생 조회” 버튼을 누르는 주체

#### B. Computer
- 데스크톱 모니터 형태의 SVG
- 내부에 Browser / Frontend UI가 보인다.
- Initial / Loading / Success 상태가 바뀐다.

#### C. Server
- 서버 Rack 또는 큰 시스템 박스 형태
- 내부에 다음 세 요소가 분리되어 보인다.
  - Nginx
  - Flask API
  - MySQL

#### D. Request Packet
- 이동하는 주요 오브젝트
- 처음에는 Request 형태
- 서버 내부 처리 과정에서 SQL 또는 JSON 형태로 변할 수 있다.

#### E. Response Packet
- Request Packet과 동일 계열 오브젝트를 재사용할 수 있으나
  방향/색/레이블로 응답임을 명확히 구분한다.

---

## 5. 단계 모델 (Step Model)

이 애니메이션은 아래 단계들을 기준으로 동작한다.

```text
0. IDLE
1. USER_CLICK
2. REQUEST_CREATED
3. REQUEST_TRAVEL_TO_SERVER
4. NGINX_RECEIVED
5. FLASK_PROCESSING
6. SQL_QUERY_TO_DB
7. DB_RESULT_READY
8. JSON_RESPONSE_BUILT
9. RESPONSE_TRAVEL_TO_CLIENT
10. UI_RENDERED
11. SUCCESS
```

### 0. IDLE
- 아무것도 실행되지 않은 상태
- 컴퓨터 화면에는 “학생 조회” UI 표시
- Packet 없음
- 서버는 대기 상태

### 1. USER_CLICK
- 사용자가 조회 버튼 클릭
- 버튼 pressed 상태 또는 클릭 파동 표시
- Browser가 Request 생성 준비

### 2. REQUEST_CREATED
- 컴퓨터 화면 또는 Browser 영역에서 Request Packet 생성
- 레이블:
  - `GET`
  - `/api/students/1`

### 3. REQUEST_TRAVEL_TO_SERVER
- Packet이 컴퓨터에서 서버 방향으로 이동
- 방향은 좌→우 또는 상→하 중 하나로 일관되게 유지
- 이동 경로는 명확한 선 또는 Path로 표시

### 4. NGINX_RECEIVED
- Packet이 서버의 Nginx Node에 도착
- Nginx 강조
- 설명:
  - “Nginx가 요청을 받았습니다.”
  - “/api/ 경로이므로 Flask API로 전달합니다.”

### 5. FLASK_PROCESSING
- Packet이 Flask API로 이동
- Flask 활성화
- 설명:
  - “Flask가 Route를 확인합니다.”
  - “학생 ID를 사용해 필요한 데이터를 조회합니다.”

### 6. SQL_QUERY_TO_DB
- Packet이 SQL Query 형태로 변환되거나 SQL 라벨 부여
- Flask에서 MySQL로 이동
- 예:
  - `SELECT id, name, score FROM students WHERE id = 1`

### 7. DB_RESULT_READY
- MySQL 활성화
- DB Row 또는 테이블 결과 일부 표시
- 설명:
  - “MySQL이 학생 데이터를 찾았습니다.”

### 8. JSON_RESPONSE_BUILT
- Packet이 Flask 쪽으로 다시 이동
- JSON Response 형태로 Morph
- 예:

```json
{
  "id": 1,
  "name": "김철수",
  "score": 93
}
```

### 9. RESPONSE_TRAVEL_TO_CLIENT
- Response Packet이 서버에서 컴퓨터로 이동
- Request와 반대 방향
- 응답임을 명확히 표시

### 10. UI_RENDERED
- 컴퓨터 화면이 Loading 상태에서 결과 상태로 변경
- 예:
  - 김철수
  - 93점

### 11. SUCCESS
- 전체 흐름 완료
- 완료 배지 또는 체크 아이콘 표시
- “요청이 성공적으로 처리되었습니다.” 표시

---

## 6. Packet 설계 규칙

### 6.1 Request Packet

최소 정보:

- Method: `GET`
- Path: `/api/students/1`

표현:
- 작은 카드 또는 캡슐
- Request 색상 계열
- `REQUEST`
- `GET /api/students/1`

### 6.2 SQL Packet

Flask → MySQL 구간에서는 다음을 표시한다.

- `SQL`
- `SELECT ...`

필요하면 Request Packet이 SQL 형태로 Morph되는 방식으로 구현한다.

### 6.3 Response Packet

최소 정보:

- `JSON`
- `200 OK`

또는:

- `RESPONSE`
- `name: 김철수`

Request와 Response는 반드시 다음 중 최소 2가지 이상이 달라야 한다.

- 색상
- 라벨
- 방향
- 아이콘
- 보조 설명

---

## 7. 색상 및 상태 표현 규칙

### 7.1 상태

- idle
- active
- success
- error
- muted

### 7.2 Request / Response 구분

권장:

- Request: warm/orange 계열
- Response: cool/cyan/green 계열

단, 색상만으로 구분하지 않는다.

반드시 텍스트 레이블과 방향 차이를 함께 제공한다.

### 7.3 활성 상태

현재 처리 중인 Node는 다음 중 2개 이상으로 표현한다.

- 외곽선 강조
- Ring
- Glow
- 라벨 강조
- 서버 LED 점등
- 관련 Edge 강조

---

## 8. 애니메이션 동작 규칙

### 8.1 기본 모드: Step Mode

기본 상태는 Step Mode다.

사용자가:

- `← 이전`
- `다음 →`

버튼으로 단계를 직접 이동한다.

각 단계 전환 시 다음이 동기화되어야 한다.

- Packet 위치
- Packet 형태
- 활성 Node
- 활성 Edge
- 설명 텍스트
- Result Preview
- Browser UI State

### 8.2 보조 모드: Play Once

사용자가 `▶ 전체 흐름 보기`를 누르면 0단계부터 11단계까지 자동 재생한다.

권장 총 재생 시간:

`약 6초 ~ 9초`

예시:

- USER_CLICK: 0.4s
- REQUEST_CREATED: 0.5s
- CLIENT → SERVER: 1.0s
- NGINX: 0.7s
- FLASK: 0.7s
- DB: 0.8s
- DB → FLASK: 0.7s
- SERVER → CLIENT: 1.0s
- UI_RENDERED: 0.8s

### 8.3 Easing

과한 탄성 효과 금지.

권장:
- `ease`
- `ease-in-out`
- `cubic-bezier(.22, 1, .36, 1)`

### 8.4 무한 Loop 금지

재생이 끝나면 멈춘다.

다시 재생하려면 사용자가 `다시 보기` 또는 `전체 흐름 보기`를 눌러야 한다.

---

## 9. Reduced Motion 명세

`prefers-reduced-motion: reduce`에서는 Packet의 긴 위치 이동을 제거한다.

대신:

- 현재 단계 Node 강조
- Edge 강조
- Packet 즉시 위치 전환
- State Label 변경
- 설명 텍스트 갱신

을 사용한다.

### Reduced Motion에서 금지
- 긴 슬라이딩 이동
- 지속 진동
- 무한 Pulse
- 과한 Zoom
- Parallax

---

## 10. 인터랙션 규칙

### 10.1 시작 Trigger

허용:

- Hero CTA: `학생 조회로 먼저 체험하기`
- Activity 내부: `학생 1번 조회 실행`

### 10.2 Step Controller

필수:

- `← 이전`
- `다음 →`
- `▶ 전체 흐름 보기`

선택:

- `처음으로`
- `일시정지`
- `다시 보기`

### 10.3 Node 선택

Computer / Nginx / Flask / MySQL은 클릭 또는 키보드로 선택 가능해야 한다.

선택 시:
- Node 강조
- 관련 Edge 강조
- 간단한 역할 설명 표시
- 관련 코드와 연결 가능

### 10.4 자동 재생 중 사용자 조작

권장 동작:

사용자가 이전/다음 또는 Node를 선택하면 자동 재생을 즉시 중단하고 사용자가 선택한 상태를 우선한다.

---

## 11. 단계별 화면 문구

### Step 1
`사용자가 학생 조회 버튼을 눌렀습니다.`

### Step 2
`Browser가 GET /api/students/1 요청을 생성했습니다.`

### Step 3
`Request가 컴퓨터에서 서버로 이동합니다.`

### Step 4
`Nginx가 요청을 받았습니다. /api 경로이므로 Backend로 전달합니다.`

### Step 5
`Flask가 Route를 확인하고 학생 ID 1을 처리합니다.`

### Step 6
`Flask가 학생 정보를 찾기 위한 SQL Query를 MySQL로 보냅니다.`

### Step 7
`MySQL이 students 테이블에서 학생 데이터를 찾았습니다.`

### Step 8
`Flask가 조회 결과를 JSON 응답으로 변환합니다.`

### Step 9
`JSON Response가 서버에서 컴퓨터로 돌아갑니다.`

### Step 10
`Frontend가 응답 데이터를 State에 저장하고 화면을 다시 그립니다.`

### Step 11
`학생 조회가 완료되었습니다.`

---

## 12. 컴퓨터 화면 상태 명세

### Initial

```text
학생 성적 조회

학생 번호 [ 1 ]

[조회]
```

### Loading

```text
학생 성적 조회

조회 중...
```

### Success

```text
학생 성적 조회

김철수

93점
```

### Error 확장

```text
학생을 찾을 수 없습니다.
```

또는:

```text
서버와 연결할 수 없습니다.
```

---

## 13. 서버 내부 상태 명세

Server는 단순 단일 박스가 아니라 내부 처리 계층을 보여준다.

```text
SERVER

┌────────────────────┐
│ Nginx              │
├────────────────────┤
│ Flask API          │
├────────────────────┤
│ MySQL              │
└────────────────────┘
```

### Nginx
- 서비스 입구
- `/`와 `/api` 경로 분기

### Flask API
- Route 확인
- 요청 처리
- SQL 실행 요청
- JSON Response 생성

### MySQL
- 데이터 저장
- SQL 실행
- Row 반환

현재 단계의 요소만 강하게 강조한다.

---

## 14. React 컴포넌트 구조

권장:

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
│
├─ ProcessStepDescription
├─ ProcessStepController
└─ ProcessResultPreview
```

Architecture와 Process Scene이 같은 Node 데이터를 사용할 수 있도록 한다.

---

## 15. 상태 모델

예:

```js
{
  mode: "step",
  currentStep: 0,
  isPlaying: false,
  selectedNode: null,
  reducedMotion: false,
  packetState: "idle",
  uiState: "initial"
}
```

### mode
- `step`
- `play`

### packetState
- `idle`
- `request`
- `sql`
- `dbResult`
- `response`

### uiState
- `initial`
- `loading`
- `success`
- `error`

### Derived State

가능하면 다음은 계산값으로 처리한다.

- activeNode
- activeEdge
- canGoPrev
- canGoNext
- isComplete
- packetPosition
- packetLabel

---

## 16. SVG 구현 규칙

### 16.1 SVG 우선

Scene은 SVG 기반 구현을 우선 검토한다.

이유:
- Node 위치 제어
- Packet Path
- Responsive ViewBox
- 상태별 Highlight
- 클릭 영역
- Morph/Transition

에 적합하다.

### 16.2 React + CSS Motion

권장 역할:

- React: Step / State / Event 관리
- SVG: Scene / Node / Path
- CSS: Transition / Highlight
- JS: 자동 재생 Timeline 제어

단순 무한 CSS Keyframe만으로 전체 상태를 제어하지 않는다.

### 16.3 좌표

Packet 경로는 미리 정의된 Node Anchor를 사용한다.

예:

```js
const anchors = {
  browser: { x: 220, y: 220 },
  nginx: { x: 560, y: 175 },
  flask: { x: 720, y: 250 },
  mysql: { x: 720, y: 350 }
};
```

실제 좌표 값은 레이아웃에 맞게 조정한다.

Magic Number가 여러 Component에 복제되지 않도록 한다.

---

## 17. Responsive Behavior

### Desktop

```text
USER → COMPUTER ─────────→ SERVER
                           Nginx
                           Flask
                           MySQL
```

좌→우 Process Flow를 우선한다.

### Tablet

필요하면 Computer와 Server를 2단으로 재배치한다.

### Mobile

Desktop Scene을 그대로 축소하지 않는다.

권장:

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

세로형 Process Scene으로 재구성한다.

---

## 18. 접근성

필수:

- Keyboard 조작
- Focus Visible
- Step 버튼 Enter / Space 지원
- Node 선택 가능
- 자동 재생 상태 표시
- 현재 단계 설명을 Screen Reader가 읽을 수 있음
- 색상만으로 상태 전달하지 않음

권장:

```html
<div aria-live="polite">
  현재 단계 설명
</div>
```

자동 재생 버튼:

```html
<button aria-pressed="false">
  전체 흐름 보기
</button>
```

---

## 19. 오류 흐름 확장

기본 Chapter 01은 성공 흐름을 중심으로 구현한다.

다만 향후 다음 오류를 표현할 수 있는 구조로 만든다.

### 404

```text
Browser → Nginx → Flask
                    ✕
             student not found
```

### 502

```text
Browser → Nginx
             ✕
           Flask
```

### DB Connection Error

```text
Flask
  ↓
  ✕
MySQL
```

Error State는 현재 문제가 발생한 Node와 Edge를 강조한다.

---

## 20. 구현 금지 패턴

금지:

- Packet 무한 반복
- 의미 없는 Particle
- Server 장식용 LED 무한 깜빡임
- 모든 Node에 계속 Glow
- 실제 상태와 무관한 Animation
- Scroll Hijacking
- 자동 재생 강제
- 클릭할 수 있어 보이지만 작동하지 않는 Node
- Desktop SVG 단순 축소형 Mobile
- Request와 Response를 색만으로 구분

---

## 21. QA 체크리스트

### 구조
- [ ] Browser → Nginx → Flask → MySQL 흐름이 정확하다.
- [ ] 응답 방향이 반대로 명확하다.
- [ ] Docker / GitHub가 Runtime Path에 잘못 들어가지 않는다.
- [ ] Server 내부 역할이 분리되어 보인다.

### 시각
- [ ] Packet이 실제 위치 또는 의미 있는 상태를 변화시킨다.
- [ ] 현재 활성 Node가 명확하다.
- [ ] Request / SQL / Response 상태 변화가 보인다.
- [ ] Browser 화면이 실제로 변한다.

### Interaction
- [ ] 이전 버튼 동작
- [ ] 다음 버튼 동작
- [ ] 전체 흐름 재생 동작
- [ ] 재생 종료 후 멈춤
- [ ] 재생 중 사용자 조작 가능
- [ ] Node 선택 동작

### Accessibility
- [ ] Keyboard 가능
- [ ] Focus Visible
- [ ] Reduced Motion 지원
- [ ] aria-live 또는 의미 있는 상태 전달
- [ ] 색상만으로 의미 전달하지 않음

### Responsive
- [ ] 375px
- [ ] 768px
- [ ] 1024px
- [ ] 1440px

### 학습성
- [ ] 사용자가 요청의 이동 경로를 설명할 수 있다.
- [ ] Nginx / Flask / MySQL의 역할을 구분할 수 있다.
- [ ] DB Row가 JSON 응답으로 바뀌는 것을 이해할 수 있다.
- [ ] 응답이 Frontend State와 화면 변화를 만든다는 것을 이해할 수 있다.

---

## 22. 최종 구현 기준

이 애니메이션은 다음 질문에 답할 수 있어야 성공이다.

> “학생 조회 버튼을 눌렀을 때 실제로 뒤에서 무슨 일이 일어나는가?”

사용자가 화면을 보면서 다음 흐름을 자연스럽게 읽을 수 있어야 한다.

```text
사용자 클릭
→ Browser Request 생성
→ Computer에서 Server로 이동
→ Nginx
→ Flask
→ SQL
→ MySQL
→ DB Result
→ JSON Response
→ Server에서 Computer로 이동
→ Frontend State 변경
→ 화면 Render
```

최종 디자인 원칙:

> **후판 공정 애니메이션에서 슬래브 한 장이 설비를 통과하듯,  
> 이 웹 교안에서는 Request Packet 한 장이 웹 시스템을 통과한다.**
