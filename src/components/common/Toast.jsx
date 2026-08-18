import { useEffect } from "react";

/* App 이 넘긴 { text, type } 을 잠깐 띄우고 스스로 사라진다. */
export default function Toast({ toast, onDone, duration = 2400 }) {
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, [toast, onDone, duration]);

  if (!toast) return null;

  const type = toast.type || "ok";

  return (
    <div
      className={`toast toast--${type}`}
      role="status"
      aria-live="polite"
      key={toast.text + type}
    >
      <span aria-hidden="true">
        {type === "error" ? "✕" : type === "warn" ? "!" : "✓"}
      </span>
      <span>{toast.text}</span>
    </div>
  );
}
