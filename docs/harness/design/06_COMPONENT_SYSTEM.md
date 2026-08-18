# 06_COMPONENT_SYSTEM

## 적용 조건

React 또는 유사 컴포넌트 기반 UI에서 적용한다.

정적 HTML에는 강제하지 않는다.

---

## 1. Component Responsibility

페이지 전체를 하나의 거대한 컴포넌트로 만들지 않는다.

예:

App
├─ Hero
├─ Controls
├─ Visualization
├─ MetricPanel
├─ DetailPanel
└─ Conclusion

시각적 책임과 상태 책임을 기준으로 분리한다.

---

## 2. Single Source of Truth

동일 데이터는 하나의 데이터 모델을 공유한다.

예:

processData
→ ProcessMap
→ TemperatureGraph
→ DetailPanel
→ MetricCards

---

## 3. State Ownership

State는 실제 UI 변화가 필요한 경우에만 만든다.

예:
- selectedStage
- selectedCategory
- activeFilter
- animationEnabled
- expandedSection
- viewMode

계산 가능한 값은 Derived Value로 처리한다.

---

## 4. Props

Props는 컴포넌트 계약을 명확하게 한다.

지나치게 많은 Props가 필요하면
컴포넌트 책임 분리가 잘못되었는지 검토한다.

---

## 5. Shared State

관련 시각화가 동일 상태를 공유해야 한다면
상태를 공통 부모 또는 적절한 상태 계층으로 올린다.

목표:
Cross-Highlighting과 동기화.

---

## 6. UI State

최소 검토:
- idle
- hover
- focus
- selected
- loading
- error
- empty
- disabled

---

## 7. Render Logic

조건부 렌더링이 복잡해지면
별도 함수 또는 컴포넌트로 분리한다.

JSX 내부에 과도한 분기와 긴 데이터를 직접 박아넣지 않는다.

---

## 8. Data Model First

복잡한 인터랙티브 페이지는 구현 전에 데이터 구조를 정의한다.

예:

{
  id,
  name,
  metrics,
  category,
  status,
  description,
  visualization
}

---

## 9. Technology Restraint

Context, Redux, Zustand 등은 필요할 때만 사용한다.

로컬 상태로 충분하면 전역 상태관리 라이브러리를 사용하지 않는다.
