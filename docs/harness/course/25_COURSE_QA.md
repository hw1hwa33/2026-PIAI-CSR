# 25_COURSE_QA

## 목적

완성된 교안이 예쁘기만 하고 학습이 되지 않는 문제를 방지한다.

총점보다 아래 Hard Gate를 우선한다.

---

## 1. Learning Clarity — 20

- Chapter 핵심 질문이 1개로 명확한가? 5
- 역할을 기술명보다 먼저 이해할 수 있는가? 5
- 전체 Architecture에서 현재 위치를 알 수 있는가? 5
- 다음 Chapter가 필요한 이유가 자연스러운가? 5

---

## 2. Technical Accuracy — 20

- Git/GitHub 역할이 구분되는가? 4
- Docker/Image/Container/Compose가 구분되는가? 4
- Front/Nginx/Flask/DB 계층이 정확한가? 4
- Request/Response 방향이 정확한가? 4
- 코드와 설명이 서로 일치하는가? 4

---

## 3. Hands-on Learning — 20

- 각 핵심 Chapter에 조작 가능한 Activity가 있는가? 5
- Activity 결과가 실제 개념 변화와 연결되는가? 5
- 코드 복사가 동작하는가? 5
- 성공/오류 Feedback이 있는가? 5

---

## 4. Continuity — 15

- 15개 Chapter가 하나의 프로젝트를 공유하는가? 5
- 파일명/Route/Service/Port가 일관적인가? 5
- Chapter 15에서 앞의 코드를 통합할 수 있는가? 5

---

## 5. Beginner Safety — 15

- Secret 하드코딩을 권장하지 않는가? 4
- 파괴적 명령을 경고/분리하는가? 4
- 가짜 Terminal을 실제 실행처럼 속이지 않는가? 4
- 복잡한 심화 내용을 핵심과 분리하는가? 3

---

## 6. Navigation & State — 10

- 현재 Chapter가 보이는가? 2
- 현재 선택 Node가 보이는가? 2
- Activity 상태가 보이는가? 2
- 다음 행동이 명확한가? 2
- Mobile에서도 핵심 학습이 가능한가? 2

---

## Hard Gate

다음 중 하나라도 실패하면 완료로 간주하지 않는다.

- Git과 GitHub를 같은 개념으로 가르침
- Docker를 HTTP Request 중간 Layer처럼 표현
- Frontend가 DB에 직접 접근하는 기본 구조로 설명
- 코드 복사 버튼이 동작하지 않음
- Activity 버튼이 실제 상태를 바꾸지 않음
- Chapter별 코드가 서로 충돌
- Secret을 Repository에 넣도록 안내
- 파괴적 명령을 경고 없이 기본 흐름에 배치
- 모바일에서 핵심 Activity 불가
- 전체 Architecture에서 현재 위치 확인 불가

---

## Final Questions

완료 전에 실제 초보자 관점으로 묻는다.

1. "지금 무엇을 배우고 있는가?"
2. "이 기술은 전체 시스템에서 어디에 있는가?"
3. "이 코드를 왜 실행하는가?"
4. "실행하면 무엇이 변하는가?"
5. "문제가 생기면 어느 구간을 먼저 확인해야 하는가?"
6. "다음 Chapter를 왜 배워야 하는가?"

하나라도 바로 답하기 어렵다면 수정한다.
