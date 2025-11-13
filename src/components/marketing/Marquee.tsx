"use client";
import React, { useEffect, useRef, useState } from 'react';

interface MarqueeProps {
  children: React.ReactNode;
  direction?: "left" | "right";
}

export default function Marquee({ children, direction = "left" }: MarqueeProps) {
  const copyRef = useRef<HTMLDivElement>(null);
  const [copyWidth, setCopyWidth] = useState(0);

  useEffect(() => {
    const el = copyRef.current;
    if (!el) return;

    const update = () => setCopyWidth(el.offsetWidth);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [children]);

  return (
    <div className="w-full overflow-hidden">
      <div
        className="flex"
        style={{
          width: copyWidth ? `${copyWidth * 2}px` : 'auto',
          '--move-distance': `${copyWidth}px`,
          animation: `${direction === "right" ? "marquee-right" : "marquee-left"} 20s linear infinite`
        } as React.CSSProperties}
      >
        <div ref={copyRef} className="flex flex-none">
          {children}
        </div>
        <div className="flex flex-none">
          {children}
        </div>
      </div>
      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-1 * var(--move-distance))); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(calc(-1 * var(--move-distance))); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
