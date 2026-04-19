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

export default function TemperatureChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-card">
        <p className="chart-title">Riwayat Suhu</p>
        <div className="chart-empty">Tidak ada data untuk ditampilkan.</div>
      </div>
    );
  }

  const labels = data.map((d) =>
    new Date(d.recorded_at).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
  );
  const temps = data.map((d) => d.temperature);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Suhu sensor",
        data: temps,
        borderColor: "#22d3ee",
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return "rgba(34,211,238,0.1)";
          const gradient = canvasCtx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom,
          );
          gradient.addColorStop(0, "rgba(34,211,238,0.25)");
          gradient.addColorStop(1, "rgba(34,211,238,0.02)");
          return gradient;
        },
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "#22d3ee",
        pointHoverBorderColor: "#fff",
        pointHoverBorderWidth: 2,
        fill: true,
        tension: 0.4,
      },
      {
        label: "Batas atas (26°C)",
        data: data.map(() => 26),
        borderColor: "rgba(248, 113, 113, 0.5)",
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
        backgroundColor: "rgba(18, 22, 31, 0.95)",
        titleColor: "#e8eaf0",
        bodyColor: "#9ca3af",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: { family: "Space Mono" },
        bodyFont: { family: "DM Sans" },
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
          color: "#6b7280",
          font: { family: "Space Mono", size: 10 },
        },
        grid: { color: "rgba(255,255,255,0.04)" },
        border: { color: "rgba(255,255,255,0.06)" },
      },
      y: {
        min: 15,
        max: 40,
        ticks: {
          callback: (v) => v + "°C",
          color: "#6b7280",
          font: { family: "Space Mono", size: 10 },
        },
        grid: { color: "rgba(255,255,255,0.04)" },
        border: { color: "rgba(255,255,255,0.06)" },
      },
    },
  };

  return (
    <div className="chart-card">
      <p className="chart-title">Riwayat Suhu</p>
      <div style={{ position: "relative", height: 280 }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
