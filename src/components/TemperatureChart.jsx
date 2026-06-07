import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend,
);

export default function TemperatureChart({ data, theme }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-card">
        <p className="chart-title">Tren Suhu</p>
        <div className="chart-empty">Tidak ada data untuk ditampilkan.</div>
      </div>
    );
  }

  const isDark = theme === "dark";

  const labels = data.map((d) =>
    new Date(d.recorded_at).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
  );
  const temps = data.map((d) => d.temperature);

  const lineColor = isDark ? "#4A90D9" : "#2D7DD2";
  const gridColor = isDark ? "rgba(42, 63, 90, 0.5)" : "rgba(208, 227, 245, 0.8)";
  const borderColor = isDark ? "rgba(42, 63, 90, 0.3)" : "rgba(208, 227, 245, 0.5)";
  const tickColor = isDark ? "#7A9BBD" : "#5A7A9A";
  const tooltipBg = isDark ? "rgba(26, 42, 63, 0.95)" : "rgba(255, 255, 255, 0.95)";
  const tooltipTitle = isDark ? "#E8F0FE" : "#1A2A3F";
  const tooltipBody = isDark ? "#7A9BBD" : "#5A7A9A";
  const tooltipBorder = isDark ? "rgba(42, 63, 90, 0.6)" : "rgba(208, 227, 245, 0.8)";
  const limitColor = isDark ? "rgba(240, 112, 112, 0.4)" : "rgba(192, 57, 43, 0.35)";

  const chartData = {
    labels,
    datasets: [
      {
        label: "Suhu sensor",
        data: temps,
        borderColor: lineColor,
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return isDark ? "rgba(74, 144, 217, 0.1)" : "rgba(45, 125, 210, 0.08)";
          const gradient = canvasCtx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom,
          );
          gradient.addColorStop(0, isDark ? "rgba(74, 144, 217, 0.25)" : "rgba(45, 125, 210, 0.15)");
          gradient.addColorStop(1, isDark ? "rgba(74, 144, 217, 0.02)" : "rgba(45, 125, 210, 0.01)");
          return gradient;
        },
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: lineColor,
        pointHoverBorderColor: isDark ? "#1A2A3F" : "#FFFFFF",
        pointHoverBorderWidth: 2,
        fill: true,
        tension: 0.4,
      },
      {
        label: "Batas atas (26°C)",
        data: data.map(() => 26),
        borderColor: limitColor,
        borderDash: [6, 4],
        borderWidth: 1,
        pointRadius: 0,
        pointHoverRadius: 0,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipTitle,
        bodyColor: tooltipBody,
        borderColor: tooltipBorder,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: { family: "Inter", weight: "600" },
        bodyFont: { family: "Inter" },
        callbacks: {
          label: (ctx) =>
            ctx.dataset.label === "Suhu sensor"
              ? `Suhu: ${ctx.parsed.y.toFixed(1)}°C`
              : ctx.dataset.label,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxTicksLimit: 8,
          color: tickColor,
          font: { family: "Inter", size: 10, weight: "500" },
        },
        grid: { color: gridColor },
        border: { color: borderColor },
      },
      y: {
        min: 15,
        max: 40,
        ticks: {
          callback: (v) => v + "°C",
          color: tickColor,
          font: { family: "Inter", size: 10, weight: "500" },
        },
        grid: { color: gridColor },
        border: { color: borderColor },
      },
    },
  };

  return (
    <div className="chart-card">
      <p className="chart-title">Tren Suhu</p>
      <div style={{ position: "relative", height: 280 }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
