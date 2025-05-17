import React from 'react'
import { Grid, Container, useTheme, useMediaQuery } from '@mui/material'
import { Product } from '../types/product'
import ProductCard from './ProductCard'

interface ProductListProps {
  products: Product[]
  onAddToCart: (product: Product) => void
  onClick: (product: Product) => void
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  onAddToCart,
  onClick,
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))

  return (
    <Container maxWidth='xl' sx={{ py: 4 }}>
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        {products.map((product) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            lg={3}
            key={product.id}
            sx={{
              display: 'flex',
              justifyContent: 'center',
            }}>
            <ProductCard
              product={product}
              onAddToCart={onAddToCart}
              onClick={() => onClick(product)}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

export default ProductList
