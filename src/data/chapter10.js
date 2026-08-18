/*
 * Chapter 10 — 22_CHAPTER_CURRICULUM.md 기준
 *   제목      Nginx
 *   핵심 질문  사용자의 요청을 Frontend와 Backend 중 어디로 보낼까?
 *   기본 구조  / → Frontend, /api/ → Flask
 *   Activity  / 또는 /api/students/1 요청을 선택 → 화살표 분기 / 502 시뮬레이션
 *
 * Legacy Chapter 10 에서 default.conf · 분기 아이디어 · 502 · 새로고침 404 · summary 를 가져왔다.
 * Legacy 의 proxy_set_header 줄은 Chapter 01 · 03 의 default.conf 와 맞추기 위해 넣지 않는다.
 * (24_TECHNICAL_CONTENT_RULES §10 — Chapter 간 설정 충돌 금지)
 *
 * 범위 통제 (20 §5) — upstream 블록 · 캐시 · gzip · TLS 는 다루지 않는다.
 */
const chapter10 = {
  id: 10,
  title: "요청을 알맞은 곳으로 보내기 — Nginx",
  coreQuestion: "들어온 요청을 누가 알맞은 곳으로 보내 줄까?",
  placeholder: false,

  intro:
    "Chapter 09에서 화면이 데이터를 달라는 요청을 만들었습니다. " +
    "그런데 화면은 뒤쪽에 어떤 서버가 있는지 모릅니다. 요청은 언제나 서비스의 입구로 먼저 들어가고, " +
    "그 입구가 주소를 보고 어디로 보낼지 정합니다.",

  whyItMatters: [
    "화면은 요청을 보낼 때 뒤쪽에 어떤 서버가 있는지 모릅니다. 화면을 달라는 요청과 데이터를 달라는 요청을 스스로 나눌 수도 없습니다.",
    "들어온 요청을 누군가는 알맞은 곳으로 보내 줘야 합니다. 그 자리가 서비스의 입구입니다."
  ],

  oneThing: "Nginx는 서비스 입구에서 요청을 나눕니다.",

  objectives: [
    "/ 요청은 화면 파일로, /api/ 요청은 뒤쪽 서버로",
    "입구가 직접 답하는 경우와 넘기는 경우의 차이",
    "화면은 뜨는데 데이터만 안 나오는 상황이 왜 생기는지"
  ],

  codeIntro:
    "설정 문법을 외우지 않아도 됩니다. 어떤 주소가 어디로 가는지 두 줄만 보면 됩니다.",

  codeFocus: {
    lines: ["location /api/  →  뒤쪽 요청 처리 서버로 넘김", "location /      →  화면 파일로 직접 응답"],
    say:
      "입구가 하는 판단은 이것 하나입니다 — 주소가 /api/ 로 시작하면 뒤쪽으로 넘기고, " +
      "아니면 내가 직접 화면 파일로 답한다. 나머지 설정은 이 두 줄을 실제로 적는 방법일 뿐입니다.",
    path: "nginx/default.conf",
    node: "nginx"
  },

  architecture: {
    edgeLabels: { "nginx-flask": "proxy_pass backend:5000" },
    caption:
      "이번 Chapter의 무대는 요청이 도착하는 첫 서버입니다. 여기서 화면 파일로 답할지 " +
      "backend로 넘길지가 결정됩니다.",
    highlight: ["user", "browser", "nginx"],
    scopeNotes: {
      flask: "Nginx가 넘긴 요청을 실제로 처리하는 곳입니다. Flask 코드는 Chapter 11에서 봅니다.",
      mysql: "이번 Chapter의 범위 밖입니다. 데이터 저장과 SQL은 Chapter 13에서 봅니다."
    }
  },

  concept: {
    lead:
      "입구가 하는 일은 두 가지뿐입니다. 이 요청에 내가 직접 답할 것인가, " +
      "아니면 뒤쪽 서비스에 넘길 것인가. 그 판단 기준은 주소입니다.",
    roles: [
      {
        role: "요청을 받는 문",
        tech: "listen 80",
        node: "nginx",
        desc: "바깥에서 들어오는 80번 포트의 요청을 받습니다. Compose에서 바깥에 연 그 포트입니다."
      },
      {
        role: "주소별 처리 규칙",
        tech: "location",
        desc:
          "주소가 어떤 모양이면 어떻게 할지를 정합니다. 규칙이 여러 개 일치하면 " +
          "가장 길게 일치하는 규칙이 이깁니다."
      },
      {
        role: "직접 답하기",
        tech: "try_files",
        desc:
          "요청한 파일이 있으면 그 파일을, 없으면 index.html을 돌려줍니다. " +
          "화면 안에서 주소가 바뀌는 앱이라 마지막에 /index.html이 필요합니다."
      },
      {
        role: "뒤쪽으로 넘기기",
        tech: "proxy_pass",
        node: "flask",
        desc:
          "요청을 backend:5000으로 그대로 넘기고, 돌아온 응답을 브라우저에 전달합니다. " +
          "Nginx는 응답의 내용을 만들지 않습니다."
      }
    ],
    note:
      "proxy_pass의 backend는 Compose에 적은 서비스 이름입니다(Chapter 08). " +
      "그래서 IP 주소를 몰라도 이름만으로 찾아갈 수 있습니다.",

    checkpoint:
      "여기까지 보면 이번 Chapter는 충분합니다 — 주소가 /api/ 로 시작하면 뒤쪽으로 넘기고, " +
      "아니면 입구가 직접 화면 파일로 답한다."
  },

  code: [
    {
      id: "ng-conf",
      name: "default.conf",
      path: "nginx/default.conf",
      lang: "nginx",
      desc: "/api/ 로 시작하는 요청만 backend로 넘기고, 나머지는 화면 파일로 응답한다.",
      lines: [
        { t: "server {", node: "nginx" },
        { t: "    listen 80;                       # 바깥에서 들어오는 문", node: "nginx" },
        { t: "", node: null },
        { t: "    root /usr/share/nginx/html;      # 화면 파일이 놓인 폴더", node: "browser" },
        { t: "    index index.html;", node: "browser" },
        { t: "", node: null },
        { t: "    location /api/ {                 # 데이터 요청", node: "flask" },
        { t: "        proxy_pass http://backend:5000;   # 서비스 이름이 곧 주소", node: "flask" },
        { t: "    }", node: null },
        { t: "", node: null },
        { t: "    location / {                     # 나머지 전부", node: "browser" },
        { t: "        try_files $uri $uri/ /index.html;", node: "browser" },
        { t: "    }", node: null },
        { t: "}", node: null }
      ]
    },
    {
      id: "ng-check",
      name: "구간별로 확인하기",
      path: "터미널 · 어디까지 정상인지 좁혀 갈 때",
      lang: "bash",
      desc: "화면이 뜨는지와 데이터가 오는지를 따로 확인하면 문제 구간이 좁혀진다.",
      lines: [
        { t: "curl -I http://localhost/                    # 화면 요청만 확인", node: "nginx" },
        { t: "curl -i http://localhost/api/students/1      # 데이터 요청 확인", node: "flask" },
        { t: "", node: null },
        { t: "docker compose ps                            # backend 가 떠 있는지", node: null },
        { t: "docker compose logs -f backend               # backend 쪽 기록", node: null }
      ]
    }
  ],

  activity: {
    type: "nginx-route",
    title: "요청의 길 갈라 보기",
    cta: "요청이 갈라지는 걸 직접 보기",
    guide:
      "요청 주소와 뒤쪽 요청 처리 서버의 상태를 바꿔 가며 눌러 보세요. " +
      "어떤 규칙이 골라지는지, 그 결과 무엇이 돌아오는지 바로 보여 줍니다."
  },

  errors: [
    {
      id: "e10-502",
      code: "502 Bad Gateway",
      title: "화면은 뜨는데 데이터만 안 나온다",
      symptom: "http://localhost 는 열리는데 /api/ 요청만 502가 난다.",
      cause: "Nginx는 요청을 받았지만 backend:5000에 연결하지 못했다.",
      fix:
        "docker compose ps로 backend가 running인지 확인하고, proxy_pass 주소가 " +
        "compose의 서비스 이름과 같은지 본다. 로그는 docker compose logs backend로 확인한다.",
      node: "nginx",
      edge: "nginx-flask"
    },
    {
      id: "e10-refresh",
      code: "새로고침하면 404",
      title: "화면 안의 주소에서 새로고침이 실패한다",
      symptom: "첫 화면은 뜨는데 /students/1 에서 새로고침하면 404가 난다.",
      cause: "그 주소에 해당하는 파일이 서버에 실제로 없다.",
      fix: "try_files의 마지막에 /index.html 이 있는지 확인한다.",
      node: "nginx",
      edge: "browser-nginx"
    },
    {
      id: "e10-merge",
      code: "Nginx와 Flask를 같은 것으로 생각함",
      title: "입구와 처리하는 곳을 구분하지 못하는 오해",
      symptom: "Flask 로그를 봐도 요청 기록이 없는데 원인을 찾지 못한다.",
      cause: "Nginx가 넘기지 못한 요청은 Flask에 도착조차 하지 않는다.",
      fix:
        "Flask 로그에 기록이 없으면 Nginx 구간(502)을, 기록이 있는데 오류면 " +
        "Flask 구간을 본다. 두 서비스는 별개다.",
      node: "flask",
      edge: "nginx-flask"
    }
  ],

  summary: {
    remember: [
      "브라우저는 언제나 서비스 입구로 먼저 보내고, 입구가 주소를 보고 어디로 갈지 정한다.",
      "/api/ 는 뒤쪽 서버로 넘기고, 나머지는 입구가 직접 화면 파일로 답한다.",
      "502는 입구가 뒤쪽 서버에 닿지 못했다는 뜻이고, 그 요청은 뒤쪽에 도착조차 하지 않았다."
    ],
    points: [
      "브라우저는 항상 입구(Nginx)로 요청을 보낸다.",
      "location 규칙 중 가장 길게 일치하는 것이 이긴다.",
      "/api/ 는 proxy_pass로 backend에 넘기고, 나머지는 화면 파일로 답한다.",
      "502는 Nginx가 backend에 닿지 못했다는 뜻이고, Flask는 그 요청을 보지 못했다.",
      "Nginx는 응답을 전달할 뿐 내용을 만들지 않는다."
    ],
    keywords: ["listen", "location", "proxy_pass", "try_files", "502"],
    position:
      "요청 경로의 두 번째 계층까지 확인했습니다. 화면(Ch09) → 입구(Ch10)까지 왔습니다.",
    next:
      "입구가 넘긴 요청은 누가 처리할까요? 다음 Chapter에서는 주소와 함수를 잇는 Flask를 봅니다."
  }
};

export default chapter10;
