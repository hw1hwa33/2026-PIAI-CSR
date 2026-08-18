/*
 * Chapter 15 — 프로젝트 완성 순환.
 *
 * Legacy Chapter 15 에서 전체 순환 명령 · 출력 · 오류 3건(포트 충돌 · down -v 주의 · .env 커밋) ·
 * summary 를 가져왔다. Legacy 는 터미널 입력형이었으므로,
 * 여기서는 한 단계를 실행할 때마다 세 축의 상태가 어떻게 달라지는지를 보여 주는 형태로 재설계했다.
 *
 * 세 축을 끝까지 구분해서 보여 주는 것이 이 Chapter 의 목적이다.
 *   SOURCE MANAGEMENT   Local Git ↔ GitHub
 *   RUNTIME ENVIRONMENT Docker / Docker Compose
 *   RUNTIME SERVICES    Nginx → Flask → MySQL
 *
 * docker compose down -v 는 데이터 삭제 위험 명령이라 기본 흐름에 넣지 않는다.
 * (24_TECHNICAL_CONTENT_RULES §3 · CLAUDE.md Hard Rules)
 */

export const REPO_URL = "https://github.com/<사용자>/student-web.git";

/*
 * 영어 대문자 제목을 Primary 로 쓰지 않는다. 한글 역할이 먼저다. (CLAUDE.md §23)
 *   ko    화면에 크게 보이는 한글 역할     label 그 아래 작게 붙는 기술 표현
 */
export const AXES = [
  {
    id: "source",
    ko: "코드와 기록 관리",
    label: "Source Management",
    desc: "내 컴퓨터의 기록 ↔ 인터넷에 둔 기록 — 코드와 기록이 오간다",
    note: "요청이 지나가는 길이 아니다"
  },
  {
    id: "env",
    ko: "실행 환경",
    label: "Runtime Environment",
    desc: "Docker Compose — 서비스를 만들고 띄운다",
    note: "요청이 통과하는 계층이 아니다"
  },
  {
    id: "runtime",
    ko: "실제 요청 경로",
    label: "Runtime Services",
    desc: "서비스 입구 → 요청 처리 → 데이터 저장",
    note: "실제 사용자 요청은 여기만 지나간다"
  }
];

export const SERVICE_NODES = [
  { id: "nginx", name: "Nginx", service: "web", role: "입구" },
  { id: "flask", name: "Flask API", service: "backend", role: "처리" },
  { id: "mysql", name: "MySQL", service: "db", role: "저장" }
];

/*
 * running 은 down 을 실행하면 false 로 돌아간다.
 * 그래서 "한 번이라도 띄웠는가"는 started 로 따로 기록한다 — 완료 판정이 down 때문에 풀리지 않게 한다.
 */
export const INITIAL = {
  cloned: false,
  envFile: false,
  started: false,
  running: false,
  checkedScreen: false,
  edited: false,
  committed: false,
  pushed: false,
  stopped: false
};

/*
 * 한 단계가 어느 축을 움직이는지 명시한다.
 * kind: cmd(명령) · note(직접 확인해야 하는 단계)
 */
export const STEPS = [
  {
    id: "clone",
    axis: "source",
    kind: "cmd",
    goal: "코드 가져오기",
    cmd: `git clone ${REPO_URL}`,
    cwd: "~",
    needs: [],
    output: "Cloning into 'student-web'...\nReceiving objects: 100% (12/12), done.",
    detail:
      "코드 관리 축에서 일어나는 일입니다. 소스와 커밋 기록을 함께 받아 옵니다. " +
      "아직 실행된 것은 아무것도 없습니다.",
    effect: { cloned: true }
  },
  {
    id: "env",
    axis: "env",
    kind: "cmd",
    goal: "환경 변수 파일 만들기",
    cmd: "cp .env.example .env",
    cwd: "~/student-web",
    needs: ["cloned"],
    blocked: "먼저 코드를 받아야 합니다.",
    output: "(출력 없음)",
    detail:
      "복사한 뒤 .env를 열어 비밀번호를 직접 채웁니다. " +
      ".env는 .gitignore에 있어 커밋되지 않습니다. 저장소에는 .env.example만 올라갑니다.",
    effect: { envFile: true }
  },
  {
    id: "up",
    axis: "env",
    kind: "cmd",
    goal: "서비스 실행하기",
    cmd: "docker compose up -d --build",
    cwd: "~/student-web",
    needs: ["envFile"],
    blocked: ".env가 없으면 ${MYSQL_PASSWORD} 자리를 채우지 못합니다.",
    output:
      "[+] Building 12.4s (14/14) FINISHED\n" +
      "[+] Running 4/4\n" +
      " ✔ Network student-web_default   Created\n" +
      " ✔ Container student-web-db-1       Started\n" +
      " ✔ Container student-web-backend-1  Started\n" +
      " ✔ Container student-web-web-1      Started",
    detail:
      "이미지를 만들고 세 서비스를 정해 둔 시작 순서대로 띄웁니다. " +
      "이 단계에서 실행 환경 축이 요청이 지나갈 길을 준비합니다.",
    effect: { running: true, started: true }
  },
  {
    id: "ps",
    axis: "env",
    kind: "cmd",
    goal: "상태 확인하기",
    use: "필요할 때",
    cmd: "docker compose ps",
    cwd: "~/student-web",
    needs: ["running"],
    blocked: "아직 실행한 서비스가 없습니다.",
    output:
      "NAME                     SERVICE   STATUS    PORTS\n" +
      "student-web-web-1        web       running   0.0.0.0:80->80/tcp\n" +
      "student-web-backend-1    backend   running   5000/tcp\n" +
      "student-web-db-1         db        running   3306/tcp",
    detail:
      "하나라도 exited면 docker compose logs 로 이유를 확인합니다. " +
      "바깥에 열린 포트가 web 하나뿐인 것도 여기서 확인됩니다.",
    effect: {}
  },
  {
    id: "check",
    axis: "runtime",
    kind: "note",
    goal: "브라우저에서 확인하기",
    cmd: null,
    confirm: "확인했습니다",
    needs: ["running"],
    blocked: "서비스가 떠 있어야 확인할 수 있습니다.",
    output:
      "# 브라우저에서 직접 확인\n" +
      "#   http://localhost                  → 화면 200 OK\n" +
      "#   http://localhost/api/students/1   → JSON 200 OK",
    detail:
      "화면이 뜨면 Nginx까지, JSON이 오면 Flask와 MySQL까지 정상이라는 뜻입니다. " +
      "이 두 가지를 나눠 확인하는 습관이 Chapter 14에서 배운 구간 좁히기입니다.",
    effect: { checkedScreen: true }
  },
  {
    id: "edit",
    axis: "source",
    kind: "note",
    goal: "코드 고치기",
    cmd: null,
    confirm: "수정했습니다",
    needs: ["cloned"],
    blocked: "먼저 코드를 받아야 합니다.",
    output: "# 편집기에서 backend/app.py 를 한 줄 수정",
    detail:
      "여기서부터 다시 코드 관리 축입니다. 실행 중인 컨테이너는 아직 예전 코드를 갖고 있습니다.",
    effect: { edited: true }
  },
  {
    id: "commit",
    axis: "source",
    kind: "cmd",
    goal: "기록 남기기",
    cmd: 'git add backend/app.py && git commit -m "feat: 점수 표시 문구 수정"',
    cwd: "~/student-web",
    needs: ["edited"],
    blocked: "고친 내용이 없으면 기록할 것이 없습니다.",
    output:
      "[main 9f8e7d6] feat: 점수 표시 문구 수정\n 1 file changed, 1 insertion(+), 1 deletion(-)",
    detail:
      "Chapter 04에서 배운 흐름 그대로입니다. 이 기록은 아직 내 컴퓨터 안에만 있습니다. " +
      "커밋 해시는 예시 값입니다.",
    effect: { committed: true }
  },
  {
    id: "push",
    axis: "source",
    kind: "cmd",
    goal: "다시 공유하기",
    cmd: "git push",
    cwd: "~/student-web",
    needs: ["committed"],
    blocked: "올릴 새 커밋이 없습니다. commit을 먼저 합니다.",
    output:
      "Enumerating objects: 5, done.\n" +
      `To ${REPO_URL}\n` +
      "   a1b2c3d..9f8e7d6  main -> main",
    detail:
      "Chapter 05에서 -u로 기본 대상을 정해 두었으므로 git push만 쳐도 됩니다. " +
      "이제 다른 사람도 이 변경을 받아 갈 수 있습니다.",
    effect: { pushed: true }
  },
  {
    id: "down",
    axis: "env",
    kind: "cmd",
    goal: "서비스 종료하기",
    cmd: "docker compose down",
    cwd: "~/student-web",
    needs: ["running"],
    blocked: "실행 중인 서비스가 없습니다.",
    output:
      "[+] Running 4/4\n" +
      " ✔ Container student-web-web-1      Removed\n" +
      " ✔ Container student-web-backend-1  Removed\n" +
      " ✔ Container student-web-db-1       Removed\n" +
      " ✔ Network student-web_default      Removed",
    detail:
      "컨테이너는 정리되지만 저장 공간(volume)에 남은 데이터는 그대로입니다. " +
      "-v를 붙이면 그 데이터까지 지워지므로 기본 흐름에서는 붙이지 않습니다. " +
      "작업을 마칠 때 쓰는 단계일 뿐, 이것을 해야 무언가 완성되는 것은 아닙니다.",
    effect: { running: false, stopped: true }
  }
];

export const getStep = (id) => STEPS.find((s) => s.id === id) || null;

/*
 * Guided Tour 순서 — 실제로 하는 순서 그대로다. (CLAUDE.md)
 * 통과해야 할 Mission 목록이 아니다. "다음 단계 보기"로 한 바퀴를 함께 돌아본다.
 * 완료 조건 / 성취 Gate 라는 개념을 사용자 화면에 두지 않는다.
 */
export const TOUR = ["clone", "env", "up", "ps", "check", "edit", "commit", "push", "down"];

/* 각 단계를 판정 용어가 아니라 "언제 쓰는지"로 설명한다 */
export const STEP_USE = {
  clone: "처음 한 번 · 코드를 받아올 때",
  env: "처음 한 번 · 실행에 필요한 값을 채울 때",
  up: "서비스를 켤 때",
  ps: "상태 확인 — 필요할 때 사용",
  check: "실제로 동작하는지 눈으로 볼 때",
  edit: "무언가 고칠 때",
  commit: "고친 내용을 기록으로 남길 때",
  push: "그 기록을 다른 곳과 나눌 때",
  down: "서비스 종료 — 작업을 마칠 때 사용"
};

/* 마지막 단계까지 함께 돌아봤는가 (평가가 아니라 Tour 의 끝) */
export function progressOf(state) {
  return TOUR.filter((id) => state[`seen_${id}`]).length;
}

export const DANGER = {
  cmd: "docker compose down -v",
  title: "이 명령은 기본 흐름에서 쓰지 않습니다",
  detail:
    "-v는 volume까지 지웁니다. 데이터베이스에 쌓인 데이터가 함께 사라지고 되돌릴 수 없습니다. " +
    "정말로 데이터를 지우려는 경우에만 따로 실행합니다."
};

/* 영어 대문자 완료 문구를 Primary 로 쓰지 않는다 (CLAUDE.md §23) */
export const FINAL_MESSAGE = "웹 애플리케이션 완성 ✓";

export default STEPS;
