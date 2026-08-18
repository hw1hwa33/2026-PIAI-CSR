import { useCallback, useRef, useState } from "react";
import ChapterHero from "./course/ChapterHero.jsx";
import WhySection from "./course/WhySection.jsx";
import ConceptSection from "./course/ConceptSection.jsx";
import ChapterSummary from "./course/ChapterSummary.jsx";
import ChapterNav from "./course/ChapterNav.jsx";
import ErrorSection from "./course/ErrorSection.jsx";
import ArchitectureSection from "./architecture/ArchitectureSection.jsx";
import CodeExplorer from "./code/CodeExplorer.jsx";
import ResultSection from "./result/ResultSection.jsx";
import ActivityRenderer from "../activities/ActivityRenderer.jsx";

/*
 * 한 화면에는 현재 Chapter 하나만 렌더링한다. (ONE CHAPTER = ONE PAGE)
 *
 * Course Identity: GUIDED INTERACTIVE EXPLORATION (CLAUDE.md)
 *   시험 · 점수 · 합격 개념이 없다. Quiz / KnowledgeCheck 구간을 두지 않는다.
 *   Chapter 이동은 언제나 자유다 — 어떤 조건으로도 잠그지 않는다.
 *
 * Story 순서
 *   Hero               이 Chapter가 무엇인지
 *   왜 이걸 보나요?      문제 상황 → 이 기술이 하는 일 → 딱 하나 볼 것
 *   직접 해보기          Activity (Activity First)
 *   방금 무슨 일이…      Activity 결과가 있을 때만
 *   지금 어디를 보고 있나  전체 시스템에서의 위치
 *   조금 더 자세히        개념 · 역할
 *   실제 프로젝트에서는    코드 (핵심 줄 먼저, 전체는 접기)
 *   문제가 생기면         오류 (기본은 접기)
 *   이것만 기억하세요      1~3문장
 *   이전 / 다음
 */
export default function ChapterPage({ chapter, total, chapters, motionOn, onSelectChapter, onNotify }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [focus, setFocus] = useState(null);
  const [errorFocus, setErrorFocus] = useState(null);
  const [outcome, setOutcome] = useState(null);
  const [codeFocus, setCodeFocus] = useState(null);
  const mapRef = useRef(null);
  const codeRef = useRef(null);

  const selectNode = useCallback((id) => {
    setErrorFocus(null);
    setSelectedNode((prev) => (prev === id ? null : id));
  }, []);

  /* §13 Linked Interaction — Node 선택 → 관련 코드 파일로 이동 */
  const showCode = useCallback((fileId) => {
    setCodeFocus({ file: fileId });
    if (codeRef.current) {
      codeRef.current.scrollIntoView({ behavior: motionOn ? "smooth" : "auto", block: "start" });
    }
  }, [motionOn]);

  const locate = useCallback((nodeId) => {
    setSelectedNode(nodeId);
    setErrorFocus(null);
    if (mapRef.current) mapRef.current.scrollIntoView({ behavior: motionOn ? "smooth" : "auto", block: "center" });
  }, [motionOn]);

  const selectError = useCallback((err) => {
    setErrorFocus((prev) => (prev && prev.id === err.id ? null : err));
    setSelectedNode(err.node);
  }, []);

  const handleFocus = useCallback((f) => {
    setFocus(f);
    if (f && f.error) setErrorFocus({ id: "activity", node: f.errorNode || f.node, edge: f.errorEdge || f.edge });
    else if (f) setErrorFocus((prev) => (prev && prev.id === "activity" ? null : prev));
  }, []);

  /*
   * Activity 가 마지막 상태에 도달했을 때 부르는 신호다.
   * 진행 기록(살펴봄)은 Chapter 를 떠날 때만 남기므로 여기서는 아무것도 하지 않는다.
   * Activity 쪽 계약(onComplete)을 유지하기 위해 안정된 빈 함수를 내려 준다.
   */
  const activityDone = useCallback(() => {}, []);

  return (
    <article className="chapter-page">
      <ChapterHero chapter={chapter} total={total} />

      <WhySection chapter={chapter} />

      <ActivityRenderer
        activity={chapter.activity}
        motionOn={motionOn}
        selectedNode={selectedNode}
        onSelectNode={selectNode}
        onOutcome={setOutcome}
        onFocus={handleFocus}
        onComplete={activityDone}
        onLocate={locate}
        onShowCode={showCode}
        onNotify={onNotify}
      />

      <ResultSection outcome={outcome} onLocate={locate} onNotify={onNotify} />

      <ArchitectureSection
        chapter={chapter}
        selectedNode={selectedNode}
        focus={focus}
        errorFocus={errorFocus}
        onSelectNode={selectNode}
        onShowCode={chapter.codeInActivity ? undefined : showCode}
        mapRef={mapRef}
      />

      <ConceptSection chapter={chapter} selectedNode={selectedNode} onSelectNode={selectNode} />

      <CodeExplorer
        chapter={chapter}
        focusNode={codeFocus}
        onLocate={locate}
        onNotify={onNotify}
        codeRef={codeRef}
      />

      <ErrorSection chapter={chapter} errorFocus={errorFocus} onSelectError={selectError} />

      <ChapterSummary chapter={chapter} />

      <ChapterNav chapter={chapter} chapters={chapters} onSelect={onSelectChapter} />
    </article>
  );
}
