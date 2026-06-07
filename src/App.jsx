import { useState, useEffect, useCallback } from "react";
import { supabase } from "./lib/supabase";
import "./App.css";
import SensorCard from "./components/SensorCard";
import TemperatureChart from "./components/TemperatureChart";
import StatsCard from "./components/StatsCard";
import RecentReadings from "./components/RecentReadings";
import ACEfficiencyAnalysis from "./components/ACEfficiencyAnalysis";
import ThemeToggle from "./components/ThemeToggle";
import Snowflakes from "./components/Snowflakes";

const today = new Date().toISOString().slice(0, 10);
const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

// Daftar sensor — tambah objek baru di sini untuk menambah card
const SENSORS = [
  { id: "sensor-01", name: "Ruang 01", sensorId: "Sensor-01" },
  // { id: "sensor-02", name: "Ruang 02", sensorId: "Sensor-02" },
  // { id: "sensor-03", name: "Ruang 03", sensorId: "Sensor-03" },
];

export default function App() {
  const [dateFrom, setDateFrom] = useState(weekAgo);
  const [dateTo, setDateTo] = useState(today);
  const [data, setData] = useState([]);
  const [latestMap, setLatestMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [clock, setClock] = useState(new Date());
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("climora-theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  });

  // Theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("climora-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  // Clock
  useEffect(() => {
    const interval = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = clock.toLocaleString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Fetch latest — kalau schema belum ada kolom sensor_id,
  // semua card akan tampilkan data dari sensor pertama (fallback)
  const fetchLatest = useCallback(async () => {
    const { data: rows } = await supabase
      .from("sensors")
      .select("*")
      .order("recorded_at", { ascending: false })
      .limit(SENSORS.length);

    if (rows?.length) {
      const map = {};
      SENSORS.forEach((s) => {
        const match = rows.find((r) => r.sensor_id === s.id) ?? rows[0];
        map[s.id] = match;
      });
      setLatestMap(map);
    }
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

  const handleRefresh = async () => {
    setSpinning(true);
    await Promise.all([fetchLatest(), fetchByRange()]);
    setTimeout(() => setSpinning(false), 800);
  };

  const firstLatest = latestMap[SENSORS[0]?.id] ?? null;

  const temps = data.map((d) => d.temperature).filter((t) => t != null);
  const avg = temps.length
    ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1)
    : "--";
  const min = temps.length ? Math.min(...temps).toFixed(1) : "--";
  const max = temps.length ? Math.max(...temps).toFixed(1) : "--";
  const count = data.length;

  // Hitung kolom grid: 1 card = full, 2 = 2 kolom, 3+ = 3 kolom (max)
  const gridCols =
    SENSORS.length === 1
      ? "1fr"
      : SENSORS.length === 2
        ? "repeat(2, 1fr)"
        : "repeat(3, 1fr)";

  return (
    <div className="app">
      <Snowflakes />

      {/* Header */}
      <header className="header" id="dashboard-header">
        <div className="header-left">
          <div className="header-brand">
            <img
              src="/climora-logo-thermo.png"
              alt="Climora"
              style={{ height: "46px", width: "auto", objectFit: "contain" }}
            />
            <div>
              <h1 className="header-title">Climora</h1>
              <p className="header-subtitle">Dashboard Monitoring Suhu</p>
            </div>
          </div>
        </div>

        <div className="header-right">
          <div className="header-clock">
            <span className="header-clock-time">{formattedTime}</span>
          </div>

          <div className="header-divider" />

          <div
            className={`status-badge ${firstLatest ? "" : "connecting"}`}
            id="status-indicator"
          >
            <span className="status-dot" />
            {firstLatest ? "Live" : "Menghubungkan…"}
          </div>

          <button
            className={`refresh-btn ${spinning ? "spinning" : ""}`}
            onClick={handleRefresh}
            title="Refresh data"
            id="refresh-btn"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>

          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      <main className="main">
        {/* Sensor Grid */}
        <div
          className="sensor-grid"
          id="sensor-cards-grid"
          style={{ gridTemplateColumns: gridCols }}
        >
          {SENSORS.map((sensor) => {
            const latest = latestMap[sensor.id];
            return (
              <SensorCard
                key={sensor.id}
                name={sensor.name}
                sensorLabel={sensor.sensorId}
                temperature={latest?.temperature ?? null}
                humidity={latest?.humidity ?? null}
                lastUpdated={latest?.recorded_at}
              />
            );
          })}
        </div>

        {/* Stats */}
        <div className="stats-grid" id="stats-section">
          <StatsCard
            label="Rata-rata"
            value={`${avg}°C`}
            icon="μ"
            color="cyan"
          />
          <StatsCard label="Minimum" value={`${min}°C`} icon="↓" color="blue" />
          <StatsCard label="Maksimum" value={`${max}°C`} icon="↑" color="red" />
          <StatsCard label="Jumlah data" value={count} icon="#" color="gray" />
        </div>

        {/* Filter */}
        <div className="filter-bar" id="filter-section">
          <div className="filter-group">
            <label className="filter-label">Dari tanggal</label>
            <input
              className="filter-input"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              id="date-from"
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">Sampai tanggal</label>
            <input
              className="filter-input"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              id="date-to"
            />
          </div>
          <button
            className="filter-btn"
            onClick={fetchByRange}
            disabled={loading}
            id="filter-submit"
          >
            {loading ? "Memuat…" : "Tampilkan data"}
          </button>
        </div>

        {/* Chart */}
        <TemperatureChart data={data} theme={theme} />

        {/* Efficiency Analysis */}
        <ACEfficiencyAnalysis data={data} />

        {/* Data Table */}
        <RecentReadings data={data} />
      </main>

      {/* Footer */}
      <footer className="footer" id="dashboard-footer">
        <span className="footer-brand">Climora v1.0</span>
        <span>
          {firstLatest
            ? `Terakhir diperbarui: ${new Date(
                firstLatest.recorded_at,
              ).toLocaleString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}`
            : "Menunggu data…"}
        </span>
      </footer>
    </div>
  );
}
