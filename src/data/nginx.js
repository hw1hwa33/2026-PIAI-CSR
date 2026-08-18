/*
 * Chapter 10 — Nginx 요청 분기.
 *
 * Legacy Chapter 10 에서 default.conf · 분기 Activity 아이디어 · 502 · 새로고침 404 ·
 * summary 를 가져왔다. Legacy 는 Chapter 02 와 같은 요청 조립형 UI 였으므로,
 * 여기서는 "규칙이 어떻게 골라지는가"를 보여 주는 규칙 평가형으로 재설계했다.
 *
 * 설정 계약: nginx/default.conf 는 Chapter 01 · 03 과 완전히 동일하다.
 * (24_TECHNICAL_CONTENT_RULES §10 — Nginx upstream 은 backend:5000)
 *
 * Nginx 와 Flask 의 역할을 하나로 합치지 않는다.
 */

export const CONF_PATH = "nginx/default.conf";

/*
 * prefix location 은 위에서부터 순서대로 이기는 것이 아니라
 * 가장 길게 일치하는 규칙이 이긴다. 이 점을 그대로 가르친다.
 */
export const LOCATIONS = [
  {
    id: "api",
    prefix: "/api/",
    kind: "proxy",
    body: "proxy_pass http://backend:5000;",
    role: "API 요청을 backend 서비스로 넘긴다",
    note: "Nginx는 응답을 만들지 않고 그대로 전달만 합니다."
  },
  {
    id: "root",
    prefix: "/",
    kind: "static",
    body: "try_files $uri $uri/ /index.html;",
    role: "화면 파일을 직접 돌려준다",
    note:
      "요청한 파일이 있으면 그 파일을, 없으면 index.html을 돌려줍니다. " +
      "화면 안에서 주소가 바뀌는 앱이라 마지막에 /index.html이 필요합니다."
  }
];

export const REQUESTS = [
  { id: "root", path: "/", label: "/ (첫 화면)", accept: "text/html" },
  { id: "deep", path: "/students/1", label: "/students/1 (화면 안의 주소)", accept: "text/html" },
  { id: "api", path: "/api/students/1", label: "/api/students/1 (데이터)", accept: "application/json" }
];

export const BACKEND_STATES = [
  { id: "up", label: "backend 실행 중" },
  { id: "down", label: "backend 중지됨" }
];

const INDEX_HTML =
  "<!doctype html>\n" +
  '<html lang="ko">\n' +
  "  <body>\n" +
  '    <div id="root"></div>   <!-- React 화면이 여기에 그려진다 -->\n' +
  "  </body>\n" +
  "</html>";

const STUDENT_JSON = '{\n  "id": 1,\n  "name": "김철수",\n  "score": 93\n}';

const BAD_GATEWAY =
  "<html>\n" +
  "<head><title>502 Bad Gateway</title></head>\n" +
  "<body><center><h1>502 Bad Gateway</h1></center></body>\n" +
  "</html>";

/* 어떤 규칙이 이기는가 — 일치하는 것 중 가장 긴 prefix 가 이긴다. */
export function matchLocation(path) {
  const hits = LOCATIONS.filter((l) => path.startsWith(l.prefix));
  if (!hits.length) return null;
  return hits.reduce((best, l) => (l.prefix.length > best.prefix.length ? l : best));
}

/* 결과는 상태에서 계산한다. */
export function resolve(reqId, backend) {
  const req = REQUESTS.find((r) => r.id === reqId);
  if (!req) return null;
  const loc = matchLocation(req.path);

  if (loc.kind === "static") {
    return {
      req,
      loc,
      usesBackend: false,
      status: 200,
      statusText: "OK",
      ok: true,
      node: "nginx",
      edge: "nginx-browser",
      headers: [["Content-Type", "text/html"], ["Server", "nginx"]],
      body: INDEX_HTML,
      steps: [
        `주소 ${req.path} 는 /api/ 로 시작하지 않는다`,
        "가장 길게 일치하는 규칙은 location / 이다",
        req.id === "deep"
          ? "try_files: /students/1 파일이 없으므로 /index.html 을 돌려준다"
          : "try_files: /index.html 을 돌려준다"
      ],
      /* 무슨 일이 일어났는지를 쉬운 말로 먼저 말하고, 숫자 이름은 그 뒤에 붙인다 (CLAUDE.md §17) */
      plain: "입구가 직접 화면 파일을 돌려줬습니다.",
      verdict:
        "Nginx가 직접 화면 파일로 답했습니다. backend가 멈춰 있어도 이 요청은 성공합니다.",
      why:
        req.id === "deep"
          ? "화면 안에서만 쓰는 주소라 서버에는 그런 파일이 없습니다. 그래서 index.html을 돌려주고, 나머지는 화면 코드가 처리합니다."
          : "첫 화면을 여는 요청입니다. backend는 전혀 관여하지 않습니다."
    };
  }

  if (backend === "down") {
    return {
      req,
      loc,
      usesBackend: true,
      status: 502,
      statusText: "Bad Gateway",
      ok: false,
      node: "nginx",
      edge: "nginx-flask",
      headers: [["Content-Type", "text/html"], ["Server", "nginx"]],
      body: BAD_GATEWAY,
      steps: [
        `주소 ${req.path} 는 /api/ 로 시작한다`,
        "가장 길게 일치하는 규칙은 location /api/ 이다",
        "proxy_pass http://backend:5000 으로 연결을 시도한다",
        "backend 가 응답하지 않는다 (connection refused)"
      ],
      plain: "입구는 요청을 받았지만, 뒤쪽 요청 처리 서버에 연결하지 못했습니다.",
      verdict:
        "Nginx까지는 정상입니다. 뒤쪽 backend에 닿지 못했고, 이 상황에 붙는 번호가 502입니다. " +
        "'화면은 뜨는데 데이터만 안 나오는' 상황이 바로 이것입니다.",
      why: "502는 Nginx가 만든 응답입니다. Flask는 이 요청을 본 적도 없습니다."
    };
  }

  return {
    req,
    loc,
    usesBackend: true,
    status: 200,
    statusText: "OK",
    ok: true,
    node: "flask",
    edge: "nginx-flask",
    headers: [["Content-Type", "application/json"], ["Server", "nginx"]],
    body: STUDENT_JSON,
    steps: [
      `주소 ${req.path} 는 /api/ 로 시작한다`,
      "가장 길게 일치하는 규칙은 location /api/ 이다",
      "proxy_pass http://backend:5000 으로 넘긴다",
      "backend 의 응답을 그대로 브라우저에 전달한다"
    ],
    plain: "입구가 뒤쪽 요청 처리 서버에 넘겼고, 거기서 만든 답을 그대로 전달했습니다.",
    verdict:
      "Nginx는 응답을 만들지 않았습니다. backend가 만든 JSON을 그대로 전달했을 뿐입니다.",
    why: "이 응답을 실제로 만든 것은 Flask입니다. Flask 코드는 Chapter 11에서 봅니다."
  };
}

export default LOCATIONS;
