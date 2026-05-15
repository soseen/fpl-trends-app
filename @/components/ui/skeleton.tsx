import { cn } from "@/lib/utils";
import type React from "react";

// Shimmer skeleton: a horizontal gradient that animates from right to left
// via the `shimmer` keyframe (defined in tailwind.config.cjs). The
// `background-size: 200% 100%` is what makes the shift visible — without
// it the gradient would have nowhere to slide. Element-level `bg-*`
// overrides will defeat the gradient, so callers should drop them.
function Skeleton({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-shimmer rounded-md", className)}
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgb(var(--accent-3-rgb)) 0%, rgb(var(--accent-rgb)) 50%, rgb(var(--accent-3-rgb)) 100%)",
        backgroundSize: "200% 100%",
        ...style,
      }}
      {...props}
    />
  );
}

export { Skeleton };
