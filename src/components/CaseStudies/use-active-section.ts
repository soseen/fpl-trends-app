import { useEffect, useState } from "react";

export const useActiveSection = (items: readonly { id: string }[]): string => {
  const [activeSection, setActiveSection] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const sections = items
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);
    const firstSection = sections[0];
    if (!firstSection) return;

    let frame: number | undefined;

    const updateActiveSection = () => {
      frame = undefined;
      const scrollMargin =
        Number.parseFloat(window.getComputedStyle(firstSection).scrollMarginTop) || 0;
      // Match native anchor positioning, independent of the viewport height.
      const activationLine = scrollMargin + 1;
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
