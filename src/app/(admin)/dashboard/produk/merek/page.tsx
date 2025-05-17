'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  getAllBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from '@/app/actions/brandAction'
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
import { Pencil, Trash2 } from 'lucide-react'
import Image from 'next/image'

export default function BrandPage() {
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [newBrand, setNewBrand] = useState('')
  const [editingBrand, setEditingBrand] = useState<{
    id: string
    name: string
  } | null>(null)
  const [editName, setEditName] = useState('')
  const [newLogo, setNewLogo] = useState<string>('')
  const [editLogo, setEditLogo] = useState<string>('')
  const [previewNewLogo, setPreviewNewLogo] = useState<string>('')
  const [previewEditLogo, setPreviewEditLogo] = useState<string>('')

  useEffect(() => {
    fetchBrands()
  }, [])

  async function fetchBrands() {
    try {
      const result = await getAllBrands()
      if (result.success) {
        setBrands(result.brands)
      } else {
        toast.error('Gagal mengambil data merek')
      }
    } catch (error) {
      toast.error('Gagal mengambil data merek')
    }
  }

  function handleLogoChange(
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'new' | 'edit'
  ) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      if (type === 'new') {
        setNewLogo(base64String)
        setPreviewNewLogo(base64String)
      } else {
        setEditLogo(base64String)
        setPreviewEditLogo(base64String)
      }
    }
    reader.readAsDataURL(file)
  }

  async function handleCreateBrand(e: React.FormEvent) {
    e.preventDefault()
    if (newBrand.length < 2) {
      toast.error('Nama merek harus minimal 2 karakter')
      return
    }
    setLoading(true)
    try {
      const result = await createBrand({
        name: newBrand,
        logo: newLogo,
        slug: '',
      })
      if (result.success) {
        toast.success('Merek berhasil ditambahkan')
        setNewBrand('')
        setNewLogo('')
        setPreviewNewLogo('')
        fetchBrands()
      } else {
        toast.error(result.error || 'Gagal menambah merek')
      }
    } catch (error) {
      toast.error('Gagal menambah merek')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateBrand(e: React.FormEvent) {
    e.preventDefault()
    if (!editingBrand) return
    if (editName.length < 2) {
      toast.error('Nama merek harus minimal 2 karakter')
      return
    }
    setLoading(true)
    try {
      const result = await updateBrand(editingBrand.id, {
        name: editName,
        logo: editLogo,
      })
      if (result.success) {
        toast.success('Merek berhasil diupdate')
        setEditingBrand(null)
        setEditName('')
        setEditLogo('')
        setPreviewEditLogo('')
        fetchBrands()
      } else {
        toast.error(result.error || 'Gagal update merek')
      }
    } catch (error) {
      toast.error('Gagal update merek')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteBrand(id: string) {
    if (!confirm('Apakah Anda yakin ingin menghapus merek ini?')) return
    setLoading(true)
    try {
      const result = await deleteBrand(id)
      if (result.success) {
        toast.success('Merek berhasil dihapus')
        fetchBrands()
      } else {
        toast.error(result.error || 'Gagal menghapus merek')
      }
    } catch (error) {
      toast.error('Gagal menghapus merek')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='container mx-auto py-8'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Kelola Merek</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Tambah Merek</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Merek Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateBrand} className='space-y-4'>
              <Input
                placeholder='Nama merek'
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
                disabled={loading}
              />
              <div className='space-y-2'>
                <Input
                  type='file'
                  accept='image/*'
                  onChange={(e) => handleLogoChange(e, 'new')}
                  disabled={loading}
                  className='block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-violet-50 file:text-violet-700
                    hover:file:bg-violet-100'
                />
                {previewNewLogo && (
                  <div className='relative w-32 h-32'>
                    <Image
                      src={previewNewLogo}
                      alt='Logo preview'
                      fill
                      className='object-contain'
                    />
                  </div>
                )}
              </div>
              <Button type='submit' disabled={loading}>
                {loading ? 'Menambahkan...' : 'Tambah'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Logo</TableHead>
            <TableHead>Nama Merek</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead className='text-right'>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {brands.map((brand) => (
            <TableRow key={brand.id}>
              <TableCell>
                {brand.logo && (
                  <div className='relative w-16 h-16'>
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      fill
                      className='object-contain'
                    />
                  </div>
                )}
              </TableCell>
              <TableCell>{brand.name}</TableCell>
              <TableCell>{brand.slug}</TableCell>
              <TableCell className='text-right'>
                <div className='flex justify-end gap-2'>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant='outline'
                        size='icon'
                        onClick={() => {
                          setEditingBrand(brand)
                          setEditName(brand.name)
                          setPreviewEditLogo(brand.logo || '')
                        }}>
                        <Pencil className='h-4 w-4' />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Merek</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleUpdateBrand} className='space-y-4'>
                        <Input
                          placeholder='Nama merek'
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          disabled={loading}
                        />
                        <div className='space-y-2'>
                          <Input
                            type='file'
                            accept='image/*'
                            onChange={(e) => handleLogoChange(e, 'edit')}
                            disabled={loading}
                            className='block w-full text-sm text-slate-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-full file:border-0
                              file:text-sm file:font-semibold
                              file:bg-violet-50 file:text-violet-700
                              hover:file:bg-violet-100'
                          />
                          {previewEditLogo && (
                            <div className='relative w-32 h-32'>
                              <Image
                                src={previewEditLogo}
                                alt='Logo preview'
                                fill
                                className='object-contain'
                              />
                            </div>
                          )}
                        </div>
                        <Button type='submit' disabled={loading}>
                          {loading ? 'Mengupdate...' : 'Update'}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant='destructive'
                    size='icon'
                    onClick={() => handleDeleteBrand(brand.id)}
                    disabled={loading}>
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
