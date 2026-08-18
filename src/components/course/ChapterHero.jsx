/*
 * Chapter 도입부 — 번호 · 제목 · 핵심 질문 · 짧은 소개 · 바로 해보기.
 *
 * Course Identity: GUIDED INTERACTIVE EXPLORATION (CLAUDE.md)
 *   Hero 에서 용어를 먼저 가르치지 않는다. 용어 사전 블록도, 기술 Tag 목록도 두지 않는다.
 *   Chapter 입장 직후 HTTP · Status Code · JSON · proxy_pass 같은 이름이 나열되면
 *   아직 배우지 않은 단어부터 마주치게 된다.
 *   용어는 실제로 필요해지는 자리(개념 · 정리)에서 역할 → 기술 이름 순으로 소개한다.
 *
 * Activity First — 설명을 다 읽고 나서 움직이는 순서가 아니다.
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

      {chapter.activity ? (
        <p className="hero-cta">
          <a className="btn btn--primary" href="#activity-heading">
            {chapter.activity.cta || "한번 움직여 보기"}
          </a>
          <span className="hero-cta-note">먼저 눌러 봐도 됩니다.</span>
        </p>
      ) : null}
    </section>
  );
}
