export function analyzeEfficiency(data) {
  if (!data || data.length === 0) return null;
  const temps = data.map((d) => d.temperature);
  const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const std = Math.sqrt(
    temps.reduce((a, b) => a + (b - avg) ** 2, 0) / temps.length,
  );
  const range = max - min;
  const inTarget =
    (temps.filter((t) => t >= 20 && t <= 25).length / temps.length) * 100;

  let score = 100;
  if (std > 3) score -= 30;
  else if (std > 2) score -= 15;
  else if (std > 1) score -= 5;
  if (range > 8) score -= 25;
  else if (range > 6) score -= 15;
  else if (range > 4) score -= 8;
  if (inTarget < 60) score -= 20;
  else if (inTarget < 75) score -= 10;
  else if (inTarget < 85) score -= 5;

  return {
    avg,
    min,
    max,
    std,
    range,
    inTarget,
    score: Math.max(0, Math.min(100, score)),
    label:
      score >= 80
        ? "Efisien"
        : score >= 60
          ? "Cukup efisien"
          : "Kurang efisien",
    status: score >= 80 ? "good" : score >= 60 ? "warning" : "danger",
    conclusion:
      score >= 80
        ? "AC bekerja optimal"
        : score >= 60
          ? "Perlu pengecekan berkala"
          : "Disarankan servis AC",
  };
}

export default function ACEfficiencyAnalysis({ data }) {
  const result = analyzeEfficiency(data);
  if (!result)
    return (
      <div className="efficiency-card">
        <p className="efficiency-title">Analisis Efisiensi AC</p>
        <div className="chart-empty">Tidak ada data untuk dianalisis.</div>
      </div>
    );

  const items = [
    {
      label: "Stabilitas suhu",
      value: `${result.std <= 2 ? "Stabil" : "Tidak stabil"} (σ = ${result.std.toFixed(1)}°C)`,
    },
    {
      label: "Rentang operasi",
      value: `${result.range.toFixed(1)}°C ${result.range <= 6 ? "(ideal)" : "(ideal ≤ 6°C)"}`,
    },
    {
      label: "Waktu di zona target",
      value: `${result.inTarget.toFixed(0)}% dalam 20–25°C`,
    },
    { label: "Kesimpulan", value: result.conclusion },
  ];

  return (
    <div className="efficiency-card">
      <div className="efficiency-header">
        <span className="efficiency-title">Analisis Efisiensi AC</span>
        <span className={`efficiency-badge ${result.status}`}>
          {result.label}
        </span>
      </div>

      <div className="efficiency-score-row">
        <span>Skor efisiensi</span>
        <span>{result.score.toFixed(0)}%</span>
      </div>
      <div className="efficiency-bar">
        <div
          className={`efficiency-bar-fill ${result.status}`}
          style={{ width: `${result.score}%` }}
        />
      </div>

      <div className="efficiency-grid">
        {items.map((item) => (
          <div key={item.label} className="efficiency-item">
            <div className="efficiency-item-label">{item.label}</div>
            <div className="efficiency-item-value">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
