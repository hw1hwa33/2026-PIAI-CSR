/*
 * Chapter 09 — 22_CHAPTER_CURRICULUM.md 기준
 *   제목      Frontend
 *   핵심 질문  API의 JSON을 어떻게 사용자 화면으로 바꿀까?
 *   핵심      State · Event · Render · fetch / idle → loading → success·error
 *   Activity  학생 조회 → 상태 변화와 화면 변화 동기화
 *
 * Legacy Chapter 09 에서 상태 단계 · 코드 · 오류 2건(로딩 멈춤 · CORS) · summary 를 가져왔다.
 * Legacy 는 Chapter 01 과 같은 stage 진행형이라, 상태 전이를 직접 일으키는 형태로 재설계했다.
 *
 * 코드 계약: frontend/src/app.jsx (Chapter 03 File Preview 와 동일한 경로·내용 계약)
 * 범위 통제 (20 §5) — 컴포넌트 분리 · 라우팅 · 상태 관리 라이브러리는 다루지 않는다.
 */
const chapter09 = {
  id: 9,
  title: "받은 데이터로 화면 바꾸기 — React",
  coreQuestion: "받아 온 데이터를 어떻게 사용자 화면으로 바꿀까?",
  placeholder: false,

  intro:
    "Chapter 08까지는 서비스를 어떻게 띄우는지를 봤습니다. 이제 그 안의 코드를 계층별로 봅니다. " +
    "첫 번째는 사용자가 직접 만나는 화면입니다. 화면은 데이터를 갖고 있지 않습니다. " +
    "상태(state)를 바꾸면 그 상태에 맞춰 다시 그려질 뿐입니다.",

  whyItMatters: [
    "지금까지는 서비스를 어떻게 띄우는지만 봤습니다. 그런데 사용자가 실제로 보는 것은 화면입니다.",
    "화면은 데이터를 직접 갖고 있지 않습니다. 받은 값을 기억해 두고, 그 값에 맞춰 다시 그려질 뿐입니다."
  ],

  oneThing: "React는 기억해 둔 값이 바뀌면 화면을 다시 그립니다.",

  objectives: [
    "클릭 → 요청 → 결과 받음 → 기억해 둠 → 다시 그림 순서",
    "화면의 네 가지 상태 — 대기 · 불러오는 중 · 성공 · 실패",
    "이 프로젝트에서 화면이 데이터를 얻는 통로는 API라는 점"
  ],

  codeIntro:
    "코드를 다 읽지 않아도 됩니다. 흐름에서 '기억해 두는 부분'과 '다시 그리는 부분' 두 줄만 봅니다.",

  codeFocus: {
    lines: ['setStudent(data);      // 받은 학생 데이터를 저장한다', 'setStatus("success");  // 조회가 끝났으므로 성공 상태로 바꾼다'],
    say:
      "화면이 바뀌는 이유는 데이터가 도착해서가 아닙니다. 이 두 줄로 화면이 기억하는 값이 바뀌고, " +
      "그때 React가 화면을 다시 그립니다. 이 두 줄이 없으면 응답이 와도 화면은 그대로입니다.",
    path: "frontend/src/app.jsx",
    node: "browser"
  },

  architecture: {
    caption:
      "이번 Chapter의 무대는 요청 경로의 가장 앞, Browser / Frontend 안쪽입니다. " +
      "여기서 만들어진 요청이 Nginx로 나갑니다.",
    highlight: ["user", "browser"],
    scopeNotes: {
      nginx: "요청이 나가는 다음 칸입니다. Nginx의 판단은 Chapter 10에서 봅니다.",
      flask: "응답을 만들어 주는 곳입니다. Flask 코드는 Chapter 11에서 봅니다.",
      mysql: "이 프로젝트에서는 화면이 여기에 직접 연결하지 않고 API를 거칩니다. 데이터 저장과 SQL은 Chapter 13에서 봅니다."
    }
  },

  concept: {
    lead:
      "먼저 흐름부터 봅니다 — 화면이 있고, 사용자가 클릭하면 요청이 나가고, 결과를 받으면 " +
      "그 값을 기억해 두고, 기억한 값으로 화면을 다시 그립니다. " +
      "화면을 바꾸는 것은 데이터가 도착한 사실이 아니라, 기억해 둔 값이 바뀌었다는 사실입니다.",
    roles: [
      {
        role: "지금 화면이 어떤 상태인지 나타내는 값",
        tech: "State (상태)",
        node: "browser",
        desc:
          "status는 idle · loading · success · error 중 하나이고, student는 받은 데이터입니다. " +
          "이 두 값만 보면 화면이 무엇을 그릴지 정해집니다."
      },
      {
        role: "상태를 바꾸는 계기",
        tech: "Event (이벤트)",
        desc:
          "사용자의 클릭이거나 서버의 응답입니다. 이벤트가 없으면 상태는 스스로 바뀌지 않습니다."
      },
      {
        role: "데이터를 가지러 가는 동작",
        tech: "fetch",
        desc:
          "화면이 API에 요청을 보냅니다. 답이 올 때까지 기다리는 동안에도 화면은 멈추지 않습니다."
      },
      {
        role: "상태에 맞춰 화면을 다시 그리는 것",
        tech: "Render (렌더)",
        desc:
          "상태가 바뀌면 React가 화면을 다시 그립니다. 우리가 직접 화면 요소를 고치지 않습니다."
      }
    ],
    note:
      "이 프로젝트에서는 화면이 API에 데이터를 요청하고, 데이터베이스 접근은 서버가 담당합니다. " +
      "브라우저에서 실행되는 화면 코드에 데이터베이스 접속 정보를 직접 두지 않도록 " +
      "Frontend와 Database 사이에 Backend API를 둔 구조입니다.",

    checkpoint:
      "여기까지 보면 이번 Chapter는 충분합니다 — 사용자 행동 → 기억해 둔 값 변경 → 화면 다시 그리기, " +
      "이 세 단계 순서면 됩니다.",

    advanced: [
      {
        label: "왜 주소 앞에 서버 이름을 붙이지 않을까?",
        note: "이번 Chapter의 핵심은 아닙니다.",
        body: [
          "코드에는 fetch(`/api/students/1`) 처럼 앞에 호스트 없이 적습니다. " +
            "화면과 API를 같은 주소로 서비스하기 때문입니다.",
          "http://localhost:5000/... 처럼 다른 주소로 직접 부르면 브라우저가 보안상 요청을 막는 경우가 " +
            "있습니다. 이것을 CORS 문제라고 부릅니다.",
          "Chapter 10에서 배울 구조(서비스 입구가 / 와 /api/ 를 함께 처리)에서는 이 문제가 생기지 않습니다. " +
            "지금은 '같은 주소로 보내면 된다'까지만 알면 충분합니다."
        ]
      }
    ]
  },

  code: [
    {
      id: "fe-app",
      name: "app.jsx",
      path: "frontend/src/app.jsx",
      lang: "jsx",
      desc: "상태를 두고, 버튼을 누르면 API를 불러 상태를 바꾼다.",
      lines: [
        { t: 'import { useState } from "react";', node: "browser" },
        { t: "", node: null },
        { t: "export default function App() {", node: "browser" },
        { t: '  const [status, setStatus] = useState("idle");   // 화면의 현재 상태', node: "browser" },
        { t: "  const [student, setStudent] = useState(null);   // 받은 데이터", node: "browser" },
        { t: "", node: null },
        { t: "  async function loadStudent(id) {", node: "browser" },
        { t: '    setStatus("loading");                         // 먼저 상태부터 바꾼다', node: "browser" },
        { t: "    const res = await fetch(`/api/students/${id}`);", node: "nginx" },
        { t: '    if (!res.ok) { setStatus("error"); return; }  // 실패 경로', node: "browser" },
        { t: "    setStudent(await res.json());", node: "browser" },
        { t: '    setStatus("success");', node: "browser" },
        { t: "  }", node: null },
        { t: "", node: null },
        { t: '  if (status === "success") return <p>{student.name} · {student.score}점</p>;', node: "browser" },
        { t: "  return <button onClick={() => loadStudent(1)}>학생 조회</button>;", node: "browser" },
        { t: "}", node: null }
      ]
    },
    {
      id: "fe-why",
      name: "왜 /api/ 로 보내는가",
      path: "frontend/src/app.jsx (요청 주소 부분)",
      lang: "jsx",
      desc: "같은 주소로 보내면 브라우저가 요청을 막지 않는다.",
      lines: [
        { t: "// 화면과 API를 같은 주소로 서비스하므로 앞에 호스트를 붙이지 않는다", node: "nginx" },
        { t: 'const res = await fetch(`/api/students/${id}`);', node: "nginx" },
        { t: "", node: null },
        { t: "// http://localhost:5000/... 처럼 다른 주소로 직접 부르면", node: null },
        { t: "// 브라우저가 막는 경우가 생긴다 (CORS)", node: null }
      ]
    }
  ],

  activity: {
    type: "react-state",
    title: "상태를 바꿔 화면 바꾸기",
    cta: "화면이 바뀌는 걸 직접 보기",
    guide:
      "지금 상태에서 일어날 수 있는 일만 고를 수 있습니다. 하나를 고를 때마다 상태와 화면, " +
      "그리고 관련된 코드 줄이 함께 바뀝니다."
  },

  errors: [
    {
      id: "e9-stuck",
      code: "화면이 계속 '불러오는 중'",
      title: "응답이 왔는데 화면이 그대로다",
      symptom: "네트워크 탭에는 200 응답이 보이는데 화면은 로딩 문구에서 멈춰 있다.",
      cause: "응답 처리 뒤에 상태를 success로 바꾸지 않았다.",
      fix: "setStudent와 setStatus가 실제로 실행되는지, 그 앞에서 return으로 빠져나가지 않는지 확인한다.",
      node: "browser",
      edge: null
    },
    {
      id: "e9-cors",
      code: "CORS 오류",
      title: "브라우저가 요청을 막았다",
      symptom: "콘솔에 blocked by CORS policy 메시지가 나오고 응답을 읽지 못한다.",
      cause: "화면 주소와 API 주소가 서로 달라 브라우저가 보안상 막았다.",
      fix:
        "같은 주소(/api/)로 요청해 Nginx를 통해 접근한다. " +
        "개발 서버를 따로 띄울 때만 생기는 문제이고, Chapter 10의 구조에서는 생기지 않는다.",
      node: "browser",
      edge: "browser-nginx"
    },
    {
      id: "e9-direct",
      code: "화면에서 DB에 직접 붙으려 함",
      title: "Frontend가 데이터베이스에 직접 접속하려는 오해",
      symptom: "화면 코드에 DB 접속 정보를 적으려고 한다.",
      cause: "화면 코드는 사용자 컴퓨터에서 실행된다는 점을 놓친 경우다.",
      fix:
        "화면 코드에 들어간 접속 정보는 누구나 볼 수 있습니다. 데이터는 반드시 API를 거쳐 받습니다.",
      node: "browser",
      edge: null
    }
  ],

  summary: {
    remember: [
      "화면이 바뀌는 이유는 데이터가 도착해서가 아니라, 기억해 둔 값이 바뀌었기 때문이다.",
      "사용자 행동 → 값 변경 → 화면 다시 그리기, 이 순서면 충분하다.",
      "이 프로젝트에서는 화면이 API에 요청하고, 데이터베이스 접근은 서버가 맡는다."
    ],
    points: [
      "사용자 행동 → 상태 변화 → 화면 변화 순서로 움직인다.",
      "화면은 데이터를 갖고 있지 않고 상태에 따라 다시 그려진다.",
      "idle · loading · success · error 네 상태만으로 조회 화면을 설명할 수 있다.",
      "이 프로젝트에서는 화면이 API로 데이터를 받고, 데이터베이스 접근은 서버가 담당한다."
    ],
    keywords: ["useState", "fetch", "status", "render", "idle/loading/success/error"],
    position:
      "요청 경로의 가장 앞(Browser / Frontend)을 확인했습니다.",
    next:
      "여기서 만든 요청은 어디로 갈까요? 다음 Chapter에서는 요청이 도착하는 " +
      "첫 서버, 서비스의 입구를 봅니다."
  }
};

export default chapter09;
