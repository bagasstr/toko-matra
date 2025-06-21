'use client'

import { useEffect, useState, useRef } from 'react'
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
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import {
  createCategory,
  getAllCategories,
  deleteCategory,
} from '@/app/actions/categoryAction'
import React from 'react'
import ProductPagination from '@/components/ProductPagination'

interface Category {
  id: string
  name: string
  children?: Category[]
}

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  )
  const [newCategoryName, setNewCategoryName] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  )
  const [isAddingSubCategory, setIsAddingSubCategory] = useState(false)
  const [isLoadingAdd, setIsLoadingAdd] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Pagination logic for root categories
  const totalPages = Math.ceil(categories.length / itemsPerPage)
  const paginatedCategories = categories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (isAddDialogOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isAddDialogOpen])

  const fetchCategories = async () => {
    const result = await getAllCategories()
    if (result.success) {
      setCategories(result.treeCategory)
    }
  }

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1)
  }, [categories, totalPages])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Nama kategori tidak boleh kosong')
      return
    }
    setIsLoadingAdd(true)
    const result = await createCategory({
      name: newCategoryName,
      parentId: isAddingSubCategory ? selectedCategory?.id : undefined,
    })
    setIsLoadingAdd(false)
    if (result.success) {
      toast.success('Kategori berhasil ditambahkan')
      setNewCategoryName('')
      setIsAddDialogOpen(false)
      setIsAddingSubCategory(false)
      setSelectedCategory(null)
      fetchCategories()
    } else {
      toast.error('Gagal menambahkan kategori')
    }
  }

  const handleAddSubCategory = (category: Category) => {
    setSelectedCategory(category)
    setIsAddingSubCategory(true)
    setIsAddDialogOpen(true)
  }

  const handleDeleteCategory = async (category: Category) => {
    setSelectedCategory(category)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedCategory) return
    const result = await deleteCategory(selectedCategory.id)
    if (result.success) {
      toast.success('Kategori berhasil dihapus')
      setIsDeleteDialogOpen(false)
      setSelectedCategory(null)
      fetchCategories()
    } else {
      toast.error('Gagal menghapus kategori')
    }
  }

  const renderCategoryRow = (category: Category, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0
    const isExpanded = expandedCategories.has(category.id)
    return (
      <React.Fragment key={category.id}>
        <TableRow
          className={hasChildren ? 'cursor-pointer hover:bg-muted/40' : ''}
          onClick={() => hasChildren && toggleCategory(category.id)}>
          <TableCell>{level === 0 ? category.id : ''}</TableCell>
          <TableCell>
            <div
              className='flex items-center gap-1'
              style={{ paddingLeft: `${level * 24}px` }}>
              {hasChildren && (
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleCategory(category.id)
                  }}
                  className='cursor-pointer p-0 w-5 h-5'>
                  {isExpanded ? (
                    <ChevronDown className='h-4 w-4' />
                  ) : (
                    <ChevronRight className='h-4 w-4' />
                  )}
                </Button>
              )}
              <span>{category.name}</span>
            </div>
          </TableCell>
          <TableCell className='text-right'>
            <div className='flex justify-end gap-2'>
              <Button
                variant='outline'
                size='icon'
                onClick={(e) => {
                  e.stopPropagation()
                  handleAddSubCategory(category)
                }}>
                <Plus className='h-4 w-4' />
              </Button>
              <Button
                variant='outline'
                size='icon'
                onClick={(e) => {
                  e.stopPropagation() /* TODO: handleEditCategory(category) */
                }}>
                <Pencil className='h-4 w-4' />
              </Button>
              <Button
                variant='outline'
                size='icon'
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteCategory(category)
                }}>
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          </TableCell>
        </TableRow>
        {isExpanded &&
          hasChildren &&
          category.children?.map((child) =>
            renderCategoryRow(child, level + 1)
          )}
      </React.Fragment>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Kategori</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='h-4 w-4 mr-2' />
              Tambah Kategori
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isAddingSubCategory
                  ? `Tambah Sub Kategori untuk "${
                      selectedCategory?.name ?? ''
                    }"`
                  : 'Tambah Kategori'}
              </DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Nama Kategori</Label>
                <Input
                  id='name'
                  ref={inputRef}
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder='Masukkan nama kategori'
                />
              </div>
              <Button
                onClick={handleAddCategory}
                className='w-full'
                disabled={isLoadingAdd}>
                {isLoadingAdd ? (
                  <span className='flex items-center gap-2'>
                    <svg className='animate-spin h-4 w-4' viewBox='0 0 24 24'>
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                        fill='none'
                      />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8v8z'
                      />
                    </svg>
                    Menyimpan...
                  </span>
                ) : (
                  'Simpan'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nama Kategori</TableHead>
            <TableHead className='text-right'>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={3}
                className='text-center text-muted-foreground'>
                Belum ada kategori
              </TableCell>
            </TableRow>
          ) : (
            paginatedCategories.map((category) => renderCategoryRow(category))
          )}
        </TableBody>
      </Table>
      <ProductPagination
        currentPage={currentPage}
        totalPages={totalPages || 1}
        onPageChange={setCurrentPage}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Kategori</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <p>Apakah Anda yakin ingin menghapus kategori ini?</p>
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
