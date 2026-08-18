# Claude Web Design Harness — Flat Edition

이 버전은 **Claude 웹 프로젝트와 로컬 Claude 프로젝트 양쪽에서 사용하기 위한 평탄화 버전**이다.

모든 Markdown 파일을 동일한 디렉터리에 둔다.

## Directory

```text
PROJECT_ROOT/
├─ CLAUDE.md
├─ README_DESIGN_HARNESS.md
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

## Claude 웹 프로젝트

각 MD 파일을 프로젝트 컨텍스트에 개별 업로드한다.

파일명 번호가 호출 순서와 역할을 나타낸다.

## 로컬 Claude 프로젝트

ZIP 내용을 프로젝트 루트에 그대로 풀어 둔다.

`CLAUDE.md`가 `00_DESIGN_ORCHESTRATOR.md`를 라우팅하고,
오케스트레이터가 같은 디렉터리의 필요한 규칙 파일을 참조한다.

하위 폴더를 전제로 한 경로는 사용하지 않는다.

## Core Flow

```text
사용자 요청
→ CLAUDE.md
→ 00_DESIGN_ORCHESTRATOR.md
→ 01_WEB_DESIGNER_EXECUTION_CORE.md
→ 필요한 02~06 규칙
→ 07_DESIGN_ANTIPATTERNS.md
→ 08_DESIGN_QA.md
→ 완료
```

## Project-specific Files

`10_DESIGN_TOKENS.md`
- 프로젝트 색상
- 타이포그래피
- 간격
- 모션 토큰

`11_PROJECT_UI_SPEC.md`
- 프로젝트 목표
- 핵심 메시지
- 시각 콘셉트
- 주요 인터랙션
- 반응형 요구사항

## Reference

`09_WEB_DESIGNER_PERSONA_FULL.md`는 상세 판단이 필요한 경우에만 참고한다.
매 작업마다 전체 내용을 반복 적용할 필요는 없다.
