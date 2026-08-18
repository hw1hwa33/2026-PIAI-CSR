/*
 * Chapter 07 — Dockerfile → Image.
 *
 * Legacy Chapter 07 에서 Dockerfile 7줄 · 각 줄의 의미 · Layer 목록 · build 출력 ·
 * 오류 2건 · summary 를 가져왔다.
 * Legacy 는 Chapter 04·05 와 같은 터미널 입력형이었으므로 그대로 쓰지 않고,
 * "줄을 올바른 순서로 쌓아 이미지를 만든다"는 배치형으로 재설계했다.
 *
 * 파일 내용은 docs 의 backend/Dockerfile 및 Chapter 03 File Preview 와 같은 계약을 유지한다.
 * (24_TECHNICAL_CONTENT_RULES §10)
 */

export const DOCKERFILE_PATH = "backend/Dockerfile";
export const BUILD_CMD = "docker build -t student-backend ./backend";
export const IMAGE_TAG = "student-backend:latest";

/*
 * needs   이 줄보다 먼저 있어야 하는 줄. 지키지 않으면 실제로 빌드가 실패하거나
 *         의미가 성립하지 않는다 — 배치를 막고 이유를 설명한다.
 * prefer  지키지 않아도 이미지는 만들어지지만 손해가 있는 순서 — 배치는 하되 경고한다.
 * layer   이 줄이 이미지에 남기는 층. meta 인 줄은 층을 만들지 않는다.
 */
export const LINES = [
  {
    id: "from",
    text: "FROM python:3.11-slim",
    goal: "바탕이 될 실행 환경 정하기",
    needs: [],
    layer: "Python 3.11 실행 환경",
    why: "맨바닥에서 시작하지 않고, 파이썬이 이미 설치된 공식 이미지 위에 쌓아 올린다.",
    block: "Dockerfile은 무엇 위에 쌓을지부터 정해야 합니다. FROM이 첫 줄이어야 합니다."
  },
  {
    id: "workdir",
    text: "WORKDIR /app",
    goal: "작업 폴더 정하기",
    needs: ["from"],
    layer: "작업 폴더 /app",
    why: "이후 COPY·RUN·CMD가 실행될 기본 폴더를 정한다. 정하지 않으면 최상위(/)에 파일이 쌓인다.",
    block: "먼저 FROM으로 바탕 이미지를 정해야 합니다."
  },
  {
    id: "copy-req",
    text: "COPY requirements.txt .",
    goal: "설치 목록만 먼저 복사하기",
    needs: ["workdir"],
    layer: "requirements.txt 복사",
    why: "설치할 라이브러리 목록을 이미지 안으로 가져온다. 소스 전체보다 먼저 복사하는 것이 요령이다.",
    block: "복사해 넣을 폴더가 정해지지 않았습니다. WORKDIR을 먼저 적습니다."
  },
  {
    id: "run-pip",
    text: "RUN pip install --no-cache-dir -r requirements.txt",
    goal: "라이브러리 설치하기",
    needs: ["copy-req"],
    layer: "flask · mysql-connector-python 설치",
    why: "이 단계 덕분에 다른 컴퓨터에서 따로 설치하지 않아도 된다. Chapter 06의 문제가 여기서 해결된다.",
    block:
      "설치 목록 파일이 아직 이미지 안에 없습니다. " +
      "이 상태로 빌드하면 COPY failed 또는 requirements.txt를 찾지 못하는 오류가 납니다."
  },
  {
    id: "copy-all",
    text: "COPY . .",
    goal: "소스 코드 복사하기",
    needs: ["workdir"],
    prefer: { after: "run-pip" },
    preferWarn:
      "이미지는 만들어지지만 손해가 있습니다. 소스를 먼저 복사하면 코드를 한 줄만 고쳐도 " +
      "그 뒤의 설치 단계까지 다시 실행됩니다. 설치를 먼저 하고 소스를 나중에 복사하면 " +
      "설치 결과를 그대로 재사용할 수 있습니다.",
    layer: "backend 소스 복사",
    why: "우리가 실제로 고치는 코드를 이미지 안으로 가져온다. 자주 바뀌는 것을 뒤쪽에 둔다.",
    block: "복사해 넣을 폴더가 정해지지 않았습니다. WORKDIR을 먼저 적습니다."
  },
  {
    id: "expose",
    text: "EXPOSE 5000",
    goal: "열어 둘 포트 표시하기",
    needs: ["from"],
    meta: true,
    why:
      "이 컨테이너가 5000번 포트를 쓴다는 표시다. 층을 만들지 않고, " +
      "이 줄만으로 바깥에서 접속할 수 있게 되지도 않는다.",
    block: "먼저 FROM으로 바탕 이미지를 정해야 합니다."
  },
  {
    id: "cmd",
    text: 'CMD ["flask", "--app", "app", "run", "--host=0.0.0.0"]',
    goal: "시작할 때 실행할 명령 정하기",
    needs: ["copy-all"],
    meta: true,
    why:
      "컨테이너가 시작될 때 실행할 명령이다. --host=0.0.0.0 이 있어야 컨테이너 밖에서 접속할 수 있다.",
    block: "실행할 소스가 아직 이미지 안에 없습니다. COPY로 코드를 넣은 뒤 시작 명령을 정합니다."
  }
];

export const lineOf = (id) => LINES.find((l) => l.id === id) || null;

/*
 * Guided Build 순서 — 실제 backend/Dockerfile 과 같은 순서다. (CLAUDE.md)
 * 사용자가 정답 순서를 맞혀야 진행하는 구조로 쓰지 않는다.
 * "다음 줄 보기"를 누르면 이 순서대로 한 줄씩 나타난다.
 */
export const BUILD_ORDER = ["from", "workdir", "copy-req", "run-pip", "copy-all", "expose", "cmd"];

/* 순서를 바꾸면 어떻게 되는지 — 심화 접기 안에서만 보여 준다 */
export const ORDER_NOTES = [
  {
    id: "copy-first",
    title: "소스를 설치보다 먼저 복사하면?",
    body:
      "이미지는 그래도 만들어집니다. 다만 코드를 한 줄만 고쳐도 그 뒤의 설치 단계까지 다시 실행됩니다. " +
      "설치를 먼저 하고 소스를 나중에 복사하면, 코드를 고쳐도 설치 결과를 그대로 재사용합니다."
  },
  {
    id: "no-from",
    title: "FROM 없이 시작하면?",
    body:
      "무엇 위에 쌓을지 정하지 않은 것이라 빌드가 시작되지 않습니다. " +
      "Dockerfile 은 언제나 바탕이 될 실행 환경부터 정합니다."
  },
  {
    id: "no-workdir",
    title: "WORKDIR 없이 복사하면?",
    body:
      "파일이 최상위(/) 에 쌓입니다. 오류는 아니지만 어디에 무엇이 있는지 알기 어려워지고, " +
      "이후 명령의 기준 위치도 정해지지 않습니다."
  }
];

/* 지금 이 줄을 놓을 수 있는가 — 놓을 수 없으면 이유를 함께 돌려준다. */
export function checkPlace(placed, id) {
  const line = lineOf(id);
  if (!line) return { ok: false, reason: "알 수 없는 줄입니다." };
  if (placed.includes(id)) return { ok: false, reason: "이미 놓은 줄입니다." };

  const missing = line.needs.filter((n) => !placed.includes(n));
  if (missing.length) {
    return { ok: false, reason: line.block, missing };
  }

  if (line.prefer && line.prefer.after && !placed.includes(line.prefer.after)) {
    return { ok: true, warn: line.preferWarn };
  }
  return { ok: true };
}

/* 지금까지 쌓인 층 — meta 인 줄은 층이 아니라 설정으로 표시한다. */
export function layersOf(placed) {
  const layers = [];
  let n = 0;
  placed.forEach((id) => {
    const line = lineOf(id);
    if (!line) return;
    if (line.meta) layers.push({ id, n: line.id === "cmd" ? "CMD" : "EXPOSE", label: line.text, meta: true });
    else { n += 1; layers.push({ id, n: `L${n}`, label: line.layer, meta: false }); }
  });
  return layers;
}

export function buildOutput(placed) {
  const real = placed.filter((id) => !(lineOf(id) || {}).meta);
  const steps = real.map((id, i) => `=> [${i + 1}/${real.length}] ${lineOf(id).text}`);
  return [
    `[+] Building 12.4s (${real.length + 3}/${real.length + 3}) FINISHED`,
    ...steps,
    "=> exporting to image",
    `=> => naming to docker.io/library/${IMAGE_TAG}`
  ].join("\n");
}

export default LINES;
