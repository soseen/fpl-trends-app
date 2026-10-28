import { useEffect, useState } from "react";

export const useActiveSection = (items: readonly { id: string }[]): string => {
  const [activeSection, setActiveSection] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const sections = items
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);
    const firstSection = sections[0];
    const lastSection = sections.at(-1);
    if (!firstSection || !lastSection) return;

    let frame: number | undefined;

    const updateActiveSection = () => {
      frame = undefined;
      const { scrollTop, scrollHeight, clientHeight } =
        document.scrollingElement ?? document.documentElement;

      // Short final sections may never reach the normal activation line.
      if (scrollTop > 0 && scrollTop + clientHeight >= scrollHeight - 2) {
        setActiveSection(lastSection.id);
        return;
      }

      const scrollMargin =
        Number.parseFloat(window.getComputedStyle(firstSection).scrollMarginTop) || 0;
      const activationLine = Math.max(window.innerHeight * 0.22, scrollMargin) + 1;
      let currentSection = firstSection;
      for (const section of sections) {
        if (section.getBoundingClientRect().top > activationLine) break;
        currentSection = section;
      }
      setActiveSection(currentSection.id);
    };

    const scheduleUpdate = () => {
      if (frame === undefined) frame = window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frame !== undefined) window.cancelAnimationFrame(frame);
    };
  }, [items]);

  return activeSection;
};
