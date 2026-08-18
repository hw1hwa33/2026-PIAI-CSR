import Disclosure from "../common/Disclosure.jsx";
import StatusCodeReference from "./StatusCodeReference.jsx";
import SecurityCallout from "./SecurityCallout.jsx";
import { getTerm } from "../../data/glossary.js";

/*
 * 핵심 개념 — 11_PROJECT_UI_SPEC §5 의 "핵심 개념 / 설명" 구간.
 * 21_COURSE_CONTENT_CORE §1 Role Before Tool: 역할을 먼저 쓰고 기술 이름을 뒤에 붙인다.
 * §17 Card Usage: 설명 구간은 Card 로 감싸지 않고 Typography 와 구분선으로 구조화한다.
 *
 * "이게 뭐지?" Zero-Tolerance — Glossary 에 등록된 기술 이름에는 [?] 를 붙여
 * 언제든 한두 문장 뜻풀이를 다시 열 수 있게 한다. 핵심 의미는 role/desc 본문에 그대로 있다.
 */
export default function ConceptSection({ chapter, selectedNode, onSelectNode }) {
  const concept = chapter.concept;

  if (!concept) {
    return (
      <section className="section" aria-labelledby="concept-heading">
        <h2 className="section-title" id="concept-heading">조금 더 알아보기</h2>
        <p className="placeholder-note">이 Chapter의 개념 설명은 아직 준비 중입니다.</p>
      </section>
    );
  }

  const roles = concept.roles || [];

  return (
    <section className="section" aria-labelledby="concept-heading">
      {/* 제작 규칙 이름(Role Before Tool 등)을 사용자 화면에 노출하지 않는다 */}
      <h2 className="section-title" id="concept-heading">조금 더 알아보기</h2>

      {/* 처음 보는 이름이 이 Chapter 의 주제일 때, 뜻과 예를 먼저 한 번 묶어 준다 */}
      {concept.primer ? (
        <div className="primer">
          <p className="primer-title">{concept.primer.title}</p>
          {concept.primer.body.map((line) => (
            <p className="primer-body" key={line}>{line}</p>
          ))}
          {concept.primer.examples ? (
            <ul className="primer-examples">
              {concept.primer.examples.map(([what, how]) => (
                <li className="primer-example" key={how}>
                  <span className="primer-what">{what}</span>
                  <code className="primer-how">{how}</code>
                </li>
              ))}
            </ul>
          ) : null}
          {concept.primer.scope ? (
            <p className="primer-scope">{concept.primer.scope}</p>
          ) : null}
        </div>
      ) : null}

      {concept.lead ? <p className="concept-lead">{concept.lead}</p> : null}

      <dl className="role-list">
        {roles.map((r) => {
          const nodeId = r.node || guessNode(r.tech);
          const selected = nodeId && nodeId === selectedNode;
          const entry = getTerm(r.term || r.tech);
          return (
            <div
              key={r.tech}
              className={"role-item" + (selected ? " is-selected" : "")}
            >
              <dt className="role-term">
                <span className="role-role">{r.role}</span>
                {nodeId ? (
                  <button
                    type="button"
                    className="role-tech role-tech--link"
                    aria-pressed={selected}
                    onClick={() => onSelectNode(nodeId)}
                  >
                    {r.tech}
                  </button>
                ) : (
                  <span className="role-tech">{r.tech}</span>
                )}
              </dt>
              <dd className="role-desc">{r.desc}</dd>
              {entry ? (
                <dd className="role-hint">
                  <span className="role-hint-label">쉬운 말로</span>
                  {entry.hint}
                </dd>
              ) : null}
            </div>
          );
        })}
      </dl>

      {concept.note ? <p className="concept-note">{concept.note}</p> : null}

      {/* 자주 보는 처리 결과 번호 — 번호마다 한 행 (CLAUDE.md) */}
      <StatusCodeReference codes={chapter.statusCodes} />

      {/* 비밀값 취급 주의 — Safe / Unsafe 대조 */}
      <SecurityCallout data={chapter.security} />

      {/*
        Progressive Disclosure (CLAUDE.md §3)
        내부 동작 · 예외 · 운영 고려사항 · 고급 문법은 첫 노출에서 빼고 여기로 내린다.
        여기 들어간 내용을 몰라도 이번 Chapter 의 핵심은 이해할 수 있어야 한다.
      */}
      {(concept.advanced || []).map((a) => (
        <div className="concept-advanced" key={a.label}>
          <Disclosure tone="advanced" label={a.label} note={a.note}>
            {a.body.map((p) => (
              <p className="concept-advanced-p" key={p}>{p}</p>
            ))}
          </Disclosure>
        </div>
      ))}

      {/* 여기까지가 이번 Chapter 의 핵심이라는 것을 명시한다 */}
      {concept.checkpoint ? (
        <p className="checkpoint">
          <span className="checkpoint-mark" aria-hidden="true">✓</span>
          <span className="checkpoint-text">{concept.checkpoint}</span>
        </p>
      ) : null}
    </section>
  );
}

/* 기술 이름에서 Architecture Node id 를 유추한다 (데이터에 node 가 없을 때만) */
function guessNode(tech = "") {
  const t = tech.toLowerCase();
  if (t.includes("browser") || t.includes("frontend")) return "browser";
  if (t.includes("nginx")) return "nginx";
  if (t.includes("flask")) return "flask";
  if (t.includes("mysql")) return "mysql";
  return null;
}
