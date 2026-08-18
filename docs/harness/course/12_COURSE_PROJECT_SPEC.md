# 12_COURSE_PROJECT_SPEC

## Project

프로젝트명:
`GitHub · Docker · Web Architecture Interactive Course`

목적:
`비전공자가 Git/GitHub/Docker와 일반적인 웹 서비스 계층을 하나의 연결된 시스템으로 이해하고 직접 실습한다.`

주 사용자:
- 개발 비전공자
- 웹 개발 입문자
- Git / Docker를 처음 접하는 학습자
- 명령어는 따라할 수 있지만 전체 구조 연결이 어려운 학습자

사용 환경:
`Desktop / Tablet / Mobile`

---

## Primary Message

사용자가 반드시 기억해야 할 핵심 메시지:

> 웹 프로젝트는 여러 프로그램의 집합이 아니라, 사용자의 요청과 데이터가 역할별 계층을 지나며 움직이는 하나의 시스템이다. GitHub는 코드를 관리하고 Docker는 이 시스템을 같은 방식으로 실행하게 만든다.

---

## Example Project

교안 전체에서 하나의 예제를 유지한다.

`학생 성적 조회 웹서비스`

기본 흐름:

`USER → Browser/Frontend → Nginx → Flask API → MySQL → Flask → JSON → Frontend → USER`

개발 관리 축:

`Local Git ↔ GitHub`

실행 환경:

`Docker Compose`

---

## Learning Outcome

완료 후 사용자는 최소한 다음을 설명하고 실행할 수 있어야 한다.

- Git과 GitHub의 차이
- `git add → commit → push` 흐름
- Docker Image와 Container의 차이
- Dockerfile의 역할
- Docker Compose의 역할
- Frontend / Reverse Proxy / Backend API / Database의 역할
- Request / Response
- REST API
- JSON
- SQL Query
- Nginx의 `/`와 `/api` 라우팅
- Flask Route
- 전체 Request → Response 추적
- 프로젝트 Clone → 실행 → 수정 → Commit → Push

---

## Teaching Principle

항상 다음 순서를 우선한다.

`WHY → 전체 구조 → 역할 → 데이터 흐름 → 코드 → 실행 → 결과 → 오류 → 전체 구조로 복귀`

초보자에게 세부 문법을 먼저 노출하지 않는다.
