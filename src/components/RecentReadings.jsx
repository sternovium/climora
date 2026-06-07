import { useState, useMemo, useCallback } from "react";

const PAGE_SIZE = 10;

export default function RecentReadings({ data }) {
  const [page, setPage] = useState(1);

  const rows = useMemo(() => [...data].reverse(), [data]);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedRows = rows.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // Reset page when data changes
  useMemo(() => setPage(1), [data]);

  const statusOf = (t) => {
    if (t == null) return { label: "Tidak ada data", cls: "normal" };
    if (t >= 32) return { label: "Alarm", cls: "danger" };
    if (t >= 28) return { label: "Peringatan", cls: "warning" };
    if (t < 18) return { label: "Alarm", cls: "danger" };
    if (t < 22) return { label: "Peringatan", cls: "warning" };
    return { label: "Normal", cls: "normal" };
  };

  const tempClass = (t) => {
    if (t == null) return "normal";
    if (t >= 32 || t < 18) return "hot";
    if (t >= 28 || t < 22) return "warm";
    return "normal";
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const exportToExcel = useCallback(async () => {
    const XLSX = await import("xlsx");
    const exportData = rows.map((d) => ({
      Waktu: formatDate(d.recorded_at),
      "Suhu (°C)": d.temperature?.toFixed(1) ?? "-",
      "Kelembaban (%)": d.humidity?.toFixed(1) ?? "-",
      Status: statusOf(d.temperature).label,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Sensor");

    // Auto column width
    const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...exportData.map((r) => String(r[key]).length)) + 2,
    }));
    ws["!cols"] = colWidths;

    XLSX.writeFile(wb, `climora-data-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }, [rows]);

  const exportToPDF = useCallback(async () => {
    const { default: jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.setTextColor(26, 42, 63);
    doc.text("Climora — Data Monitoring Suhu", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(90, 122, 154);
    doc.text(`Diekspor: ${new Date().toLocaleString("id-ID")}`, 14, 28);
    doc.text(`Total data: ${rows.length} pembacaan`, 14, 34);

    // Table
    const tableData = rows.map((d) => [
      formatDate(d.recorded_at),
      d.temperature != null ? d.temperature.toFixed(1) + "°C" : "-",
      d.humidity != null ? d.humidity.toFixed(1) + "%" : "-",
      statusOf(d.temperature).label,
    ]);

    autoTable(doc, {
      startY: 42,
      head: [["Waktu", "Suhu", "Kelembaban", "Status"]],
      body: tableData,
      styles: {
        fontSize: 9,
        cellPadding: 4,
        textColor: [26, 42, 63],
      },
      headStyles: {
        fillColor: [45, 125, 210],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10,
      },
      alternateRowStyles: {
        fillColor: [240, 246, 255],
      },
      theme: "grid",
      margin: { left: 14, right: 14 },
    });

    doc.save(`climora-data-${new Date().toISOString().slice(0, 10)}.pdf`);
  }, [rows]);

  // Pagination range
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="table-card">
      <div className="table-header">
        <div className="table-header-left">
          <span className="table-title">Data Terbaru</span>
          <span className="table-count">{rows.length} data</span>
        </div>
        <div className="table-header-right">
          <button
            className="export-btn"
            onClick={exportToExcel}
            disabled={rows.length === 0}
            title="Export ke Excel"
            id="export-excel-btn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Excel
          </button>
          <button
            className="export-btn"
            onClick={exportToPDF}
            disabled={rows.length === 0}
            title="Export ke PDF"
            id="export-pdf-btn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <polyline points="9 15 12 18 15 15" />
            </svg>
            PDF
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="table-empty">Tidak ada data pada rentang ini.</div>
      ) : (
        <>
          <table className="readings-table">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Suhu</th>
                <th>Kelembaban</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((d, i) => {
                const s = statusOf(d.temperature);
                return (
                  <tr key={`${d.recorded_at}-${i}`}>
                    <td className="time-cell">{formatDate(d.recorded_at)}</td>
                    <td>
                      <span className={`temp-badge ${tempClass(d.temperature)}`}>
                        {d.temperature.toFixed(1)}°C
                      </span>
                    </td>
                    <td>
                      <span className="humidity-cell">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                        </svg>
                        {d.humidity != null ? `${d.humidity.toFixed(1)}%` : "—"}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${s.cls}`}>{s.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setPage(1)}
                disabled={currentPage === 1}
                title="Halaman pertama"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="11 17 6 12 11 7" />
                  <polyline points="18 17 13 12 18 7" />
                </svg>
              </button>
              <button
                className="pagination-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                title="Halaman sebelumnya"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              {getPageNumbers().map((p) => (
                <button
                  key={p}
                  className={`pagination-btn ${p === currentPage ? "active" : ""}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}

              <span className="pagination-info">
                {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, rows.length)} dari {rows.length}
              </span>

              <button
                className="pagination-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                title="Halaman berikutnya"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
              <button
                className="pagination-btn"
                onClick={() => setPage(totalPages)}
                disabled={currentPage === totalPages}
                title="Halaman terakhir"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="13 17 18 12 13 7" />
                  <polyline points="6 17 11 12 6 7" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
