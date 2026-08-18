/*
 * Chapter 08 — Docker Compose.
 *
 * Legacy Chapter 08 에서 services / environment / volume / depends_on 설명 ·
 * 서비스별 설정 · 오류 2건 · summary 를 가져왔다.
 *
 * 단, Legacy 의 compose 는 web 을 `image: nginx:1.27-alpine` + volume 마운트로 썼다.
 * 현재 프로젝트 계약(src/data/project.js 의 compose.yaml)은 `build: ./nginx` 이므로
 * 현재 계약을 우선한다. (24_TECHNICAL_CONTENT_RULES §10 · CLAUDE.md 충돌 시 현재 규칙 우선)
 *
 * Compose 는 Request 가 통과하는 Hop 이 아니다. 서비스를 실행하고 이어 주는 환경 설정이다.
 */

export const COMPOSE_PATH = "compose.yaml";

export const SERVICES = [
  {
    id: "web",
    name: "web",
    tech: "Nginx",
    node: "nginx",
    role: "서비스 입구",
    external: "80",
    address: "바깥에서 http://localhost",
    dependsOn: ["backend"],
    volume: null,
    yaml: [
      "  web:",
      "    build: ./nginx",
      '    ports: ["80:80"]',
      "    depends_on: [backend]"
    ].join("\n"),
    rows: [
      ["서비스 이름", "web"],
      ["이미지", "./nginx 의 Dockerfile 로 빌드"],
      ["열린 포트", "80:80 (바깥 80 → 컨테이너 80)"],
      ["먼저 떠야 하는 것", "backend"],
      ["바깥 접근", "가능 — 이 서비스만 열려 있다"]
    ],
    note:
      "바깥에서 직접 접속할 수 있는 유일한 서비스입니다. " +
      "사용자의 요청은 항상 여기로 먼저 들어옵니다."
  },
  {
    id: "backend",
    name: "backend",
    tech: "Flask API",
    node: "flask",
    role: "요청 처리",
    external: null,
    address: "http://backend:5000 (컨테이너끼리만)",
    dependsOn: ["db"],
    volume: null,
    yaml: [
      "  backend:",
      "    build: ./backend",
      "    environment:",
      "      DB_HOST: db",
      "      DB_NAME: student_db",
      "      DB_USER: student_user",
      "      DB_PASSWORD: ${MYSQL_PASSWORD}",
      "    depends_on: [db]"
    ].join("\n"),
    rows: [
      ["서비스 이름", "backend"],
      ["이미지", "./backend 의 Dockerfile 로 빌드 (Chapter 07)"],
      ["열린 포트", "없음 — 바깥에서 직접 접속 불가"],
      ["내부 주소", "http://backend:5000"],
      ["DB 접속 정보", "환경 변수로 주입 (코드에 적지 않는다)"],
      ["먼저 떠야 하는 것", "db"]
    ],
    note:
      "포트를 바깥으로 열지 않습니다. Nginx의 proxy_pass 가 서비스 이름 그대로 " +
      "http://backend:5000 으로 찾아갑니다. 서비스 이름이 곧 주소가 됩니다."
  },
  {
    id: "db",
    name: "db",
    tech: "MySQL",
    node: "mysql",
    role: "데이터 보관",
    external: null,
    address: "db:3306 (컨테이너끼리만)",
    dependsOn: [],
    volume: "db_data",
    yaml: [
      "  db:",
      "    image: mysql:8.0",
      "    environment:",
      "      MYSQL_DATABASE: student_db",
      "      MYSQL_USER: student_user",
      "      MYSQL_PASSWORD: ${MYSQL_PASSWORD}",
      "      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}",
      "    volumes:",
      "      - db_data:/var/lib/mysql",
      "      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql:ro"
    ].join("\n"),
    rows: [
      ["서비스 이름", "db"],
      ["이미지", "mysql:8.0 (만들지 않고 받아서 쓴다)"],
      ["열린 포트", "없음 — backend 만 접근한다"],
      ["내부 주소", "db:3306"],
      ["volume", "db_data — 컨테이너를 지워도 데이터는 남는다"],
      ["처음 실행", "database/init.sql 로 표를 만든다"]
    ],
    note:
      "컨테이너를 지우면 그 안의 파일은 사라집니다. volume 에 저장해 두어야 " +
      "다시 띄워도 데이터가 남습니다."
  }
];

export const getService = (id) => SERVICES.find((s) => s.id === id) || null;

/* depends_on 을 따라 뜨는 순서. db 가 먼저, web 이 마지막이다. */
export const START_ORDER = ["db", "backend", "web"];

export const UP_CMD = "docker compose up -d --build";
export const PS_CMD = "docker compose ps";

/*
 * 서비스를 하나씩 켤 때 실제로 쓰는 명령.
 * docker compose up -d <서비스 이름> 은 그 서비스(와 먼저 시작해야 하는 것)를 띄운다.
 * 여기서는 시작 순서대로 하나씩 켜므로 먼저 시작할 것이 이미 떠 있는 상태다.
 */
export const upOne = (id) => `docker compose up -d ${id}`;

export function startLine(id) {
  const s = getService(id);
  return ` ✔ Container student-web-${s.name}-1  Started`;
}

export const NETWORK_LINE = " ✔ Network student-web_default  Created";

export const PS_OUTPUT = [
  "NAME                     SERVICE   STATUS    PORTS",
  "student-web-web-1        web       running   0.0.0.0:80->80/tcp",
  "student-web-backend-1    backend   running   5000/tcp",
  "student-web-db-1         db        running   3306/tcp"
].join("\n");

export default SERVICES;
