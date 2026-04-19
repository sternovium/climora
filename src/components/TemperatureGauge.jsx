export default function TemperatureGauge({ temperature, humidity }) {
  const getColorClass = (temp) => {
    if (temp == null) return "";
    if (temp >= 35) return "hot";
    if (temp >= 28) return "warm";
    if (temp < 18) return "cool";
    return "";
  };

  const getArcColor = (temp) => {
    if (temp == null) return "#374151";
    if (temp >= 35) return "#f87171";
    if (temp >= 28) return "#fb923c";
    if (temp < 18) return "#60a5fa";
    return "#22d3ee";
  };

  // --- Speedometer geometry ---
  // Center of the gauge, radius
  const CX = 120,
    CY = 110,
    R = 80;
  const MIN_TEMP = 0,
    MAX_TEMP = 50;

  // Sweep from 225° to -45° (270° total sweep, like a car speedometer)
  // In SVG: 0° = 3 o'clock, goes clockwise with negative angles going counter-clockwise
  // We use: start at 225° (lower-left), sweep clockwise to 315° (lower-right)
  const START_ANGLE = 225; // degrees, lower-left
  const END_ANGLE = -45; // degrees, lower-right (same as 315°)
  const SWEEP = 270; // total degrees of arc

  // Convert angle in degrees to SVG x,y (0° = 3 o'clock, clockwise positive)
  const toXY = (angleDeg, radius) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: CX + radius * Math.cos(rad),
      y: CY - radius * Math.sin(rad), // SVG Y is inverted
    };
  };

  // Map temperature to angle
  const tempToAngle = (t) => {
    const clamped = Math.min(Math.max(t, MIN_TEMP), MAX_TEMP);
    const fraction = (clamped - MIN_TEMP) / (MAX_TEMP - MIN_TEMP);
    return START_ANGLE - fraction * SWEEP; // clockwise from start
  };

  // Build SVG arc path (clockwise in SVG = sweep-flag 0 when angle decreases)
  const arcPath = (fromAngle, toAngle, radius) => {
    const start = toXY(fromAngle, radius);
    const end = toXY(toAngle, radius);
    const angleDiff = fromAngle - toAngle;
    const largeArc = angleDiff > 180 ? 1 : 0;
    // sweep-flag 1 = clockwise in SVG (which is decreasing angle in our system)
    return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
  };

  const hasTemp = temperature != null;
  const currentAngle = hasTemp ? tempToAngle(temperature) : START_ANGLE;
  const arcColor = getArcColor(temperature);

  // Needle geometry
  const needleTip = toXY(currentAngle, R - 12);
  const needleBase1 = toXY(currentAngle + 90, 4);
  const needleBase2 = toXY(currentAngle - 90, 4);

  // Tick marks & labels
  const ticks = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
  const majorTicks = [0, 10, 20, 30, 40, 50];

  // Color zones for the arc background
  const zones = [
    { from: 0, to: 18, color: "rgba(96,165,250,0.25)" }, // cool
    { from: 18, to: 26, color: "rgba(34,211,238,0.25)" }, // normal
    { from: 26, to: 35, color: "rgba(251,146,60,0.25)" }, // warm
    { from: 35, to: 50, color: "rgba(248,113,113,0.25)" }, // hot
  ];

  return (
    <div className="gauge-card">
      <span className="gauge-title">Suhu Sekarang</span>

      <svg viewBox="0 0 240 155" className="gauge-svg">
        <defs>
          <filter id="needle-shadow">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.4" />
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Color zone arcs (background) */}
        {zones.map((zone, i) => (
          <path
            key={i}
            d={arcPath(tempToAngle(zone.from), tempToAngle(zone.to), R)}
            fill="none"
            stroke={zone.color}
            strokeWidth="10"
            strokeLinecap="butt"
          />
        ))}

        {/* Track — full arc outline */}
        <path
          d={arcPath(START_ANGLE, END_ANGLE, R)}
          fill="none"
          stroke="var(--bg4, #1e2535)"
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.4"
        />

        {/* Active arc — filled portion */}
        {hasTemp && (
          <path
            d={arcPath(START_ANGLE, currentAngle, R)}
            fill="none"
            stroke={arcColor}
            strokeWidth="10"
            strokeLinecap="round"
            filter="url(#glow)"
          />
        )}

        {/* Tick marks */}
        {ticks.map((v) => {
          const angle = tempToAngle(v);
          const isMajor = majorTicks.includes(v);
          const outerR = R + 2;
          const innerR = isMajor ? R - 14 : R - 8;
          const outer = toXY(angle, outerR);
          const inner = toXY(angle, innerR);
          return (
            <line
              key={`tick-${v}`}
              x1={outer.x}
              y1={outer.y}
              x2={inner.x}
              y2={inner.y}
              stroke={isMajor ? "var(--muted, #6b7280)" : "var(--bg4, #374151)"}
              strokeWidth={isMajor ? 2 : 1}
              strokeLinecap="round"
            />
          );
        })}

        {/* Tick labels (major only) */}
        {majorTicks.map((v) => {
          const angle = tempToAngle(v);
          const p = toXY(angle, R + 16);
          return (
            <text
              key={`label-${v}`}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="9"
              fill="var(--muted, #6b7280)"
              fontFamily="Space Mono, monospace"
              fontWeight="700"
            >
              {v}
            </text>
          );
        })}

        {/* Needle */}
        {hasTemp && (
          <g filter="url(#needle-shadow)">
            <polygon
              points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`}
              fill={arcColor}
              opacity="0.9"
            />
          </g>
        )}

        {/* Center hub */}
        <circle cx={CX} cy={CY} r="8" fill="var(--bg3, #1a1f2e)" stroke="var(--bg4, #222838)" strokeWidth="2" />
        <circle cx={CX} cy={CY} r="4" fill={hasTemp ? arcColor : "var(--muted, #6b7280)"} />
      </svg>

      <div className="gauge-value">
        {hasTemp ? (
          <span className={`gauge-number ${getColorClass(temperature)}`}>
            {temperature.toFixed(1)}
            <span className="gauge-unit">°C</span>
          </span>
        ) : (
          <p className="gauge-no-data">Menunggu data…</p>
        )}
      </div>

      {humidity != null && (
        <div className="gauge-humidity">
          💧 Kelembaban: <strong>{humidity.toFixed(1)}%</strong>
        </div>
      )}
    </div>
  );
}
