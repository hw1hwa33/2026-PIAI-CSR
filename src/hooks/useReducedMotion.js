import { useEffect, useState } from "react";

/*
 * OS의 "동작 줄이기(prefers-reduced-motion)" 설정을 감지한다.
 * true 를 반환하면 App 이 .no-motion 을 붙여 모든 애니메이션을 멈춘다.
 */
const QUERY = "(prefers-reduced-motion: reduce)";

export default function useReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;

    const mql = window.matchMedia(QUERY);
    const onChange = (e) => setReduced(e.matches);

    setReduced(mql.matches);

    // Safari 14 이하는 addEventListener 를 지원하지 않는다.
    if (mql.addEventListener) {
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    }
    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, []);

  return reduced;
}
