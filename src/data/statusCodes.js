/*
 * 자주 보는 처리 결과 번호 (Status Code) — 공통 참고표.
 *
 * 암기표가 아니다. 실제로 마주쳤을 때 한 번에 찾아보는 참고표다. (CLAUDE.md)
 *   한 문장에 여러 번호를 몰아넣지 않는다.
 *   번호 · 이름 · 의미를 각각 다른 칸에 두어 모바일에서도 행으로 읽힌다.
 *
 * Chapter 는 chapter.statusCodes 로 보여 줄 번호만 고른다.
 */

export const STATUS_CODES = [
  {
    code: 200,
    name: "OK",
    meaning: "요청이 정상적으로 처리됨",
    when: "가져오기(GET)나 고치기(PATCH)가 잘 끝났을 때"
  },
  {
    code: 201,
    name: "Created",
    meaning: "새 데이터가 만들어짐",
    when: "새로 만들기(POST)가 성공했을 때"
  },
  {
    code: 204,
    name: "No Content",
    meaning: "성공했지만 돌려줄 내용이 없음",
    when: "지우기(DELETE)처럼 보여 줄 데이터가 남지 않을 때"
  },
  {
    code: 400,
    name: "Bad Request",
    meaning: "보낸 값이나 형식에 문제가 있음",
    when: "필요한 값을 빠뜨리고 보냈을 때"
  },
  {
    code: 404,
    name: "Not Found",
    meaning: "요청한 대상을 찾지 못함",
    when: "그 번호의 데이터가 없거나 주소가 등록돼 있지 않을 때"
  },
  {
    code: 405,
    name: "Method Not Allowed",
    meaning: "그 주소가 받지 않는 동작임",
    when: "목록 주소에 수정을 보내는 것처럼 짝이 맞지 않을 때"
  },
  {
    code: 500,
    name: "Internal Server Error",
    meaning: "서버가 처리하다 문제가 생김",
    when: "요청은 도착했지만 처리 도중에 오류가 났을 때"
  },
  {
    code: 502,
    name: "Bad Gateway",
    meaning: "입구가 뒤쪽 서버에 연결하지 못함",
    when: "요청 처리 서버가 꺼져 있을 때"
  }
];

export const getStatusCode = (code) =>
  STATUS_CODES.find((s) => s.code === Number(code)) || null;

/* Chapter 가 고른 번호만, 정의된 순서대로 돌려준다 */
export function pickStatusCodes(codes) {
  if (!Array.isArray(codes) || !codes.length) return [];
  const want = new Set(codes.map(Number));
  return STATUS_CODES.filter((s) => want.has(s.code));
}

export default STATUS_CODES;
