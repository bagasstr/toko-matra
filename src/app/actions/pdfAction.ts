'use client'

export async function generatePdfFromHtml(
  htmlContent: string
): Promise<Uint8Array> {
  try {
    // Dynamic import untuk menghindari SSR error
    const HTMLToPDF = (await import('html-to-pdf-js')).default

    // Create a temporary container
    const container = document.createElement('div')
    container.innerHTML = htmlContent

    // Add necessary styles
    const style = document.createElement('style')
    style.textContent = `
      @page {
        margin: 20px;
        size: A4;
      }
      body {
        margin: 0;
        padding: 0;
      }
      .watermark {
        color: rgba(147, 147, 147, 0.1) !important;
      }
    `
    container.insertBefore(style, container.firstChild)
    document.body.appendChild(container)

    // Generate PDF
    const pdf = await HTMLToPDF.create(container, {
      margin: 20,
      filename: 'document.pdf',
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
      },
    })

    // Cleanup
    document.body.removeChild(container)

    // Get PDF data
    const pdfBlob = await pdf.toBlob()
    const arrayBuffer = await pdfBlob.arrayBuffer()
    return new Uint8Array(arrayBuffer)
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error(`Failed to generate PDF: ${error.message}`)
  }
}
