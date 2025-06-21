import { NextRequest, NextResponse } from 'next/server'
import { readFile, access } from 'fs/promises'
import { join } from 'path'
import { constants } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params
    const imagePath = resolvedParams.path.join('/')
    const filePath = join(process.cwd(), 'public', imagePath)

    // Check if file exists
    try {
      await access(filePath, constants.F_OK)
    } catch {
      return new NextResponse('Image not found', { status: 404 })
    }

    // Read file
    const imageBuffer = await readFile(filePath)

    // Get file extension to determine content type
    const extension = imagePath.split('.').pop()?.toLowerCase()
    let contentType = 'image/jpeg' // default

    switch (extension) {
      case 'png':
        contentType = 'image/png'
        break
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg'
        break
      case 'gif':
        contentType = 'image/gif'
        break
      case 'webp':
        contentType = 'image/webp'
        break
      case 'svg':
        contentType = 'image/svg+xml'
        break
    }

    // Return image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate', // No cache untuk development
        Pragma: 'no-cache',
        Expires: '0',
      },
    })
  } catch (error) {
    console.error('Error serving image:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
