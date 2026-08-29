/**
 * SupplySense — Manager Report Export Utility (PDF & CSV)
 */

export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvLines: string[] = [];
  csvLines.push(headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(","));

  for (const row of rows) {
    csvLines.push(
      row
        .map((cell) => {
          const val = cell == null ? "" : String(cell);
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(",")
    );
  }

  const csvString = "\uFEFF" + csvLines.join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToPDF(
  reportTitle: string,
  subtitle: string,
  headers: string[],
  rows: (string | number)[][],
  filename: string
) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to download the PDF report.");
    return;
  }

  const currentDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const tableHeaderHtml = headers
    .map(
      (h) =>
        `<th style="padding: 10px 12px; text-align: left; background-color: #F8FAFC; border-bottom: 2px solid #E2E8F0; font-size: 11px; text-transform: uppercase; color: #475569;">${h}</th>`
    )
    .join("");

  const tableRowsHtml = rows
    .map(
      (row, idx) => `
      <tr style="background-color: ${idx % 2 === 0 ? "#FFFFFF" : "#F8FAFC"}; border-bottom: 1px solid #E2E8F0;">
        ${row
          .map(
            (cell) =>
              `<td style="padding: 10px 12px; font-size: 12px; color: #1E293B;">${cell == null ? "-" : cell}</td>`
          )
          .join("")}
      </tr>
    `
    )
    .join("");

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${reportTitle} — SupplySense Executive Report</title>
        <style>
          body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; margin: 0; padding: 30px; color: #0F172A; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #1E293B; padding-bottom: 15px; margin-bottom: 25px; }
          .title-area h1 { font-size: 22px; margin: 0; color: #0F172A; }
          .title-area p { font-size: 12px; color: #64748B; margin: 4px 0 0 0; }
          .meta-area { text-align: right; font-size: 11px; color: #64748B; }
          .meta-area strong { color: #0F172A; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          .footer { margin-top: 40px; border-top: 1px solid #E2E8F0; padding-top: 15px; text-align: center; font-size: 10px; color: #94A3B8; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title-area">
            <h1>SupplySense — ${reportTitle}</h1>
            <p>${subtitle}</p>
          </div>
          <div class="meta-area">
            <strong>OFFICIAL EXECUTIVE REPORT</strong><br/>
            Generated: ${currentDate}<br/>
            Scope: All Regional Hubs
          </div>
        </div>

        <button onclick="window.print()" class="no-print" style="margin-bottom: 15px; padding: 8px 16px; background-color: #0F172A; color: #FFF; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold;">
          🖨️ Print / Save as PDF
        </button>

        <table>
          <thead>
            <tr>${tableHeaderHtml}</tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>

        <div class="footer">
          SupplySense AI Supply Chain Risk & Inventory Intelligence Hub — Confidential & Proprietary Report
        </div>

        <script>
          setTimeout(() => {
            window.print();
          }, 400);
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
