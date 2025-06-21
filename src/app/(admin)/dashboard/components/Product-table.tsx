'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import {
  Edit,
  MoreHorizontal,
  Search,
  Trash,
  Eye,
  ArrowUpDown,
  ChevronDown,
  X,
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { getAllProducts, deleteProduct } from '@/app/actions/productAction'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDebounce } from '@/hooks/useDebounce'
import { Checkbox } from '@/components/ui/checkbox'
import Image from 'next/image'
import ProductPagination from '@/components/ProductPagination'

function TableSkeleton() {
  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div className='relative w-64'>
            <Skeleton className='h-10 w-full' />
          </div>
        </div>
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Gambar</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Nama Produk</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='text-right'>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className='h-4 w-16' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-12 w-12 rounded-md' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-20' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-32' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-24' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-24' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-16' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-6 w-20 rounded-full' />
                </TableCell>
                <TableCell className='text-right'>
                  <Skeleton className='h-8 w-8 rounded-full' />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default function ProductsTable() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<string>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    try {
      const result = await getAllProducts()
      if (result.success) {
        setProducts(result.products)
      } else {
        toast.error('Gagal mengambil data produk')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat mengambil data produk')
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredAndSortedProducts = products
    .filter((product) => {
      const matchesSearch =
        debouncedSearchTerm === '' ||
        product.name
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        product.category?.name
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(debouncedSearchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && product.isActive) ||
        (statusFilter === 'inactive' && !product.isActive) ||
        (statusFilter === 'out-of-stock' && product?.stock === 0) ||
        (statusFilter === 'low-stock' &&
          product?.stock <= 10 &&
          product?.stock > 0)

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'sku':
          comparison = a.sku.localeCompare(b.sku)
          break
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'category':
          comparison = (a.category?.name || '').localeCompare(
            b.category?.name || ''
          )
          break
        case 'price':
          comparison = a.price - b.price
          break
        case 'stock':
          comparison = (a?.stock || 0) - (b?.stock || 0)
          break
        default:
          comparison = 0
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage)
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset to page 1 if filter/search changes and currentPage out of range
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1)
  }, [debouncedSearchTerm, statusFilter, totalPages])

  const handleDeleteProduct = (id: string) => {
    setDeleteProductId(id)
  }

  const confirmDelete = async () => {
    if (deleteProductId) {
      try {
        const result = await deleteProduct(deleteProductId)
        if (result.success) {
          // Remove the deleted product from the state
          setProducts(
            products.filter((product) => product.id !== deleteProductId)
          )
          toast.success('Produk berhasil dihapus')
        } else {
          toast.error(result.error || 'Gagal menghapus produk')
        }
      } catch (error) {
        toast.error('Terjadi kesalahan saat menghapus produk')
      } finally {
        setDeleteProductId(null)
      }
    }
  }

  const handleEditProduct = (id: string) => {
    router.push(`/dashboard/produk/edit/${id}`)
  }

  const handleViewProduct = (id: string) => {
    router.push(`/dashboard/produk/detail/${id}`)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getStockStatus = (stock: number, isActive: boolean) => {
    if (!isActive) return { label: 'Nonaktif', variant: 'secondary' as const }
    if (stock <= 0) return { label: 'Habis', variant: 'destructive' as const }
    if (stock <= 10)
      return { label: 'Stok Menipis', variant: 'destructive' as const }
    return { label: 'Tersedia', variant: 'default' as const }
  }

  const clearSearch = () => {
    setSearchTerm('')
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(
        filteredAndSortedProducts.map((product) => product.id)
      )
    } else {
      setSelectedProducts([])
    }
  }

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId])
    } else {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId))
    }
  }

  if (loading) {
    return <TableSkeleton />
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div className='relative w-64'>
            <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Cari produk...'
              value={searchTerm || ''}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-8'
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className='absolute right-2 top-2.5'>
                <X className='h-4 w-4 text-muted-foreground' />
              </button>
            )}
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Filter Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Semua Status</SelectItem>
              <SelectItem value='active'>Aktif</SelectItem>
              <SelectItem value='inactive'>Nonaktif</SelectItem>
              <SelectItem value='out-of-stock'>Habis</SelectItem>
              <SelectItem value='low-stock'>Stok Menipis</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {selectedProducts.length > 0 && (
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>
              {selectedProducts.length} produk dipilih
            </span>
            <Button
              variant='destructive'
              size='sm'
              onClick={() => {
                // Handle bulk delete
                setDeleteProductId(selectedProducts.join(','))
              }}>
              Hapus Terpilih
            </Button>
          </div>
        )}
      </div>
      <div className='rounded-md border'>
        <div className='overflow-x-auto'>
          <div className='min-w-[1000px]'>
            <Table>
              <TableHeader>
                <TableRow className=''>
                  <TableHead className='flex items-center justify-center'>
                    <Checkbox
                      checked={
                        filteredAndSortedProducts.length > 0 &&
                        selectedProducts.length ===
                          filteredAndSortedProducts.length
                      }
                      onCheckedChange={handleSelectAll}
                      aria-label='Select all'
                    />
                  </TableHead>
                  <TableHead className='w-[50px] text-center'>Gambar</TableHead>
                  <TableHead className='text-center w-[120px]'>
                    <Button
                      variant='ghost'
                      onClick={() => handleSort('sku')}
                      className=' h-8 data-[state=open]:bg-accent'>
                      SKU
                      <ArrowUpDown className='ml-2 h-4 w-4' />
                    </Button>
                  </TableHead>
                  <TableHead className='w-[250px] text-center'>
                    <Button
                      variant='ghost'
                      onClick={() => handleSort('name')}
                      className=' h-8 data-[state=open]:bg-accent'>
                      Nama Produk
                      <ArrowUpDown className='ml-2 h-4 w-4' />
                    </Button>
                  </TableHead>
                  <TableHead className='text-center w-[100px]'>
                    <Button
                      variant='ghost'
                      onClick={() => handleSort('category')}
                      className=' h-8 data-[state=open]:bg-accent'>
                      Kategori
                      <ArrowUpDown className='ml-2 h-4 w-4' />
                    </Button>
                  </TableHead>
                  <TableHead className='text-center'>
                    <Button
                      variant='ghost'
                      onClick={() => handleSort('price')}
                      className=' h-8 data-[state=open]:bg-accent'>
                      Harga
                      <ArrowUpDown className='ml-2 h-4 w-4' />
                    </Button>
                  </TableHead>
                  <TableHead className='w-[100px]'>
                    <Button
                      variant='ghost'
                      onClick={() => handleSort('stock')}
                      className=' h-8 data-[state=open]:bg-accent'>
                      Stok
                      <ArrowUpDown className='ml-2 h-4 w-4' />
                    </Button>
                  </TableHead>
                  <TableHead className='w-[20px] text-center'>Status</TableHead>
                  <TableHead className='w-[80px] text-center'>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProducts.map((product) => {
                  const stockStatus = getStockStatus(
                    product?.stock || 0,
                    product.isActive
                  )
                  return (
                    <TableRow key={product.id} className='text-center'>
                      <TableCell className='flex items-center justify-center h-[100px]'>
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={(checked) =>
                            handleSelectProduct(product.id, checked as boolean)
                          }
                          aria-label={`Select ${product.name}`}
                        />
                      </TableCell>
                      <TableCell className='text-center'>
                        {product.images ? (
                          <Image
                            src={`${product.images[0]}`}
                            alt={product.name}
                            className='rounded-md object-cover'
                            width={100}
                            height={100}
                          />
                        ) : (
                          <div className='h-12 w-12 rounded-md bg-muted flex items-center justify-center'>
                            <span className='text-xs text-muted-foreground'>
                              No image
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className='font-medium text-center'>
                        {product.sku}
                      </TableCell>
                      <TableCell
                        className='max-w-[250px] truncate text-center'
                        title={product.name}>
                        {product.name}
                      </TableCell>
                      <TableCell
                        className='truncate text-center'
                        title={product.category?.name || '-'}>
                        {product.category?.name || '-'}
                      </TableCell>
                      <TableCell className='whitespace-nowrap text-center'>
                        {formatPrice(product.price)}
                      </TableCell>
                      <TableCell className='text-center'>
                        {product.stock || 0}
                      </TableCell>
                      <TableCell className='text-center'>
                        <Badge variant={stockStatus.variant} className='py-1'>
                          {stockStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-center'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' className='h-8 w-8 p-0'>
                              <span className='sr-only'>Buka menu</span>
                              <MoreHorizontal className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleViewProduct(product.id)}>
                              <Eye className='mr-2 h-4 w-4' />
                              Lihat Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditProduct(product.id)}>
                              <Edit className='mr-2 h-4 w-4' />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className='text-destructive'
                              onClick={() => handleDeleteProduct(product.id)}>
                              <Trash className='mr-2 h-4 w-4' />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <AlertDialog
        open={!!deleteProductId}
        onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteProductId?.includes(',')
                ? 'Konfirmasi Hapus Produk Terpilih'
                : 'Konfirmasi Hapus Produk'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteProductId?.includes(',')
                ? `Apakah Anda yakin ingin menghapus ${
                    deleteProductId.split(',').length
                  } produk yang dipilih? Tindakan ini tidak dapat dibatalkan.`
                : 'Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteProductId?.includes(',')) {
                  // Handle bulk delete
                  const ids = deleteProductId.split(',')
                  try {
                    for (const id of ids) {
                      await deleteProduct(id)
                    }
                    setProducts(products.filter((p) => !ids.includes(p.id)))
                    setSelectedProducts([])
                    toast.success('Produk berhasil dihapus')
                  } catch (error) {
                    toast.error('Gagal menghapus beberapa produk')
                  }
                } else {
                  await confirmDelete()
                }
                setDeleteProductId(null)
              }}
              className='bg-destructive text-destructive-foreground'>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ProductPagination
        currentPage={currentPage}
        totalPages={totalPages || 1}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  )
}
