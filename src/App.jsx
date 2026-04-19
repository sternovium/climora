import { useState, useEffect, useCallback } from "react";
import { supabase } from "./lib/supabase";
import TemperatureGauge from "./components/TemperatureGauge";
import TemperatureChart from "./components/TemperatureChart";
import StatsCard from "./components/StatsCard";
import RecentReadings from "./components/RecentReadings";
import ThemeToggle from "./components/ThemeToggle";
import "./App.css";

const SENSOR_ID = "arduino-1";
const MAX_CHART_POINTS = 50;

function useTheme() {
  const getInitial = () => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const [theme, setTheme] = useState(getInitial);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Sync with system preference changes (only if user hasn't manually set)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      if (!localStorage.getItem("theme")) {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const reset = () => {
    localStorage.removeItem("theme");
    setTheme(
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light",
    );
  };

  return { theme, toggle, reset };
}

export default function App() {
  const [readings, setReadings] = useState([]);
  const [latest, setLatest] = useState(null);
  const [status, setStatus] = useState("connecting");
  const [lastUpdated, setLastUpdated] = useState(null);
  const { theme, toggle, reset } = useTheme();

  const fetchInitialData = useCallback(async () => {
    const { data, error } = await supabase
      .from("temperature_readings")
      .select("*")
      .eq("sensor_id", SENSOR_ID)
      .order("created_at", { ascending: false })
      .limit(MAX_CHART_POINTS);

    if (error) {
      console.error("Fetch error:", error);
      setStatus("error");
      return;
    }

    const sorted = [...data].reverse();
    setReadings(sorted);
    if (data.length > 0) {
      setLatest(data[0]);
      setLastUpdated(new Date(data[0].created_at));
    }
    setStatus("live");
  }, []);

  useEffect(() => {
    fetchInitialData();

    const channel = supabase
      .channel("temperature-live")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "temperature_readings",
          filter: `sensor_id=eq.${SENSOR_ID}`,
        },
        (payload) => {
          const newReading = payload.new;
          setLatest(newReading);
          setLastUpdated(new Date(newReading.created_at));
          setReadings((prev) => {
            const updated = [...prev, newReading];
            return updated.slice(-MAX_CHART_POINTS);
          });
          setStatus("live");
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setStatus("live");
        if (status === "CHANNEL_ERROR") setStatus("error");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchInitialData]);

  const stats =
    readings.length > 0
      ? {
          min: Math.min(...readings.map((r) => r.temperature)).toFixed(1),
          max: Math.max(...readings.map((r) => r.temperature)).toFixed(1),
          avg: (
            readings.reduce((sum, r) => sum + r.temperature, 0) /
            readings.length
          ).toFixed(1),
          count: readings.length,
        }
      : null;

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">⬡</span>
            <span className="logo-text">Tempora</span>
          </div>
          <span className="sensor-label">Sensor: {SENSOR_ID}</span>
        </div>
        <div className="header-right">
          <div className={`status-badge status-${status}`}>
            <span className="status-dot" />
            {status === "live"
              ? "Live"
              : status === "connecting"
                ? "Menghubungkan..."
                : "Error"}
          </div>
          {lastUpdated && (
            <span className="last-updated">
              Update terakhir: {lastUpdated.toLocaleTimeString("id-ID")}
            </span>
          )}
          <ThemeToggle theme={theme} onToggle={toggle} onReset={reset} />
        </div>
      </header>

      <main className="main">
        <div className="top-section">
          <div className="gauge-section">
            <TemperatureGauge
              temperature={latest?.temperature ?? null}
              humidity={latest?.humidity ?? null}
            />
          </div>
          <div className="stats-section">
            <StatsCard
              label="Suhu Min"
              value={stats ? `${stats.min}°C` : "—"}
              icon="↓"
              color="blue"
            />
            <StatsCard
              label="Suhu Max"
              value={stats ? `${stats.max}°C` : "—"}
              icon="↑"
              color="red"
            />
            <StatsCard
              label="Rata-rata"
              value={stats ? `${stats.avg}°C` : "—"}
              icon="≈"
              color="green"
            />
            <StatsCard
              label="Total Data"
              value={stats ? stats.count : "—"}
              icon="#"
              color="gray"
            />
          </div>
        </div>

        <div className="chart-section">
          <h2 className="section-title">Riwayat Suhu</h2>
          <TemperatureChart readings={readings} />
        </div>

        <div className="table-section">
          <h2 className="section-title">Data Terbaru</h2>
          <RecentReadings readings={[...readings].reverse().slice(0, 20)} />
        </div>
      </main>
    </div>
  );
}
