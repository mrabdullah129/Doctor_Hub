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

export function downloadReportPdf(report, quickStats = []) {
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
  y = addSectionTitle(doc, 'Quick Stats', y)
  quickStats.forEach((stat) => {
    y = ensurePageBreak(doc, y, 18)
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(margin, y - 5, contentWidth, 14, 2, 2, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(17, 24, 39)
    doc.text(stat.label, margin + 5, y + 3)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(71, 85, 105)
    doc.text(`${stat.value} - ${stat.sub}`, margin + 75, y + 3)
    y += 18
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
