import { pickStatusCodes } from "../../data/statusCodes.js";

/*
 * 자주 보는 처리 결과 번호 — 참고표.
 *
 * 외우라고 두는 표가 아니다. 화면에서 숫자를 만났을 때 되돌아와 찾아보는 자리다.
 * 그래서 번호 · 이름 · 의미를 각각 다른 칸에 둔다 — 한 문장에 몰아넣지 않는다. (CLAUDE.md)
 * 모바일에서는 각 항목이 한 줄씩 쌓이도록 표가 아니라 목록으로 그린다.
 */
export default function StatusCodeReference({ codes }) {
  const rows = pickStatusCodes(codes);
  if (!rows.length) return null;

  return (
    <div className="status-ref">
      <h3 className="status-ref-title">자주 보는 처리 결과 번호</h3>
      <p className="status-ref-note">
        외울 필요는 없습니다. 화면에서 숫자를 만나면 여기로 돌아와 찾아보면 됩니다.
      </p>

      <ul className="status-ref-list">
        {rows.map((s) => (
          <li className={"status-ref-row is-" + String(s.code)[0] + "xx"} key={s.code}>
            <span className="status-ref-code">{s.code}</span>
            <span className="status-ref-name">{s.name}</span>
            <span className="status-ref-meaning">{s.meaning}</span>
            <span className="status-ref-when">{s.when}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
