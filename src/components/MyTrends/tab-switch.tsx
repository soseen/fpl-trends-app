import type { FC } from "react";
import clsx from "clsx";

type TabOption = { id: string; label: string };

type Props = {
  tabs: readonly [TabOption, TabOption];
  value: string;
  onChange: (id: string) => void;
};

// Centered pill toggle shared by combined sections in My Trends. Full-width
// on mobile (each button takes half the row), fixed ~384px total on desktop.
// Uses focus-visible (not focus) for the keyboard ring so mouse clicks don't
// leave a stray outline.
const TabSwitch: FC<Props> = ({ tabs, value, onChange }) => (
  <div className="flex w-full justify-center sm:w-auto">
    <div className="inline-flex w-full overflow-hidden rounded-md border border-accent4 bg-primary/40 sm:w-auto">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={clsx(
            "flex-1 px-4 py-1 text-xs font-semibold transition-colors sm:w-48 sm:flex-none sm:py-1.5 sm:text-sm",
            "focus:outline-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-magenta",
            value === t.id ? "bg-magenta text-white" : "text-text/70 hover:bg-accent4/30",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  </div>
);

export default TabSwitch;
