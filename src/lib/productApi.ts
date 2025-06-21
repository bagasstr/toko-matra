// Product API utilities

// Upload images
export async function uploadProductImages(formData: FormData) {
  try {
    const response = await fetch('/api/products/upload', {
      method: 'POST',
      body: formData, // Don't set Content-Type for FormData
    })

    return await response.json()
  } catch (error) {
    console.error('Upload failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}

// Get all products with pagination
export async function getProducts(params?: {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
}) {
  try {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.search) searchParams.set('search', params.search)
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId)

    const query = searchParams.toString()
    const response = await fetch(`/api/products${query ? `?${query}` : ''}`)

    return await response.json()
  } catch (error) {
    console.error('Get products failed:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to fetch products',
    }
  }
}

// Get single product by ID
export async function getProduct(id: string) {
  try {
    const response = await fetch(`/api/products/${id}`)
    return await response.json()
  } catch (error) {
    console.error('Get product failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch product',
    }
  }
}

// Create new product
export async function createProduct(data: any) {
  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    return await response.json()
  } catch (error) {
    console.error('Create product failed:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to create product',
    }
  }
}

// Update product
export async function updateProduct(id: string, data: any) {
  try {
    const response = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    return await response.json()
  } catch (error) {
    console.error('Update product failed:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update product',
    }
  }
}

// Delete product
export async function deleteProduct(id: string) {
  try {
    const response = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
    })

    return await response.json()
  } catch (error) {
    console.error('Delete product failed:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to delete product',
    }
  }
}
