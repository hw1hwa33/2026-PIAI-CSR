/*
 * 아키텍처 Single Source of Truth.
 * Runtime : USER → Browser/Frontend → Nginx → Flask API → MySQL (응답은 반대 방향)
 * 관리 축 : Local Git ↔ GitHub          실행 환경 : Docker / Docker Compose
 * GitHub 와 Docker 는 HTTP 요청이 통과하는 계층으로 표현하지 않는다.
 */

/*
 * role 이 Primary, name(기술 이름)이 Secondary 다. (CLAUDE.md §4 Beginner Label 우선순위)
 * 초보자는 "Nginx"를 몰라도 "서비스 입구"만 읽고 흐름을 따라갈 수 있어야 한다.
 */
export const NODES = [
  { id: "user", name: "USER", role: "사람", desc: "버튼을 누르는 사용자", axis: "runtime" },
  { id: "browser", name: "Browser / Frontend", role: "화면", desc: "요청을 만들고 받은 JSON으로 화면을 다시 그린다", axis: "runtime", code: "frontend" },
  { id: "nginx", name: "Nginx", role: "서비스 입구", desc: "주소를 보고 / 는 화면으로, /api/ 는 Backend로 보낸다", axis: "runtime", code: "nginx" },
  { id: "flask", name: "Flask API", role: "요청 처리", desc: "주소에 맞는 함수를 실행하고 JSON을 만든다", axis: "runtime", code: "backend" },
  { id: "mysql", name: "MySQL", role: "데이터 저장", desc: "데이터가 실제로 저장된 곳 · SQL로 조회한다", axis: "runtime", code: "database" },

  { id: "local-git", name: "Local Git", role: "내 컴퓨터의 기록", desc: "내 컴퓨터의 변경 이력", axis: "manage" },
  { id: "github", name: "GitHub", role: "인터넷에 둔 기록", desc: "원격 저장소 · 협업", axis: "manage" },
  { id: "docker", name: "Docker / Compose", role: "실행 환경", desc: "위 서비스들을 담아 함께 띄운다", axis: "env" }
];

/*
 * 기본 지도는 기술 구현 상세가 아니라 역할 흐름을 보여 준다.
 * proxy_pass · SQL · JSON 같은 구현 문자열은 그 Chapter 에서만 Detail 로 덮어쓴다.
 * (chapter.architecture.edgeLabels 로 Chapter 별 override)
 */
export const EDGES = [
  { id: "user-browser", from: "user", to: "browser", label: "클릭", dir: "req" },
  { id: "browser-nginx", from: "browser", to: "nginx", label: "요청", dir: "req" },
  { id: "nginx-flask", from: "nginx", to: "flask", label: "전달", dir: "req" },
  { id: "flask-mysql", from: "flask", to: "mysql", label: "데이터 요청", dir: "req" },
  { id: "mysql-flask", from: "mysql", to: "flask", label: "결과", dir: "res" },
  { id: "flask-nginx", from: "flask", to: "nginx", label: "응답", dir: "res" },
  { id: "nginx-browser", from: "nginx", to: "browser", label: "응답", dir: "res" },

  { id: "local-github", from: "local-git", to: "github", label: "올리기 / 받기", dir: "manage" }
];

/* Runtime 요청이 지나가는 순서 — ArchitectureSection 이 한 줄로 그린다. */
export const RUNTIME_PATH = ["user", "browser", "nginx", "flask", "mysql"];

export const getNode = (id) => NODES.find((n) => n.id === id) || null;
export const getEdge = (id) => EDGES.find((e) => e.id === id) || null;

export default { NODES, EDGES, RUNTIME_PATH, getNode, getEdge };
