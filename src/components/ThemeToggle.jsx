import { useState, useRef, useEffect } from "react";

export default function ThemeToggle({ theme, onToggle, onReset }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isDark = theme === "dark";

  return (
    <div className="theme-toggle-wrap" ref={ref}>
      <button
        className="theme-btn"
        onClick={() => setOpen((o) => !o)}
        title="Ganti tema"
        aria-label="Ganti tema"
      >
        <span className="theme-icon">{isDark ? "🌙" : "☀️"}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          style={{ marginLeft: 2, opacity: 0.5 }}
        >
          <path
            d="M2 3.5L5 6.5L8 3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="theme-dropdown">
          <button
            className={`theme-option ${theme === "light" ? "active" : ""}`}
            onClick={() => {
              if (theme !== "light") onToggle();
              setOpen(false);
            }}
          >
            <span>☀️</span> Light
          </button>
          <button
            className={`theme-option ${theme === "dark" ? "active" : ""}`}
            onClick={() => {
              if (theme !== "dark") onToggle();
              setOpen(false);
            }}
          >
            <span>🌙</span> Dark
          </button>
          <div className="theme-divider" />
          <button
            className="theme-option"
            onClick={() => {
              onReset();
              setOpen(false);
            }}
          >
            <span>💻</span> Ikuti sistem
          </button>
        </div>
      )}
    </div>
  );
}
