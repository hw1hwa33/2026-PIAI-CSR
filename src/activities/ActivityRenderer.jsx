import ProcessActivity from "./process/ProcessActivity.jsx";
import RequestActivity from "./request/RequestActivity.jsx";
import FolderMapActivity from "./folder/FolderMapActivity.jsx";
import GitFlowActivity from "./git/GitFlowActivity.jsx";
import RemoteSyncActivity from "./remote/RemoteSyncActivity.jsx";
import EnvCompareActivity from "./docker/EnvCompareActivity.jsx";
import ImageBuildActivity from "./docker/ImageBuildActivity.jsx";
import ComposeMapActivity from "./compose/ComposeMapActivity.jsx";
import StateMachineActivity from "./frontend/StateMachineActivity.jsx";
import RouteBranchActivity from "./nginx/RouteBranchActivity.jsx";
import RouteMatchActivity from "./flask/RouteMatchActivity.jsx";
import RestMatrixActivity from "./rest/RestMatrixActivity.jsx";
import SqlTableActivity from "./sql/SqlTableActivity.jsx";
import TraceActivity from "./trace/TraceActivity.jsx";
import ProjectCompleteActivity from "./complete/ProjectCompleteActivity.jsx";

/*
 * Activity 유형을 늘리려면 컴포넌트를 만들고 아래 REGISTRY 에 등록한다.
 * ChapterPage 는 이 파일만 알고 개별 Activity 는 모른다.
 * Chapter 마다 Primary Visualization 이 달라야 한다 (11_PROJECT_UI_SPEC §26).
 * 같은 화면에 글자만 바꾸는 방식은 쓰지 않는다.
 */
const REGISTRY = {
  process: ProcessActivity,        // Ch01 — Request/Response Process Scene
  request: RequestActivity,        // Ch02 — Request Builder / Response Inspector
  folder: FolderMapActivity,       // Ch03 — Folder Tree ↔ Architecture 매칭
  git: GitFlowActivity,            // Ch04 — Working Directory → Staging → History
  remote: RemoteSyncActivity,      // Ch05 — Local ↔ GitHub ↔ 다른 컴퓨터 동기화
  "docker-env": EnvCompareActivity, // Ch06 — 두 컴퓨터 대조 + Image/Container
  dockerfile: ImageBuildActivity,  // Ch07 — Dockerfile 줄 배치 → Image Layer
  compose: ComposeMapActivity,     // Ch08 — Compose Service Map
  "react-state": StateMachineActivity, // Ch09 — State 전이 → Render
  "nginx-route": RouteBranchActivity,  // Ch10 — location 규칙 분기
  "flask-route": RouteMatchActivity,   // Ch11 — Route 표 매칭
  rest: RestMatrixActivity,        // Ch12 — Method × Resource 매트릭스
  sql: SqlTableActivity,           // Ch13 — SQL → Table Row → JSON
  trace: TraceActivity,            // Ch14 — 전체 Request→Response 추적
  complete: ProjectCompleteActivity // Ch15 — 프로젝트 완성 순환
};

export default function ActivityRenderer({ activity, ...rest }) {
  if (!activity) {
    return (
      <section className="section" aria-labelledby="activity-heading">
        <h2 className="section-title" id="activity-heading">실습</h2>
        <p className="placeholder-note">이 Chapter의 실습은 아직 준비 중입니다.</p>
      </section>
    );
  }

  const Activity = REGISTRY[activity.type];

  if (!Activity) {
    return (
      <section className="section" aria-labelledby="activity-heading">
        <h2 className="section-title" id="activity-heading">{activity.title || "실습"}</h2>
        <p className="placeholder-note">
          등록되지 않은 Activity 유형입니다: <code>{String(activity.type)}</code>
        </p>
      </section>
    );
  }

  return <Activity activity={activity} {...rest} />;
}
