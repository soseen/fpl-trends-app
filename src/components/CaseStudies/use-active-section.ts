import { useCallback, useEffect, useState, type MouseEvent } from "react";

export const useActiveSection = (items: readonly { id: string }[]) => {
  const [activeSection, setActiveSection] = useState(items[0]?.id ?? "");

  const getAnchors = useCallback(() => {
    const sections = items
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);
    const root = document.scrollingElement ?? document.documentElement;
    const maxScroll = Math.max(0, root.scrollHeight - root.clientHeight);
    const anchors = sections.map((section) => ({
      id: section.id,
      top: Math.max(
        0,
        section.getBoundingClientRect().top +
          window.scrollY -
          (Number.parseFloat(window.getComputedStyle(section).scrollMarginTop) || 0),
      ),
    }));
    const lastTop = anchors.at(-1)?.top ?? 0;

    // Reserve real scroll distance for trailing sections without blank page height.
    if (lastTop > maxScroll) {
      const gap = Math.min(
        120,
        maxScroll / Math.max(1, anchors.length - 1),
        ...anchors
          .slice(1)
          .map((anchor, index) => anchor.top - (anchors[index]?.top ?? 0)),
      );
      let nextTop = maxScroll;
      for (let index = anchors.length - 1; index >= 0; index--) {
        const anchor = anchors[index];
        if (!anchor) continue;
        anchor.top = Math.max(0, Math.min(anchor.top, nextTop));
        nextTop = anchor.top - gap;
      }
    }
    return { anchors, maxScroll };
  }, [items]);

  const scrollToSection = useCallback(
    (id: string) => {
      const anchor = getAnchors().anchors.find((anchor) => anchor.id === id);
      if (!anchor) return;
      window.scrollTo({ top: anchor.top, behavior: "instant" });
      setActiveSection(id);
    },
    [getAnchors],
  );

  const onSectionClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const hash = event.currentTarget.hash;
    const id = hash.slice(1);
    if (!items.some((item) => item.id === id)) return;
    event.preventDefault();
    if (window.location.hash !== hash) window.location.hash = hash;
    scrollToSection(id);
  };

  useEffect(() => {
    let frame: number | undefined;

    const updateActiveSection = () => {
      frame = undefined;
      const { anchors, maxScroll } = getAnchors();
      if (maxScroll === 0) {
        const linked = anchors.find((anchor) => `#${anchor.id}` === window.location.hash);
        setActiveSection(linked?.id ?? anchors[0]?.id ?? "");
        return;
      }
      let current = anchors[0]?.id ?? "";
      for (const anchor of anchors) {
        if (anchor.top > window.scrollY + 1) break;
        current = anchor.id;
      }
      setActiveSection(current);
    };

    const scheduleUpdate = () => {
      if (frame === undefined) frame = window.requestAnimationFrame(updateActiveSection);
    };

    const followHash = () => scrollToSection(window.location.hash.slice(1));

    followHash();
    updateActiveSection();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("hashchange", followHash);
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(document.body);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("hashchange", followHash);
      observer.disconnect();
      if (frame !== undefined) window.cancelAnimationFrame(frame);
    };
  }, [getAnchors, scrollToSection]);

  return { activeSection, onSectionClick };
};
