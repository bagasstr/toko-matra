'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pencil, Trash2, Search } from 'lucide-react'
import { toast } from 'sonner'
import { searchCustomers, deleteCustomer } from '@/app/actions/customerAction'
import { formatDate } from '@/lib/clientHelpers'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  createdAt: string
}

interface ClientCustomerPageProps {
  initialCustomers: Customer[]
}

export function ClientCustomerPage({
  initialCustomers,
}: ClientCustomerPageProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Update customers when initialCustomers props change
  useEffect(() => {
    setCustomers(initialCustomers)
  }, [initialCustomers])

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setCustomers(initialCustomers)
      return
    }

    setIsLoading(true)
    try {
      const result = await searchCustomers(searchQuery)
      if (result.success) {
        setCustomers(result.customers)
      } else {
        toast.error(result.message || 'Gagal mencari pelanggan')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat mencari pelanggan')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsViewDialogOpen(true)
  }

  const handleDeleteCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedCustomer) return

    try {
      const result = await deleteCustomer(selectedCustomer.id)
      if (result.success) {
        toast.success('Pelanggan berhasil dihapus')
        setIsDeleteDialogOpen(false)
        setSelectedCustomer(null)

        // Remove deleted customer from the list
        setCustomers((prev) => prev.filter((c) => c.id !== selectedCustomer.id))
      } else {
        toast.error(result.message || 'Gagal menghapus pelanggan')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat menghapus pelanggan')
      console.error(error)
    }
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-2'>
        <div>
          <h1 className='text-2xl font-bold'>Daftar Pelanggan</h1>
          <p className='text-muted-foreground'>
            Menampilkan semua pengguna dengan role Customer
          </p>
        </div>
      </div>

      <div className='flex gap-2 mb-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            type='text'
            placeholder='Cari pelanggan berdasarkan nama atau email...'
            className='pl-8'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch}>Cari</Button>
        <Button
          variant='outline'
          onClick={() => {
            setSearchQuery('')
            setCustomers(initialCustomers)
          }}>
          Reset
        </Button>
      </div>

      {isLoading ? (
        <div className='text-center py-6 my-4 border rounded-md'>
          <div className='flex flex-col items-center gap-2'>
            <div className='animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full'></div>
            <p>Memuat data pelanggan...</p>
          </div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telepon</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead>Tanggal Daftar</TableHead>
              <TableHead className='text-right'>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='h-32 text-center'>
                  <div className='flex flex-col items-center gap-2'>
                    {searchQuery ? (
                      <>
                        <p className='text-muted-foreground'>
                          Tidak ada hasil yang cocok dengan pencarian
                        </p>
                        <p className='text-sm'>
                          Coba gunakan kata kunci yang berbeda
                        </p>
                      </>
                    ) : (
                      <>
                        <p className='text-muted-foreground'>
                          Belum ada data pelanggan
                        </p>
                        <p className='text-sm'>
                          Pelanggan yang mendaftar akan muncul di sini
                        </p>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className='font-medium'>
                    {customer.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell className='max-w-[200px] truncate'>
                    {customer.address}
                  </TableCell>
                  <TableCell>{formatDate(customer.createdAt)}</TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-2'>
                      <Button
                        variant='outline'
                        size='icon'
                        onClick={() => handleViewCustomer(customer)}>
                        <Pencil className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='outline'
                        size='icon'
                        onClick={() => handleDeleteCustomer(customer)}>
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Pelanggan</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label>ID</Label>
                  <p className='font-medium mt-1'>{selectedCustomer.id}</p>
                </div>
                <div>
                  <Label>Tanggal Daftar</Label>
                  <p className='font-medium mt-1'>
                    {formatDate(selectedCustomer.createdAt)}
                  </p>
                </div>
                <div>
                  <Label>Nama</Label>
                  <p className='font-medium mt-1'>{selectedCustomer.name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className='font-medium mt-1'>{selectedCustomer.email}</p>
                </div>
                <div>
                  <Label>Telepon</Label>
                  <p className='font-medium mt-1'>{selectedCustomer.phone}</p>
                </div>
                <div className='col-span-2'>
                  <Label>Alamat</Label>
                  <p className='font-medium mt-1'>{selectedCustomer.address}</p>
                </div>
              </div>

              <div className='flex justify-end'>
                <Button onClick={() => setIsViewDialogOpen(false)}>
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Pelanggan</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <p>
              Apakah Anda yakin ingin menghapus pelanggan{' '}
              <span className='font-semibold'>{selectedCustomer?.name}</span>?
            </p>
            <div className='flex justify-end gap-2'>
              <Button
                variant='outline'
                onClick={() => setIsDeleteDialogOpen(false)}>
                Batal
              </Button>
              <Button variant='destructive' onClick={confirmDelete}>
                Hapus
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
