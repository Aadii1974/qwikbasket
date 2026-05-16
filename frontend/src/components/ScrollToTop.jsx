import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll immediately to prevent flash of scrolled content
    const scrollToTop = () => {
      // Scroll the window itself
      window.scrollTo(0, 0);
      // Also scroll document.documentElement in case the root is the scroll container
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      // Scroll the #root element if it has overflow
      const root = document.getElementById("root");
      if (root) root.scrollTop = 0;
    };

    // Fire immediately
    scrollToTop();
    // Fire again after the next paint to beat any layout shifts
    const raf = requestAnimationFrame(scrollToTop);
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
