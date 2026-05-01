/**
 * utils/pdfGenerator.js - pdfkit version (npm install pdfkit)
 * Replaces Puppeteer. Pure JS, ~2MB, no browser download needed.
 */

import PDFDocument from "pdfkit";

// ── Colour palette ────────────────────────────────────────────────────────────
const PURPLE = [112, 12, 235];
const DARK = [63, 12, 145];
const PURPLE2 = [138, 47, 240]; // mid-purple for gradients
const BLACK = [15, 10, 30];
const GREY = [107, 114, 128];
const LGREY = [243, 244, 246];
const MGREY = [229, 231, 235];
const WHITE = [255, 255, 255];
const GREEN = [5, 150, 105];
const AMBER = [217, 119, 6];
const GOLD = [180, 140, 60];

// ── Formatters ────────────────────────────────────────────────────────────────
const fmtNGN = (n = 0) =>
  "₦" + Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2 });
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";
const today = () => fmtDate(new Date());
const refNo = (doc) =>
  doc.referenceNumber ||
  doc._id?.toString().slice(-8).toUpperCase() ||
  "KHL-XXXX";

// ── Stream to Buffer ──────────────────────────────────────────────────────────
function streamToBuffer(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}

function createDoc(opts = {}) {
  return new PDFDocument({
    size: "A4",
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    ...opts,
  });
}

// ── PREMIUM HEADER ────────────────────────────────────────────────────────────
// Deep purple left panel + white right panel separated by a diagonal cut
function drawHeader(doc, docType, refNum) {
  const W = doc.page.width;
  const H = 110;
  const M = 56; // left margin of left panel content

  // Main dark background
  doc.rect(0, 0, W, H).fill(DARK);

  // Diagonal right-edge accent — creates a slanted right side on the dark area
  doc.polygon([W * 0.58, 0], [W * 0.68, H], [W, H], [W, 0]).fill([90, 20, 180]);

  // Subtle horizontal rule at bottom of header
  doc.rect(0, H, W, 3).fill(PURPLE2);

  // Thin gold accent line at very top
  doc.rect(0, 0, W, 2).fill(GOLD);

  // ── Left: company name + tagline ──
  doc
    .fillColor(WHITE)
    .font("Helvetica-Bold")
    .fontSize(17)
    .text("KEMCHUTA HOMES", M, 22);
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor([180, 140, 255])
    .text("LIMITED", M, 42);
  doc
    .font("Helvetica")
    .fontSize(7.5)
    .fillColor([200, 180, 255])
    .text("Lekki, Lagos  ·  Asaba, Delta State", M, 57);
  doc
    .font("Helvetica")
    .fontSize(7)
    .fillColor([170, 150, 220])
    .text("kemchutahomesltd.com  ·  info@kemchutahomesltd.com", M, 68);

  // Thin vertical separator
  doc
    .moveTo(W * 0.55, 16)
    .lineTo(W * 0.55, H - 16)
    .strokeColor([255, 255, 255])
    .lineWidth(0.4)
    .opacity(0.2)
    .stroke();
  doc.opacity(1);

  // ── Right: document type + reference ──
  const rx = W * 0.58;
  const rw = W - rx - 20;
  doc
    .fillColor([200, 180, 255])
    .font("Helvetica-Bold")
    .fontSize(7)
    .text(docType.toUpperCase(), rx, 24, {
      width: rw,
      align: "right",
      letterSpacing: 1.5,
    });
  doc
    .fillColor(WHITE)
    .font("Helvetica-Bold")
    .fontSize(12)
    .text(refNum, rx, 38, { width: rw, align: "right" });
  doc
    .fillColor([180, 160, 240])
    .font("Helvetica")
    .fontSize(7.5)
    .text(today(), rx, 56, { width: rw, align: "right" });
}

// ── PREMIUM FOOTER ────────────────────────────────────────────────────────────
function drawFooter(doc) {
  const W = doc.page.width;
  const fh = 44;
  const fy = doc.page.height - fh;

  // Dark footer band
  doc.rect(0, fy, W, fh).fill([12, 8, 25]);

  // Thin purple top-edge of footer
  doc.rect(0, fy, W, 2).fill(DARK);

  // Gold accent dots
  doc.circle(40, fy + 22, 3).fill(GOLD);
  doc.circle(W - 40, fy + 22, 3).fill(GOLD);

  doc
    .fillColor([160, 150, 200])
    .font("Helvetica")
    .fontSize(7.5)
    .text(
      `© ${new Date().getFullYear()} Kemchuta Homes Limited  ·  RC No: XXXXXXXX  ·  info@kemchutahomesltd.com  ·  +234 800 000 0001  ·  +234 800 000 0003`,
      56,
      fy + 16,
      { align: "center", width: W - 112 },
    );
}

// ── SECTION HEADING ───────────────────────────────────────────────────────────
function sectionHeading(doc, text, y) {
  const W = doc.page.width;

  // Left accent bar
  doc.rect(48, y + 1, 3, 11).fill(PURPLE);

  // Heading text
  doc
    .fillColor(DARK)
    .font("Helvetica-Bold")
    .fontSize(7.5)
    .text(text.toUpperCase(), 58, y + 2, { letterSpacing: 1.8 });

  // Full-width rule — two-tone
  doc
    .moveTo(48, y + 15)
    .lineTo(W - 48, y + 15)
    .strokeColor(MGREY)
    .lineWidth(0.6)
    .stroke();
  doc
    .moveTo(48, y + 15)
    .lineTo(200, y + 15)
    .strokeColor(PURPLE)
    .lineWidth(0.8)
    .stroke();

  return y + 22;
}

// ── INFO ROW ──────────────────────────────────────────────────────────────────
// Alternating row background for readability
let _rowIndex = 0;
function resetRows() {
  _rowIndex = 0;
}

function infoRow(doc, label, value, y, { highlight = false } = {}) {
  const W = doc.page.width;
  const rh = 20;

  // Alternating bg
  if (_rowIndex % 2 === 0) {
    doc.rect(48, y, W - 96, rh).fill([250, 248, 255]);
  } else {
    doc.rect(48, y, W - 96, rh).fill(WHITE);
  }
  _rowIndex++;

  if (highlight) {
    doc.rect(48, y, 3, rh).fill(PURPLE);
  }

  doc
    .fillColor([130, 100, 180])
    .font("Helvetica")
    .fontSize(8)
    .text(label, 58, y + 6, { width: 155 });

  doc
    .fillColor(highlight ? DARK : BLACK)
    .font(highlight ? "Helvetica-Bold" : "Helvetica-Bold")
    .fontSize(8.5)
    .text(value || "—", 220, y + 5, { width: W - 96 - 180 });

  return y + rh;
}

// ── AMOUNT HIGHLIGHT BOX ──────────────────────────────────────────────────────
function amountBox(doc, label, value, sub, y) {
  const W = doc.page.width;
  const bw = W - 96;
  const bh = 72;

  // Outer glow effect — slightly larger darker rect behind
  doc.roundedRect(46, y - 1, bw + 4, bh + 4, 9).fill([220, 200, 255]);

  // Main box — deep purple gradient simulation (two rects)
  doc.roundedRect(48, y, bw, bh, 8).fill(DARK);
  doc.roundedRect(48 + bw * 0.4, y, bw * 0.6, bh, 8).fill([80, 20, 160]);

  // Subtle diagonal stripe texture
  for (let sx = 0; sx < bw; sx += 18) {
    doc
      .moveTo(48 + sx, y)
      .lineTo(48 + sx + 10, y + bh)
      .strokeColor([255, 255, 255])
      .lineWidth(0.25)
      .opacity(0.06)
      .stroke();
  }
  doc.opacity(1);

  // Gold top-left accent bar
  doc.rect(48, y, 4, bh).fill(GOLD);
  doc.roundedRect(48, y, 4, bh, 2).fill(GOLD);

  // Label
  doc
    .fillColor([200, 180, 255])
    .font("Helvetica-Bold")
    .fontSize(7)
    .text(label.toUpperCase(), 62, y + 12, { letterSpacing: 1.2 });

  // Value — large
  doc
    .fillColor(WHITE)
    .font("Helvetica-Bold")
    .fontSize(24)
    .text(value, 62, y + 24);

  // Sub-text
  if (sub) {
    doc
      .fillColor([180, 160, 220])
      .font("Helvetica")
      .fontSize(8)
      .text(sub, 62, y + 54);
  }

  return y + bh + 14;
}

// ── SIGNATURE BLOCK ───────────────────────────────────────────────────────────
function sigBlock(doc, name, title, x, y, width = 200) {
  // Dotted signature line
  doc
    .moveTo(x, y)
    .lineTo(x + width, y)
    .strokeColor(MGREY)
    .lineWidth(1)
    .dash(3, { space: 2 })
    .stroke();
  doc.undash();

  doc
    .fillColor(BLACK)
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .text(name, x, y + 5, { width });
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(7.5)
    .text(title, x, y + 17, { width });
}

// ── WATERMARK ─────────────────────────────────────────────────────────────────
function drawWatermark(doc, text = "KEMCHUTA HOMES") {
  doc.save();
  doc.opacity(0.04);
  doc.fillColor(PURPLE).font("Helvetica-Bold").fontSize(52);
  const W = doc.page.width;
  const H = doc.page.height;
  // Rotate 45° from center
  doc.rotate(-38, { origin: [W / 2, H / 2] });
  doc.text(text, W / 2 - 180, H / 2 - 26, { width: 360, align: "center" });
  doc.restore();
  doc.opacity(1);
}

export async function generateAcknowledgement(sub) {
  const doc = createDoc();
  const buf = streamToBuffer(doc);
  const fullName = `${sub.title} ${sub.firstName} ${sub.lastName}`;
  resetRows();
  drawWatermark(doc);
  drawHeader(doc, "Subscription Acknowledgement", refNo(sub));
  let y = 126;
  doc
    .fillColor(BLACK)
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("Subscription Acknowledgement", 48, y);
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(10)
    .text(
      "This confirms receipt of your application — not a contract.",
      48,
      y + 22,
    );
  y += 50;
  y = sectionHeading(doc, "Application Details", y);
  y = infoRow(doc, "Reference Number", refNo(sub), y);
  y = infoRow(doc, "Estate", sub.estateName, y);
  y = infoRow(doc, "Plot Type", sub.plotType, y);
  y = infoRow(doc, "Plot Size", sub.plotSize, y);
  y = infoRow(doc, "No. of Plots", String(sub.numberOfPlots), y);
  y = infoRow(doc, "Payment Plan", sub.paymentPlan, y);
  y = infoRow(doc, "Total Amount", fmtNGN(sub.totalAmount), y);
  y = infoRow(doc, "Survey Type", sub.surveyType, y);
  y = infoRow(doc, "Date Submitted", fmtDate(sub.createdAt), y);
  y = sectionHeading(doc, "Applicant", y + 10);
  y = infoRow(doc, "Full Name", fullName, y);
  y = infoRow(doc, "Email", sub.email, y);
  y = infoRow(doc, "Phone", sub.phone, y);
  y = infoRow(
    doc,
    "Address",
    `${sub.residentialAddress}, ${sub.cityTown}, ${sub.state}`,
    y,
  );
  y += 16;
  doc
    .roundedRect(48, y, doc.page.width - 96, 56, 5)
    .fillAndStroke([255, 248, 225], [245, 158, 11]);
  doc
    .fillColor(AMBER)
    .font("Helvetica-Bold")
    .fontSize(8)
    .text("IMPORTANT NOTICE", 64, y + 8);
  doc
    .fillColor([146, 64, 14])
    .font("Helvetica")
    .fontSize(9)
    .text(
      "This is not a receipt of payment or contract. Await approval before making any payment. Do not pay to any personal account.",
      64,
      y + 20,
      { width: doc.page.width - 128 },
    );
  y += 70;
  sigBlock(doc, "Authorised Signatory", "Kemchuta Homes Limited", 48, y + 30);
  sigBlock(doc, fullName, "Applicant", doc.page.width - 248, y + 30);
  drawFooter(doc);
  doc.end();
  return buf;
}

export async function generateContractOfSale(sub) {
  const doc = createDoc();
  const buf = streamToBuffer(doc);
  const fullName =
    `${sub.title} ${sub.firstName} ${sub.lastName}`.toUpperCase();
  const plotDesc = `${sub.numberOfPlots} ${sub.numberOfPlots === 1 ? "plot" : "plots"} of Land measuring ${sub.plotSize} each`;
  const totalSqm = sub.plotSize;

  // ── PAGE 1: Premium Cover ─────────────────────────────────────────────────
  const W = doc.page.width;
  const H = doc.page.height;

  // Full-page dark cover
  doc.rect(0, 0, W, H).fill([10, 6, 24]);

  // Left purple column
  doc.rect(0, 0, 180, H).fill(DARK);

  // Diagonal cut between column and body
  doc.polygon([160, 0], [200, 0], [200, H], [180, H]).fill([70, 15, 150]);

  // Gold horizontal rule inside left column
  doc.rect(0, 140, 180, 2).fill(GOLD);
  doc.rect(0, H - 142, 180, 2).fill(GOLD);

  // Company name — vertical in left column (rotated)
  doc.save();
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(11);
  doc.rotate(-90, { origin: [90, H / 2] });
  doc.text("KEMCHUTA HOMES LIMITED", 90 - 130, H / 2 - 6, {
    width: 260,
    align: "center",
  });
  doc.restore();

  // KHL monogram in column
  doc
    .fillColor([180, 140, 255])
    .font("Helvetica-Bold")
    .fontSize(36)
    .text("KHL", 22, 60, { width: 136, align: "center" });
  doc
    .fillColor(GOLD)
    .font("Helvetica")
    .fontSize(7.5)
    .text("EST. 2018", 22, 100, {
      width: 136,
      align: "center",
      letterSpacing: 2,
    });

  // Dot pattern decoration in left column
  for (let dy = 160; dy < H - 160; dy += 24) {
    for (let dx = 14; dx < 160; dx += 24) {
      doc.circle(dx, dy, 1.2).fill([255, 255, 255]).opacity(0.06);
    }
  }
  doc.opacity(1);

  // ── Right side: document title block ─────────────────────────────────────
  const rx = 230;
  const rw = W - rx - 40;

  // Gold accent rule at top
  doc.rect(rx, 60, rw, 2).fill(GOLD);

  // Document title
  doc
    .fillColor([200, 180, 255])
    .font("Helvetica-Bold")
    .fontSize(9)
    .text("LEGAL DOCUMENT", rx, 76, { letterSpacing: 2.5 });
  doc
    .fillColor(WHITE)
    .font("Helvetica-Bold")
    .fontSize(34)
    .text("CONTRACT", rx, 96, { lineGap: -2 });
  doc
    .fillColor(WHITE)
    .font("Helvetica-Bold")
    .fontSize(34)
    .text("OF SALE", rx, 128);

  // Gold underline under title
  doc.rect(rx, 168, 120, 3).fill(GOLD);

  // Reference chip
  doc.roundedRect(rx, 188, rw, 40, 6).fill([255, 255, 255]).opacity(0.06);
  doc.opacity(1);
  doc
    .roundedRect(rx, 188, rw, 40, 6)
    .stroke([255, 255, 255])
    .lineWidth(0.4)
    .opacity(0.15);
  doc.opacity(1);
  doc
    .fillColor([180, 160, 220])
    .font("Helvetica")
    .fontSize(7.5)
    .text("REFERENCE NO.", rx + 14, 198, { letterSpacing: 1.5 });
  doc
    .fillColor(WHITE)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(refNo(sub), rx + 14, 210);

  // ── BETWEEN block ────────────────────────────────────────────────────────
  let cy = 268;
  doc
    .fillColor([180, 160, 220])
    .font("Helvetica")
    .fontSize(8)
    .text("BETWEEN", rx, cy, { letterSpacing: 2 });
  cy += 22;

  // Vendor box
  doc.roundedRect(rx, cy, rw, 58, 6).fill([255, 255, 255]).opacity(0.07);
  doc.opacity(1);
  doc.rect(rx, cy, 3, 58).fill(GOLD);
  doc
    .fillColor(WHITE)
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("KEMCHUTA HOMES LIMITED", rx + 14, cy + 10);
  doc
    .fillColor([180, 160, 220])
    .font("Helvetica")
    .fontSize(8.5)
    .text("THE VENDOR", rx + 14, cy + 28);
  doc
    .fillColor([140, 120, 180])
    .font("Helvetica")
    .fontSize(7.5)
    .text(
      "K/M 42, Lekki-Epe Expressway, Abijo, Lagos State, Nigeria",
      rx + 14,
      cy + 40,
    );
  cy += 70;

  doc
    .fillColor([180, 160, 220])
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .text("AND", rx, cy, { letterSpacing: 2 });
  cy += 20;

  // Purchaser box
  doc.roundedRect(rx, cy, rw, 58, 6).fill([255, 255, 255]).opacity(0.07);
  doc.opacity(1);
  doc.rect(rx, cy, 3, 58).fill(PURPLE2);
  doc
    .fillColor(WHITE)
    .font("Helvetica-Bold")
    .fontSize(12)
    .text(fullName, rx + 14, cy + 10, { width: rw - 20 });
  doc
    .fillColor([180, 160, 220])
    .font("Helvetica")
    .fontSize(8.5)
    .text("THE PURCHASER", rx + 14, cy + 30);
  doc
    .fillColor([140, 120, 180])
    .font("Helvetica")
    .fontSize(7.5)
    .text(
      `${sub.residentialAddress || ""}, ${sub.cityTown || ""}, ${sub.state || ""}, Nigeria`
        .trim()
        .replace(/^,\s*/, ""),
      rx + 14,
      cy + 42,
      { width: rw - 20 },
    );
  cy += 70;

  // ── Estate summary chip ──────────────────────────────────────────────────
  doc
    .roundedRect(rx, cy + 10, rw, 52, 6)
    .fill([255, 255, 255])
    .opacity(0.05);
  doc.opacity(1);
  doc
    .fillColor([180, 160, 220])
    .font("Helvetica")
    .fontSize(7.5)
    .text("ESTATE", rx + 14, cy + 20, { letterSpacing: 1.5 });
  doc
    .fillColor(WHITE)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(sub.estateName?.toUpperCase() || "—", rx + 14, cy + 32, {
      width: rw - 28,
    });
  doc
    .fillColor([140, 120, 180])
    .font("Helvetica")
    .fontSize(7.5)
    .text(
      `${plotDesc}  ·  Total Consideration: ${fmtNGN(sub.totalAmount)}`,
      rx + 14,
      cy + 47,
      { width: rw - 28 },
    );
  cy += 74;

  // ── Prepared by ──────────────────────────────────────────────────────────
  doc
    .fillColor([140, 120, 180])
    .font("Helvetica")
    .fontSize(7.5)
    .text("Prepared by:", rx, cy + 4);
  doc
    .fillColor([180, 160, 220])
    .font("Helvetica-Bold")
    .fontSize(8)
    .text("Obinna Obiegue Esq.  ·  Dozie & Co.", rx, cy + 16);
  doc
    .fillColor([120, 100, 160])
    .font("Helvetica")
    .fontSize(7.5)
    .text(
      "66, Awolowo Road, South West, Ikoyi – Lagos.  ·  legal@kemchutahomesltd.com",
      rx,
      cy + 28,
      { width: rw },
    );

  // Gold rule at bottom
  doc
    .rect(rx, H - 60, rw, 1)
    .fill(GOLD)
    .opacity(0.5);
  doc.opacity(1);
  doc
    .fillColor([120, 100, 160])
    .font("Helvetica")
    .fontSize(7)
    .text(
      `Date: ${today()}  ·  © ${new Date().getFullYear()} Kemchuta Homes Limited`,
      rx,
      H - 48,
      { width: rw },
    );

  // ── PAGE 2: Recitals ─────────────────────────────────────────────────────
  doc.addPage();
  drawWatermark(doc);
  drawHeader(doc, "Contract of Sale", refNo(sub));
  const TW = doc.page.width - 96; // text width
  let y = 126;

  // Date line — with boxes to fill in
  doc
    .fillColor(BLACK)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("THIS CONTRACT OF SALE", 48, y);
  y += 15;
  doc
    .fillColor(BLACK)
    .font("Helvetica")
    .fontSize(9.5)
    .text(
      `is made this ______________ day of ______________________________ ${new Date().getFullYear()}`,
      48,
      y,
      { width: TW },
    );
  y += 28;

  // Thin rule
  doc
    .moveTo(48, y)
    .lineTo(doc.page.width - 48, y)
    .strokeColor(MGREY)
    .lineWidth(0.5)
    .stroke();
  y += 16;

  // Party intro text
  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor(BLACK)
    .text("BETWEEN", 48, y, { continued: false });
  y += 14;
  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor(BLACK)
    .text(
      "KEMCHUTA HOMES LIMITED of K/M 42, Lekki - Epe Expressway, Green Gate Beside Car Wash, Opp. Mesia Filling Station, Kingdom Hall Bus Stop, Abijo, Lekki Peninsula, Lagos State (hereinafter referred to as ",
      48,
      y,
      { width: TW, continued: true },
    );
  doc.font("Helvetica-Bold").text("'THE VENDOR'", { continued: true });
  doc.font("Helvetica").text(") of the ONE PART.", { continued: false });
  y = doc.y + 12;

  doc.font("Helvetica").fontSize(9.5).fillColor(BLACK).text("AND", 48, y);
  y += 14;
  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor(BLACK)
    .text(
      `${fullName} of ${sub.residentialAddress || ""}, ${sub.cityTown || ""}, ${sub.state || ""}, Nigeria (hereinafter referred to as `,
      48,
      y,
      { width: TW, continued: true },
    );
  doc.font("Helvetica-Bold").text("'THE PURCHASER'", { continued: true });
  doc.font("Helvetica").text(") of the OTHER PART.", { continued: false });
  y = doc.y + 18;

  // Whereas heading
  doc
    .moveTo(48, y)
    .lineTo(doc.page.width - 48, y)
    .strokeColor(MGREY)
    .lineWidth(0.5)
    .stroke();
  y += 14;
  doc
    .fillColor(DARK)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("WHEREAS:", 48, y);
  y += 16;

  const clauses = [
    `(a)  The Vendor is the operator of "${(sub.estateName || "").toUpperCase()}" at ${sub.residentialAddress || "Ibeju-Lekki Area"}, Lagos State.`,
    `(b)  This is a scheme whereby an interested person or corporate body can subscribe to land at an agreed sum after which a parcel of land is allocated at a designated location.`,
    `(c)  The PURCHASER has applied to subscribe and the VENDOR has accepted that the PURCHASER be subscribed to the scheme at ${(sub.estateName || "").toUpperCase()}.`,
    `(d)  The PURCHASER has now subscribed to ${plotDesc}, at a total of ${totalSqm} in the estate area.`,
  ];
  clauses.forEach((c) => {
    doc
      .font("Helvetica")
      .fontSize(9.5)
      .fillColor(BLACK)
      .text(c, 54, y, { width: TW - 6, lineGap: 1.5 });
    y = doc.y + 10;
  });

  drawFooter(doc);

  // ── PAGE 3: Agreement Clauses ─────────────────────────────────────────────
  doc.addPage();
  drawWatermark(doc);
  drawHeader(doc, "Contract of Sale — Agreement", refNo(sub));
  y = 126;

  doc
    .fillColor(DARK)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("2.  NOW THIS AGREEMENT WITNESSETH as follows:", 48, y, {
      width: TW,
    });
  y += 18;

  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor(BLACK)
    .text("IN CONSIDERATION of the sum of ", 48, y, {
      width: TW,
      continued: true,
    });
  doc
    .font("Helvetica-Bold")
    .text(`${fmtNGN(sub.totalAmount)}`, { continued: true });
  doc
    .font("Helvetica")
    .text(
      ` (Naira only), receipt of which is hereby acknowledged, the VENDOR shall allocate ${sub.numberOfPlots} Plot(s) of land, measuring ${totalSqm}, to the PURCHASER at ${(sub.estateName || "").toUpperCase()}.`,
      { continued: false },
    );
  y = doc.y + 20;

  doc
    .moveTo(48, y)
    .lineTo(doc.page.width - 48, y)
    .strokeColor(MGREY)
    .lineWidth(0.5)
    .stroke();
  y += 14;
  doc
    .fillColor(DARK)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("3.  THE VENDOR COVENANTS WITH THE PURCHASER as follows:", 48, y, {
      width: TW,
    });
  y += 16;
  [
    "(a)  To allocate the Plot(s) of Land to the PURCHASER at the time of allocation.",
    "(b)  To refund the total money contributed less 40% administrative charges and 10% Agency Fee, if the PURCHASER is no longer interested in the Scheme before taking full possession.",
    "(c)  To indemnify the PURCHASER against loss, adverse claimant and lawsuit.",
  ].forEach((c) => {
    doc
      .font("Helvetica")
      .fontSize(9.5)
      .fillColor(BLACK)
      .text(c, 54, y, { width: TW - 6, lineGap: 1.5 });
    y = doc.y + 10;
  });

  y += 6;
  doc
    .moveTo(48, y)
    .lineTo(doc.page.width - 48, y)
    .strokeColor(MGREY)
    .lineWidth(0.5)
    .stroke();
  y += 14;
  doc
    .fillColor(DARK)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("4.  THE PURCHASER COVENANTS WITH THE VENDOR as follows:", 48, y, {
      width: TW,
    });
  y += 16;
  [
    "(a)  To pay for Survey and legal fees in respect of the Plot(s) of Land.",
    "(b)  If the PURCHASER wishes to withdraw from this Scheme/contract of sale at any time:\n       (i)   To give a notice of 90 days, and 60 days thereafter if the refund is not ready.\n       (ii)  An administrative charge of 40% and Agency fee of 10% shall be deducted.",
  ].forEach((c) => {
    doc
      .font("Helvetica")
      .fontSize(9.5)
      .fillColor(BLACK)
      .text(c, 54, y, { width: TW - 6, lineGap: 1.5 });
    y = doc.y + 10;
  });

  y += 6;
  doc
    .moveTo(48, y)
    .lineTo(doc.page.width - 48, y)
    .strokeColor(MGREY)
    .lineWidth(0.5)
    .stroke();
  y += 14;
  doc
    .fillColor(DARK)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("5.  IT IS HEREBY FURTHER agreed that:", 48, y, { width: TW });
  y += 14;
  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor(BLACK)
    .text(
      "Both parties covenant to uphold these presents and be bound by the terms of this contract.",
      54,
      y,
      { width: TW - 6 },
    );

  drawFooter(doc);

  // ── PAGE 4: Execution ────────────────────────────────────────────────────
  doc.addPage();
  drawWatermark(doc);
  drawHeader(doc, "Contract of Sale — Execution", refNo(sub));
  y = 126;

  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor(BLACK)
    .text(
      "IN WITNESS WHEREOF, the Parties have hereto set their hands and sealed the day and year first above written.",
      48,
      y,
      { width: TW, lineGap: 1.5 },
    );
  y += 36;

  // ── VENDOR execution block ────────────────────────────────────────────────
  doc.roundedRect(48, y, TW, 90, 6).fill([250, 248, 255]);
  doc.rect(48, y, 4, 90).fill(GOLD);
  doc
    .fillColor(DARK)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text("SIGNED, SEALED AND DELIVERED", 62, y + 10);
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(8)
    .text("By the within named VENDOR — KEMCHUTA HOMES LIMITED", 62, y + 23);
  // Sig lines inside box
  doc
    .moveTo(62, y + 66)
    .lineTo(200, y + 66)
    .strokeColor(MGREY)
    .lineWidth(0.8)
    .stroke();
  doc
    .moveTo(260, y + 66)
    .lineTo(420, y + 66)
    .strokeColor(MGREY)
    .lineWidth(0.8)
    .stroke();
  doc
    .fillColor(BLACK)
    .font("Helvetica-Bold")
    .fontSize(8)
    .text("DIRECTOR", 62, y + 70);
  doc
    .fillColor(BLACK)
    .font("Helvetica-Bold")
    .fontSize(8)
    .text("SECRETARY", 260, y + 70);
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(7)
    .text("Kemchuta Homes Limited", 62, y + 80);
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(7)
    .text("Kemchuta Homes Limited", 260, y + 80);
  y += 106;

  // ── PURCHASER execution block ─────────────────────────────────────────────
  doc.roundedRect(48, y, TW, 90, 6).fill([248, 245, 255]);
  doc.rect(48, y, 4, 90).fill(PURPLE);
  doc
    .fillColor(DARK)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text("SIGNED, SEALED AND DELIVERED", 62, y + 10);
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(8)
    .text("By the within named PURCHASER", 62, y + 23);
  doc
    .fillColor(BLACK)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(fullName, 62, y + 36, { width: TW - 20 });
  doc
    .moveTo(62, y + 66)
    .lineTo(280, y + 66)
    .strokeColor(MGREY)
    .lineWidth(0.8)
    .dash(3, { space: 2 })
    .stroke();
  doc.undash();
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(7.5)
    .text("Signature of Purchaser", 62, y + 70);
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(8)
    .text("Date: _______________________", 62, y + 80);
  y += 106;

  // ── Witness block ─────────────────────────────────────────────────────────
  doc
    .fillColor(DARK)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text("IN THE PRESENCE OF:", 48, y);
  y += 16;
  [
    ["Name", ""],
    ["Address", ""],
    ["Occupation", ""],
    ["Signature", ""],
    ["Date", ""],
  ].forEach(([label]) => {
    doc
      .fillColor(GREY)
      .font("Helvetica")
      .fontSize(8.5)
      .text(label + ":", 48, y, { width: 90 });
    doc
      .moveTo(130, y + 10)
      .lineTo(doc.page.width - 48, y + 10)
      .strokeColor(LGREY)
      .lineWidth(0.8)
      .stroke();
    y += 24;
  });

  drawFooter(doc);
  doc.end();
  return buf;
}

export async function generatePaymentInvoice(sub) {
  const doc = createDoc();
  const buf = streamToBuffer(doc);
  const fullName = `${sub.title} ${sub.firstName} ${sub.lastName}`;
  const deposit =
    sub.paymentPlan === "Outright"
      ? sub.totalAmount
      : Math.round(sub.totalAmount * 0.3);
  const balance = sub.totalAmount - deposit;
  const ref = refNo(sub);
  const W = doc.page.width;
  resetRows();

  drawWatermark(doc, "INVOICE");
  drawHeader(doc, "Payment Invoice", `INV-${ref}`);

  let y = 126;

  // ── Title + tagline ──────────────────────────────────────────────────────
  doc
    .fillColor(DARK)
    .font("Helvetica-Bold")
    .fontSize(22)
    .text("PAYMENT INVOICE", 48, y);
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(9)
    .text(
      "Please make payment as detailed below to secure your property.",
      48,
      y + 26,
    );
  y += 52;

  // ── Two-column top: Bill To (left) | Invoice Meta (right) ────────────────
  const colW = (W - 96 - 16) / 2;

  // Bill To box
  doc.roundedRect(48, y, colW, 100, 8).fill([250, 248, 255]);
  doc.rect(48, y, 4, 100).fill(PURPLE);
  doc
    .fillColor([130, 100, 180])
    .font("Helvetica-Bold")
    .fontSize(7)
    .text("BILL TO", 62, y + 10, { letterSpacing: 1.5 });
  doc
    .fillColor(DARK)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(fullName, 62, y + 24, { width: colW - 20 });
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(8.5)
    .text(sub.email || "", 62, y + 42, { width: colW - 20 });
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(8.5)
    .text(sub.phone || "", 62, y + 54, { width: colW - 20 });
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(8)
    .text(
      `${sub.residentialAddress || ""}, ${sub.cityTown || ""}, ${sub.state || ""}`
        .replace(/^,\s*/, "")
        .replace(/,\s*,/g, ","),
      62,
      y + 68,
      { width: colW - 20, lineGap: 1 },
    );

  // Invoice meta box
  const mx = 48 + colW + 16;
  doc.roundedRect(mx, y, colW, 100, 8).fill([250, 248, 255]);
  doc.rect(mx, y, 4, 100).fill(GOLD);
  doc
    .fillColor([130, 100, 140])
    .font("Helvetica-Bold")
    .fontSize(7)
    .text("INVOICE DETAILS", mx + 14, y + 10, { letterSpacing: 1.5 });

  const metaRows = [
    ["Invoice No.", `INV-${ref}`],
    ["Date Issued", today()],
    ["Estate", sub.estateName || "—"],
    ["Payment Plan", sub.paymentPlan || "—"],
  ];
  let my = y + 28;
  metaRows.forEach(([lbl, val]) => {
    doc
      .fillColor(GREY)
      .font("Helvetica")
      .fontSize(7.5)
      .text(lbl, mx + 14, my, { width: 80 });
    doc
      .fillColor(BLACK)
      .font("Helvetica-Bold")
      .fontSize(8)
      .text(val, mx + 100, my, { width: colW - 110 });
    my += 16;
  });
  y += 116;

  // ── Plot details ─────────────────────────────────────────────────────────
  y = sectionHeading(doc, "Property Details", y);
  y = infoRow(doc, "Estate Name", sub.estateName || "—", y);
  y = infoRow(doc, "Plot Type", sub.plotType || "—", y);
  y = infoRow(
    doc,
    "Plot Size",
    `${sub.plotSize || "—"} × ${sub.numberOfPlots} plot(s)`,
    y,
  );
  y = infoRow(doc, "Survey Type", sub.surveyType || "—", y);
  y += 6;

  // ── Amount summary table ─────────────────────────────────────────────────
  y = sectionHeading(doc, "Payment Summary", y);

  // Table header row
  doc.rect(48, y, W - 96, 24).fill(DARK);
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(8.5);
  doc.text("Description", 60, y + 8, { width: 240 });
  doc.text("Amount", W - 160, y + 8, { width: 100, align: "right" });
  y += 24;

  const tableRows = [
    ["Total Purchase Price", fmtNGN(sub.totalAmount), false],
    [
      `Initial Deposit Due (${sub.paymentPlan === "Outright" ? "100" : "30"}%)`,
      fmtNGN(deposit),
      true,
    ],
    ["Balance Remaining", fmtNGN(balance), false],
  ];
  tableRows.forEach(([desc, amt, highlight], i) => {
    const bg = highlight
      ? [240, 235, 255]
      : i % 2 === 0
        ? WHITE
        : [250, 248, 255];
    doc.rect(48, y, W - 96, 24).fill(bg);
    if (highlight) doc.rect(48, y, 4, 24).fill(PURPLE);
    doc
      .fillColor(highlight ? DARK : BLACK)
      .font(highlight ? "Helvetica-Bold" : "Helvetica")
      .fontSize(9)
      .text(desc, 60, y + 8, { width: 240 });
    doc
      .fillColor(highlight ? PURPLE : BLACK)
      .font(highlight ? "Helvetica-Bold" : "Helvetica")
      .fontSize(9)
      .text(amt, W - 160, y + 8, { width: 100, align: "right" });
    y += 24;
  });
  y += 10;

  // ── BIG amount box ────────────────────────────────────────────────────────
  y = amountBox(
    doc,
    "Amount Due Now — Initial Deposit",
    fmtNGN(deposit),
    `Payment Plan: ${sub.paymentPlan}  ·  Balance after deposit: ${fmtNGN(balance)}`,
    y,
  );

  // ── Bank payment details ─────────────────────────────────────────────────
  y = sectionHeading(doc, "Bank Payment Details", y + 4);

  // Bank box with strong visual
  doc.roundedRect(48, y, W - 96, 96, 8).fill([245, 243, 255]);
  doc.rect(48, y, 5, 96).fill(DARK);

  const bankData = [
    ["Bank Name", "ACCESS BANK PLC"],
    ["Account Name", "KEMCHUTA HOMES LIMITED"],
    ["Account Number", "XXXXXXXXXX"],
    ["Payment Reference", ref],
  ];
  let by = y + 12;
  bankData.forEach(([lbl, val]) => {
    doc
      .fillColor([130, 100, 180])
      .font("Helvetica")
      .fontSize(8)
      .text(lbl, 64, by, { width: 150 });
    doc
      .fillColor(lbl === "Payment Reference" ? PURPLE : DARK)
      .font("Helvetica-Bold")
      .fontSize(lbl === "Payment Reference" ? 11 : 9)
      .text(val, 224, by - (lbl === "Payment Reference" ? 1 : 0), {
        width: W - 280,
      });
    by += 22;
  });
  y += 110;

  // ── Warning notice ────────────────────────────────────────────────────────
  doc.roundedRect(48, y, W - 96, 52, 6).fill([255, 251, 230]);
  doc.rect(48, y, 4, 52).fill(AMBER);
  doc
    .fillColor([146, 64, 14])
    .font("Helvetica-Bold")
    .fontSize(8)
    .text("⚠  IMPORTANT PAYMENT NOTICE", 62, y + 10);
  doc
    .fillColor([120, 60, 10])
    .font("Helvetica")
    .fontSize(8)
    .text(
      `Always quote reference ${ref} on your bank transfer narration. Send proof of payment to info@kemchutahomesltd.com or WhatsApp. Kemchuta Homes Limited will NEVER request payment into a personal account.`,
      62,
      y + 24,
      { width: W - 120, lineGap: 1 },
    );

  drawFooter(doc);
  doc.end();
  return buf;
}

export async function generateInstallmentSchedule(sub) {
  const doc = createDoc();
  const buf = streamToBuffer(doc);
  const fullName = `${sub.title} ${sub.firstName} ${sub.lastName}`;
  const deposit = Math.round(sub.totalAmount * 0.3);
  const balance = sub.totalAmount - deposit;
  const monthly = Math.round(balance / 5);
  const schedule = sub.installmentSchedule?.length
    ? sub.installmentSchedule
    : [
        { dueDate: new Date(), amount: deposit, isPaid: false },
        ...Array.from({ length: 5 }, (_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() + i + 1);
          return { dueDate: d, amount: monthly, isPaid: false };
        }),
      ];
  resetRows();
  drawWatermark(doc, "SCHEDULE");
  drawHeader(doc, "Instalment Schedule", refNo(sub));
  let y = 126;
  doc
    .fillColor(BLACK)
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("Instalment Payment Schedule", 48, y);
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(10)
    .text(`${sub.estateName} — ${fullName}`, 48, y + 22);
  y += 50;
  y = sectionHeading(doc, "Summary", y);
  y = infoRow(doc, "Total", fmtNGN(sub.totalAmount), y);
  y = infoRow(doc, "Deposit (30%)", fmtNGN(deposit), y);
  y = infoRow(doc, "Monthly", fmtNGN(monthly), y);
  y += 10;
  y = sectionHeading(doc, "Schedule", y);
  doc.rect(48, y, doc.page.width - 96, 22).fill(PURPLE);
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(9);
  doc.text("#", 52, y + 7);
  doc.text("Description", 70, y + 7);
  doc.text("Due Date", 250, y + 7);
  doc.text("Amount", 360, y + 7);
  doc.text("Status", 460, y + 7);
  y += 26;
  schedule.forEach((s, i) => {
    doc
      .rect(48, y, doc.page.width - 96, 20)
      .fill(i % 2 === 0 ? WHITE : [249, 246, 255]);
    doc.fillColor(BLACK).font("Helvetica").fontSize(9);
    doc.text(String(i + 1), 52, y + 6);
    doc.text(
      i === 0 ? "Initial Deposit (30%)" : `Month ${i} Instalment`,
      70,
      y + 6,
      { width: 175 },
    );
    doc.text(fmtDate(s.dueDate), 250, y + 6);
    doc.text(fmtNGN(s.amount), 360, y + 6, { width: 95 });
    doc
      .fillColor(s.isPaid ? GREEN : AMBER)
      .font("Helvetica-Bold")
      .fontSize(8)
      .text(s.isPaid ? "PAID" : "DUE", 460, y + 6);
    doc.fillColor(BLACK);
    y += 22;
  });
  drawFooter(doc);
  doc.end();
  return buf;
}

export async function generateReceipt(sub, payment) {
  const doc = createDoc();
  const buf = streamToBuffer(doc);
  const fullName = `${sub.title} ${sub.firstName} ${sub.lastName}`;
  const receiptNo = `RCT-${refNo(sub)}-${String(sub.payments?.length || 1).padStart(2, "0")}`;
  resetRows();
  drawWatermark(doc, "RECEIPT");
  drawHeader(doc, "Official Receipt", receiptNo);
  let y = 126;
  doc
    .fillColor(BLACK)
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("Official Payment Receipt", 48, y);
  y += 32;
  y = amountBox(
    doc,
    "Amount Received",
    fmtNGN(payment.amount),
    `Date: ${fmtDate(payment.paidAt)}  ·  ${payment.method || "Bank Transfer"}`,
    y,
  );
  y = sectionHeading(doc, "Receipt Details", y + 8);
  y = infoRow(doc, "Receipt No.", receiptNo, y);
  y = infoRow(doc, "Reference", refNo(sub), y);
  y = infoRow(doc, "Paid By", fullName, y);
  y = infoRow(doc, "Payment For", `${sub.estateName} — ${sub.plotType}`, y);
  if (payment.reference)
    y = infoRow(doc, "Bank Reference", payment.reference, y);
  y = infoRow(doc, "Amount Paid", fmtNGN(payment.amount), y);
  y = infoRow(doc, "Total Paid To Date", fmtNGN(sub.amountPaid), y);
  y = infoRow(
    doc,
    "Balance Remaining",
    fmtNGN(sub.totalAmount - sub.amountPaid),
    y,
  );
  y += 32;
  doc
    .circle(doc.page.width / 2, y + 36, 36)
    .strokeColor(PURPLE)
    .lineWidth(2)
    .stroke();
  doc
    .fillColor(PURPLE)
    .font("Helvetica-Bold")
    .fontSize(7)
    .text("KEMCHUTA HOMES LTD", doc.page.width / 2 - 36, y + 22, {
      width: 72,
      align: "center",
    });
  doc
    .font("Helvetica-Bold")
    .fontSize(6)
    .text("OFFICIAL SEAL", doc.page.width / 2 - 36, y + 48, {
      width: 72,
      align: "center",
    });
  y += 90;
  sigBlock(doc, "Accounts Officer", "Kemchuta Homes Limited", 48, y, 200);
  drawFooter(doc);
  doc.end();
  return buf;
}

export async function generateAllocationLetter(sub) {
  const doc = createDoc();
  const buf = streamToBuffer(doc);
  const fullName = `${sub.title} ${sub.firstName} ${sub.lastName}`;
  resetRows();
  drawWatermark(doc, "ALLOCATION");
  drawHeader(doc, "Letter of Allocation", refNo(sub));
  let y = 126;
  doc
    .fillColor(BLACK)
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("Letter of Allocation", 48, y);
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(10)
    .text(`${sub.estateName} — ${sub.plotSize} ${sub.plotType}`, 48, y + 22);
  y += 52;
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(BLACK)
    .text(
      `Dear ${fullName},\n\nWe are delighted to inform you that following the completion of all payment obligations, Kemchuta Homes Limited hereby allocates to you the plot described below at ${sub.estateName}. This letter serves as your official confirmation of ownership pending title document processing.`,
      48,
      y,
      { width: doc.page.width - 96, lineGap: 3 },
    );
  y = doc.y + 16;
  y = amountBox(
    doc,
    "Allocated Plot",
    sub.plotNumber || "Block ___, Plot ___",
    `${sub.plotSize}  ·  ${sub.plotType}  ·  ${sub.surveyType}`,
    y,
  );
  y = sectionHeading(doc, "Allocation Details", y + 8);
  y = infoRow(doc, "Allottee", fullName, y);
  y = infoRow(doc, "Estate", sub.estateName, y);
  y = infoRow(doc, "Plot Number", sub.plotNumber || "To be confirmed", y);
  y = infoRow(doc, "Plot Size", sub.plotSize, y);
  y = infoRow(doc, "Title Type", sub.surveyType, y);
  y = infoRow(doc, "Total Amount Paid", fmtNGN(sub.totalAmount), y);
  y = infoRow(
    doc,
    "Date of Allocation",
    fmtDate(sub.allocationDate) || today(),
    y,
  );
  y += 12;
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(BLACK)
    .text(
      `Title documents will be processed and delivered within 90 working days of this allocation date.`,
      48,
      y,
      { width: doc.page.width - 96 },
    );
  y = doc.y + 32;
  sigBlock(doc, "Managing Director", "Kemchuta Homes Limited", 48, y, 200);
  sigBlock(doc, fullName, "Allottee", doc.page.width - 248, y, 200);
  drawFooter(doc);
  doc.end();
  return buf;
}

export async function generateInvestmentCertificate(lead) {
  const doc = createDoc();
  const buf = streamToBuffer(doc);
  const ref =
    lead.referenceNumber || lead._id?.toString().slice(-8).toUpperCase();
  drawHeader(doc, "Investment Certificate", ref);
  let y = 110;
  doc
    .roundedRect(40, y, doc.page.width - 80, 320, 10)
    .strokeColor(PURPLE)
    .lineWidth(2)
    .stroke();
  doc
    .roundedRect(46, y + 6, doc.page.width - 92, 308, 8)
    .strokeColor([200, 160, 255])
    .lineWidth(0.5)
    .stroke();
  doc
    .fillColor(PURPLE)
    .font("Helvetica-Bold")
    .fontSize(20)
    .text("CERTIFICATE OF INVESTMENT", 0, y + 24, {
      align: "center",
      width: doc.page.width,
    });
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(10)
    .text("Buy2Sell Land Bank Scheme — Kemchuta Homes Limited", 0, y + 48, {
      align: "center",
      width: doc.page.width,
    });
  doc
    .moveTo(100, y + 66)
    .lineTo(doc.page.width - 100, y + 66)
    .strokeColor([200, 160, 255])
    .lineWidth(0.75)
    .stroke();
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(10)
    .text("This certifies that", 0, y + 78, {
      align: "center",
      width: doc.page.width,
    });
  doc
    .fillColor(BLACK)
    .font("Helvetica-Bold")
    .fontSize(16)
    .text(lead.fullName.toUpperCase(), 0, y + 94, {
      align: "center",
      width: doc.page.width,
    });
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(10)
    .text("has invested", 0, y + 118, {
      align: "center",
      width: doc.page.width,
    });
  doc
    .fillColor(PURPLE)
    .font("Helvetica-Bold")
    .fontSize(22)
    .text(fmtNGN(lead.principalAmount), 0, y + 132, {
      align: "center",
      width: doc.page.width,
    });
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(10)
    .text("at a fixed ROI rate of", 0, y + 162, {
      align: "center",
      width: doc.page.width,
    });
  doc
    .fillColor(BLACK)
    .font("Helvetica-Bold")
    .fontSize(36)
    .text(`${lead.roiPercent}%`, 0, y + 174, {
      align: "center",
      width: doc.page.width,
    });
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(10)
    .text(`over a period of ${lead.duration}`, 0, y + 218, {
      align: "center",
      width: doc.page.width,
    });
  doc
    .moveTo(100, y + 236)
    .lineTo(doc.page.width - 100, y + 236)
    .strokeColor([200, 160, 255])
    .lineWidth(0.75)
    .stroke();
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(9)
    .text(
      `Investment Date: ${fmtDate(lead.investmentDate)}   ·   Maturity Date: ${fmtDate(lead.maturityDate)}`,
      0,
      y + 246,
      { align: "center", width: doc.page.width },
    );
  doc
    .fillColor(PURPLE)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(
      `Expected Payout at Maturity: ${fmtNGN(lead.expectedPayout)}`,
      0,
      y + 264,
      { align: "center", width: doc.page.width },
    );
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(9)
    .text(
      `Principal ${fmtNGN(lead.principalAmount)}  +  ROI ${fmtNGN(lead.expectedROI)} (${lead.roiPercent}%)`,
      0,
      y + 282,
      { align: "center", width: doc.page.width },
    );
  y += 340;
  sigBlock(doc, "Managing Director", "Kemchuta Homes Limited", 48, y, 200);
  sigBlock(doc, lead.fullName, "Investor", doc.page.width - 248, y, 200);
  drawFooter(doc);
  doc.end();
  return buf;
}

export async function generateInvestmentAgreement(lead) {
  const doc = createDoc();
  const buf = streamToBuffer(doc);
  const ref =
    lead.referenceNumber || lead._id?.toString().slice(-8).toUpperCase();
  resetRows();
  drawWatermark(doc, "AGREEMENT");
  drawHeader(doc, "Investment Agreement", ref);
  let y = 126;
  doc
    .fillColor(BLACK)
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("Buy2Sell Investment Agreement", 48, y);
  y += 36;
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(BLACK)
    .text(
      `This Investment Agreement is entered into on ${today()} between KEMCHUTA HOMES LIMITED ("the Company") and ${lead.fullName.toUpperCase()} ("the Investor").`,
      48,
      y,
      { width: doc.page.width - 96, lineGap: 3 },
    );
  y = doc.y + 16;
  y = sectionHeading(doc, "1. Investment Details", y);
  y = infoRow(doc, "Investor", lead.fullName, y);
  y = infoRow(doc, "Principal Amount", fmtNGN(lead.principalAmount), y);
  y = infoRow(doc, "Duration", lead.duration, y);
  y = infoRow(doc, "ROI Rate (fixed)", `${lead.roiPercent}%`, y);
  y = infoRow(doc, "Expected ROI", fmtNGN(lead.expectedROI), y);
  y = infoRow(doc, "Total Expected Payout", fmtNGN(lead.expectedPayout), y);
  y = infoRow(doc, "Investment Date", fmtDate(lead.investmentDate), y);
  y = infoRow(doc, "Maturity Date", fmtDate(lead.maturityDate), y);
  y = sectionHeading(doc, "2. Terms & Conditions", y + 8);
  [
    "1. The Investor agrees to invest the principal amount with Kemchuta Homes Limited for the stated duration.",
    "2. The Company shall pay total payout (principal + ROI) on or within 14 working days of the maturity date.",
    "3. The ROI rate is fixed and will not be reduced during the investment period.",
    "4. Early withdrawal is not permitted except by written mutual agreement.",
    "5. Early withdrawal attracts forfeiture of 50% of the accrued ROI to date of withdrawal.",
    "6. The Company may extend by up to 30 days with prior written notice.",
    "7. Payout will be via bank transfer to the Investor's registered account.",
    "8. This agreement is governed by the laws of the Federal Republic of Nigeria.",
  ].forEach((t) => {
    doc
      .font("Helvetica")
      .fontSize(9.5)
      .fillColor(BLACK)
      .text(t, 48, y, { width: doc.page.width - 96, lineGap: 2 });
    y = doc.y + 6;
  });
  y += 16;
  sigBlock(doc, "Managing Director", "Kemchuta Homes Limited", 48, y, 200);
  sigBlock(doc, lead.fullName, "Investor", doc.page.width - 248, y, 200);
  drawFooter(doc);
  doc.end();
  return buf;
}

export async function generatePayoutConfirmation(lead) {
  const doc = createDoc();
  const buf = streamToBuffer(doc);
  const ref =
    lead.referenceNumber || lead._id?.toString().slice(-8).toUpperCase();
  resetRows();
  drawWatermark(doc, "CONFIRMATION");
  drawHeader(doc, "Payout Confirmation", ref);
  let y = 126;
  doc
    .fillColor(BLACK)
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("Payout Confirmation Letter", 48, y);
  y += 32;
  y = amountBox(
    doc,
    "Total Payout Sent",
    fmtNGN(lead.actualPayout || lead.expectedPayout),
    `Payout Date: ${fmtDate(lead.payoutDate) || today()}`,
    y,
  );
  y = sectionHeading(doc, "Investment Summary", y + 8);
  y = infoRow(doc, "Reference", ref, y);
  y = infoRow(doc, "Investor", lead.fullName, y);
  y = infoRow(doc, "Duration", lead.duration, y);
  y = infoRow(doc, "ROI Rate", `${lead.roiPercent}%`, y);
  y = infoRow(doc, "Principal Invested", fmtNGN(lead.principalAmount), y);
  y = infoRow(doc, "ROI Earned", fmtNGN(lead.expectedROI), y);
  y = infoRow(
    doc,
    "Total Payout",
    fmtNGN(lead.actualPayout || lead.expectedPayout),
    y,
  );
  y = infoRow(doc, "Investment Date", fmtDate(lead.investmentDate), y);
  y = infoRow(doc, "Maturity Date", fmtDate(lead.maturityDate), y);
  y = infoRow(doc, "Payout Date", fmtDate(lead.payoutDate) || today(), y);
  y += 12;
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(BLACK)
    .text(
      "Thank you for choosing the Kemchuta Homes Buy2Sell scheme. We hope to welcome you back for your next investment cycle.",
      48,
      y,
      { width: doc.page.width - 96, lineGap: 3 },
    );
  y = doc.y + 32;
  sigBlock(doc, "Authorised Signatory", "Kemchuta Homes Limited", 48, y, 200);
  drawFooter(doc);
  doc.end();
  return buf;
}
