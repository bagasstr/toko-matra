import { NextRequest, NextResponse } from 'next/server'
import { generatePdfFromHtml } from '@/app/actions/pdfAction'

export async function POST(request: NextRequest) {
  const { htmlContent } = await request.json()
  const pdfBuffer = await generatePdfFromHtml(htmlContent)
  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=cart.pdf',
    },
  })
}
