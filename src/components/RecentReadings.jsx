export default function RecentReadings({ data }) {
  const rows = [...data].reverse().slice(0, 20);

  const statusOf = (t) => {
    if (t < 18)
      return { label: "Terlalu dingin", cls: "cool" };
    if (t > 26)
      return { label: "Terlalu panas", cls: "warning" };
    return { label: "Normal", cls: "normal" };
  };

  const tempClass = (t) => {
    if (t >= 35) return "hot";
    if (t >= 28) return "warm";
    if (t < 18) return "cool";
    return "normal";
  };

  return (
    <div className="table-card">
      <div className="table-header">
        <span className="table-title">Data Terbaru</span>
        <span className="table-count">{rows.length} data</span>
      </div>
      {rows.length === 0 ? (
        <div className="table-empty">
          Tidak ada data pada rentang ini.
        </div>
      ) : (
        <table className="readings-table">
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Suhu</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d, i) => {
              const s = statusOf(d.temperature);
              return (
                <tr key={i}>
                  <td className="time-cell">
                    {new Date(d.recorded_at).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td>
                    <span className={`temp-badge ${tempClass(d.temperature)}`}>
                      {d.temperature.toFixed(1)}°C
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${s.cls}`}>
                      {s.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
