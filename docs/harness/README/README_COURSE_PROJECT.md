# Interactive Course Project — Claude Reference Harness

이 폴더는 **교안 제작 하네스 + 기존 웹 디자인 하네스**를 하나의 프로젝트에서 함께 사용하기 위한 Flat 구성이다.

## 핵심 구조

```text
CLAUDE.md
│
├─ Course Harness
│  ├─ 12_COURSE_PROJECT_SPEC.md
│  ├─ 20_COURSE_ORCHESTRATOR.md
│  ├─ 21_COURSE_CONTENT_CORE.md
│  ├─ 22_CHAPTER_CURRICULUM.md
│  ├─ 23_INTERACTIVE_LEARNING_UX.md
│  ├─ 24_TECHNICAL_CONTENT_RULES.md
│  └─ 25_COURSE_QA.md
│
└─ Design Harness
   ├─ 00_DESIGN_ORCHESTRATOR.md
   ├─ 01_WEB_DESIGNER_EXECUTION_CORE.md
   ├─ 02_UIUX_CORE.md
   ├─ 03_VISUAL_STORYTELLING.md
   ├─ 04_RESPONSIVE_RULES.md
   ├─ 05_MOTION_INTERACTION.md
   ├─ 06_COMPONENT_SYSTEM.md
   ├─ 07_DESIGN_ANTIPATTERNS.md
   ├─ 08_DESIGN_QA.md
   ├─ 09_WEB_DESIGNER_PERSONA_FULL.md
   ├─ 10_DESIGN_TOKENS.md
   └─ 11_PROJECT_UI_SPEC.md
```

## Claude 실행 원칙

### 교안 내용 작성
`CLAUDE.md → 20 → 21 → 필요한 22~24 → 25`

### 웹 화면 구현
먼저 교안 구조를 확정한 후:

`CLAUDE.md → 00 → 01 → 필요한 02~06 → 10 → 11 → 07 → 08`

### 교안 + 구현 동시 작업
`Course Harness → Design Harness`

순서를 유지한다.

## 왜 두 하네스를 분리하는가

Course Harness:
- 무엇을 가르칠지
- 어떤 순서로 가르칠지
- 기술 설명이 정확한지
- Activity가 학습에 도움이 되는지

Design Harness:
- 어떻게 보여줄지
- 어떻게 조작하게 할지
- 어떻게 반응형으로 만들지
- Motion과 시각적 표현을 어떻게 사용할지

디자인이 교육 내용을 왜곡하지 않도록 역할을 분리한다.
