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
      case 'avif':
        contentType = 'image/avif'
        break
      case 'svg':
        contentType = 'image/svg+xml'
        break
    }

    // Optimized cache headers based on environment
    const isProduction = process.env.NODE_ENV === 'production'
    const cacheHeaders = isProduction
      ? {
          'Cache-Control': 'public, max-age=31536000, immutable', // 1 year cache
          Expires: new Date(Date.now() + 31536000000).toUTCString(),
          ETag: `"${Date.now()}"`, // Simple ETag for cache validation
        }
      : {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        }

    // Return image with optimized headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': imageBuffer.length.toString(),
        'X-Content-Type-Options': 'nosniff',
        'Cross-Origin-Resource-Policy': 'cross-origin',
        ...cacheHeaders,
      },
    })
  } catch (error) {
    console.error('Error serving image:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
