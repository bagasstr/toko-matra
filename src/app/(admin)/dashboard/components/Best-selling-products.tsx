'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Product {
  name: string
  price: number
  stock: number
  totalSold: number
}

interface BestSellingProductsProps {
  products: Product[]
}

export function BestSellingProducts({ products }: BestSellingProductsProps) {
  return (
    <div className='space-y-4'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Produk</TableHead>
            <TableHead className='text-right'>Harga</TableHead>
            <TableHead className='text-right'>Stok</TableHead>
            <TableHead className='text-right'>Terjual</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, index) => (
            <TableRow key={index}>
              <TableCell className='font-medium'>{product.name}</TableCell>
              <TableCell className='text-right'>
                {isNaN(product.price)
                  ? '-'
                  : new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(product.price)}
              </TableCell>
              <TableCell className='text-right'>
                {isNaN(product.stock) ? '-' : product.stock}
              </TableCell>
              <TableCell className='text-right'>
                {isNaN(product.totalSold) ? '-' : product.totalSold}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
