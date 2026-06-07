export default function SensorCard({
  name = "Ruang Server",
  sensorLabel = "Sensor-01",
  temperature,
  humidity,
  lastUpdated,
}) {
  const getStatus = (temp) => {
    if (temp == null) return { label: "Tidak ada data", cls: "normal" };
    if (temp >= 32) return { label: "Alarm", cls: "danger" };
    if (temp >= 28) return { label: "Peringatan", cls: "warning" };
    if (temp < 18) return { label: "Alarm", cls: "danger" };
    if (temp < 22) return { label: "Peringatan", cls: "warning" };
    return { label: "Normal", cls: "normal" };
  };

  const status = getStatus(temperature);
  const hasData = temperature != null;

  return (
    <div className="sensor-card">
      <div className={`sensor-card-indicator ${status.cls}`} />
      <div className="sensor-card-body">
        {/* Header */}
        <div className="sensor-card-header">
          <div className="sensor-card-name">
            <span className="sensor-card-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
              </svg>
            </span>
            <span className="sensor-card-label">{name}</span>
          </div>
          <span className="sensor-card-sensor-id">DHT22 · {sensorLabel}</span>
        </div>

        {/* Readings — dua kolom */}
        {hasData ? (
          <>
            <div className="sensor-card-readings">
              {/* Kolom kiri: Suhu */}
              <div className="sensor-card-temp">
                <span className="sensor-card-temp-label">Suhu</span>
                <span className="sensor-card-temp-value">
                  {temperature.toFixed(1)}
                  <span className="sensor-card-temp-unit">°C</span>
                </span>
              </div>

              {/* Divider vertikal */}
              <div className="sensor-card-divider" />

              {/* Kolom kanan: Kelembaban */}
              {humidity != null && (
                <div className="sensor-card-humidity-col">
                  <div className="sensor-card-humidity-icon-wrap">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                    </svg>
                  </div>
                  <span className="sensor-card-humidity-label-lg">
                    Kelembaban
                  </span>
                  <span className="sensor-card-humidity-value-lg">
                    {humidity.toFixed(1)}
                    <span className="sensor-card-humidity-unit">%</span>
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sensor-card-footer">
              <span className={`sensor-card-status ${status.cls}`}>
                <span className="sensor-card-status-dot" />
                {status.label}
              </span>
              {lastUpdated && (
                <span className="sensor-card-updated">
                  {new Date(lastUpdated).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="sensor-card-no-data">Menunggu data sensor…</div>
        )}
      </div>
    </div>
  );
}
