"use client";

import { useEffect, useCallback, forwardRef, ReactNode } from "react";

interface ScreenshotGuardProps {
  children: ReactNode;
  className?: string;
  watermark?: string;
}

export const ScreenshotGuard = forwardRef<HTMLDivElement, ScreenshotGuardProps>(
  function ScreenshotGuard({ children, className = "", watermark, ...rest }, ref) {
    const blockKey = useCallback((e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        e.preventDefault();
        navigator.clipboard?.writeText?.("").catch(() => {});
      }
      if (
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "s") ||
        (e.metaKey && e.shiftKey && ["3", "4", "5"].includes(e.key))
      ) {
        e.preventDefault();
      }
    }, []);

    useEffect(() => {
      document.addEventListener("keyup", blockKey);
      document.addEventListener("keydown", blockKey);
      return () => {
        document.removeEventListener("keyup", blockKey);
        document.removeEventListener("keydown", blockKey);
      };
    }, [blockKey]);

    return (
      <div
        ref={ref}
        className={`screenshot-guard ${className}`}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        {...rest}
      >
        {children}
        {watermark && <Watermark text={watermark} />}
      </div>
    );
  }
);

/**
 * Standalone watermark overlay — place as sibling next to an Image
 * inside a `position: relative` container. Does not affect layout.
 */
export function Watermark({ text }: { text: string }) {
  const now = new Date();
  const timestamp =
    now.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    " " +
    now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  const label = `${text} \u2022 ${timestamp}`;

  return (
    <div
      className="absolute inset-0 z-10 pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
    >
      <div
        style={{
          position: "absolute",
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
          transform: "rotate(-30deg)",
          display: "flex",
          flexWrap: "wrap",
          gap: "32px 48px",
          alignContent: "flex-start",
          justifyContent: "flex-start",
          padding: "16px",
        }}
      >
        {Array.from({ length: 120 }).map((_, i) => (
          <span
            key={i}
            className="whitespace-nowrap"
            style={{
              fontSize: "14px",
              fontWeight: 800,
              color: "rgba(255,255,255,0.35)",
              textShadow: "0 1px 3px rgba(0,0,0,0.15), 0 0 6px rgba(0,0,0,0.08)",
              letterSpacing: "0.04em",
              userSelect: "none",
              WebkitUserSelect: "none",
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}