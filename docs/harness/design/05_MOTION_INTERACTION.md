# 05_MOTION_INTERACTION

## 목적

Motion은 정보 전달과 상태 변화 이해를 돕는 도구다.

장식 자체가 목적이 되어서는 안 된다.

---

## 1. Motion Eligibility

다음 중 하나를 설명할 때 사용한다.

- 상태 변화
- 시선 이동
- 공간 변화
- 시간 흐름
- 진행 상황
- 인과관계
- 사용자 피드백

설명할 수 없는 Motion은 제거한다.

---

## 2. Semantic Motion

실제 현상의 의미와 움직임을 연결한다.

가열
→ 발광 증가

냉각
→ 발광 감소

압연
→ 이동 + 압축

유체 분사
→ 방향성이 있는 반복

증기
→ 상승 + 소멸

진행
→ Position 변화

---

## 3. Duration Guide

Micro Interaction
100~250ms

일반 Transition
200~400ms

Panel Transition
300~500ms

Story Transition
400~800ms

공정 시뮬레이션은 별도 Timeline 사용 가능.

---

## 4. Phase Distribution

여러 반복 객체가 모두 동시에 움직이지 않게 한다.

불꽃, 입자, 분사, 증기 등의 반복 요소는
animation-delay 또는 phase를 분산한다.

목적:
기계적인 동기화 느낌 감소.

---

## 5. Infinite Animation

기본적으로 제한한다.

허용:
- 실제 지속 상태
- 회전 설비
- 증기
- 불꽃
- 물 흐름
- 작은 상태 Indicator

금지:
사용자의 주의를 계속 빼앗는 장식 애니메이션.

---

## 6. Interaction Feedback

Hover
→ 가벼운 강조

Click
→ 선택 상태

Selected
→ 명확한 지속 강조

Focus
→ 키보드 사용자가 인지 가능한 표시

Disabled
→ 상호작용 불가 상태

---

## 7. Reduced Motion

반드시 고려:

@media (prefers-reduced-motion: reduce)

감소 대상:
- Parallax
- 큰 이동
- Zoom
- Auto-play Motion
- Infinite Animation

Motion이 많은 페이지는 필요하면 사용자 토글을 제공한다.

---

## 8. Scroll

기본 Browser Scroll을 존중한다.

금지:
- Scroll Hijacking
- 강제 Snap 남발
- 사용자의 스크롤 속도 변경

Scroll Animation은 Story 이해를 보조할 때만 사용한다.

---

## 9. Motion QA

Motion을 제거했을 때 이해가 거의 변하지 않는다면
장식일 가능성이 높다.

장식이라면 제거 또는 약화한다.
