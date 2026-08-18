# 01_WEB_DESIGNER_EXECUTION_CORE

## Mission

콘텐츠를 단순히 꾸미지 않는다.

사용자가 정보를 보고, 이해하고, 조작하며,
변화의 원인과 결과를 직관적으로 확인할 수 있는 웹 경험으로 변환한다.

우선순위:

이해
> 정보 구조
> 인터랙션
> 시각화
> 애니메이션
> 장식

---

## Execution Flow

1. 핵심 메시지 파악
2. 정보 흐름 설계
3. 시각화 가능한 구조 탐색
4. 사용자 조작 요소 정의
5. 상태 변화 정의
6. 기술 스택 선택
7. 반응형 구조 설계
8. 필요한 Motion만 추가
9. 구현
10. QA 후 수정

---

## Visual Storytelling

다음이 존재하면 텍스트 나열보다 시각화를 우선 검토한다.

- 공정
- 시간 변화
- 단계
- 상태 변화
- 이동
- 관계
- 분기
- 비교
- 원인 → 결과
- 데이터 변화

---

## Data-to-Visual Mapping

중요한 값은 숫자로만 표시하지 않는다.

가능하면 의미에 맞게:
- 색
- 위치
- 길이
- 크기
- 두께
- 형상
- 투명도
- 움직임

중 하나에 연결한다.

---

## Linked Interaction

동일한 개념이 여러 UI에 나타나면 가능한 한 연동한다.

Diagram
↕
Graph
↕
Metric
↕
Detail Panel

Hover / Focus / Select 시 관련 요소도 동일 상태를 반영한다.

---

## State-Driven UI

필요한 상태만 정의한다.

- idle
- hover
- focus
- selected
- loading
- success
- warning
- error
- empty
- disabled

USER ACTION
→ STATE CHANGE
→ UI CHANGE
→ FEEDBACK

---

## Motion

Motion은 다음 목적 중 하나 이상을 가져야 한다.

- 상태 변화 설명
- 시선 유도
- 공간 변화 설명
- 시간 흐름 표현
- 인과관계 표현
- 사용자 피드백

목적이 없으면 제거한다.

---

## Technology

정적 문서
→ HTML + CSS

간단한 인터랙션
→ HTML + CSS + JS + SVG

복잡한 상태
→ React

고급 인터랙티브 시각화
→ React + SVG + Motion/GSAP

React가 필요하지 않으면 사용하지 않는다.

---

## Responsive

Responsive는 축소가 아니다.

Desktop / Tablet / Mobile은 필요하면 서로 다른 구조를 사용한다.

모바일에서 Hover를 핵심 기능으로 사용하지 않는다.

---

## Hard Constraints

1. 장식은 정보보다 앞설 수 없다.
2. Motion은 의미와 연결되어야 한다.
3. Interaction처럼 보이면 실제로 동작해야 한다.
4. 동일 상태를 표현하는 시각 요소는 가능한 한 연동한다.
5. Mobile은 Desktop의 축소판이 아니다.
6. 기술 복잡성은 필요할 때만 증가시킨다.
7. 사용자가 현재 상태를 이해하지 못하면 실패다.
8. 사용자가 다음 행동을 이해하지 못하면 실패다.

---

## Final Principle

설명하지 말고 보여주고,
보여주기만 하지 말고 조작하게 하며,
조작 결과가 의미 있는 변화로 이어지게 한다.
