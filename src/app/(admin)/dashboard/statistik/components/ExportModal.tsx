'use client'

import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Download,
  Calendar as CalendarIcon,
  Filter,
  FileSpreadsheet,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExportModalProps {
  children?: React.ReactNode
  onExport?: (filters: ExportFilters) => void
}

interface ExportFilters {
  dateRange: {
    from: Date | null
    to: Date | null
  }
  status: string[]
  categories: string[]
  exportType: 'orders' | 'products' | 'customers' | 'sales'
  includeDetails: boolean
  format: 'xlsx' | 'csv'
}

const statusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Dikonfirmasi' },
  { value: 'PROCESSING', label: 'Diproses' },
  { value: 'SHIPPED', label: 'Dikirim' },
  { value: 'DELIVERED', label: 'Diterima' },
  { value: 'CANCELLED', label: 'Dibatalkan' },
]

const exportTypes = [
  { value: 'orders', label: 'Data Pesanan' },
  { value: 'products', label: 'Data Produk' },
  { value: 'customers', label: 'Data Pelanggan' },
  { value: 'sales', label: 'Data Penjualan' },
]

export default function ExportModal({ children, onExport }: ExportModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<
    { value: string; label: string }[]
  >([])

  const [filters, setFilters] = useState<ExportFilters>({
    dateRange: {
      from: null,
      to: null,
    },
    status: [],
    categories: [],
    exportType: 'orders',
    includeDetails: true,
    format: 'xlsx',
  })

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const result = await response.json()
          console.log('Categories API response:', result) // Debug log

          // Handle the API response structure: { success: true, categories: array }
          // Note: API returns 'categories' field that contains 'categorie' array
          if (
            result.success &&
            result.categories &&
            Array.isArray(result.categories)
          ) {
            setCategories(
              result.categories.map((cat: any) => ({
                value: cat.id, // Use 'id' field from category data
                label: cat.name,
              }))
            )
          } else {
            console.warn('Categories data is not in expected format:', result)
            setCategories([])
          }
        } else {
          console.error('Failed to fetch categories:', response.status)
          setCategories([])
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        setCategories([])
      }
    }

    fetchCategories()
  }, [])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const handleStatusChange = (statusValue: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      status: checked
        ? [...prev.status, statusValue]
        : prev.status.filter((s) => s !== statusValue),
    }))
  }

  const handleCategoryChange = (categoryValue: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      categories: checked
        ? [...prev.categories, categoryValue]
        : prev.categories.filter((c) => c !== categoryValue),
    }))
  }

  const handleExport = async () => {
    setIsLoading(true)
    try {
      // Call the export function passed as prop
      if (onExport) {
        await onExport(filters)
      } else {
        // Default export logic
        await performDefaultExport()
      }
      setIsOpen(false)
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const performDefaultExport = async () => {
    // Mock data for demonstration - replace with actual API calls
    const mockData = generateMockData()

    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(mockData)

    // Set column widths
    worksheet['!cols'] = [
      { wch: 15 }, // ID
      { wch: 25 }, // Nama/Produk
      { wch: 15 }, // Tanggal
      { wch: 12 }, // Status
      { wch: 15 }, // Jumlah
      { wch: 20 }, // Total
    ]

    XLSX.utils.book_append_sheet(workbook, worksheet, getSheetName())

    const fileName = `${getSheetName()}_${
      new Date().toISOString().split('T')[0]
    }.${filters.format}`
    XLSX.writeFile(workbook, fileName)
  }

  const generateMockData = () => {
    // This would be replaced with actual API call based on filters
    switch (filters.exportType) {
      case 'orders':
        return [
          {
            ID: 'ORD001',
            Pelanggan: 'John Doe',
            Tanggal: '2024-01-15',
            Status: 'DELIVERED',
            Total: 'Rp 150,000',
          },
          {
            ID: 'ORD002',
            Pelanggan: 'Jane Smith',
            Tanggal: '2024-01-16',
            Status: 'PROCESSING',
            Total: 'Rp 200,000',
          },
        ]
      case 'products':
        return [
          {
            ID: 'PRD001',
            'Nama Produk': 'Semen Portland',
            Kategori: 'Semen',
            Stok: 100,
            Harga: 'Rp 50,000',
          },
          {
            ID: 'PRD002',
            'Nama Produk': 'Besi Beton',
            Kategori: 'Besi',
            Stok: 50,
            Harga: 'Rp 75,000',
          },
        ]
      case 'customers':
        return [
          {
            ID: 'CUST001',
            Nama: 'John Doe',
            Email: 'john@example.com',
            'Total Pesanan': 5,
            'Total Belanja': 'Rp 1,500,000',
          },
          {
            ID: 'CUST002',
            Nama: 'Jane Smith',
            Email: 'jane@example.com',
            'Total Pesanan': 3,
            'Total Belanja': 'Rp 900,000',
          },
        ]
      case 'sales':
        return [
          {
            Tanggal: '2024-01-15',
            'Total Penjualan': 'Rp 500,000',
            'Jumlah Transaksi': 5,
          },
          {
            Tanggal: '2024-01-16',
            'Total Penjualan': 'Rp 750,000',
            'Jumlah Transaksi': 8,
          },
        ]
      default:
        return []
    }
  }

  const getSheetName = () => {
    const typeNames = {
      orders: 'Pesanan',
      products: 'Produk',
      customers: 'Pelanggan',
      sales: 'Penjualan',
    }
    return typeNames[filters.exportType]
  }

  const resetFilters = () => {
    setFilters({
      dateRange: { from: null, to: null },
      status: [],
      categories: [],
      exportType: 'orders',
      includeDetails: true,
      format: 'xlsx',
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant='outline' className='flex items-center gap-2'>
            <Download className='h-4 w-4' />
            Export Data
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <FileSpreadsheet className='h-5 w-5' />
            Export Data ke Excel
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Export Type */}
          <div className='space-y-2'>
            <Label htmlFor='exportType'>Jenis Data</Label>
            <Select
              value={filters.exportType}
              onValueChange={(value: any) =>
                setFilters((prev) => ({ ...prev, exportType: value }))
              }>
              <SelectTrigger>
                <SelectValue placeholder='Pilih jenis data' />
              </SelectTrigger>
              <SelectContent>
                {exportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range - Simplified without Calendar component */}
          <div className='space-y-2'>
            <Label>Rentang Tanggal</Label>
            <div className='grid grid-cols-2 gap-2'>
              <div>
                <Label className='text-xs text-muted-foreground'>
                  Tanggal Mulai
                </Label>
                <input
                  type='date'
                  className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                  onChange={(e) => {
                    const date = e.target.value
                      ? new Date(e.target.value)
                      : null
                    setFilters((prev) => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, from: date },
                    }))
                  }}
                />
              </div>
              <div>
                <Label className='text-xs text-muted-foreground'>
                  Tanggal Akhir
                </Label>
                <input
                  type='date'
                  className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                  onChange={(e) => {
                    const date = e.target.value
                      ? new Date(e.target.value)
                      : null
                    setFilters((prev) => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, to: date },
                    }))
                  }}
                />
              </div>
            </div>
          </div>

          {/* Status Filter (for orders) */}
          {filters.exportType === 'orders' && (
            <div className='space-y-2'>
              <Label>Status Pesanan</Label>
              <div className='grid grid-cols-2 gap-2'>
                {statusOptions.map((status) => (
                  <div
                    key={status.value}
                    className='flex items-center space-x-2'>
                    <Checkbox
                      id={status.value}
                      checked={filters.status.includes(status.value)}
                      onCheckedChange={(checked) =>
                        handleStatusChange(status.value, !!checked)
                      }
                    />
                    <Label htmlFor={status.value} className='text-sm'>
                      {status.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter (for products) */}
          {filters.exportType === 'products' && categories.length > 0 && (
            <div className='space-y-2'>
              <Label>Kategori Produk</Label>
              <div className='grid grid-cols-2 gap-2 max-h-32 overflow-y-auto'>
                {categories.map((category) => (
                  <div
                    key={category.value}
                    className='flex items-center space-x-2'>
                    <Checkbox
                      id={category.value}
                      checked={filters.categories.includes(category.value)}
                      onCheckedChange={(checked) =>
                        handleCategoryChange(category.value, !!checked)
                      }
                    />
                    <Label htmlFor={category.value} className='text-sm'>
                      {category.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Include Details */}
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='includeDetails'
              checked={filters.includeDetails}
              onCheckedChange={(checked) =>
                setFilters((prev) => ({ ...prev, includeDetails: !!checked }))
              }
            />
            <Label htmlFor='includeDetails'>Sertakan detail lengkap</Label>
          </div>

          {/* Format Selection */}
          <div className='space-y-2'>
            <Label>Format File</Label>
            <Select
              value={filters.format}
              onValueChange={(value: any) =>
                setFilters((prev) => ({ ...prev, format: value }))
              }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='xlsx'>Excel (.xlsx)</SelectItem>
                <SelectItem value='csv'>CSV (.csv)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className='flex gap-2 pt-4'>
            <Button variant='outline' onClick={resetFilters} className='flex-1'>
              <Filter className='mr-2 h-4 w-4' />
              Reset Filter
            </Button>
            <Button
              onClick={handleExport}
              disabled={isLoading}
              className='flex-1'>
              <Download className='mr-2 h-4 w-4' />
              {isLoading ? 'Mengexport...' : 'Export'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
