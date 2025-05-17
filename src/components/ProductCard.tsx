import React from 'react'
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import { Product } from '../types/product'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
  onClick: () => void
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onClick,
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))

  return (
    <Card
      sx={{
        maxWidth: { xs: '100%', sm: 345, md: 345 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: theme.shadows[4],
        },
      }}>
      <CardMedia
        component='img'
        height={isMobile ? '200' : '140'}
        image={product.image}
        alt={product.name}
        sx={{
          objectFit: 'cover',
          width: '100%',
        }}
      />
      <CardContent sx={{ flexGrow: 1, p: { xs: 2, sm: 2, md: 3 } }}>
        <Typography
          gutterBottom
          variant={isMobile ? 'h5' : 'h6'}
          component='div'
          sx={{
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
            fontWeight: 600,
          }}>
          {product.name}
        </Typography>
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{
            fontSize: { xs: '0.875rem', sm: '0.9rem' },
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
          {product.description}
        </Typography>
        <Box
          sx={{
            mt: 2,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: { xs: 1, sm: 0 },
          }}>
          <Typography
            variant='h6'
            color='primary'
            sx={{
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              textAlign: { xs: 'center', sm: 'left' },
            }}>
            Rp {product.price.toLocaleString()}
          </Typography>
          <Button
            variant='contained'
            color='primary'
            fullWidth={isMobile}
            onClick={() => onAddToCart(product)}
            sx={{
              py: { xs: 1, sm: 1.5 },
              px: { xs: 2, sm: 3 },
            }}>
            Add to Cart
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

export default ProductCard
