import { useCallback, useEffect, useRef, useState } from "react";
import Disclosure from "../../components/common/Disclosure.jsx";
import {
  QUERIES,
  COLUMNS,
  PARAM_NOTES,
  ROWS,
  TABLE,
  INIT_PATH,
  runQuery
} from "../../data/sql.js";

/*
 * Chapter 13 Primary Visualization — SQL Table / Row → JSON
 * (11_PROJECT_UI_SPEC §26 — Chapter 13)
 *
 * 앞 Chapter 들의 Activity 를 복제하지 않는다.
 * 여기서 배우는 것은 "대상을 정하는 것은 WHERE 다"와 "행 하나가 JSON 이 된다" 두 가지다.
 * 그래서 화면의 주인공은 실제 표이고, 어떤 행이 대상이 되는지가 표 위에서 바로 보여야 한다.
 *
 * WHERE 가 없는 UPDATE 는 실행하지 않고 결과만 예고한다.
 * (24_TECHNICAL_CONTENT_RULES §7 · CLAUDE.md Hard Rules — 파괴적 명령을 기본 흐름에서 실행하지 않는다)
 */
export default function SqlTableActivity({
  activity,
  selectedNode,
  onSelectNode,
  onOutcome,
  onFocus,
  onComplete,
  onNotify
}) {
  const [rows, setRows] = useState(ROWS);
  const [result, setResult] = useState(null);
  const [seen, setSeen] = useState({ where: false, write: false, danger: false });
  const doneRef = useRef(false);

  useEffect(() => { onFocus({ node: "mysql", edge: "flask-mysql" }); }, [onFocus]);

  const run = useCallback((id) => {
    const res = runQuery(rows, id);
    setResult(res);
    if (selectedNode !== "mysql") onSelectNode("mysql");
    onFocus({ node: "mysql", edge: "flask-mysql" });

    if (res.next) setRows(res.next);

    const key = res.query.kind === "danger" ? "danger"
      : res.query.kind === "write" ? "write"
      : res.query.target ? "where" : null;
    if (key) setSeen((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  }, [rows, selectedNode, onSelectNode, onFocus]);

  const doneCount = ["where", "write", "danger"].filter((k) => seen[k]).length;

  useEffect(() => {
    if (doneCount < 3 || doneRef.current) return;
    doneRef.current = true;
    onOutcome({
      status: "success",
      title: "대상을 정하는 것은 WHERE입니다",
      text:
        "조회는 데이터를 바꾸지 않고, 수정·삭제는 조건에 맞는 행만 바꿉니다. " +
        "WHERE가 빠지면 조건이 '전부'가 되어 되돌릴 수 없는 변경이 일어납니다. " +
        "Chapter 14에서는 지금까지의 계층을 하나의 요청으로 이어서 추적합니다."
    });
    onComplete();
    onNotify("조회 · 변경 · 위험한 명령을 모두 확인했습니다");
  }, [doneCount, onOutcome, onComplete, onNotify]);

  const reset = () => {
    doneRef.current = false;
    setRows(ROWS);
    setResult(null);
    setSeen({ where: false, write: false, danger: false });
    onOutcome(null);
    onNotify("표를 처음 상태로 되돌렸습니다");
  };

  const shown = result ? result.preview : rows;
  const affected = result ? result.affected : [];
  const danger = !!result && result.query.kind === "danger";

  const remaining = !seen.where ? "한 명만 찾는 질문"
    : !seen.write ? "값을 바꾸거나 지우는 질문"
    : !seen.danger ? "조건을 빠뜨리면 어떻게 되는지" : null;

  return (
    <section className="section" aria-labelledby="activity-heading">
      <h2 className="section-title" id="activity-heading">{activity.title}</h2>
      {activity.guide ? <p className="section-desc">{activity.guide}</p> : null}

      <div className="panel activity-panel">
        <p className="sim-notice" role="note">
          <span className="tag tag--warn">학습용 시뮬레이션</span>
          <span className="sim-notice-title">SQL 연습 화면</span>
          <span className="sim-notice-body">
            실제 데이터베이스에 연결하지 않습니다. WHERE가 없는 명령은 실행하지 않고 결과만 미리 보여 줍니다.
          </span>
        </p>

        <p className="explore-hint" aria-live="polite">
          {remaining ? `${remaining}도 눌러 보세요.` : "세 가지를 모두 봤습니다. 다시 눌러 비교해 봐도 됩니다."}
          {result ? <button type="button" className="btn btn--sm" onClick={reset}>표 되돌리기</button> : null}
        </p>

        {/* ---------- 표 ---------- */}
        <div className="sql-table-wrap">
          <p className="sql-table-head">
            <span className="sql-table-name">{TABLE}</span>
            <span className="sql-table-file">{INIT_PATH} 로 만들어진 표</span>
          </p>

          <table className={"sql-table" + (danger ? " is-danger" : "")}>
            <caption className="sql-caption">
              {danger
                ? "실행했다면 이렇게 된다 (실행하지 않음)"
                : result
                  ? result.countLabel
                  : "현재 저장된 행"}
            </caption>
            {/* 첫 화면의 표 머리글은 데이터만 보여 준다 — 칸 정의는 아래 펼침에서 (CLAUDE.md §21) */}
            <thead>
              <tr>
                {COLUMNS.map((c) => (
                  <th key={c.id} scope="col">
                    <span className="sql-col">{c.id}</span>
                    <span className="sql-col-type">{c.label}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr
                  key={r.id}
                  className={affected.includes(r.id) ? (danger ? "is-warn" : "is-hit") : ""}
                >
                  <td>{r.id}{affected.includes(r.id) ? <span className="sql-mark">대상</span> : null}</td>
                  <td>{r.name}</td>
                  <td>{r.score}</td>
                </tr>
              ))}
              {shown.length === 0 ? (
                <tr><td colSpan={COLUMNS.length}>남은 행이 없습니다</td></tr>
              ) : null}
            </tbody>
          </table>

          <Disclosure
            tone="quiet"
            label="표 구조 자세히 보기"
            note="각 칸이 어떤 값을 담도록 정해져 있는지"
          >
            <ul className="sql-schema">
              {COLUMNS.map((c) => (
                <li className="sql-schema-item" key={c.id}>
                  <p className="sql-schema-head">
                    <span className="sql-schema-label">{c.label}</span>
                    <code className="sql-schema-id">{c.id}</code>
                    <span className="sql-schema-role">{c.role}</span>
                  </p>
                  <ul className="sql-schema-parts">
                    {c.parts.map(([mark, desc]) => (
                      <li key={mark}>
                        <code className="sql-schema-mark">{mark}</code>
                        <span className="sql-schema-desc">{desc}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            <p className="cmd-detail">
              이 정의는 {INIT_PATH} 가 처음 실행될 때 한 번 정해집니다.
            </p>
          </Disclosure>
        </div>

        {/* ---------- 질문 → 질의 ---------- */}
        <div className="sql-pick">
          <h3 className="builder-title">무엇이 궁금한가요?</h3>
          <p className="builder-hint">
            알고 싶은 것을 하나 눌러 보세요. 위 표에서 어떤 줄이 대상이 되는지 바로 표시되고,
            그다음에 데이터베이스에는 이 질문을 어떻게 적는지 보여 줍니다.
          </p>
          {/* 먼저 질문만 고르게 한다. SQL 문장은 고른 뒤에 보여 준다. (CLAUDE.md) */}
          <ul className="sql-list">
            {QUERIES.map((q) => {
              const picked = result && result.query.id === q.id;
              return (
                <li className={"sql-option" + (q.kind === "danger" ? " is-danger" : "")} key={q.id}>
                  <button
                    type="button"
                    className={"btn btn--sm sql-btn" + (picked ? " is-last" : "")}
                    onClick={() => run(q.id)}
                  >
                    {q.question || q.label}
                  </button>
                  <span className="sql-desc">
                    {q.kind === "danger" ? "실행하지 않고 결과만 미리 보여 줍니다" : q.desc}
                  </span>
                  {picked ? (
                    <code className="sql-code">
                      {q.sql}{q.params ? `  ${q.params}` : ""}
                    </code>
                  ) : null}
                </li>
              );
            })}
          </ul>

          {/* %s 와 (1,) 는 SQL 이 실제로 보인 뒤에만 설명한다 */}
          {result ? (
            <ul className="sql-params">
              {PARAM_NOTES.map((p) => (
                <li className="sql-param" key={p.mark}>
                  <code className="sql-param-mark">{p.mark}</code>
                  <span className="sql-param-role">{p.role}</span>
                  <span className="sql-param-desc">{p.desc}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* ---------- 결과 ---------- */}
        <div className="cmd-result" aria-live="polite">
          {result ? (
            <>
              <p className="cmd-note">
                <span className={"tag " + (danger ? "tag--error" : "tag--done")}>
                  {danger ? "실행하지 않음" : result.query.kind === "read" ? "조회" : "변경됨"}
                </span>
                <strong className="repo-result-title">{result.countLabel}</strong>
              </p>

              <pre className="cmd-output"><code>
                <span className="cmd-echo">
                  <span className="cmd-echo-prompt">{"mysql> "}</span>
                  {result.query.sql}
                </span>
                {result.query.params ? `\n-- 전달한 값 ${result.query.params}` : ""}
                {"\n" + (danger ? "(안전을 위해 실행하지 않았습니다)" : result.countLabel)}
              </code></pre>

              <p className="cmd-detail">{result.query.detail}</p>
              <p className="cmd-detail">{result.verdict}</p>

              {result.json ? (
                <>
                  <p className="sql-json-head">이 결과가 Flask에서 JSON으로 바뀝니다</p>
                  <pre className="wire-block wire-block--res"><code>
                    <span className="wire-line wire-line--body">{result.json}</span>
                  </code></pre>
                </>
              ) : null}
            </>
          ) : (
            <p className="cmd-empty">
              실행할 SQL을 고르면 어떤 행이 대상이 되는지 위 표에서 바로 표시됩니다.
            </p>
          )}
        </div>

        <p className="map-foot">
          데이터가 실제로 남는 곳은 여기입니다. 화면과 Flask는 이 표를 읽고 쓸 뿐 보관하지 않습니다.
        </p>
      </div>
    </section>
  );
}
