import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PROJECT_ROOT,
  PROJECT_ENTRIES,
  MATCHABLE,
  getTarget,
  previewsOf
} from "../../data/project.js";
import useClipboard from "../../hooks/useClipboard.js";

/*
 * Chapter 03 Primary Visualization — Folder Tree 자유 탐색
 * (11_PROJECT_UI_SPEC §26 / 22_CHAPTER_CURRICULUM Ch03)
 *
 * 여기서 보는 것은 "폴더 분리가 시스템의 역할 분리와 대응한다" 는 점 하나다.
 *
 * 짝 맞히기가 아니다. (CLAUDE.md — Activity 는 평가 도구가 아니다)
 *   폴더를 누르면 즉시 역할 · 대응 위치 · 왜 거기인지 · 안의 파일 · 짧은 코드가 나온다.
 *   사용자가 위치를 맞혀야 다음으로 갈 수 있는 구조를 두지 않는다.
 *   여러 폴더를 자유롭게 눌러 비교하는 것이 이 Activity 의 전부다.
 *
 * Docker Compose 와 .env 는 실행 환경 축으로만 표시하고
 * 요청이 지나가는 Hop 으로 표현하지 않는다.
 */
export default function FolderMapActivity({
  activity,
  selectedNode,
  onSelectNode,
  onOutcome,
  onFocus,
  onComplete,
  onLocate,
  onNotify
}) {
  const [openId, setOpenId] = useState("frontend");
  /* 어떤 폴더를 열어 봤는지만 기억한다 — 점수가 아니라 "또 볼 것"을 안내하려는 용도다 */
  const [seen, setSeen] = useState({ frontend: true });
  const [fileId, setFileId] = useState(null);
  const [copyState, setCopyState] = useState("idle");
  const doneRef = useRef(false);
  const copy = useClipboard();

  const entry = PROJECT_ENTRIES.find((e) => e.id === openId) || PROJECT_ENTRIES[0];

  /* 대표 예제 코드가 있는 파일들 — 항목이 바뀌면 첫 파일을 연다 */
  const previews = previewsOf(entry);
  const file = previews.find((p) => p.id === fileId) || previews[0] || null;

  useEffect(() => {
    if (copyState !== "copied" && copyState !== "copy_error") return undefined;
    const t = setTimeout(() => setCopyState("idle"), 1600);
    return () => clearTimeout(t);
  }, [copyState]);

  const onCopy = useCallback(async () => {
    if (!file) return;
    setCopyState("copying");
    const done = await copy(file.code);
    setCopyState(done ? "copied" : "copy_error");
    onNotify(done ? `${file.name} 코드를 복사했습니다` : "복사하지 못했습니다", done ? "ok" : "error");
  }, [file, copy, onNotify]);
  const target = entry.target ? getTarget(entry.target) : null;

  /* 아직 열어 보지 않은 폴더를 한 개만 넌지시 권한다. 점수도 목표도 아니다. */
  const nextToOpen = useMemo(
    () => PROJECT_ENTRIES.find((e) => !seen[e.id]) || null,
    [seen]
  );

  /* 항목을 고르면 대응 위치를 지도에 바로 알린다. 실행 환경 축은 요청 단계가 아니므로 focus 를 비운다. */
  const pickEntry = useCallback(
    (e) => {
      setOpenId(e.id);
      setFileId(null);
      setCopyState("idle");
      setSeen((prev) => (prev[e.id] ? prev : { ...prev, [e.id]: true }));

      const t = e.target ? getTarget(e.target) : null;
      onFocus({ node: t && t.axis === "runtime" ? t.node : null, edge: null });
      if (t && selectedNode !== t.node) onSelectNode(t.node);
    },
    [onFocus, onSelectNode, selectedNode]
  );

  /* 요청이 지나가는 네 자리를 모두 한 번씩 열어 보면 정리를 보여 준다 — 통과 판정이 아니다 */
  const runtimeSeen = MATCHABLE.filter((e) => {
    const t = getTarget(e.target);
    return t && t.axis === "runtime" && seen[e.id];
  }).length;

  useEffect(() => {
    if (runtimeSeen < 4 || doneRef.current) return;
    doneRef.current = true;
    onOutcome({
      status: "success",
      title: "폴더 이름이 곧 시스템에서의 자리였습니다",
      text:
        "폴더를 나눈 것은 정리 때문이 아니라, 역할이 다른 프로그램이라 따로 실행되고 " +
        "따로 고쳐지기 때문입니다. compose.yaml 과 .env 는 그 프로그램들을 실행하는 환경 쪽입니다.",
      rows: MATCHABLE.map((e) => {
        const t = getTarget(e.target);
        return {
          label: e.name,
          value: t.label,
          node: t.axis === "runtime" ? t.node : null
        };
      }),
      raw: [PROJECT_ROOT, ...PROJECT_ENTRIES.map((e) => `├─ ${e.name}`)].join("\n")
    });
    onComplete();
  }, [runtimeSeen, onOutcome, onComplete]);

  return (
    <section className="section" aria-labelledby="activity-heading">
      <h2 className="section-title" id="activity-heading">{activity.title}</h2>
      {activity.guide ? <p className="section-desc">{activity.guide}</p> : null}

      <div className="panel activity-panel">
        {/* 점수 대신, 아직 안 열어 본 것 하나만 넌지시 권한다 */}
        <p className="explore-hint" aria-live="polite">
          {nextToOpen
            ? <>왼쪽에서 아무 폴더나 눌러 보세요. <code>{nextToOpen.name}</code> 는 아직 열어 보지 않았습니다.</>
            : "여덟 항목을 모두 열어 봤습니다. 다시 눌러 비교해 봐도 됩니다."}
        </p>

        <div className="folder-map">
          {/* ---------- Folder Tree ---------- */}
          <div className="tree">
            <p className="tree-root">{PROJECT_ROOT}</p>
            <ul className="tree-list">
              {PROJECT_ENTRIES.map((e, i) => {
                const last = i === PROJECT_ENTRIES.length - 1;
                const active = e.id === entry.id;
                const t = e.target ? getTarget(e.target) : null;
                return (
                  <li className="tree-item" key={e.id}>
                    <button
                      type="button"
                      className={
                        "tree-row" +
                        (active ? " is-active" : "") +
                        (seen[e.id] ? " is-solved" : "") +
                        (e.matchable === false ? " is-info" : "")
                      }
                      aria-current={active ? "true" : undefined}
                      onClick={() => pickEntry(e)}
                    >
                      <span className="tree-branch" aria-hidden="true">{last ? "└─" : "├─"}</span>
                      <span className={"tree-name is-" + e.kind}>{e.name}</span>
                      {/* 정답 표시가 아니라 그 폴더의 역할을 바로 옆에 적어 둔다 */}
                      <span className="tree-role">{t ? t.label : "참고 파일"}</span>
                    </button>

                    {active && e.files ? (
                      <ul className="tree-children">
                        {e.files.map((f) => (
                          <li className="tree-child" key={f.id}>
                            <span className="tree-child-branch" aria-hidden="true">│&nbsp;&nbsp;</span>
                            {f.code ? (
                              <button
                                type="button"
                                className={"tree-file" + (file && file.id === f.id ? " is-open" : "")}
                                aria-pressed={!!(file && file.id === f.id)}
                                onClick={() => { setFileId(f.id); setCopyState("idle"); }}
                              >
                                {f.name}
                              </button>
                            ) : (
                              <span className="tree-file-note">{f.name} · {f.note}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* ---------- 선택한 항목 + 매칭 ---------- */}
          <div className="map-detail" aria-live="polite">
            <p className="map-detail-head">
              <code className="map-detail-name">{entry.name}</code>
              <span className="map-detail-role">{entry.role}</span>
            </p>
            <p className="map-detail-why">{entry.why}</p>

            {entry.change ? <p className="map-detail-change">{entry.change}</p> : null}
            {entry.misread ? (
              <p className="map-detail-misread">
                <span className="tag tag--warn">자주 하는 오해</span>
                {entry.misread}
              </p>
            ) : null}

            {/* 맞히게 하지 않는다 — 누르면 바로 어디에 해당하는지 보여 준다 (CLAUDE.md) */}
            {entry.matchable === false ? (
              <p className="map-detail-note">
                {entry.axis === "manage"
                  ? "이 파일은 요청이 지나가는 길이 아니라, 코드 변경을 기록하는 쪽에 속합니다."
                  : "이 파일은 특정 계층에 속하지 않는 설명 문서입니다."}
              </p>
            ) : target ? (
              <p className="map-answer is-shown">
                <span className="tag">시스템에서의 자리</span>
                <strong>{target.label}</strong>
                <span className="map-answer-axis">
                  {target.axis === "runtime" ? "요청이 지나가는 길 위" : "실행 환경 · 요청이 지나가는 길이 아님"}
                </span>
                {target.axis === "runtime" ? (
                  <button type="button" className="btn btn--sm" onClick={() => onLocate(target.node)}>
                    지도에서 보기
                  </button>
                ) : null}
              </p>
            ) : null}

            {/* ---------- File Preview — Folder → File → Code → System Role ---------- */}
            {file ? (
              <div className="file-preview">
                {previews.length > 1 ? (
                  <div className="file-tabs" role="tablist" aria-label="파일 선택">
                    {previews.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        role="tab"
                        aria-selected={p.id === file.id}
                        tabIndex={p.id === file.id ? 0 : -1}
                        className={"file-tab" + (p.id === file.id ? " is-active" : "")}
                        onClick={() => { setFileId(p.id); setCopyState("idle"); }}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="file-head">
                  <span className="file-path">
                    {file.path}
                    <span className="code-lang">{file.lang}</span>
                  </span>
                  <span className="code-actions">
                    {file.node ? (
                      <button type="button" className="btn btn--sm" onClick={() => onLocate(file.node)}>
                        지도에서 보기
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className={"btn btn--sm code-copy is-" + copyState}
                      onClick={onCopy}
                      disabled={copyState === "copying"}
                    >
                      {copyState === "copying" ? "복사 중…"
                        : copyState === "copied" ? "복사됨 ✓"
                        : copyState === "copy_error" ? "복사 실패"
                        : "코드 복사"}
                    </button>
                  </span>
                </div>

                <p className="file-purpose">{file.purpose}</p>
                {file.here ? (
                  <p className="file-here">
                    <span className="file-here-label">왜 여기에 있나</span>
                    {file.here}
                  </p>
                ) : null}

                <pre className="file-code"><code>{file.code}</code></pre>
              </div>
            ) : null}
          </div>
        </div>

        <p className="map-foot">
          compose.yaml 과 .env.example 은 요청이 지나가는 계층이 아니라
          위 서비스들을 실행하는 환경 쪽입니다. 지도에서도 별도 축으로 표시됩니다.
        </p>
      </div>
    </section>
  );
}
