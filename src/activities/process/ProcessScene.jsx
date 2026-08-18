import { WIDE, NARROW } from "./sceneLayout.js";

/*
 * SPEC §10.3 / §18 — Computer · Nginx · Flask · MySQL 은 클릭과 키보드로 선택할 수 있어야 한다.
 * 기존 도형은 그대로 두고 투명한 조작 영역만 위에 얹는다.
 */
function SceneHit({ id, label, x, y, w, h, selected, onSelect }) {
  if (!onSelect) return null;
  return (
    <g
      className={"scene-hit" + (selected ? " is-selected" : "")}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={label}
      onClick={() => onSelect(id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
          e.preventDefault();
          onSelect(id);
        }
      }}
    >
      <rect className="scene-hit-area" x={x} y={y} width={w} height={h} rx="8" />
    </g>
  );
}

function BrowserScreen({ L, ui, student, clicked }) {
  const s = L.computer.screen;
  const cx = s.x + s.w / 2;
  return (
    <g>
      <rect className={"machine-screen is-" + ui} x={s.x} y={s.y} width={s.w} height={s.h} rx="4" />
      <rect className="machine-bar" x={s.x} y={s.y} width={s.w} height="18" rx="4" />
      <circle cx={s.x + 12} cy={s.y + 9} r="3" fill="#cdd1d5" />
      <circle cx={s.x + 24} cy={s.y + 9} r="3" fill="#cdd1d5" />
      <text className="screen-title" x={s.x + 14} y={s.y + 42}>학생 성적 조회</text>
      {ui === "initial" ? (
        <>
          <rect className="screen-field" x={s.x + 14} y={s.y + 56} width={s.w - 28} height="30" rx="4" />
          <text className="screen-hint" x={s.x + 24} y={s.y + 76}>학생 번호 {student.id}</text>
          <rect className={"screen-btn" + (clicked ? " is-pressed" : "")} x={s.x + 14} y={s.y + 98} width="80" height="30" rx="4" />
          <text className="screen-btn-text" x={s.x + 54} y={s.y + 118} textAnchor="middle">조회</text>
          {clicked ? <circle cx={s.x + 54} cy={s.y + 113} r="26" fill="none" stroke="var(--primary)" strokeWidth="2" opacity=".6" /> : null}
        </>
      ) : null}
      {ui === "loading" ? (
        <>
          <text className="screen-hint" x={s.x + 14} y={s.y + 76}>조회 중…</text>
          <rect className="screen-field" x={s.x + 14} y={s.y + 88} width={s.w - 28} height="14" rx="7" />
          <rect x={s.x + 14} y={s.y + 88} width={(s.w - 28) * 0.6} height="14" rx="7" fill="var(--primary)" opacity=".7" />
        </>
      ) : null}
      {ui === "success" ? (
        <>
          <text className="screen-value" x={cx} y={s.y + 78} textAnchor="middle">{student.name}</text>
          <text className="screen-score" x={cx} y={s.y + 116} textAnchor="middle">{student.score}점</text>
        </>
      ) : null}
    </g>
  );
}

function ServerRack({ L, active, visited, selected, onSelect }) {
  const bays = [
    ["nginx", "Nginx", "서비스 입구 · 길 안내"],
    ["flask", "Flask API", "요청을 처리하는 곳"],
    ["mysql", "MySQL", "데이터 저장소"]
  ];
  return (
    <g>
      <rect className="rack-body" x={L.rack.x} y={L.rack.y} width={L.rack.w} height={L.rack.h} rx="10" />
      <text className="rack-title" x={L.rack.title.x} y={L.rack.title.y}>SERVER</text>
      <path className="wire" d={L.spine} stroke="#464c53" strokeWidth="3" />
      {bays.map(([id, name, role]) => {
        const b = L.bays[id];
        const on = active === id;
        const done = visited.includes(id);
        const sel = selected === id;
        return (
          <g key={id}>
            <rect className={"bay" + (on ? " is-active" : "") + (done ? " is-done" : "") + (sel ? " is-selected" : "")} x={b.x} y={b.y} width={b.w} height={b.h} rx="6" />
            <circle className={"led" + (on ? " is-busy" : done ? " is-on" : "")} cx={b.x + 16} cy={b.y + b.h / 2} r="5" />
            <text className="bay-name" x={b.x + 34} y={b.y + 27}>{name}</text>
            <text className="bay-role" x={b.x + 34} y={b.y + 48}>{role}</text>
            {on
              ? <text className="bay-state is-active" x={b.x + b.w - 12} y={b.y + 27} textAnchor="end">처리 중</text>
              : done
                ? <text className="bay-state is-done" x={b.x + b.w - 12} y={b.y + 27} textAnchor="end">완료</text>
                : null}
            <SceneHit id={id} label={`${name} — ${role}`} x={b.x} y={b.y} w={b.w} h={b.h} selected={sel} onSelect={onSelect} />
          </g>
        );
      })}
    </g>
  );
}

function PacketCard({ L, packet, dot }) {
  if (!packet) return null;
  const w = L.card.w;
  const lines = (packet.lines || []).slice(0, 5);
  const h = 34 + lines.length * 18;
  const cx = Math.max(L.card.minX, Math.min(L.card.maxX, dot.x));
  const x = cx - w / 2;
  const y = L.card.y;
  return (
    <g className="packet-group" style={{ transform: `translate(${x}px, ${y}px)` }} aria-hidden="true">
      <rect className={"packet-card is-" + packet.kind} x="0" y="0" width={w} height={h} rx="8" />
      <text className={"packet-kind is-" + packet.kind} x="12" y="20">{packet.label}</text>
      {lines.map((ln, i) => (
        <text className="packet-line" key={i} x="12" y={40 + i * 18}>{ln}</text>
      ))}
    </g>
  );
}

export default function ProcessScene({ step, student, narrow, visited, selectedNode, onSelectNode }) {
  const L = narrow ? NARROW : WIDE;
  const anchor = step.packet ? L.anchors[step.packet.at] : null;
  const dot = anchor || L.anchors.browser;
  const cardCx = Math.max(L.card.minX, Math.min(L.card.maxX, dot.x));
  const lines = step.packet ? (step.packet.lines || []).slice(0, 5) : [];
  const cardH = 34 + lines.length * 18;

  return (
    <svg className="scene-svg" viewBox={L.view} role="group"
      aria-label={`요청 처리 장면 · ${step.title} — ${step.text}`}>
      {/* USER */}
      <g className="node-ico" transform={`translate(${L.user.x},${L.user.y})`}>
        <circle cx="0" cy="-9" r="7" />
        <path d="M-12 12 a12 12 0 0 1 24 0" />
      </g>
      <text className="machine-label" x={L.user.label.x} y={L.user.label.y} textAnchor="middle">USER</text>

      {/* COMPUTER */}
      <rect className="machine-body" x={L.computer.x} y={L.computer.y} width={L.computer.w} height={L.computer.h} rx="10" />
      <rect className="machine-body" x={L.computer.x + L.computer.w / 2 - 22} y={L.computer.y + L.computer.h} width="44" height="18" />
      <rect className="machine-body" x={L.computer.x + L.computer.w / 2 - 62} y={L.computer.y + L.computer.h + 18} width="124" height="10" rx="4" />
      <BrowserScreen L={L} ui={step.ui} student={student} clicked={!!step.click} />
      <text className="machine-label" x={L.computer.label.x} y={L.computer.label.y} textAnchor="middle">COMPUTER · Browser</text>
      <SceneHit
        id="browser"
        label="Computer · Browser — 요청을 만들고 결과를 그리는 곳"
        x={L.computer.x} y={L.computer.y} w={L.computer.w} h={L.computer.h}
        selected={selectedNode === "browser"} onSelect={onSelectNode}
      />

      {/* NETWORK */}
      {L.band ? (
        <text className="band-label" x={L.band.x} y={L.band.y} textAnchor="middle">{L.band.text}</text>
      ) : null}

      <path className={"wire wire--req" + (step.wire === "req" ? " is-live-req" : "")} d={L.wireOut.d} markerEnd="url(#scene-arrow-req)" />
      <text className={"wire-label wire-label--req" + (step.wire === "req" ? " is-live" : "")}
        x={L.wireOut.label.x} y={L.wireOut.label.y}
        textAnchor={L.wireOut.label.anchor || "middle"}>{L.wireOut.label.text}</text>
      <path className={"wire wire--res" + (step.wire === "res" ? " is-live-res" : "")} d={L.wireBack.d} markerEnd="url(#scene-arrow-res)" />
      <text className={"wire-label wire-label--res" + (step.wire === "res" ? " is-live" : "")}
        x={L.wireBack.label.x} y={L.wireBack.label.y}
        textAnchor={L.wireBack.label.anchor || "middle"}>{L.wireBack.label.text}</text>

      <defs>
        <marker id="scene-arrow-req" viewBox="0 0 12 10" refX="11" refY="5" markerWidth="12" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto">
          <path d="M 0 0 L 12 5 L 0 10 z" fill="var(--request)" />
        </marker>
        <marker id="scene-arrow-res" viewBox="0 0 12 10" refX="11" refY="5" markerWidth="12" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto">
          <path d="M 0 0 L 12 5 L 0 10 z" fill="var(--success)" />
        </marker>
      </defs>

      <ServerRack
        L={L}
        active={step.active === "nginx" || step.active === "flask" || step.active === "mysql" ? step.active : null}
        visited={visited}
        selected={selectedNode}
        onSelect={onSelectNode}
      />

      {/* 이동하는 데이터 + 현재 의미를 보여 주는 카드 */}
      {step.packet ? (
        <>
          <line x1={cardCx} y1={L.card.y + cardH} x2={dot.x} y2={dot.y}
            stroke="var(--border-strong)" strokeWidth="1.5" strokeDasharray="4 4" />
          <g className="packet-group" style={{ transform: `translate(${dot.x}px, ${dot.y}px)` }}>
            <circle r="11" className={"packet-card is-" + step.packet.kind} />
          </g>
          <PacketCard L={L} packet={step.packet} dot={dot} />
        </>
      ) : null}
    </svg>
  );
}
