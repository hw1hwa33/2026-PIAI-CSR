import { useCallback } from "react";

/* 코드 복사. 실패해도 화면이 깨지지 않도록 항상 boolean 을 돌려준다. */
export default function useClipboard() {
  return useCallback(async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }, []);
}
