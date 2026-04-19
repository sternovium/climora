const getTempClass = (temp) => {
  if (temp >= 35) return "hot";
  if (temp >= 28) return "warm";
  if (temp < 18) return "cool";
  return "normal";
};

export default function RecentReadings({ readings }) {
  if (readings.length === 0) {
    return (
      <div className="table-card">
        <div className="table-empty">Belum ada data masuk</div>
      </div>
    );
  }

  return (
    <div className="table-card">
      <table className="readings-table">
        <thead>
          <tr>
            <th>Waktu</th>
            <th>Suhu</th>
            <th>Kelembaban</th>
            <th>Sensor</th>
          </tr>
        </thead>
        <tbody>
          {readings.map((r) => (
            <tr key={r.id}>
              <td className="time-cell">
                {new Date(r.created_at).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </td>
              <td>
                <span className={`temp-badge ${getTempClass(r.temperature)}`}>
                  {r.temperature.toFixed(1)}°C
                </span>
              </td>
              <td
                style={{
                  fontFamily: "Space Mono",
                  fontSize: 13,
                  color: r.humidity !== null ? "#a5b4fc" : "#374151",
                }}
              >
                {r.humidity !== null && r.humidity !== undefined
                  ? `${r.humidity.toFixed(1)}%`
                  : "—"}
              </td>
              <td
                style={{
                  fontFamily: "Space Mono",
                  fontSize: 12,
                  color: "#6b7280",
                }}
              >
                {r.sensor_id}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
