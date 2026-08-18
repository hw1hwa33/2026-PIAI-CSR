/*
 * Chapter 09 — Frontend 화면 상태.
 *
 * Legacy Chapter 09 에서 상태 단계(idle → loading → success) · 코드 · 오류 2건 · summary 를 가져왔다.
 * Legacy 는 Chapter 01 과 같은 stage 진행형이라 그대로 쓰면 Process Scene 의 축소 복제가 된다.
 * 여기서는 "무엇이 일어나면 어느 상태로 가는가"를 직접 눌러 보는 상태 전이 모델로 재설계했다.
 *
 * 코드 계약: frontend/src/app.jsx · GET /api/students/1 (24_TECHNICAL_CONTENT_RULES §10)
 * 화면은 API 를 통해서만 데이터를 얻는다. Browser 가 MySQL 에 직접 붙지 않는다.
 */

export const FILE_PATH = "frontend/src/app.jsx";

export const STATES = [
  {
    id: "idle",
    label: "idle",
    ko: "대기",
    desc: "아직 아무것도 요청하지 않았다. 버튼만 있는 화면이다.",
    screen: { kind: "idle", title: "학생 성적 조회", body: "학생 번호 1", action: "조회" },
    line: "return <button onClick={() => loadStudent(1)}>학생 조회</button>;"
  },
  {
    id: "loading",
    label: "loading",
    ko: "불러오는 중",
    desc: "요청을 보냈고 아직 답을 받지 못했다. 데이터는 없지만 화면은 멈추지 않는다.",
    screen: { kind: "loading", title: "학생 성적 조회", body: "불러오는 중…" },
    line: 'setStatus("loading");'
  },
  {
    id: "success",
    label: "success",
    ko: "성공",
    desc: "받은 JSON을 상태에 넣었고, 그 상태에 맞춰 화면이 다시 그려졌다.",
    screen: { kind: "success", title: "학생 성적 조회", name: "김철수", score: "93점", sub: "학생 번호 1" },
    line: 'setStudent(await res.json()); setStatus("success");'
  },
  {
    id: "error",
    label: "error",
    ko: "실패",
    desc: "응답은 왔지만 정상 응답이 아니었다. 데이터를 넣지 않고 실패 화면을 보여 준다.",
    screen: { kind: "error", title: "학생 성적 조회", body: "학생을 찾지 못했습니다." },
    line: 'if (!res.ok) { setStatus("error"); return; }'
  }
];

export const getState = (id) => STATES.find((s) => s.id === id) || null;

/*
 * 이벤트는 사용자 행동이거나 서버의 응답이다.
 * from 에 없는 상태에서는 그 이벤트가 일어날 수 없다 — 버튼을 비활성으로 둔다.
 */
export const EVENTS = [
  {
    id: "click",
    label: "조회 버튼 누르기",
    kind: "user",
    from: ["idle", "success", "error"],
    to: "loading",
    detail:
      "loadStudent(1) 이 실행되고 곧바로 status 가 loading 으로 바뀝니다. " +
      "화면은 데이터를 기다리는 동안에도 즉시 반응합니다.",
    request: "GET /api/students/1"
  },
  {
    id: "ok",
    label: "서버가 200 OK 로 답함",
    kind: "server",
    from: ["loading"],
    to: "success",
    detail:
      "res.ok 가 참이므로 응답 JSON 을 student 상태에 넣고 status 를 success 로 바꿉니다. " +
      "화면이 바뀐 이유는 데이터가 도착해서가 아니라 상태가 바뀌었기 때문입니다.",
    body: '{\n  "id": 1,\n  "name": "김철수",\n  "score": 93\n}'
  },
  {
    id: "fail",
    label: "서버가 404 로 답함",
    kind: "server",
    from: ["loading"],
    to: "error",
    detail:
      "res.ok 가 거짓이면 데이터를 넣지 않고 error 상태로 갑니다. " +
      "이때 setStatus 를 하지 않으면 화면이 계속 '불러오는 중'에 머무릅니다.",
    body: '{\n  "error": "student not found"\n}'
  },
  {
    id: "reset",
    label: "처음 화면으로",
    kind: "user",
    from: ["success", "error"],
    to: "idle",
    detail: "상태를 idle 로 되돌리면 화면도 처음 모습으로 돌아갑니다."
  }
];

export const canFire = (state, ev) => ev.from.includes(state);

export const CODE_LINES = [
  { t: 'const [status, setStatus] = useState("idle");', at: ["idle"] },
  { t: "const [student, setStudent] = useState(null);", at: ["idle"] },
  { t: "", at: [] },
  { t: "async function loadStudent(id) {", at: ["loading"] },
  { t: '  setStatus("loading");', at: ["loading"] },
  { t: "  const res = await fetch(`/api/students/${id}`);", at: ["loading"] },
  { t: '  if (!res.ok) { setStatus("error"); return; }', at: ["error"] },
  { t: "  setStudent(await res.json());", at: ["success"] },
  { t: '  setStatus("success");', at: ["success"] },
  { t: "}", at: [] },
  { t: "", at: [] },
  { t: 'if (status === "loading") return <p>불러오는 중…</p>;', at: ["loading"] },
  { t: 'if (status === "error") return <p>학생을 찾지 못했습니다.</p>;', at: ["error"] },
  { t: 'if (status === "success") return <p>{student.name} · {student.score}점</p>;', at: ["success"] },
  { t: "return <button onClick={() => loadStudent(1)}>학생 조회</button>;", at: ["idle"] }
];

export default STATES;
