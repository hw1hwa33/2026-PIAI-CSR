/*
 * Chapter 도입부 — 번호 · 제목 · 핵심 질문 · 짧은 소개.
 *
 * Course Identity: GUIDED INTERACTIVE EXPLORATION (CLAUDE.md)
 *   Hero 에서 용어를 먼저 가르치지 않는다. 용어 사전 블록도, 기술 Tag 목록도 두지 않는다.
 *   Chapter 입장 직후 HTTP · Status Code · JSON · proxy_pass 같은 이름이 나열되면
 *   아직 배우지 않은 단어부터 마주치게 된다.
 *   용어는 실제로 필요해지는 자리(개념 · 정리)에서 역할 → 기술 이름 순으로 소개한다.
 *
 * Hero 에 Activity 로 건너뛰는 CTA 를 두지 않는다.
 *   CTA Anchor 는 바로 다음에 오는 "왜 이걸 보나요?"를 건너뛰게 만든다.
 *   사용자는 Hero → 왜 이걸 보나요 → 이번에는 이것만 → 직접 해보기 순서로
 *   그냥 아래로 읽어 내려가면 된다.
 */
export default function ChapterHero({ chapter, total }) {
  const num = String(chapter.id).padStart(2, "0");

  return (
    <section className="section hero" aria-labelledby="chapter-title">
      <p className="hero-eyebrow">
        <span className="hero-num">Chapter {num}</span>
        <span className="hero-total">전체 {total}개 중</span>
      </p>

      <h1 className="hero-title" id="chapter-title">{chapter.title}</h1>

      {chapter.coreQuestion ? (
        <p className="hero-question">{chapter.coreQuestion}</p>
      ) : null}

      {chapter.intro ? <p className="hero-intro">{chapter.intro}</p> : null}
    </section>
  );
}
