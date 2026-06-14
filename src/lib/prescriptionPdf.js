import { jsPDF } from 'jspdf'

function addWrappedText(doc, text, x, y, maxWidth, lineHeight) {
  const lines = doc.splitTextToSize(String(text || ''), maxWidth)
  doc.text(lines, x, y)
  return y + lines.length * lineHeight
}

function addSectionTitle(doc, title, y) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text(title, 14, y)
  return y + 8
}

function addKeyValue(doc, label, value, x, y, valueX) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text(label, x, y)
  doc.setFont('helvetica', 'normal')
  doc.text(String(value || '-'), valueX, y)
}

function ensurePageBreak(doc, y, requiredSpace = 24) {
  if (y + requiredSpace > 280) {
    doc.addPage()
    return 18
  }
  return y
}

export function downloadPrescriptionPdf(prescription, options = {}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const title = options.title || 'DoctorHub Prescription'
  const filename = options.filename || `prescription-${String(prescription?.id || Date.now())}.pdf`

  let y = 18

  doc.setFillColor(37, 99, 235)
  doc.rect(0, 0, 210, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(title, 14, 16)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('DoctorHub Medical Center', 14, 23)

  doc.setTextColor(17, 24, 39)
  y = 38

  y = addSectionTitle(doc, 'Prescription Details', y)
  addKeyValue(doc, 'Prescription ID:', prescription?.id || '-', 14, y, 55)
  y += 7
  addKeyValue(doc, 'Date:', prescription?.date ? new Date(prescription.date).toLocaleDateString() : '-', 14, y, 55)
  y += 7
  addKeyValue(doc, 'Doctor:', prescription?.doctor || '-', 14, y, 55)
  y += 7
  addKeyValue(doc, 'Specialty:', prescription?.specialty || '-', 14, y, 55)
  y += 7
  addKeyValue(doc, 'Patient:', prescription?.patientName || prescription?.patient_name || '-', 14, y, 55)
  y += 12

  y = ensurePageBreak(doc, y, 60)
  y = addSectionTitle(doc, 'Diagnosis', y)
  doc.setFont('helvetica', 'normal')
  y = addWrappedText(doc, prescription?.diagnosis || '-', 14, y, 180, 5)
  y += 8

  y = ensurePageBreak(doc, y, 70)
  y = addSectionTitle(doc, 'Medicines', y)
  ;(prescription?.medicines || []).forEach((medicine, index) => {
    y = ensurePageBreak(doc, y, 46)
    doc.setDrawColor(226, 232, 240)
    doc.roundedRect(14, y - 4, 182, 32, 3, 3)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text(`${index + 1}. ${medicine.name || '-'}`, 18, y + 2)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`Strength: ${medicine.strength || '-'}`, 18, y + 9)
    doc.text(`Form: ${medicine.form || '-'}`, 80, y + 9)
    doc.text(`Dosage: ${medicine.dosage || '-'}`, 18, y + 16)
    doc.text(`Frequency: ${medicine.frequency || '-'}`, 80, y + 16)
    doc.text(`Duration: ${medicine.duration || '-'}`, 18, y + 23)
    if (medicine.instructions) {
      doc.text(`Instructions: ${medicine.instructions}`, 80, y + 23)
    }
    y += 36
  })

  y = ensurePageBreak(doc, y, 40)
  y = addSectionTitle(doc, 'Doctor Advice', y)
  doc.setFont('helvetica', 'normal')
  y = addWrappedText(doc, prescription?.advice || '-', 14, y, 180, 5)
  y += 8

  y = ensurePageBreak(doc, y, 24)
  y = addSectionTitle(doc, 'Follow-up', y)
  doc.setFont('helvetica', 'normal')
  y = addWrappedText(doc, prescription?.followUp || '-', 14, y, 180, 5)

  doc.save(filename)
}
