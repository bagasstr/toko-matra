'use server'

import { list, del } from '@vercel/blob'

export async function listBlobFiles(prefix?: string) {
  try {
    const { blobs } = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN,
      prefix, // Optional: filter by folder (e.g., 'produk/')
    })

    return { success: true, files: blobs }
  } catch (error) {
    console.error('Error listing blob files:', error)
    return { success: false, error: 'Failed to list files' }
  }
}

export async function deleteBlobFile(url: string) {
  try {
    await del(url, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return { success: true }
  } catch (error) {
    console.error('Error deleting blob file:', error)
    return { success: false, error: 'Failed to delete file' }
  }
}

export async function cleanupTestFiles() {
  try {
    const { blobs } = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN,
      prefix: 'produk/',
    })

    // Delete all test files (optional - be careful!)
    const deletePromises = blobs.map((blob) =>
      del(blob.url, {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      })
    )

    await Promise.all(deletePromises)

    return { success: true, deletedCount: blobs.length }
  } catch (error) {
    console.error('Error cleaning up test files:', error)
    return { success: false, error: 'Failed to cleanup' }
  }
}
