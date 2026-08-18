# DESIGN_TOKENS

## 목적

프로젝트 전반의 디자인 값을 일관되게 관리한다.

아래 값은 기본 템플릿이다.
프로젝트에 맞게 수정한다.

---

## Color

```css
:root {
  --bg-primary: #0b0e13;
  --bg-secondary: #151a22;
  --surface: #1d242e;
  --border: #2b3542;

  --text-primary: #e8edf3;
  --text-secondary: #8f9aa8;

  --accent-primary: #4a6fa5;
  --accent-warm: #c74a15;
  --accent-hot: #ffc861;

  --success: #4f9d69;
  --warning: #d6a33c;
  --danger: #c55454;
}
```

---

## Typography

권장 역할:

Display  
H1  
H2  
H3  
Body  
Caption  
Metadata  
Numeric / Mono  

숫자, 코드, 상태값은 필요하면 Monospace 사용.

---

## Spacing

기본 Scale:

4  
8  
12  
16  
24  
32  
48  
64  
96

---

## Radius

Small: 4px  
Medium: 8px  
Large: 12~16px

Pill은 특별한 경우만 사용.

---

## Border

일반 Border:
1px

선택 / 강조:
1~2px

---

## Motion

Fast:
150ms

Normal:
250ms

Slow:
400ms

Story:
600ms 전후

---

## Breakpoint Reference

Mobile:
~ 375px

Tablet:
~ 768px

Desktop:
~ 1024px+

Wide:
~ 1440px+

실제 breakpoint는 레이아웃이 깨지는 지점으로 결정한다.

---

## Token Rule

같은 역할의 요소는 같은 Token을 사용한다.

페이지마다 임의의 색상, Radius, Shadow를 생성하지 않는다.
