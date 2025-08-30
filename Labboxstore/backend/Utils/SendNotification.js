const NotificationModels = require("../Models/Notification.Models");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const XLSX = require("xlsx");
const nodemailer = require("nodemailer");
require("dotenv").config();

// -------------------- Shared --------------------
async function fetchHistoryData() {
  const response = await NotificationModels.GetAllData();
  return response;
}

function createTransporter() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "billwachi2550@gmail.com",
      pass: "efnp cxcv zvds zpqs",
    },
  });
}

// -------------------- CSV --------------------
function generateCSV(data, filePath) {
  if (data.length === 0) {
    fs.writeFileSync(filePath, "No data.\n", "utf8");
    return;
  }
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(",")];
  for (const row of data) {
    const values = headers.map(
      (h) => `"${String(row[h] || "").replace(/"/g, '""')}"`
    );
    csvRows.push(values.join(","));
  }
  fs.writeFileSync(filePath, csvRows.join("\n"), "utf8");
}

async function sendCSV(filePath, ReceiveEmail) {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: "billwachi2550@gmail.com",
    to: ReceiveEmail,
    subject: "ESD CSV Report",
    html: "<h3>Attached CSV file</h3>",
    attachments: [{ filename: "ESD_Report.csv", path: filePath }],
  });
}

// -------------------- PDF --------------------
function generatePDF(data, filePath) {
  const doc = new PDFDocument({ margin: 40 });
  doc.pipe(fs.createWriteStream(filePath));

  // Title
  doc.font("Helvetica-Bold").fontSize(24).text("ESD Report", {
    align: "center",
  });
  doc.moveDown(2);

  if (data.length === 0) {
    doc.fontSize(14).text("No data available.", { align: "center" });
  } else {
    // Remove 'id' from headers
    const headers = Object.keys(data[0]).filter((h) => h !== "id");
    const columnWidths = headers.map(() => 100);
    const startX = 50;
    let y = doc.y;

    // Draw header background
    doc
      .rect(startX, y, columnWidths.length * 100, 20)
      .fill("#eeeeee")
      .stroke();

    // Header row
    doc.fillColor("black").font("Helvetica-Bold").fontSize(12);
    headers.forEach((h, i) => {
      doc.text(h, startX + i * columnWidths[i] + 5, y + 5, {
        width: columnWidths[i] - 10,
        align: "left",
      });
    });

    y += 20;
    doc
      .moveTo(startX, y)
      .lineTo(startX + columnWidths.length * 100, y)
      .stroke();

    // Data rows
    doc.font("Helvetica").fontSize(10);
    data.forEach((row) => {
      headers.forEach((h, i) => {
        let value = row[h];
        if (value instanceof Date) {
          value = value.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
        } else {
          value = String(value ?? "");
        }

        doc.text(value, startX + i * columnWidths[i] + 5, y + 5, {
          width: columnWidths[i] - 10,
          align: "left",
        });
      });
      y += 20;

      // Page break if needed
      if (y > doc.page.height - 50) {
        doc.addPage();
        y = doc.y;
      }
    });

    // Optional border (can remove if not needed)
    const totalWidth = columnWidths.reduce((a, b) => a + b, 0);
    doc
      .rect(
        startX,
        doc.y - data.length * 20 - 20,
        totalWidth,
        data.length * 20 + 20
      )
      .stroke();
  }

  doc.end();
}

async function sendPDF(filePath, ReceiveEmail) {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: "billwachi2550@gmail.com",
    to: ReceiveEmail,
    subject: "ESD PDF Report",
    html: "<h3>Attached PDF file</h3>",
    attachments: [{ filename: "ESD_Report.pdf", path: filePath }],
  });
}

// -------------------- Excel --------------------
function generateExcel(data, filePath) {
  const ws = XLSX.utils.json_to_sheet(
    data.length > 0 ? data : [{ Message: "No data" }]
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, filePath);
}

async function sendExcel(filePath, ReceiveEmail) {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: "billwachi2550@gmail.com",
    to: ReceiveEmail,
    subject: "ESD Excel Report",
    html: "<h3>Attached Excel file</h3>",
    attachments: [
      {
        filename: "ESD_Report.xlsx",
        path: filePath,
        contentType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    ],
  });
}

// -------------------- Exported Main Tasks --------------------
async function exportCSV(ReceiveEmail) {
  const data = await fetchHistoryData();
  const filePath = path.join(__dirname, "ESD_Report.csv");
  generateCSV(data, filePath);
  await sendCSV(filePath, ReceiveEmail);
  fs.unlinkSync(filePath);
}

async function exportPDF(ReceiveEmail) {
  const data = await fetchHistoryData();
  const filePath = path.join(__dirname, "ESD_Report.pdf");
  generatePDF(data, filePath);
  setTimeout(async () => {
    await sendPDF(filePath, ReceiveEmail);
    fs.unlinkSync(filePath);
  }, 1000);
}

async function exportExcel(ReceiveEmail) {
  const data = await fetchHistoryData();
  const filePath = path.join(__dirname, "ESD_Report.xlsx");
  generateExcel(data, filePath);
  await sendExcel(filePath, ReceiveEmail);
  fs.unlinkSync(filePath);
}

module.exports = {
  exportCSV,
  exportPDF,
  exportExcel,
};
