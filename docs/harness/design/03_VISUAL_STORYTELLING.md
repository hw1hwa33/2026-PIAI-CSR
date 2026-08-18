# 03_VISUAL_STORYTELLING

## 목적

콘텐츠의 의미를 시각적 구조, 데이터 표현, 인터랙션으로 번역한다.

특히 다음 유형에서 우선 적용한다.

- 공정 설명
- 데이터 분석
- 시스템 구조
- 알고리즘 흐름
- 시계열
- 단계별 변화
- 비교
- 인과관계
- 발표용 인터랙티브 웹

---

## 1. Story Before Layout

레이아웃 전에 Story를 정의한다.

분석형:
Problem
→ Finding
→ Evidence
→ Pattern
→ Validation
→ Implication
→ Conclusion

공정형:
Overview
→ Current Stage
→ State Change
→ Key Variable
→ Mechanism
→ Next Stage

---

## 2. Visual Metaphor

복잡한 개념은 적절한 시각적 은유를 검토한다.

Process
→ Flow / Factory Line

Time
→ Timeline

Hierarchy
→ Tree

State
→ Node / State Map

Before vs After
→ Split View

Cause → Result
→ Flow Diagram

Model Comparison
→ Scoreboard / Matrix

---

## 3. SVG as Interactive UI

공정, 구조, 시스템, 네트워크는 SVG 사용을 적극 검토한다.

SVG는 단순 삽화가 아니라 UI 컴포넌트로 취급한다.

가능한 상태:
- idle
- hover
- focus
- selected
- active

SVG 요소가 조작 대상이면 키보드 접근도 가능하게 한다.

---

## 4. Cross-Highlighting

같은 개념이 여러 시각 요소에 나타나면 연결한다.

예:
공정 설비 선택
→ 온도 그래프 노드 강조
→ 상태 변수 갱신
→ 상세 패널 갱신

하나의 선택이 관련 시각화 전체에 반영되게 한다.

---

## 5. Data-to-Visual Mapping

실제 수치를 시각적 특성에 매핑한다.

온도
→ Heat Ramp

두께
→ Shape Height

진행
→ Position

위험도
→ Emphasis

냉각
→ Color Decrease

처리 전/후
→ Morph / Split / Transition

중요:
시각 변화는 실제 의미와 일치해야 한다.

---

## 6. Spatial Process Rule

물리적 이동이나 공정 순서가 존재하면
가능한 경우 화면에서도 공간적 흐름으로 표현한다.

단순 카드 나열보다
공정 객체 + 이동 + 상태 변화를 우선 검토한다.

---

## 7. Dynamic Detail

복잡한 객체를 선택하면 페이지 이동보다 Context 유지형 상세 패널을 우선 검토한다.

권장:
- 번호
- 이름
- 짧은 설명
- 시각 도해
- 핵심 변수
- 상세 설명
- 비교
- 이전 / 다음

---

## 8. Filtering

필터는 실제 정보 공간을 바꿔야 한다.

필터 변경 시 필요한 경우:
- Graph
- Metrics
- Description
- Comparison
- Detail

을 함께 갱신한다.

색상만 바뀌는 가짜 필터를 만들지 않는다.

---

## 9. Single Source of Truth

동일 데이터를 여러 컴포넌트에 복제하지 않는다.

Data Model
→ Diagram
→ Graph
→ Metric
→ Detail

구조를 우선한다.

---

## 10. Analysis Storytelling

EDA 결과를 차트 갤러리처럼 나열하지 않는다.

각 차트는 하나의 질문에 답해야 한다.

예:
"rolling_temp가 공정 조합별로 다른가?"
→ 그룹 비교

"이상값이 시간적으로 고착되어 있는가?"
→ 시계열 + run-length 시각화

"모델 성능 차이가 의미 있는가?"
→ 비교 그래프 + 핵심 결론

---

## 11. Direct Manipulation

가능하면 사용자가 화면 속 대상 자체를 조작하게 한다.

좋음:
그래프 점 클릭
→ 해당 관측치 상세

좋음:
공정 설비 클릭
→ 해당 공정 상세

Dropdown보다 직접 조작이 자연스러우면 직접 조작을 우선한다.

---

## 12. Presentation Emphasis

발표용 웹에서는 다음을 강화한다.

- 강한 첫 메시지
- 핵심 숫자
- 단계적 Reveal
- 시선 유도
- 직접 시연 가능성
- 마지막 결론 강화

다만 발표 효과 때문에 사실 관계를 왜곡하지 않는다.
