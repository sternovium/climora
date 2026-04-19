import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#1e2535",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8,
        padding: "10px 14px",
        fontFamily: "Space Mono, monospace",
        fontSize: 12,
      }}
    >
      <p style={{ color: "#6b7280", marginBottom: 4 }}>{label}</p>
      <p style={{ color: "#22d3ee" }}>
        Suhu: {payload[0]?.value?.toFixed(1)}°C
      </p>
      {payload[1] && (
        <p style={{ color: "#818cf8" }}>
          Kelembaban: {payload[1]?.value?.toFixed(1)}%
        </p>
      )}
    </div>
  );
};

export default function TemperatureChart({ readings }) {
  const data = readings.map((r) => ({
    time: new Date(r.created_at).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    temperature: parseFloat(r.temperature.toFixed(2)),
    humidity:
      r.humidity !== null && r.humidity !== undefined
        ? parseFloat(r.humidity.toFixed(2))
        : undefined,
  }));

  const hasHumidity = readings.some(
    (r) => r.humidity !== null && r.humidity !== undefined,
  );

  if (data.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-empty">Belum ada data untuk ditampilkan</div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart
          data={data}
          margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
          />
          <XAxis
            dataKey="time"
            tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "Space Mono" }}
            interval="preserveStartEnd"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "Space Mono" }}
            tickLine={false}
            axisLine={false}
            domain={["auto", "auto"]}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={30}
            stroke="rgba(251,146,60,0.3)"
            strokeDasharray="4 4"
          />
          <ReferenceLine
            y={35}
            stroke="rgba(248,113,113,0.3)"
            strokeDasharray="4 4"
          />
          <Area
            type="monotone"
            dataKey="temperature"
            stroke="#22d3ee"
            strokeWidth={2}
            fill="url(#tempGrad)"
            dot={false}
            activeDot={{ r: 4, fill: "#22d3ee", strokeWidth: 0 }}
          />
          {hasHumidity && (
            <Area
              type="monotone"
              dataKey="humidity"
              stroke="#818cf8"
              strokeWidth={1.5}
              fill="url(#humGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#818cf8", strokeWidth: 0 }}
              strokeDasharray="5 3"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
      <div
        style={{
          display: "flex",
          gap: 20,
          marginTop: 10,
          justifyContent: "center",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            color: "#6b7280",
            fontFamily: "Space Mono",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 24,
              height: 2,
              background: "#22d3ee",
              borderRadius: 2,
            }}
          />
          Suhu (°C)
        </span>
        {hasHumidity && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              color: "#6b7280",
              fontFamily: "Space Mono",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 24,
                height: 2,
                background: "#818cf8",
                borderRadius: 2,
                borderTop: "2px dashed #818cf8",
              }}
            />
            Kelembaban (%)
          </span>
        )}
      </div>
    </div>
  );
}
