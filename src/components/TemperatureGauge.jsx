export default function TemperatureGauge({ temperature, humidity }) {
  const getColorClass = (temp) => {
    if (temp === null) return "";
    if (temp >= 35) return "hot";
    if (temp >= 28) return "warm";
    if (temp < 18) return "cool";
    return "";
  };

  const getArcColor = (temp) => {
    if (temp === null) return "#374151";
    if (temp >= 35) return "#f87171";
    if (temp >= 28) return "#fb923c";
    if (temp < 18) return "#60a5fa";
    return "#22d3ee";
  };

  // Arc gauge: maps 0-50°C to 0-180° sweep
  const MIN = 0,
    MAX = 50;
  const clamp = (v) => Math.min(Math.max(v, MIN), MAX);
  const toAngle = (v) => ((clamp(v) - MIN) / (MAX - MIN)) * 180;

  const polarToXY = (deg, r) => {
    const rad = ((deg - 180) * Math.PI) / 180;
    return { x: 100 + r * Math.cos(rad), y: 100 + r * Math.sin(rad) };
  };

  const angle = temperature !== null ? toAngle(temperature) : 0;
  const arcColor = getArcColor(temperature);

  // Build arc path
  const start = polarToXY(0, 70);
  const end = polarToXY(angle, 70);
  const largeArc = angle > 90 ? 1 : 0;

  const arcPath =
    temperature !== null
      ? `M ${start.x} ${start.y} A 70 70 0 ${largeArc} 1 ${end.x} ${end.y}`
      : "";

  const needleTip = polarToXY(angle, 65);

  return (
    <div className="gauge-card">
      <span className="gauge-title">Suhu Sekarang</span>

      <svg viewBox="0 0 200 110" className="gauge-svg">
        {/* Track */}
        <path
          d="M 30 100 A 70 70 0 0 1 170 100"
          fill="none"
          stroke="#1e2535"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Active arc */}
        {temperature !== null && (
          <path
            d={arcPath}
            fill="none"
            stroke={arcColor}
            strokeWidth="8"
            strokeLinecap="round"
          />
        )}
        {/* Needle dot */}
        {temperature !== null && (
          <circle cx={needleTip.x} cy={needleTip.y} r="5" fill={arcColor} />
        )}
        {/* Tick labels */}
        {[0, 10, 20, 30, 40, 50].map((v) => {
          const p = polarToXY(toAngle(v), 82);
          return (
            <text
              key={v}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="8"
              fill="#6b7280"
              fontFamily="Space Mono, monospace"
            >
              {v}
            </text>
          );
        })}
      </svg>

      <div className="gauge-value">
        {temperature !== null ? (
          <span className={`gauge-number ${getColorClass(temperature)}`}>
            {temperature.toFixed(1)}
            <span className="gauge-unit">°C</span>
          </span>
        ) : (
          <p className="gauge-no-data">Menunggu data...</p>
        )}
      </div>

      {humidity !== null && humidity !== undefined ? (
        <div className="gauge-humidity">
          💧 Kelembaban: <strong>{humidity.toFixed(1)}%</strong>
        </div>
      ) : null}
    </div>
  );
}
