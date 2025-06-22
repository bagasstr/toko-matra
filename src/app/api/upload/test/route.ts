import { NextRequest, NextResponse } from 'next/server'
import { uploadToSupabase, generateFileName } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = (formData.get('type') as string) || 'test'

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const filename = generateFileName(file.name, `${type}-`)
    const path = `${type}/${filename}`

    console.log('Testing upload to Supabase:', {
      filename,
      path,
      size: file.size,
    })

    // Upload to Supabase Storage
    const { url, error } = await uploadToSupabase(file, 'images', path)

    if (error) {
      console.error('Supabase upload error:', error)
      return NextResponse.json(
        { success: false, error, path, filename },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      url,
      filename,
      path,
      originalName: file.name,
      size: file.size,
      type: file.type,
      message: 'File uploaded successfully to Supabase Storage!',
    })
  } catch (error) {
    console.error('Upload test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: String(error),
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Supabase Storage Test API',
    usage: 'POST with form-data: file (required), type (optional)',
    example:
      'curl -X POST /api/upload/test -F "file=@image.jpg" -F "type=test"',
  })
}
