import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProcessScene from "./ProcessScene.jsx";
import useMediaQuery from "../../hooks/useMediaQuery.js";
import { getNode } from "../../data/architecture.js";

/*
 * PROCESS_ANIMATION_SPEC.md 준수 담당.
 *   §8.1 기본 = Step Mode          ← 이전 | STEP n / 11 | 다음 →
 *   §8.2 보조 = Play Once          ▶ 전체 흐름 보기 · 끝나면 멈춤 · 무한 반복 없음
 *   §10.3 Node 선택                Computer / Nginx / Flask / MySQL
 *   §10.4 자동 재생 중 사용자 조작 시 즉시 중지
 *   §9   Reduced Motion 이면 Play Once 를 쓰지 않고 단계 강조로 전달
 *
 * ProcessScene 은 장면 렌더링만, 이 컴포넌트는 Process State / Controls / Description /
 * Result Preview 책임만 가진다. (11_PROJECT_UI_SPEC §25)
 */
export default function ProcessActivity({
  activity,
  motionOn,
  selectedNode,
  onSelectNode,
  onOutcome,
  onFocus,
  onComplete,
  onLocate,
  onNotify
}) {
  const steps = activity.steps || [];
  const student = activity.student || { id: "-", name: "-", score: 0 };
  const narrow = useMediaQuery("(max-width: 768px)");
  const last = steps.length - 1;

  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef(null);

  const index = Math.min(i, Math.max(0, last));
  const step = steps[index] || { title: "", text: "", ui: "initial" };

  /* 지금까지 지나온 서버 계층 — Scene 의 is-done 표시 */
  const visited = useMemo(
    () => steps.slice(0, index + 1).map((s) => s.visit).filter(Boolean),
    [steps, index]
  );

  const stopPlay = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setPlaying(false);
  }, []);

  /* 현재 단계를 아키텍처 지도에 알린다 */
  useEffect(() => {
    onFocus({ node: step.node || null, edge: step.edge || null });
  }, [onFocus, step.node, step.edge]);

  /* 마지막 단계에 도달하면 결과를 만들고 Chapter 를 완료 처리한다 */
  useEffect(() => {
    if (!step.done) return;
    onOutcome({
      status: "success",
      title: "요청 한 건이 끝까지 다녀왔습니다",
      text:
        "클릭 → 요청 생성 → Nginx → Flask → MySQL → JSON 응답 → 화면 변경 순서로 진행되었습니다. " +
        "같은 데이터가 단계마다 다른 형태로 바뀐 점을 확인하세요.",
      rows: [
        { label: "① HTTP Request", value: `GET /api/students/${student.id}`, node: "browser" },
        { label: "② 길 안내", value: "Nginx → http://backend:5000", node: "nginx" },
        { label: "③ 처리", value: `get_student(student_id=${student.id})`, node: "flask" },
        {
          label: "④ SQL Query",
          value: `SELECT id, name, score FROM students WHERE id = ${student.id}`,
          node: "mysql"
        },
        {
          label: "⑤ DB Result",
          value: `${student.id} | ${student.name} | ${student.score}`,
          node: "mysql"
        },
        { label: "⑥ 화면 표시", value: `${student.name} · ${student.score}점`, node: "browser" }
      ],
      raw:
        "HTTP/1.1 200 OK\n" +
        "Content-Type: application/json\n\n" +
        JSON.stringify({ id: student.id, name: student.name, score: student.score }, null, 2)
    });
    onComplete();
  }, [step.done, onOutcome, onComplete, student.id, student.name, student.score]);

  /* §8.2 Play Once — 한 번 재생하고 마지막 단계에서 멈춘다 (무한 반복 없음) */
  useEffect(() => {
    if (!playing) return undefined;
    if (index >= last) {
      setPlaying(false);
      return undefined;
    }
    timerRef.current = setTimeout(() => {
      setI((n) => Math.min(last, n + 1));
    }, steps[index]?.hold || 700);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [playing, index, last, steps]);

  useEffect(() => stopPlay, [stopPlay]);

  /* §10.4 사용자가 직접 조작하면 자동 재생을 즉시 중지한다 */
  const go = useCallback(
    (next) => {
      stopPlay();
      if (next < 0 || next > last) return;
      if (next < index) onOutcome(null);
      setI(next);
    },
    [stopPlay, last, index, onOutcome]
  );

  const pickNode = useCallback(
    (id) => {
      stopPlay();
      onSelectNode(id);
    },
    [stopPlay, onSelectNode]
  );

  const play = useCallback(() => {
    if (playing) {
      stopPlay();
      return;
    }
    onOutcome(null);
    setI(0);
    setPlaying(true);
  }, [playing, stopPlay, onOutcome]);

  const reset = useCallback(() => {
    stopPlay();
    onOutcome(null);
    setI(0);
    onNotify("처음 단계로 돌아갔습니다");
  }, [stopPlay, onOutcome, onNotify]);

  const onKey = (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
  };

  const detail = selectedNode ? getNode(selectedNode) : null;

  return (
    <section className="section" aria-labelledby="activity-heading">
      <h2 className="section-title" id="activity-heading">{activity.title}</h2>
      {activity.guide ? <p className="section-desc">{activity.guide}</p> : null}

      <div className="panel activity-panel">
        {activity.mockNote ? (
          <p className="learn-note" role="note">
            <span className="tag">학습용</span>
            {activity.mockNote}
          </p>
        ) : null}

        <div className="scene-wrap" onKeyDown={onKey}>
          <ProcessScene
            step={step}
            student={student}
            narrow={narrow}
            visited={visited}
            selectedNode={selectedNode}
            onSelectNode={pickNode}
          />
        </div>

        {/* §10.3 선택한 Node 의 역할 설명 + 관련 코드로 이동 */}
        <div className="node-detail" aria-live="polite">
          {detail ? (
            <p>
              <strong>{detail.role}</strong>
              <span className="node-detail-role">{detail.name}</span>
              {detail.desc}
              <button type="button" className="btn btn--sm" onClick={() => onLocate(detail.id)}>
                지도에서 보기
              </button>
            </p>
          ) : (
            <p className="node-detail-empty">
              장면 안의 상자를 누르면 그곳이 무슨 일을 하는지 설명이 나옵니다.
            </p>
          )}
        </div>

        {/* §8.1 단계 설명 — 단계마다 설명·데이터 상태가 함께 바뀐다 */}
        <div className="step-info" aria-live="polite">
          <p className="step-count">
            STEP {index} / {last} · <span className="step-id">{step.id}</span>
          </p>
          <h3 className="step-title">{step.title}</h3>
          <p className="step-text">{step.text}</p>
          {step.preview ? (
            <p className="step-preview">
              <span className="step-preview-label">{step.preview.label}</span>
              <code className="step-preview-value">{step.preview.value}</code>
            </p>
          ) : null}
        </div>

        <div className="step-controls">
          <button type="button" className="btn" onClick={() => go(index - 1)} disabled={index === 0}>
            ← 이전
          </button>

          <ol className="step-dots" aria-hidden="true">
            {steps.map((s, si) => (
              <li
                key={s.id}
                className={"step-dot" + (si === index ? " is-active" : "") + (si < index ? " is-done" : "")}
              />
            ))}
          </ol>

          <button
            type="button"
            className="btn btn--primary"
            onClick={() => go(index + 1)}
            disabled={index === last}
          >
            다음 →
          </button>
        </div>

        <div className="step-foot">
          <button
            type="button"
            className={"btn btn--sm" + (playing ? " is-playing" : "")}
            aria-pressed={playing}
            onClick={play}
          >
            {playing ? "■ 재생 멈춤" : "▶ 전체 흐름 보기"}
          </button>
          <button type="button" className="btn btn--sm" onClick={reset} disabled={index === 0 && !playing}>
            처음으로
          </button>
          <span className="step-foot-note">
            {playing ? "자동 재생 중 — 조작하면 즉시 멈춥니다" : "← → 방향키로도 이동할 수 있습니다"}
          </span>
        </div>
      </div>
    </section>
  );
}
