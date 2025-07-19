'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { getExportData } from '@/app/actions/exportAction'

export default function TestExport() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testProductExport = async () => {
    setIsLoading(true)
    try {
      const filters = {
        dateRange: { from: null, to: null },
        status: [],
        categories: [],
        exportType: 'products' as const,
        includeDetails: false,
        format: 'xlsx' as const,
      }

      console.log('Testing product export...')
      const response = await getExportData(filters)
      console.log('Export response:', response)
      setResult(response)
    } catch (error) {
      console.error('Export test error:', error)
      setResult({ success: false, error: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='p-4 border rounded-lg'>
      <h3 className='text-lg font-semibold mb-4'>Test Export Produk</h3>

      <Button onClick={testProductExport} disabled={isLoading} className='mb-4'>
        {isLoading ? 'Testing...' : 'Test Export Produk'}
      </Button>

      {result && (
        <div className='mt-4'>
          <h4 className='font-medium mb-2'>Result:</h4>
          <pre className='bg-gray-100 p-3 rounded text-sm overflow-auto max-h-96'>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
