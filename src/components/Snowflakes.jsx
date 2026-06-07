import { useMemo } from "react";

export default function Snowflakes() {
  const flakes = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => {
      const left = Math.random() * 100; // 0% to 100%
      const size = Math.random() * 12 + 12; // 12px to 24px (larger star size)
      const delay = Math.random() * 12; // 0s to 12s delay
      const duration = Math.random() * 15 + 10; // 10s to 25s duration
      const opacity = Math.random() * 0.5 + 0.15; // 0.15 to 0.65 opacity

      return {
        id: i,
        style: {
          left: `${left}%`,
          fontSize: `${size}px`,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
          opacity: opacity,
        },
      };
    });
  }, []);

  return (
    <div className="snowflakes-container" aria-hidden="true">
      {flakes.map((flake) => (
        <div key={flake.id} className="snowflake" style={flake.style}>
          ✦
        </div>
      ))}
    </div>
  );
}
