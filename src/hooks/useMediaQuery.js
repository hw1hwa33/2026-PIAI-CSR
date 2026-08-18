import { useEffect, useState } from "react";

/* 화면 폭에 따라 ProcessScene 이 WIDE / NARROW 레이아웃을 고른다. */
export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;

    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);

    setMatches(mql.matches);

    if (mql.addEventListener) {
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    }
    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, [query]);

  return matches;
}
