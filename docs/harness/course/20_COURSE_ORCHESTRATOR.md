# 20_COURSE_ORCHESTRATOR

## 역할

교안 제작 작업의 최상위 오케스트레이터다.

디자인을 결정하는 파일이 아니다.
먼저 **무엇을 어떤 순서로 가르칠지**를 결정한다.

---

## 1. 기본 실행 순서

1. 사용자 학습 목표 파악
2. 현재 Chapter 확인
3. 이 Chapter의 핵심 질문 1개 정의
4. 전체 Architecture에서 현재 위치 정의
5. 선수 개념 확인
6. 설명 범위 결정
7. 실제 예제 코드 선정
8. Activity 정의
9. 성공 조건 정의
10. 대표 오류/오해 정의
11. 다음 Chapter와 연결
12. 기술 정확성 검토
13. 필요한 경우 Interactive UX 설계
14. 필요한 경우 Design Harness 호출
15. Course QA
16. Design QA

---

## 2. Chapter 공통 구조

모든 Chapter는 가능한 한 다음 구조를 유지한다.

### A. 핵심 질문
학습자가 이번 Chapter에서 답해야 할 질문 1개.

### B. 먼저 보는 전체 그림
전체 Architecture Map에서 현재 학습 대상 강조.

### C. 핵심 설명
필요한 개념만 설명.

### D. 실제 코드
최종 프로젝트에 그대로 연결 가능한 코드.

### E. 코드 해설
라인별 설명은 필요한 경우만 Progressive Disclosure.

### F. Activity
사용자가 클릭, 선택, 복사, 단계 진행 등을 통해 개념을 조작.

### G. Result
Activity 결과를 명확히 표시.

### H. Error / Misconception
대표적인 실패 사례 또는 자주 발생하는 오해.

### I. Chapter Summary
"오늘 배운 것 / 전체 시스템에서 위치 / 다음에 배우는 이유"

---

## 3. Story Rule

Chapter를 독립된 글 15개처럼 만들지 않는다.

전체 Story:

`전체 시스템 → 통신 → 프로젝트 구조 → Git → GitHub → Docker → Dockerfile → Compose → Frontend → Nginx → Flask → REST → DB/SQL → 전체 추적 → 완성`

각 Chapter는 이전 Chapter의 결과를 다음 Chapter의 이유로 사용한다.

---

## 4. Routing

### Chapter 내용이 필요할 때
`22_CHAPTER_CURRICULUM.md`

### 학습 인터랙션/상태가 필요할 때
`23_INTERACTIVE_LEARNING_UX.md`

### 기술 코드/명령어가 필요할 때
`24_TECHNICAL_CONTENT_RULES.md`

### UI 구현이 필요할 때
기존 Design Harness 호출.

---

## 5. Scope Control

한 Chapter에서 모든 것을 설명하지 않는다.

예:
- Git Chapter에서 rebase, reflog, submodule까지 확장하지 않는다.
- Docker Chapter에서 orchestration 전체를 Kubernetes까지 확장하지 않는다.
- Nginx Chapter에서 내부 worker architecture를 핵심 내용으로 만들지 않는다.
- REST Chapter에서 REST maturity model을 필수 내용으로 만들지 않는다.

필요한 심화 내용은 `심화`로 분리한다.
