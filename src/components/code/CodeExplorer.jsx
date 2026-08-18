import { useEffect, useState } from "react";
import useClipboard from "../../hooks/useClipboard.js";

/*
 * 11_PROJECT_UI_SPEC §18 Code UX — 모든 Code Block 은
 *   파일명 · 언어 · 코드 · 한 줄 목적 · "이 코드의 위치 보기" · "코드 복사" 를 가진다.
 * Copy State: idle → copying → copied (실패 시 copy_error)
 * focusNode 가 바뀌면 해당 Node 의 코드 파일 탭으로 전환한다. (§13 Linked Interaction)
 *
 * Beginner Code UX (CLAUDE.md §5)
 *   완전 초보자에게 전체 파일 코드를 첫 노출하지 않는다.
 *     1) 이번 Chapter에서 볼 한두 줄  →  2) 쉬운 설명  →  3) [전체 코드 보기 ▾]
 *   chapter.codeFocus 가 있으면 그 줄만 먼저 보이고, 전체 파일 탐색은 접힌 채로 시작한다.
 *   지도에서 "관련 코드 보기"로 들어오면 접힘을 자동으로 연다 — 링크가 헛돌지 않게 한다.
 *   chapter.codeIntro 로 Chapter 마다 다른 안내 문구를 데이터에서 받는다.
 */
export default function CodeExplorer({ chapter, focusNode, onLocate, onNotify, codeRef }) {
  const files = chapter.code || [];
  const focus = chapter.codeFocus || null;
  const [active, setActive] = useState(0);
  const [copyState, setCopyState] = useState("idle");
  /* focus 가 있으면 전체 코드는 접힌 상태에서 시작한다 */
  const [showAll, setShowAll] = useState(!focus);
  const copy = useClipboard();

  const focusId = focusNode ? focusNode.file : null;

  useEffect(() => {
    if (!focusId) return;
    const i = files.findIndex((f) => f.id === focusId);
    if (i >= 0) {
      setActive(i);
      setShowAll(true);
    }
  }, [focusId, focusNode, files]);

  useEffect(() => {
    if (copyState !== "copied" && copyState !== "copy_error") return undefined;
    const t = setTimeout(() => setCopyState("idle"), 1600);
    return () => clearTimeout(t);
  }, [copyState]);

  /* Chapter 03 처럼 Activity 의 File Preview 가 코드 경험을 담당하는 경우,
     같은 코드를 두 번 노출하지 않도록 이 섹션을 렌더하지 않는다. */
  if (chapter.codeInActivity) return null;

  if (!files.length) {
    return (
      <section className="section" aria-labelledby="code-heading" ref={codeRef}>
        <h2 className="section-title" id="code-heading">실제 프로젝트에서는</h2>
        <p className="placeholder-note">이 Chapter의 코드 예시는 아직 준비 중입니다.</p>
      </section>
    );
  }

  const file = files[Math.min(active, files.length - 1)];
  const source = file.lines.map((l) => l.t).join("\n");
  const mainNode = (file.lines.find((l) => l.node) || {}).node || null;

  const onCopy = async () => {
    setCopyState("copying");
    const ok = await copy(source);
    setCopyState(ok ? "copied" : "copy_error");
    onNotify(ok ? `${file.name} 코드를 복사했습니다` : "복사하지 못했습니다", ok ? "ok" : "error");
  };

  const copyFocus = async () => {
    const ok = await copy(focus.lines.join("\n"));
    onNotify(ok ? "코드를 복사했습니다" : "복사하지 못했습니다", ok ? "ok" : "error");
  };

  const copyLabel =
    copyState === "copying" ? "복사 중…"
      : copyState === "copied" ? "복사됨 ✓"
      : copyState === "copy_error" ? "복사 실패"
      : "코드 복사";

  return (
    <section className="section" aria-labelledby="code-heading" ref={codeRef}>
      <h2 className="section-title" id="code-heading">실제 프로젝트에서는</h2>
      {chapter.codeIntro ? <p className="section-desc">{chapter.codeIntro}</p> : null}

      {/* ---------- 방금 본 동작과 연결된 코드 (1~5줄) ---------- */}
      {focus ? (
        <div className="code-focus">
          <p className="code-focus-label">방금 본 동작은 이 코드와 연결됩니다</p>
          <pre className="code-focus-lines"><code>{focus.lines.join("\n")}</code></pre>
          <p className="code-focus-say">{focus.say}</p>
          <p className="code-focus-file">
            {focus.path}
            {focus.node ? (
              <button type="button" className="btn btn--sm" onClick={() => onLocate(focus.node)}>
                이 코드의 위치 보기
              </button>
            ) : null}
            <button type="button" className="btn btn--sm" onClick={copyFocus}>이 줄 복사</button>
          </p>
        </div>
      ) : null}

      {/* ---------- 전체 코드 (Progressive Disclosure) ---------- */}
      {focus ? (
        <p className="code-more">
          <button
            type="button"
            className="btn"
            aria-expanded={showAll}
            aria-controls="code-full"
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? "실제 코드 전체 접기 ▴" : "실제 코드 전체 보기 ▾"}
          </button>
          <span className="code-more-note">
            {showAll
              ? "문법을 외울 필요는 없습니다. 위 줄이 어디에 들어 있는지만 보면 됩니다."
              : "프로그래밍 문법을 배우러 온 것이 아닙니다. 위 줄만 봐도 충분합니다."}
          </span>
        </p>
      ) : null}

      {showAll ? (
        <div className="panel code-card" id="code-full">
          <div className="code-tabs" role="tablist" aria-label="파일 선택">
            {files.map((f, i) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                id={`code-tab-${f.id}`}
                aria-selected={i === active}
                aria-controls={`code-panel-${f.id}`}
                tabIndex={i === active ? 0 : -1}
                className={"code-tab" + (i === active ? " is-active" : "")}
                onClick={() => setActive(i)}
              >
                {f.name}
              </button>
            ))}
          </div>

          <div
            className="code-panel"
            role="tabpanel"
            id={`code-panel-${file.id}`}
            aria-labelledby={`code-tab-${file.id}`}
          >
            <div className="code-head">
              <span className="code-path">
                {file.path}
                <span className="code-lang">{file.lang}</span>
              </span>
              <span className="code-actions">
                {mainNode ? (
                  <button type="button" className="btn btn--sm" onClick={() => onLocate(mainNode)}>
                    이 코드의 위치 보기
                  </button>
                ) : null}
                <button
                  type="button"
                  className={"btn btn--sm code-copy is-" + copyState}
                  onClick={onCopy}
                  disabled={copyState === "copying"}
                >
                  {copyLabel}
                </button>
              </span>
            </div>

            {file.desc ? <p className="code-desc">{file.desc}</p> : null}

            <ol className="code-lines">
              {file.lines.map((line, i) => (
                <li key={`${file.id}-${i}`} className="code-line">
                  <span className="code-lineno" aria-hidden="true">{i + 1}</span>
                  {line.node ? (
                    <button
                      type="button"
                      className="code-text code-text--link"
                      onClick={() => onLocate(line.node)}
                      title="지도에서 위치 보기"
                    >
                      <code>{line.t}</code>
                      <span className="code-locate" aria-hidden="true">위치 보기</span>
                    </button>
                  ) : (
                    <span className="code-text"><code>{line.t || " "}</code></span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : null}
    </section>
  );
}
