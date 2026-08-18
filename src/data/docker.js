/*
 * Chapter 06 — 실행 환경 통일.
 *
 * Legacy Chapter 06 에서 두 노트북 비교 Activity · 명령 · 오류 2건 · summary 를 가져왔다.
 * Legacy 는 컴퓨터와 실행 방식을 하나씩 골라 한 번에 한 결과만 보여 줬다.
 * 여기서는 두 컴퓨터를 나란히 두고 같은 실행 방식을 동시에 적용해 대조한다 —
 * "코드가 아니라 환경이 다르다"는 것이 한눈에 보여야 하기 때문이다.
 *
 * 24_TECHNICAL_CONTENT_RULES §3 — Dockerfile · Image · Container · Compose 를 구분한다.
 * Docker 는 Request 가 통과하는 Network Layer 가 아니다. (CLAUDE.md Hard Rules)
 */

export const IMAGE_NAME = "student-backend";

/* 같은 코드를 받은 두 대의 컴퓨터. 다른 것은 코드가 아니라 설치 상태다. */
export const HOSTS = [
  {
    id: "a",
    name: "A 노트북",
    python: "3.11.9",
    libs: true,
    note: "마침 필요한 버전과 라이브러리가 설치되어 있다"
  },
  {
    id: "b",
    name: "B 노트북",
    python: "3.9.6",
    libs: false,
    note: "파이썬 버전이 낮고 라이브러리도 없다"
  }
];

export const RUN_MODES = [
  {
    id: "direct",
    label: "컴퓨터에 직접 실행",
    cmd: "flask --app app run",
    desc: "그 컴퓨터에 설치된 파이썬과 라이브러리를 그대로 쓴다."
  },
  {
    id: "docker",
    label: "이미지로 실행",
    cmd: `docker run --rm ${IMAGE_NAME}`,
    desc: "실행에 필요한 것이 들어 있는 이미지를 컨테이너로 띄운다."
  }
];

/* Image 안에 무엇이 들어 있는가 — Code + Runtime + Dependencies */
export const IMAGE_PARTS = [
  { id: "code", label: "우리 코드", value: "backend/app.py", desc: "고쳐 가며 만드는 부분" },
  { id: "runtime", label: "실행기(Runtime)", value: "Python 3.11", desc: "코드를 실행해 주는 프로그램" },
  { id: "deps", label: "라이브러리(Dependencies)", value: "flask · mysql-connector-python", desc: "코드가 빌려 쓰는 남의 코드" }
];

/* 실행 결과는 상태에서 계산한다. 미리 적어 둔 대본을 재생하지 않는다. */
export function runOn(host, mode) {
  if (mode === "docker") {
    return {
      ok: true,
      cmd: RUN_MODES[1].cmd,
      python: "3.11.9",
      source: "이미지 안에 포함",
      output:
        " * Serving Flask app 'app'\n" +
        " * Running on http://0.0.0.0:5000",
      note: "이 컴퓨터에 무엇이 설치돼 있든 결과가 같다."
    };
  }
  if (host.libs) {
    return {
      ok: true,
      cmd: RUN_MODES[0].cmd,
      python: host.python,
      source: `${host.name}에 설치된 것`,
      output:
        " * Serving Flask app 'app'\n" +
        " * Running on http://127.0.0.1:5000",
      note: "성공했지만 '이 컴퓨터에서만' 되는 상태다."
    };
  }
  return {
    ok: false,
    cmd: RUN_MODES[0].cmd,
    python: host.python,
    source: `${host.name}에 설치된 것`,
    output:
      "Traceback (most recent call last):\n" +
      '  File "app.py", line 2, in <module>\n' +
      "    from flask import Flask\n" +
      "ModuleNotFoundError: No module named 'flask'",
    note: "코드는 같은데 환경이 달라 실패한다."
  };
}

export function compareNote(mode) {
  return mode === "docker"
    ? "두 컴퓨터의 결과가 같습니다. 실행에 필요한 것이 이미지 안에 함께 들어 있기 때문입니다."
    : "같은 코드인데 결과가 다릅니다. 달라진 것은 코드가 아니라 컴퓨터에 설치된 것입니다.";
}

/* ---------------- Image ↔ Container ----------------
   이미지는 틀이고, 컨테이너는 그 틀로 실제 실행된 것이다.
   하나의 이미지로 여러 컨테이너를 띄울 수 있다는 점이 이 구분의 핵심이다. */
export const MAX_CONTAINERS = 3;

export const CONTAINER_NAMES = ["silly_hopper", "bold_kepler", "eager_wright"];

export function containerAt(i) {
  return {
    id: `c${i + 1}`,
    name: CONTAINER_NAMES[i] || `container_${i + 1}`,
    image: IMAGE_NAME,
    status: "running"
  };
}

export default HOSTS;
