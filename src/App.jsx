import { useState, useEffect, useCallback } from "react";
import climoraLogo from "./assets/climora-logo.png";
import { supabase } from "./lib/supabase";
import "./App.css";
import TemperatureGauge from "./components/TemperatureGauge";
import TemperatureChart from "./components/TemperatureChart";
import StatsCard from "./components/StatsCard";
import RecentReadings from "./components/RecentReadings";
import ACEfficiencyAnalysis from "./components/ACEfficiencyAnalysis";
import ThemeToggle from "./components/ThemeToggle";

const today = new Date().toISOString().slice(0, 10);
const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

export default function App() {
  const [dateFrom, setDateFrom] = useState(weekAgo);
  const [dateTo, setDateTo] = useState(today);
  const [data, setData] = useState([]);
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("tempora-theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("tempora-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const resetTheme = () => {
    const sys = window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
    setTheme(sys);
    localStorage.removeItem("tempora-theme");
  };

  const fetchLatest = useCallback(async () => {
    const { data: rows } = await supabase
      .from("sensors")
      .select("*")
      .order("recorded_at", { ascending: false })
      .limit(1);
    if (rows?.length) setLatest(rows[0]);
  }, []);

  const fetchByRange = useCallback(async () => {
    setLoading(true);
    const { data: rows, error } = await supabase
      .from("sensors")
      .select("*")
      .gte("recorded_at", `${dateFrom}T00:00:00`)
      .lte("recorded_at", `${dateTo}T23:59:59`)
      .order("recorded_at", { ascending: true });

    if (!error) setData(rows || []);
    setLoading(false);
  }, [dateFrom, dateTo]);

  useEffect(() => {
    fetchLatest();
    fetchByRange();
  }, [fetchLatest, fetchByRange]);

  // Compute stats from data
  const temps = data.map((d) => d.temperature).filter((t) => t != null);
  const avg = temps.length
    ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1)
    : "--";
  const min = temps.length ? Math.min(...temps).toFixed(1) : "--";
  const max = temps.length ? Math.max(...temps).toFixed(1) : "--";
  const count = data.length;

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <img
              src={climoraLogo}
              alt="Climora"
              style={{ height: 150, width: "auto" }}
            />
          </div>
          <span className="sensor-label">DHT22 · Sensor-01</span>
        </div>
        <div className="header-right">
          {latest && (
            <span className="last-updated">
              Terakhir:{" "}
              {new Date(latest.recorded_at).toLocaleString("id-ID", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          <div
            className={`status-badge ${latest ? "status-live" : "status-connecting"}`}
          >
            <span className="status-dot" />
            {latest ? "Live" : "Menghubungkan…"}
          </div>
          <ThemeToggle
            theme={theme}
            onToggle={toggleTheme}
            onReset={resetTheme}
          />
        </div>
      </header>

      <main className="main">
        {/* Top Section: Gauge + Stats */}
        <div className="top-section">
          <TemperatureGauge
            temperature={latest?.temperature ?? null}
            humidity={latest?.humidity ?? null}
          />
          <div>
            <p className="section-title">Statistik</p>
            <div className="stats-section">
              <StatsCard
                label="Rata-rata"
                value={`${avg}°C`}
                icon="μ"
                color="cyan"
              />
              <StatsCard
                label="Minimum"
                value={`${min}°C`}
                icon="↓"
                color="blue"
              />
              <StatsCard
                label="Maksimum"
                value={`${max}°C`}
                icon="↑"
                color="red"
              />
              <StatsCard
                label="Jumlah data"
                value={count}
                icon="#"
                color="gray"
              />
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="filter-bar">
          <div className="filter-group">
            <label className="filter-label">Dari tanggal</label>
            <input
              className="filter-input"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">Sampai tanggal</label>
            <input
              className="filter-input"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <button
            className="filter-btn"
            onClick={fetchByRange}
            disabled={loading}
          >
            {loading ? "Memuat…" : "Tampilkan data"}
          </button>
        </div>

        {/* Chart */}
        <TemperatureChart data={data} />

        {/* Efficiency Analysis */}
        <ACEfficiencyAnalysis data={data} />

        {/* Recent Readings Table */}
        <RecentReadings data={data} />
      </main>
    </div>
  );
}
