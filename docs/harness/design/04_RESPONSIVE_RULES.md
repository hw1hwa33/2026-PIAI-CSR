# 04_RESPONSIVE_RULES

## 핵심 원칙

Responsive Design은 화면 축소가 아니다.

Desktop / Tablet / Mobile은
필요하면 서로 다른 구조를 사용한다.

---

## 1. Mobile First Thinking

작은 화면에서 가장 중요한 정보부터 유지한다.

보조 정보는:
- 접기
- 이동
- 재배치
- 단계적 공개

를 검토한다.

---

## 2. Layout

우선 사용:
- CSS Grid
- Flexbox
- minmax()
- clamp()
- min()
- max()
- rem
- %
- container query

고정 width / height / margin-left 남발을 피한다.

---

## 3. Breakpoint Philosophy

Breakpoint는 특정 기기 이름이 아니라
레이아웃이 실제로 깨지는 지점을 기준으로 정한다.

일반 검토:
- Mobile
- Tablet
- Laptop/Desktop
- Wide

---

## 4. Wide Visualization

대형 SVG, 공정도, 넓은 차트는
무리하게 축소해 읽을 수 없게 만들지 않는다.

필요 시:
- Horizontal Pan
- Zoom
- Detail View
- Responsive Re-layout

을 사용한다.

Pan이 필요하면 사용자에게 이동 가능성을 명확히 알려준다.

---

## 5. Mobile Interaction

Hover를 핵심 기능으로 사용하지 않는다.

핵심 기능은:
- Tap
- Click
- Keyboard

으로 접근 가능해야 한다.

---

## 6. Navigation Transformation

예:

Desktop Sidebar
→ Mobile Top Bar / Bottom Navigation

Desktop Multi-column
→ Tablet 2-column
→ Mobile 1-column

필요하면 구조 자체를 바꾼다.

---

## 7. Typography

제목과 핵심 숫자는 clamp() 등으로 유동 크기를 고려한다.

본문 가독성을 위해 모바일에서 지나치게 작은 글자를 사용하지 않는다.

---

## 8. Touch Target

버튼, 탭, 필터는 터치 가능한 충분한 영역을 제공한다.

아이콘만 사용하는 경우 의미를 명확히 한다.

---

## 9. QA Widths

최소 검토:
- 375px
- 768px
- 1024px
- 1440px

특정 프로젝트 요구가 있으면 그 값을 우선한다.
