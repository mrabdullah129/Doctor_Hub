import { jsPDF } from 'jspdf'

const pageWidth = 210
const margin = 14
const contentWidth = pageWidth - margin * 2

function slugify(value) {
  return String(value || 'report')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function addWrappedText(doc, text, x, y, maxWidth, lineHeight = 6) {
  const lines = doc.splitTextToSize(String(text || '-'), maxWidth)
  doc.text(lines, x, y)
  return y + lines.length * lineHeight
}

function addSectionTitle(doc, title, y) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(17, 24, 39)
  doc.text(title, margin, y)
  return y + 8
}

function ensurePageBreak(doc, y, requiredSpace = 30) {
  if (y + requiredSpace > 280) {
    doc.addPage()
    return 18
  }
  return y
}

function addMetricCards(doc, metrics, y) {
  y = addSectionTitle(doc, 'Key Metrics', y)
  metrics.forEach((metric) => {
    y = ensurePageBreak(doc, y, 22)
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(margin, y - 5, contentWidth, 17, 2, 2, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(17, 24, 39)
    doc.text(metric.label, margin + 5, y + 2)
    doc.setFontSize(12)
    doc.text(metric.value, margin + 78, y + 2)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(71, 85, 105)
    doc.text(metric.note || '-', margin + 78, y + 9)
    y += 21
  })
  return y + 3
}

function addReportSection(doc, section, y) {
  y = ensurePageBreak(doc, y, 28)
  y = addSectionTitle(doc, section.title, y)
  ;(section.rows || []).forEach((row) => {
    y = ensurePageBreak(doc, y, 15)
    doc.setDrawColor(226, 232, 240)
    doc.line(margin, y + 5, pageWidth - margin, y + 5)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(17, 24, 39)
    doc.text(String(row[0] || '-'), margin, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(71, 85, 105)
    doc.text(String(row[1] || '-'), margin + 70, y)
    doc.text(String(row[2] || '-'), margin + 125, y)
    y += 11
  })
  return y + 7
}

export function downloadReportPdf(report) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const filename = `${slugify(report?.title)}-${slugify(report?.period)}.pdf`

  doc.setFillColor(37, 99, 235)
  doc.rect(0, 0, pageWidth, 30, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(report?.title || 'DoctorHub Report', margin, 16)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`DoctorHub Platform Report | ${report?.period || 'Current period'}`, margin, 24)

  let y = 42

  y = addSectionTitle(doc, 'Report Summary', y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(71, 85, 105)
  y = addWrappedText(doc, report?.desc, margin, y, contentWidth)
  y += 6

  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(margin, y, contentWidth, 24, 3, 3)
  doc.setTextColor(17, 24, 39)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Period', margin + 5, y + 9)
  doc.text('Generated On', margin + 70, y + 9)
  doc.text('Format', margin + 135, y + 9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(71, 85, 105)
  doc.text(report?.period || '-', margin + 5, y + 17)
  doc.text(new Date().toLocaleDateString(), margin + 70, y + 17)
  doc.text('PDF Download', margin + 135, y + 17)
  y += 38

  y = ensurePageBreak(doc, y, 50)
  y = addMetricCards(doc, report?.metrics || [], y)
  ;(report?.sections || []).forEach((section) => {
    y = addReportSection(doc, section, y)
  })

  y = ensurePageBreak(doc, y, 34)
  y += 4
  doc.setDrawColor(226, 232, 240)
  doc.line(margin, y, pageWidth - margin, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)
  doc.text('This report was downloaded from DoctorHub admin reports.', margin, y + 8)

  doc.save(filename)
}
