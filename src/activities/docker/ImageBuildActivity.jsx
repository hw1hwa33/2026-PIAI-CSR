import { useCallback, useEffect, useRef, useState } from "react";
import Disclosure from "../../components/common/Disclosure.jsx";
import {
  LINES,
  BUILD_ORDER,
  ORDER_NOTES,
  DOCKERFILE_PATH,
  BUILD_CMD,
  IMAGE_TAG,
  lineOf,
  layersOf,
  buildOutput
} from "../../data/dockerfile.js";

/*
 * Chapter 07 Primary Visualization — Guided Build
 * (11_PROJECT_UI_SPEC §26 — Chapter 07)
 *
 * 순서 맞히기 Puzzle 이 아니다. (CLAUDE.md — Activity 는 평가 도구가 아니다)
 *   [다음 줄 보기] 를 누르면 실제 Dockerfile 순서대로 한 줄씩 나타나고,
 *   그때마다 "이 줄이 무엇을 하는지"와 "이미지에 무엇이 추가됐는지"를 함께 본다.
 *   정답을 맞혀야 진행되는 구조를 두지 않는다.
 *
 * 순서를 바꾸면 어떻게 되는지는 접힌 심화 안에서만 설명한다.
 */
export default function ImageBuildActivity({
  activity,
  selectedNode,
  onSelectNode,
  onOutcome,
  onFocus,
  onComplete,
  onNotify
}) {
  const [step, setStep] = useState(0);          // 지금까지 나타난 줄 수
  const [built, setBuilt] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => { onFocus({ node: null, edge: null }); }, [onFocus]);

  const placed = BUILD_ORDER.slice(0, step);
  const layers = layersOf(placed);
  const allShown = step >= BUILD_ORDER.length;
  const current = step > 0 ? lineOf(BUILD_ORDER[step - 1]) : null;
  const next = allShown ? null : lineOf(BUILD_ORDER[step]);

  const showNext = useCallback(() => {
    if (allShown) return;
    setStep((s) => s + 1);
    if (selectedNode !== "docker") onSelectNode("docker");
  }, [allShown, selectedNode, onSelectNode]);

  const build = () => {
    setBuilt(true);
    onNotify("설명서대로 이미지를 만들었습니다");
  };

  useEffect(() => {
    if (!built || doneRef.current) return;
    doneRef.current = true;
    onOutcome({
      status: "success",
      title: "설명서 한 장이 이미지가 되었습니다",
      text:
        `${DOCKERFILE_PATH}의 각 줄이 위에서 아래로 실행되어 ${IMAGE_TAG} 이미지가 되었습니다. ` +
        "이미지는 아직 실행된 것이 아닙니다. 실행하면 그때 컨테이너가 됩니다. " +
        "Chapter 08에서는 이렇게 만든 것을 여러 개 함께 띄웁니다."
    });
    onComplete();
  }, [built, onOutcome, onComplete]);

  const reset = () => {
    doneRef.current = false;
    setStep(0);
    setBuilt(false);
    onOutcome(null);
    onNotify("처음부터 다시 봅니다");
  };

  return (
    <section className="section" aria-labelledby="activity-heading">
      <h2 className="section-title" id="activity-heading">{activity.title}</h2>
      {activity.guide ? <p className="section-desc">{activity.guide}</p> : null}

      <div className="panel activity-panel">
        <p className="sim-notice" role="note">
          <span className="tag tag--warn">학습용 시뮬레이션</span>
          <span className="sim-notice-title">설명서 한 줄씩 따라가기</span>
          <span className="sim-notice-body">
            실제 build를 실행하지 않습니다. 줄이 하나씩 나타날 때마다 이미지에 무엇이 쌓이는지 보여 줍니다.
          </span>
        </p>

        {/* ---------- 지금 나온 줄 ---------- */}
        <div className="guided">
          <p className="guided-head">
            <span className="guided-step">
              {step === 0 ? "시작 전" : `${step}번째 줄`}
            </span>
            <span className="guided-task">
              {current ? current.goal : "아직 아무 줄도 없습니다. 첫 줄부터 봅니다."}
            </span>
          </p>
          {current ? (
            <>
              <pre className="code-focus-lines"><code>{current.text}</code></pre>
              <p className="guided-why">{current.why}</p>
            </>
          ) : null}

          <p className="guided-actions">
            {!allShown ? (
              <button type="button" className="btn btn--primary" onClick={showNext}>
                다음 줄 보기
              </button>
            ) : (
              <button type="button" className="btn btn--primary" onClick={build} disabled={built}>
                {built ? "이미지 생성됨" : BUILD_CMD}
              </button>
            )}
            {next ? <span className="guided-dir">다음: {next.goal}</span> : null}
            {step > 0 ? (
              <button type="button" className="btn btn--sm" onClick={reset}>처음부터</button>
            ) : null}
          </p>
        </div>

        {/* ---------- Dockerfile 본문 + 쌓이는 층 ---------- */}
        <div className="dockerfile-board">
          <div className="dockerfile-pane">
            <p className="dockerfile-head">
              <span className="dockerfile-path">{DOCKERFILE_PATH}</span>
            </p>
            <pre className="dockerfile-code"><code>
              {placed.length === 0 ? (
                <span className="dockerfile-empty">아직 비어 있습니다. 다음 줄 보기를 눌러 보세요.</span>
              ) : (
                placed.map((id, i) => (
                  <span className={"dockerfile-line" + (i === placed.length - 1 ? " is-new" : "")} key={id}>
                    {lineOf(id).text}
                  </span>
                ))
              )}
            </code></pre>
          </div>

          <div className="layer-pane">
            <p className="layer-head">이미지에 쌓인 것</p>
            <ul className="layer-stack">
              {layers.length === 0 ? (
                <li className="layer-empty">아직 아무것도 쌓이지 않았습니다.</li>
              ) : (
                layers.slice().reverse().map((l, i) => (
                  <li
                    className={"layer-item" + (l.meta ? " is-meta" : "") + (i === 0 ? " is-new" : "")}
                    key={l.id}
                  >
                    <span className="layer-n">{l.n}</span>
                    <span className="layer-label">{l.label}</span>
                    {l.meta ? <span className="layer-tag">쌓이지 않는 설정</span> : null}
                  </li>
                ))
              )}
            </ul>
            <p className="layer-foot">
              한 겹씩 아래에서 위로 쌓입니다. EXPOSE와 CMD는 파일을 더하지 않는 설정이라 겹으로 남지 않습니다.
            </p>
          </div>
        </div>

        {/* ---------- 전체 줄 목록 (자유 확인용) ---------- */}
        <Disclosure
          tone="quiet"
          label="일곱 줄을 한눈에 보기"
          note="지금까지 나온 줄과 앞으로 나올 줄을 함께 봅니다."
        >
          <ul className="line-list">
            {LINES.map((l) => {
              const shown = placed.includes(l.id);
              return (
                <li className={"line-option" + (shown ? " is-shown" : "")} key={l.id}>
                  <code className="line-code">{l.text}</code>
                  <span className="line-goal">{l.goal}</span>
                  {!shown ? <span className="line-later">아직</span> : null}
                </li>
              );
            })}
          </ul>
        </Disclosure>

        {/* ---------- 순서를 바꾸면 (심화) ---------- */}
        <Disclosure
          tone="advanced"
          label="순서를 바꾸면 어떻게 될까?"
          note="지금 몰라도 됩니다. 궁금할 때만 열어 보세요."
        >
          {ORDER_NOTES.map((n) => (
            <p className="concept-advanced-p" key={n.id}>
              <strong>{n.title}</strong> {n.body}
            </p>
          ))}
        </Disclosure>

        {built ? (
          <div className="cmd-result" aria-live="polite">
            <p className="cmd-output-head">
              <span className="cmd-output-label">
                학습용 시뮬레이션 결과 — 실제 docker가 출력한 내용이 아닙니다.
              </span>
            </p>
            <pre className="cmd-output"><code>
              <span className="cmd-echo">
                <span className="cmd-echo-prompt">{"~/student-web $ "}</span>
                {BUILD_CMD}
              </span>
              {"\n" + buildOutput(placed)}
            </code></pre>
          </div>
        ) : null}

        <p className="map-foot">
          설명서는 Dockerfile, 그 설명서로 만든 틀은 Image, 그 틀로 실행된 하나는 Container입니다.
        </p>
      </div>
    </section>
  );
}
