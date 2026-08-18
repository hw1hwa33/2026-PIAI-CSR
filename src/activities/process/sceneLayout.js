/*
 * ProcessScene.jsx 가 읽는 좌표표. UI 를 만들지 않고 "어디에 그릴지"만 정의한다.
 *
 * 필수 키 (ProcessScene 이 직접 참조)
 *   view                     viewBox 문자열
 *   user     { x, y, label:{x,y} }
 *   computer { x, y, w, h, screen:{x,y,w,h}, label:{x,y} }
 *   rack     { x, y, w, h, title:{x,y} }
 *   bays     { nginx|flask|mysql : {x,y,w,h} }
 *   spine    서버 랙 내부 배선 path d
 *   wireOut  { d, label:{x,y,text,anchor} }   요청 방향 — 위쪽
 *   wireBack { d, label:{x,y,text,anchor} }   응답 방향 — 아래쪽
 *   band     { x, y, text }                   구간 이름 (선택 · 모바일 NETWORK)
 *   anchors  step.packet.at 값 → {x,y}
 *   card     { w, y, minX, maxX }             설명 카드 위치·클램프 범위
 *
 * 요청은 항상 화면 위쪽 경로, 응답은 항상 아래쪽 경로로 분리한다.
 * "위로 나가고 아래로 돌아온다"가 한눈에 읽히도록 두 곡선의 y 대역을 겹치지 않게 둔다.
 */

/* ------------------------------------------------------------------
   WIDE — 가로 배치 (USER · COMPUTER 왼쪽, SERVER 랙 오른쪽)
   높이를 압축해 공정 흐름이 한눈에 들어오는 밀도로 맞춘다.
   ------------------------------------------------------------------ */
export const WIDE = {
  view: "0 0 900 430",

  user: { x: 54, y: 252, label: { x: 54, y: 298 } },

  computer: {
    x: 100,
    y: 170,
    w: 250,
    h: 154,
    screen: { x: 114, y: 184, w: 222, h: 136 },
    label: { x: 225, y: 372 }
  },

  rack: { x: 560, y: 150, w: 300, h: 252, title: { x: 580, y: 174 } },

  bays: {
    nginx: { x: 590, y: 186, w: 250, h: 58 },
    flask: { x: 590, y: 254, w: 250, h: 58 },
    mysql: { x: 590, y: 322, w: 250, h: 58 }
  },

  spine:
    "M 576 215 L 576 351 M 576 215 L 590 215 M 576 283 L 590 283 M 576 351 L 590 351",

  /* 요청 — 위쪽으로 나간다 */
  wireOut: {
    d: "M 356 202 C 430 176, 490 172, 570 202",
    label: { x: 462, y: 156, text: "요청 · HTTP Request →", anchor: "middle" }
  },

  /* 응답 — 아래쪽으로 돌아온다 */
  wireBack: {
    d: "M 570 310 C 490 366, 430 372, 356 304",
    label: { x: 462, y: 396, text: "← 응답 · JSON Response", anchor: "middle" }
  },

  anchors: {
    user: { x: 54, y: 252 },
    browser: { x: 225, y: 252 },
    client: { x: 225, y: 252 },
    network: { x: 462, y: 188 },
    wireOut: { x: 462, y: 188 },
    wireBack: { x: 462, y: 344 },
    server: { x: 715, y: 283 },
    nginx: { x: 715, y: 215 },
    flask: { x: 715, y: 283 },
    mysql: { x: 715, y: 351 },
    db: { x: 715, y: 351 }
  },

  card: { w: 240, y: 8, minX: 128, maxX: 772 }
};

/* ------------------------------------------------------------------
   NARROW — 세로 배치 (모바일). 카드는 맨 위, 랙은 아래.
   COMPUTER ↓ NETWORK ↓ SERVER 가 세 구간으로 끊겨 읽히도록
   요청은 왼쪽 열, 응답은 오른쪽 열로 분리하고 가로 구간의 y 를 벌린다.
   ------------------------------------------------------------------ */
export const NARROW = {
  view: "0 0 420 900",

  user: { x: 54, y: 250, label: { x: 54, y: 296 } },

  computer: {
    x: 100,
    y: 160,
    w: 280,
    h: 190,
    screen: { x: 116, y: 176, w: 248, h: 158 },
    label: { x: 240, y: 400 }
  },

  rack: { x: 60, y: 500, w: 300, h: 330, title: { x: 80, y: 526 } },

  bays: {
    nginx: { x: 90, y: 540, w: 250, h: 64 },
    flask: { x: 90, y: 630, w: 250, h: 64 },
    mysql: { x: 90, y: 720, w: 250, h: 64 }
  },

  spine:
    "M 76 572 L 76 752 M 76 572 L 90 572 M 76 662 L 90 662 M 76 752 L 90 752",

  /* 요청 — 왼쪽 열로 내려간다 */
  wireOut: {
    d: "M 150 408 L 150 428 L 118 428 L 118 534",
    label: { x: 132, y: 486, text: "요청 ↓", anchor: "start" }
  },

  /* 응답 — 오른쪽 열로 올라온다 */
  wireBack: {
    d: "M 302 498 L 302 462 L 252 462 L 252 396",
    label: { x: 288, y: 486, text: "↑ 응답", anchor: "end" }
  },

  /* 두 가로 구간(428 / 462) 사이의 빈 대역에 구간 이름을 둔다 */
  band: { x: 210, y: 450, text: "NETWORK" },

  anchors: {
    user: { x: 54, y: 250 },
    browser: { x: 240, y: 250 },
    client: { x: 240, y: 250 },
    network: { x: 118, y: 482 },
    wireOut: { x: 118, y: 482 },
    wireBack: { x: 302, y: 482 },
    server: { x: 215, y: 662 },
    nginx: { x: 215, y: 572 },
    flask: { x: 215, y: 662 },
    mysql: { x: 215, y: 752 },
    db: { x: 215, y: 752 }
  },

  card: { w: 220, y: 12, minX: 112, maxX: 308 }
};

export default { WIDE, NARROW };
