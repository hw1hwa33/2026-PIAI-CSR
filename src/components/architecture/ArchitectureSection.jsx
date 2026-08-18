import Disclosure from "../common/Disclosure.jsx";
import { NODES, EDGES, RUNTIME_PATH } from "../../data/architecture.js";

const MANAGE_NODES = NODES.filter((n) => n.axis === "manage");
const ENV_NODES = NODES.filter((n) => n.axis === "env");

/*
 * 현재 위치 지도.
 *
 * Shared Architecture 원칙 (23_INTERACTIVE_LEARNING_UX §1)
 *   Runtime 경로 USER → Browser → Nginx → Flask → MySQL 은 모든 Chapter 에서 항상 전부 그린다.
 *   Chapter 마다 달라지는 것은 "무엇을 지웠는가"가 아니라 "어디를 강조하는가"다.
 *   architecture.highlight 에 없는 Node 는 지우지 않고 muted(범위 밖) 상태로 남긴다.
 *
 *   selectedNode  사용자가 직접 고른 노드
 *   focus         Activity 가 알려 준 지금 단계 { node, edge }
 *   errorFocus    오류가 가리키는 지점 { node, edge }
 * mapRef 는 "위치 보기" 스크롤 대상이다.
 */
export default function ArchitectureSection({
  chapter,
  selectedNode,
  focus,
  errorFocus,
  onSelectNode,
  onShowCode,
  mapRef
}) {
  const arch = chapter.architecture;
  const highlight = (arch && arch.highlight) || RUNTIME_PATH;
  const scopeNotes = (arch && arch.scopeNotes) || {};
  /* 기본 Edge 는 쉬운 말이다. 그 구현을 실제로 배우는 Chapter 에서만 덮어쓴다. */
  const edgeLabels = (arch && arch.edgeLabels) || {};
  /* Chapter 04 처럼 학습 대상이 Runtime 이 아니라 관리 축인 경우 */
  const axisFocus = (arch && arch.axisFocus) || [];

  /* Node 는 언제나 전부 그린다. 이번 Chapter 범위 밖이면 muted 로만 표시한다. */
  const nodes = RUNTIME_PATH.map((id) => NODES.find((n) => n.id === id)).filter(Boolean);
  const inScope = (id) => highlight.includes(id) || axisFocus.includes(id);
  const hasMuted = nodes.some((n) => !inScope(n.id));

  const focusNode = focus ? focus.node : null;
  const focusEdge = focus ? focus.edge : null;
  const errNode = errorFocus ? errorFocus.node : null;
  const errEdge = errorFocus ? errorFocus.edge : null;

  const detail = selectedNode ? NODES.find((n) => n.id === selectedNode) : null;
  const detailNote = detail && !inScope(detail.id)
    ? (scopeNotes[detail.id] || (arch && arch.scopeNote) || null)
    : null;

  if (!arch) {
    return (
      <section className="section" aria-labelledby="map-heading" ref={mapRef}>
        <h2 className="section-title" id="map-heading">지금 어디를 보고 있나</h2>
        <p className="placeholder-note">이 Chapter의 아키텍처 지도는 아직 준비 중입니다.</p>
      </section>
    );
  }

  /* 별도 축(코드 관리 · 실행 환경). 이번 Chapter의 무대일 때만 펼친 채로 보여 준다. */
  const aside = (
    <>
      <div className="arch-axis">
        <p className="arch-axis-label">
          코드와 기록 관리 <span className="arch-axis-tech">Local Git ↔ GitHub</span>
        </p>
        <p className="arch-axis-row">
          {MANAGE_NODES.map((n, i) => (
            <span key={n.id}>
              {i > 0 ? <span className="arch-axis-link" aria-hidden="true">↔</span> : null}
              <span
                className={"arch-axis-node"
                  + (axisFocus.includes(n.id) ? " is-focus" : "")
                  + (n.id === selectedNode ? " is-selected" : "")}
              >
                <span className="arch-axis-role">{n.role}</span>
                <span className="arch-axis-name">{n.name}</span>
                {axisFocus.includes(n.id) ? (
                  <span className="arch-axis-badge">이번 Chapter</span>
                ) : null}
              </span>
            </span>
          ))}
          <span className="arch-axis-desc">요청이 지나가는 길이 아니다</span>
        </p>
      </div>

      <div className="arch-axis">
        <p className="arch-axis-label">
          실행 환경 <span className="arch-axis-tech">Docker / Docker Compose</span>
        </p>
        <p className="arch-axis-row">
          {ENV_NODES.map((n) => (
            <span
              className={"arch-axis-node"
                + (axisFocus.includes(n.id) ? " is-focus" : "")
                + (n.id === selectedNode ? " is-selected" : "")}
              key={n.id}
            >
              <span className="arch-axis-role">{n.role}</span>
              <span className="arch-axis-name">{n.name}</span>
              {axisFocus.includes(n.id) ? (
                <span className="arch-axis-badge">이번 Chapter</span>
              ) : null}
            </span>
          ))}
          <span className="arch-axis-desc">위 서비스들을 실행한다</span>
        </p>
      </div>
    </>
  );

  return (
    <section className="section" aria-labelledby="map-heading" ref={mapRef}>
      <h2 className="section-title" id="map-heading">지금 어디를 보고 있나</h2>
      {arch.caption ? <p className="section-desc">{arch.caption}</p> : null}

      <div className="panel arch-panel">
        {/* Runtime 이라는 이름을 지도 이해의 전제 조건으로 요구하지 않는다 */}
        <p className="arch-axis-label">요청이 지나가는 길</p>
        <ol className="arch-path" aria-label="요청이 지나가는 순서">
          {nodes.map((n, i) => {
            const inEdge = i > 0
              ? EDGES.find((e) => e.from === nodes[i - 1].id && e.to === n.id)
              : null;
            const edgeId = inEdge ? inEdge.id : null;

            return (
              <li key={n.id} className="arch-step">
                {inEdge ? (
                  <span
                    className={
                      "arch-edge" +
                      (inScope(n.id) && inScope(nodes[i - 1].id) ? "" : " is-muted") +
                      (edgeId === focusEdge ? " is-live" : "") +
                      (edgeId === errEdge ? " is-error" : "")
                    }
                  >
                    <span className="arch-edge-line" aria-hidden="true" />
                    <span className="arch-edge-label">{edgeLabels[edgeId] || inEdge.label}</span>
                  </span>
                ) : null}

                <button
                  type="button"
                  className={
                    "arch-node" +
                    (inScope(n.id) ? "" : " is-muted") +
                    (n.id === selectedNode ? " is-selected" : "") +
                    (n.id === focusNode ? " is-live" : "") +
                    (n.id === errNode ? " is-error" : "")
                  }
                  aria-pressed={n.id === selectedNode}
                  onClick={() => onSelectNode(n.id)}
                >
                  <span className="arch-node-role">{n.role}</span>
                  <span className="arch-node-name">{n.name}</span>
                  {!inScope(n.id) ? (
                    <span className="arch-node-scope">이번 Chapter 범위 밖</span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ol>

        {/* 23_INTERACTIVE_LEARNING_UX §1 — 관리 축과 실행 환경은 Runtime 경로와 분리해서 보여 준다.
            Beginner Rule (CLAUDE.md §4) — 이번 Chapter와 관계없는 별도 축은 항상 크게 펼쳐 두지 않는다.
            단 Mental Model 자체는 삭제하지 않고 접어서 언제든 열 수 있게 남긴다. */}
        {axisFocus.length ? (
          <div className="arch-aside">{aside}</div>
        ) : (
          <div className="arch-aside-fold">
            <Disclosure
              tone="quiet"
              label="이 요청과 별개인 개발 도구 보기"
              note="코드와 기록을 관리하는 축, 실행 환경을 만드는 축 — 요청이 지나가는 길은 아닙니다."
            >
              <div className="arch-aside">{aside}</div>
            </Disclosure>
          </div>
        )}

        <p className="arch-legend">
          <span className="arch-legend-item"><i className="dot dot--live" aria-hidden="true" />지금 단계</span>
          <span className="arch-legend-item"><i className="dot dot--selected" aria-hidden="true" />선택한 곳</span>
          <span className="arch-legend-item"><i className="dot dot--error" aria-hidden="true" />오류 지점</span>
          {hasMuted ? (
            <span className="arch-legend-item"><i className="dot dot--muted" aria-hidden="true" />이번 Chapter 범위 밖</span>
          ) : null}
        </p>

        {/* 한글 역할이 먼저, 기술 이름은 그 뒤 (CLAUDE.md) */}
        <div className="arch-detail" aria-live="polite">
          {detail ? (
            <>
              <p>
                <strong>{detail.role}</strong>
                <span className="arch-detail-role">{detail.name}</span>
                {detail.desc}
                {detail.code && onShowCode && !detailNote ? (
                  <button type="button" className="btn btn--sm" onClick={() => onShowCode(detail.code)}>
                    관련 코드 보기
                  </button>
                ) : null}
              </p>
              {detailNote ? <p className="arch-detail-scope">{detailNote}</p> : null}
            </>
          ) : (
            <p className="arch-detail-empty">위 상자를 누르면 무슨 일을 하는 곳인지 설명이 나옵니다.</p>
          )}
        </div>

        <p className="arch-note">
          응답은 같은 길을 반대 방향으로 돌아옵니다.
          코드 기록 도구와 실행 환경 도구는 이 요청이 지나가는 길과는 별개입니다.
        </p>
      </div>
    </section>
  );
}
