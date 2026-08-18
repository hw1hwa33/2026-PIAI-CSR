# 21_COURSE_CONTENT_CORE

## Mission

비전공자가 명령어를 복사하는 수준을 넘어
"왜 이 명령을 쓰는지"와 "전체 시스템 어디에서 일어나는지"를 이해하게 만든다.

---

## 1. Role Before Tool

기술 이름보다 역할을 먼저 설명한다.

예:

나쁨:
`Nginx는 reverse proxy다.`

좋음:
`사용자의 요청을 받아 Frontend로 보낼지 Backend API로 보낼지 결정하는 서비스 입구가 필요하다. 이 역할에 Nginx를 사용할 수 있다.`

그 다음 용어를 붙인다.

---

## 2. One System Rule

모든 Chapter는 같은 예제를 사용한다.

`학생 성적 조회 웹서비스`

학생 조회:

`GET /api/students/1`

응답 예:

```json
{
  "id": 1,
  "name": "김철수",
  "score": 93
}
```

---

## 3. Layer Model

기본 Runtime 계층:

`USER → Browser/Frontend → Nginx → Flask API → MySQL`

응답:

`MySQL → Flask → JSON → Nginx → Frontend → USER`

별도 축:

- Source Management: `Local Git ↔ GitHub`
- Runtime Environment: `Docker Compose`

GitHub와 Docker를 HTTP Request가 지나가는 중간 계층처럼 그리지 않는다.

---

## 4. Explain With Cause and Effect

각 개념은 가능하면:

`사용자 행동 → 시스템 변화 → 데이터 변화 → 화면 변화`

로 설명한다.

예:

`조회 클릭 → fetch 실행 → GET Request → Flask Route → SQL → JSON → React State → 화면 변경`

---

## 5. Progressive Disclosure

첫 노출:
- 역할
- 전체 위치
- 핵심 코드

선택 후:
- 줄별 설명
- 추가 옵션
- 내부 동작
- 대표 오류

심화:
- 운영 고려사항
- 대체 기술
- 예외 케이스

---

## 6. Terminology

처음 등장할 때 한글 역할 + 실제 용어를 함께 제공한다.

예:
- 요청(Request)
- 응답(Response)
- 경로(Route)
- 원격 저장소(Remote Repository)
- 이미지(Image)
- 컨테이너(Container)
- 역방향 프록시(Reverse Proxy)

이후에는 실제 개발 용어 사용을 점진적으로 늘린다.

---

## 7. Code Principle

코드는:
- 복사 가능해야 한다.
- 최종 프로젝트에 연결 가능해야 한다.
- 비밀정보를 하드코딩하지 않는다.
- 불필요한 추상화를 하지 않는다.
- Chapter 목적과 무관한 고급 문법을 피한다.
- 예상 결과를 함께 보여준다.

---

## 8. Error-as-Learning

정상 흐름만 설명하지 않는다.

대표 오류는 Architecture Map에서 "어디에서 끊겼는가"로 설명한다.

예:
- 404: Route/Resource
- 502: Nginx → Backend 연결
- DB connection error: Backend → Database
- git push할 새 commit 없음: Git workflow
- Container exited: Runtime 상태

---

## 9. Chapter End Rule

모든 Chapter 마지막에 반드시:

1. 오늘 배운 것
2. 전체 시스템에서 현재 위치
3. 다음 Chapter가 필요한 이유

를 제공한다.
