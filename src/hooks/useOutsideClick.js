import { useEffect } from "react";

/*
 * ref 바깥을 눌렀을 때 handler 를 호출한다. (ChapterDropdown 닫기)
 * active 가 false 면 리스너를 아예 걸지 않는다.
 */
export default function useOutsideClick(ref, handler, active = true) {
  useEffect(() => {
    if (!active) return undefined;

    const onPointerDown = (e) => {
      const el = ref.current;
      if (!el) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      handler(e);
    };

    const onFocusIn = (e) => {
      const el = ref.current;
      if (!el) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      handler(e);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    document.addEventListener("focusin", onFocusIn);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, [ref, handler, active]);
}
