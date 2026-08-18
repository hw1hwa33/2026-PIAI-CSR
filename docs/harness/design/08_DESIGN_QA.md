# 08_DESIGN_QA

## 목적

완료 전에 디자인 품질을 점수와 Gate로 검증한다.

총점 100점.

---

## 1. Information Architecture — 15점

- 핵심 메시지가 즉시 보이는가? 5
- 정보 위계가 명확한가? 5
- 사용자가 다음 행동을 이해하는가? 5

---

## 2. Visual Storytelling — 20점

- 텍스트를 적절히 시각화했는가? 5
- 데이터와 시각 표현이 의미적으로 연결되는가? 5
- 관련 요소가 서로 연동되는가? 5
- 스토리 흐름이 자연스러운가? 5

---

## 3. Interaction — 15점

- 모든 인터랙션이 실제 동작하는가? 5
- 상태 변화가 명확한가? 5
- 사용자 행동에 피드백이 있는가? 5

---

## 4. Motion — 10점

- Motion이 의미를 전달하는가? 4
- 과도한 Motion이 없는가? 3
- Reduced Motion을 고려했는가? 3

---

## 5. Responsive — 15점

- Desktop 구조가 안정적인가? 4
- Tablet 구조가 자연스러운가? 3
- Mobile이 독립적으로 설계되었는가? 5
- Touch Interaction이 가능한가? 3

---

## 6. Accessibility — 10점

- Keyboard 접근 3
- Focus 표시 2
- Semantic HTML / ARIA 2
- Contrast / Label 3

---

## 7. Consistency — 10점

- Color System 2
- Typography 2
- Spacing 2
- Component Style 2
- State Style 2

---

## 8. Performance — 5점

- 불필요한 대형 자산 없음 2
- 과도한 Animation/JS 없음 2
- 렌더링 구조 합리적 1

---

## Score

90~100
Excellent

80~89
Pass

70~79
Revision Required

0~69
Reject

---

## Hard Gate

점수와 관계없이 다음 중 하나라도 실패하면 완료로 간주하지 않는다.

- 핵심 버튼이 동작하지 않음
- Fake Data
- 모바일에서 핵심 기능 사용 불가
- 키보드 접근 완전 차단
- 사용자가 현재 선택 상태를 알 수 없음
- 심각한 Layout Overflow
- Motion이 사용자 통제를 방해함

---

## Required Width QA

최소:
- 375px
- 768px
- 1024px
- 1440px

---

## Final Checklist

□ 핵심 메시지
□ 정보 위계
□ 실제 Interaction
□ 상태 연동
□ 의미 있는 Motion
□ Mobile
□ Keyboard
□ Focus
□ Reduced Motion
□ Fake UI 없음
□ Fake Data 없음
□ 불필요한 기술 없음
