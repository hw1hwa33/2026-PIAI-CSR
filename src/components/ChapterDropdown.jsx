import { useEffect, useRef, useState } from "react";
import useOutsideClick from "../hooks/useOutsideClick.js";

/*
 * Header 아래로 열리는 Chapter 선택 Dropdown (좌측 Drawer 아님)
 * Chapter 이동은 언제나 자유다 — 어떤 조건으로도 잠그지 않는다. (CLAUDE.md)
 */
export default function ChapterDropdown({ chapters, currentId, progress, onSelect }) {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(currentId - 1);
  const wrapRef = useRef(null);
  const listRef = useRef(null);
  const buttonRef = useRef(null);

  useOutsideClick(wrapRef, () => setOpen(false), open);

  useEffect(() => {
    if (!open) return undefined;
    setCursor(chapters.findIndex((c) => c.id === currentId));
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        if (buttonRef.current) buttonRef.current.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, chapters, currentId]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelectorAll("[data-item]")[cursor];
    if (el && el.focus) el.focus();
  }, [open, cursor]);

  const pick = (id) => {
    onSelect(id);
    setOpen(false);
    if (buttonRef.current) buttonRef.current.focus();
  };

  const onListKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(chapters.length - 1, c + 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => Math.max(0, c - 1)); }
    if (e.key === "Home") { e.preventDefault(); setCursor(0); }
    if (e.key === "End") { e.preventDefault(); setCursor(chapters.length - 1); }
  };

  return (
    <div className="dropdown" ref={wrapRef}>
      <button
        type="button"
        ref={buttonRef}
        className="btn btn--sm"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        Chapter 선택 {open ? "▲" : "▼"}
      </button>

      {open ? (
        <div className="dropdown-panel" role="menu" aria-label="Chapter 목록" onKeyDown={onListKey}>
          <div className="dropdown-head">
            <span>Chapter 선택</span>
            {/* 성취율처럼 보이지 않도록 개수만 적는다 */}
            <span>{chapters.length}개 · 어디로든 이동할 수 있습니다</span>
          </div>
          <ul className="dropdown-list" ref={listRef}>
            {chapters.map((c, i) => {
              const done = progress[c.id] === "COMPLETED";
              const current = c.id === currentId;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    data-item
                    role="menuitem"
                    tabIndex={cursor === i ? 0 : -1}
                    className={"dropdown-item" + (cursor === i ? " is-active" : "")}
                    aria-current={current ? "true" : undefined}
                    onClick={() => pick(c.id)}
                    onFocus={() => setCursor(i)}
                  >
                    <span className="dropdown-num">{current ? "●" : done ? "✓" : String(c.id).padStart(2, "0")}</span>
                    <span className="dropdown-text">
                      {String(c.id).padStart(2, "0")} {c.title}
                      <span className="dropdown-q">{c.coreQuestion}</span>
                    </span>
                    {/* 평가가 아니다. 미방문 Chapter 에는 아무 Tag 도 붙이지 않는다 —
                        "아직"은 해야 할 일이 남았다는 압박을 만든다. (CLAUDE.md) */}
                    {current ? <span className="tag tag--now">보는 중</span>
                      : done ? <span className="tag tag--done">살펴봄</span>
                      : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
