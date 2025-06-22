import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create Supabase client with fallback for build time
let supabase: ReturnType<typeof createClient> | null = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  // Create a dummy client for build time when env vars are not available
  supabase = createClient('https://dummy.supabase.co', 'dummy-key')
}

export { supabase }

// Helper function untuk upload file ke Supabase Storage
export async function uploadToSupabase(
  file: File,
  bucket: string,
  path: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    // Check if Supabase is properly configured
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return { url: null, error: 'Supabase configuration is missing' }
    }

    if (!supabase) {
      return { url: null, error: 'Supabase client is not initialized' }
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return { url: null, error: error.message }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(data.path)

    return { url: publicUrl, error: null }
  } catch (error) {
    console.error('Upload error:', error)
    return { url: null, error: 'Failed to upload file' }
  }
}

// Helper function untuk upload dari base64
export async function uploadBase64ToSupabase(
  base64Data: string,
  bucket: string,
  path: string,
  contentType: string = 'image/jpeg'
): Promise<{ url: string | null; error: string | null }> {
  try {
    // Remove data:image/...;base64, prefix jika ada
    const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Content, 'base64')

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType,
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return { url: null, error: error.message }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(data.path)

    return { url: publicUrl, error: null }
  } catch (error) {
    console.error('Upload error:', error)
    return { url: null, error: 'Failed to upload file' }
  }
}

// Helper function untuk delete file dari Supabase Storage
export async function deleteFromSupabase(
  bucket: string,
  path: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) {
      console.error('Supabase delete error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Delete error:', error)
    return { success: false, error: 'Failed to delete file' }
  }
}

// Helper function untuk generate unique filename
export function generateFileName(
  originalName: string,
  prefix: string = ''
): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split('.').pop()

  return `${prefix}${timestamp}-${randomString}.${extension}`
}

// Helper function untuk extract path dari Supabase URL
export function extractSupabasePath(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    // Remove /storage/v1/object/public/bucket-name/ dari path
    return pathParts.slice(5).join('/')
  } catch (error) {
    console.error('Error extracting path:', error)
    return ''
  }
}
