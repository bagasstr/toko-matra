import PDFDocument from 'pdfkit-browserify'
import blobStream from 'blob-stream'
import { formatCurrency } from '../lib/utils'

interface InvoiceItem {
  product: string
  uom: string
  qty: number
  priceWithPPN: number
  priceWithoutPPN: number
}

interface InvoiceData {
  items: InvoiceItem[]
  subtotal: number
  discount?: number
  otherValue?: number
  ppn?: number
  shippingCost?: number
  totalPayment: number
  date?: string
  logoDataUrl?: string // Base64 encoded logo
}

export function generateInvoicePDF(data: InvoiceData) {
  // Create a new PDF document
  const doc = new PDFDocument({
    size: 'A4',
    margin: 40,
    bufferPages: true,
  })

  const stream = doc.pipe(blobStream())

  // === Kop Surat ===
  const margin = 40
  const pageWidth = doc.page.width
  const logoWidth = 75
  const logoHeight = 60
  const headerTop = 40
  const infoX = margin + logoWidth + 20 // jarak antara logo dan info
  const infoWidth = pageWidth - infoX - margin

  // Logo di kiri atas
  if (data.logoDataUrl) {
    doc.image(data.logoDataUrl, margin, headerTop, {
      width: logoWidth,
      height: logoHeight,
    })
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .fillColor('#2a1f9d')
      .text('Toko Matra', margin + logoWidth, headerTop + 20)
  } else {
    doc.rect(margin, headerTop, logoWidth, logoHeight).stroke()
  }

  // Company info di kanan atas
  const companyName = 'PT. Matra Kosala Digdaya'
  const npwp = 'NPWP : xxxxxxxxxxxx'
  const address1 = 'Jl. Raya Kb. Jeruk No.10 4, Kb. Jeruk'
  const address3 = ' Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11530'
  const contact = 'CS : +62 856-9709-3044; Email : matrakosala@gmail.com'

  let infoY = headerTop
  doc
    .fontSize(16)
    .fillColor('#000000')
    .font('Helvetica-Bold')
    .text(companyName, infoX, infoY, { width: infoWidth, align: 'right' })
  infoY += 20
  doc
    .fontSize(8)
    .fillColor('#000000')
    .font('Helvetica')
    .text(npwp, infoX, infoY, { width: infoWidth, align: 'right' })
  infoY += 13
  doc
    .fontSize(8)
    .fillColor('#000000')
    .font('Helvetica')
    .text(address1, infoX, infoY, { width: infoWidth, align: 'right' })
  infoY += 11
  doc
    .fontSize(8)
    .fillColor('#000000')
    .font('Helvetica')
    .text(address3, infoX, infoY, { width: infoWidth, align: 'right' })
  infoY += 11
  doc
    .fontSize(8)
    .fillColor('#000000')
    .font('Helvetica')
    .text(contact, infoX, infoY, { width: infoWidth, align: 'right' })

  // Line under header
  doc
    .moveTo(40, 120)
    .lineTo(555, 120)
    .strokeColor('#000000')
    .lineWidth(1.5)
    .stroke()

  // === Judul & Tanggal ===
  doc
    .fontSize(13)
    .fillColor('#000000')
    .font('Helvetica-Bold')
    .text('Daftar Keranjang', 40, 140)

  doc
    .fontSize(9)
    .fillColor('#000000')
    .font('Helvetica')
    .text(
      `Diunduh Pada ${
        data.date ||
        new Date().toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
      } ${new Date().toLocaleTimeString('id-ID')}`,
      40,
      160
    )

  // === Tabel Produk ===
  const tableTop = 190
  const tableLeft = 40
  const tableWidth = 515
  const columnWidths = [
    tableWidth * 0.32, // Produk
    tableWidth * 0.12, // UOM
    tableWidth * 0.12, // Qty
    tableWidth * 0.2, // Harga Satuan (termasuk PPN)
    tableWidth * 0.24, // Total
  ]

  const headers = [
    'Produk',
    'UOM',
    'Qty',
    'Harga Satuan\n(termasuk PPN)',
    'Total\n(diluar PPN dan diskon)',
  ]

  // Draw table header background and border
  const headerHeight = 28
  doc
    .rect(tableLeft, tableTop - 5, tableWidth, headerHeight)
    .fillColor('#f5f5f5')
    .fill()

  // Border tebal di atas, kiri, kanan
  // Atas
  doc
    .moveTo(tableLeft, tableTop - 5)
    .lineTo(tableLeft + tableWidth, tableTop - 5)
    .strokeColor('#000')
    .lineWidth(1.5)
    .stroke()
  // Kiri
  doc
    .moveTo(tableLeft, tableTop - 5)
    .lineTo(tableLeft, tableTop + headerHeight + data.items.length * 28)
    .strokeColor('#000')
    .lineWidth(1.5)
    .stroke()
  // Kanan
  doc
    .moveTo(tableLeft + tableWidth, tableTop - 5)
    .lineTo(
      tableLeft + tableWidth,
      tableTop + headerHeight + data.items.length * 28
    )
    .strokeColor('#000')
    .lineWidth(1.5)
    .stroke()
  // Bawah (nanti setelah data rows)

  doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000')
  let currentX = tableLeft
  headers.forEach((header, i) => {
    doc.text(header, currentX + 8, tableTop + 4, {
      width: columnWidths[i] - 16,
      align: i === 4 ? 'right' : 'center',
    })
    currentX += columnWidths[i]
  })

  // Draw vertical lines for header
  currentX = tableLeft
  columnWidths.forEach((width, i) => {
    currentX += width
    doc
      .moveTo(currentX, tableTop - 5)
      .lineTo(currentX, tableTop + headerHeight - 5)
      .strokeColor('#808080')
      .lineWidth(1.5)
      .stroke()
  })

  // Draw table data
  let y = tableTop + headerHeight
  const rowHeight = 28
  data.items.forEach((item, index) => {
    const isEven = index % 2 === 0
    const rowTotal = item.priceWithoutPPN * item.qty

    // Row background
    doc
      .rect(tableLeft, y - 5, tableWidth, rowHeight)
      .fillColor(isEven ? '#ffffff' : '#fafafa')
      .fill()

    // Row data
    const row = [
      item.product,
      item.uom,
      String(item.qty),
      formatCurrency(item.priceWithPPN),
      formatCurrency(rowTotal),
    ]

    currentX = tableLeft
    row.forEach((cell, i) => {
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#1a1a1a')
        .text(cell, currentX + 8, y + (rowHeight - 9) / 2, {
          width: columnWidths[i] - 16,
          align: i === 4 ? 'right' : 'center',
        })
      currentX += columnWidths[i]
    })

    // Row borders (horizontal garis row)
    doc
      .moveTo(tableLeft, y + rowHeight - 5)
      .lineTo(tableLeft + tableWidth, y + rowHeight - 5)
      .strokeColor('#808080')
      .lineWidth(1.5)
      .stroke()

    // Draw vertical lines
    currentX = tableLeft
    columnWidths.forEach((width, i) => {
      currentX += width
      doc
        .moveTo(currentX, y - 5)
        .lineTo(currentX, y + rowHeight - 5)
        .strokeColor('#808080')
        .lineWidth(1.5)
        .stroke()
    })

    y += rowHeight
  })
  // Draw table bottom border
  doc
    .moveTo(tableLeft, y - 5)
    .lineTo(tableLeft + tableWidth, y - 5)
    .strokeColor('#000')
    .lineWidth(1.5)
    .stroke()

  // === Ringkasan ===
  y += 20
  const summaryLeft = tableLeft + 300
  const summaryWidth = 200

  const summaryRows = [
    {
      label: 'Subtotal',
      value: formatCurrency(data.subtotal),
      color: '#000000',
      bold: false,
    },
    {
      label: 'Diskon',
      value: data.discount ? `- ${formatCurrency(data.discount)}` : '- Rp 0,00',
      color: '#ff0000',
      bold: false,
    },
    {
      label: 'Subtotal Setelah Diskon',
      value: formatCurrency(
        data.discount ? data.subtotal - data.discount : data.subtotal
      ),
      color: '#000000',
      bold: false,
    },
    {
      label: 'Nilai Lain',
      value: data.otherValue ? formatCurrency(data.otherValue) : 'Rp 0,00',
      color: '#000000',
      bold: false,
    },
    {
      label: 'PPN',
      value: data.ppn ? formatCurrency(data.ppn) : 'Rp 0,00',
      color: '#000000',
      bold: false,
    },
    {
      label: 'Biaya Kirim',
      value: data.shippingCost ? formatCurrency(data.shippingCost) : 'Rp 0,00',
      color: '#000000',
      bold: false,
    },
  ]

  summaryRows.forEach((row, idx) => {
    doc
      .font(row.bold ? 'Helvetica-Bold' : 'Helvetica')
      .fontSize(10)
      .fillColor(row.color)
      .text(row.label, summaryLeft, y + idx * 20)

    doc
      .font(row.bold ? 'Helvetica-Bold' : 'Helvetica')
      .fontSize(10)
      .fillColor(row.color)
      .text(row.value, summaryLeft + summaryWidth - 100, y + idx * 20, {
        align: 'right',
        width: 100,
      })

    // Add line after each item except the last one
    if (idx < summaryRows.length - 1) {
      doc
        .moveTo(summaryLeft, y + idx * 20 + 15)
        .lineTo(summaryLeft + summaryWidth, y + idx * 20 + 15)
        .strokeColor('#cccccc')
        .lineWidth(0.5)
        .stroke()
    }
  })

  // Line before total
  const totalY = y + summaryRows.length * 20 + 10
  doc
    .moveTo(summaryLeft, totalY)
    .lineTo(summaryLeft + summaryWidth, totalY)
    .strokeColor('#808080')
    .lineWidth(1.5)
    .stroke()

  // Total
  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor('#000000')
    .text('Total Tagihan', summaryLeft, totalY + 10)

  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor('#000000')
    .text(
      formatCurrency(data.totalPayment),
      summaryLeft + summaryWidth - 100,
      totalY + 10,
      {
        align: 'right',
        width: 100,
      }
    )
  // === Keterangan ===
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor('#000000')
    .text('Keterangan:', 40, totalY)

  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor('#333333')
    .text(
      '1. Harga pada PDF ini hanya reference. Harga terupdate hanya pada website',
      40,
      totalY + 12
    )

  // === Watermark Logo ===
  if (data.logoDataUrl) {
    doc.opacity(0.5).image(data.logoDataUrl, 200, 350, {
      width: 200,
    })
  }

  // Finalize PDF
  doc.end()

  // Return the PDF as a blob URL for download
  return new Promise((resolve) => {
    stream.on('finish', () => {
      const blob = stream.toBlob('application/pdf')
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'daftar-keranjang.pdf'
      link.click()
      resolve(url)
    })
  })
}
