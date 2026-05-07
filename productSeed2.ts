import { prisma } from './src/lib/prisma'
import { generateCustomId } from './src/lib/helpper'

async function seedAdditionalProducts() {
  // First, get existing categories and brands to use their IDs
  const categories = await prisma.category.findMany()
  const brands = await prisma.brand.findMany()

  // Helper function to generate slug
  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .trim()
      .replace(/\s+/g, '-')
  }

  const additionalProducts = [
    // BATA MERAH (Brick Category)
    {
      id: generateCustomId('prd'),
      sku: 'BATA-001',
      name: 'Bata Merah Press Premium',
      slug: 'bata-merah-press-premium',
      description:
        'Bata merah press berkualitas tinggi untuk dinding bangunan. Kuat, tahan lama, dan memiliki ukuran yang seragam. Cocok untuk konstruksi rumah, gedung, dan pagar.',
      images: ['/assets/products/bata-merah-press-1.png'],
      price: 2500,
      costPrice: 2000,
      unit: 'pcs',
      weight: 2.5,
      dimensions: '21x10x5.5',
      stock: 10000,
      minOrder: 100,
      multiOrder: 50,
      label: 'ready_stock',
      isFeatured: true,
      isActive: true,
      categoryId: categories.find((cat) => cat.name === 'Dinding')?.id || '',
      brandId: null, // No specific brand for bricks
    },

    // BESI BETON (Steel Category)
    {
      id: generateCustomId('prd'),
      sku: 'BESI-10-001',
      name: 'Besi Beton 10mm SNI',
      slug: 'besi-beton-10mm-sni',
      description:
        'Besi beton diameter 10mm dengan standar SNI untuk konstruksi beton bertulang. Kuat tarik tinggi, tahan korosi, dan cocok untuk struktur bangunan.',
      images: ['/assets/products/besi-beton-10mm-1.png'],
      price: 85000,
      costPrice: 75000,
      unit: 'batang',
      weight: 7.4,
      dimensions: '12000x10', // 12 meter length, 10mm diameter
      stock: 500,
      minOrder: 10,
      multiOrder: 5,
      label: 'ready_stock',
      isFeatured: false,
      isActive: true,
      categoryId:
        categories.find((cat) => cat.name === 'Besi Beton & Wiremesh')?.id ||
        '',
      brandId: null,
    },

    // WIREMESH (Steel Category)
    {
      id: generateCustomId('prd'),
      sku: 'WM-6-150-001',
      name: 'Wiremesh M6-150 (6mm x 150mm)',
      slug: 'wiremesh-m6-150-6mm-x-150mm',
      description:
        'Wiremesh dengan diameter 6mm dan jarak 150mm untuk pelat lantai dan dinding. Memperkuat struktur beton dan mencegah retak.',
      images: ['/assets/products/wiremesh-m6-150-1.png'],
      price: 125000,
      costPrice: 110000,
      unit: 'lembar',
      weight: 15,
      dimensions: '2100x5400', // 2.1m x 5.4m
      stock: 200,
      minOrder: 5,
      multiOrder: 2,
      label: 'ready_stock',
      isFeatured: false,
      isActive: true,
      categoryId:
        categories.find((cat) => cat.name === 'Besi Beton & Wiremesh')?.id ||
        '',
      brandId: null,
    },

    // KERAMIK LANTAI (Floor Category)
    {
      id: generateCustomId('prd'),
      sku: 'KER-60-60-001',
      name: 'Keramik Lantai 60x60cm Premium',
      slug: 'keramik-lantai-60x60cm-premium',
      description:
        'Keramik lantai ukuran 60x60cm dengan motif modern dan tahan gores. Cocok untuk ruang tamu, kamar tidur, dan area komersial.',
      images: ['/assets/products/keramik-60x60-premium-1.png'],
      price: 85000,
      costPrice: 70000,
      unit: 'm2',
      weight: 15,
      dimensions: '60x60x0.8',
      stock: 1000,
      minOrder: 10,
      multiOrder: 5,
      label: 'ready_stock',
      isFeatured: true,
      isActive: true,
      categoryId: categories.find((cat) => cat.name === 'Lantai')?.id || '',
      brandId: null,
    },

    // PIPA PVC (Piping Category)
    {
      id: generateCustomId('prd'),
      sku: 'PIPA-PVC-4-001',
      name: 'Pipa PVC 4 Inch SNI',
      slug: 'pipa-pvc-4-inch-sni',
      description:
        'Pipa PVC diameter 4 inch untuk saluran air dan limbah. Tahan korosi, ringan, dan mudah dipasang. Standar SNI untuk kualitas terjamin.',
      images: ['/assets/products/pipa-pvc-4-inch-1.png'],
      price: 45000,
      costPrice: 38000,
      unit: 'batang',
      weight: 8.5,
      dimensions: '4000x110', // 4m length, 110mm diameter
      stock: 300,
      minOrder: 5,
      multiOrder: 2,
      label: 'ready_stock',
      isFeatured: false,
      isActive: true,
      categoryId:
        categories.find((cat) => cat.name === 'Sistem Pemipaan')?.id || '',
      brandId: null,
    },

    // GENTENG (Roof Category)
    {
      id: generateCustomId('prd'),
      sku: 'GEN-MULTI-001',
      name: 'Genteng Multi Roof Premium',
      slug: 'genteng-multi-roof-premium',
      description:
        'Genteng multi roof dengan teknologi anti bocor dan tahan cuaca ekstrem. Desain modern, ringan, dan mudah dipasang.',
      images: ['/assets/products/genteng-multi-roof-1.png'],
      price: 35000,
      costPrice: 28000,
      unit: 'lembar',
      weight: 3.2,
      dimensions: '1050x420',
      stock: 800,
      minOrder: 50,
      multiOrder: 10,
      label: 'ready_stock',
      isFeatured: true,
      isActive: true,
      categoryId:
        categories.find((cat) => cat.name === 'Atap & Rangka')?.id || '',
      brandId: null,
    },

    // GYPSUM (Ceiling Category)
    {
      id: generateCustomId('prd'),
      sku: 'GYP-BOARD-001',
      name: 'Gypsum Board 9mm Premium',
      slug: 'gypsum-board-9mm-premium',
      description:
        'Papan gypsum tebal 9mm untuk plafon dan dinding partisi. Ringan, mudah dipotong, dan memberikan hasil finishing yang halus.',
      images: ['/assets/products/gypsum-board-9mm-1.png'],
      price: 45000,
      costPrice: 38000,
      unit: 'lembar',
      weight: 7.5,
      dimensions: '1200x2400x9',
      stock: 400,
      minOrder: 10,
      multiOrder: 5,
      label: 'ready_stock',
      isFeatured: false,
      isActive: true,
      categoryId:
        categories.find((cat) => cat.name === 'Plafon & Partisi')?.id || '',
      brandId: null,
    },

    // BATU KALI (Natural Material Category)
    {
      id: generateCustomId('prd'),
      sku: 'BATU-KALI-001',
      name: 'Batu Kali Belah Premium',
      slug: 'batu-kali-belah-premium',
      description:
        'Batu kali belah untuk pondasi dan dinding penahan tanah. Kuat, tahan lama, dan memberikan stabilitas yang baik untuk konstruksi.',
      images: ['/assets/products/batu-kali-belah-1.png'],
      price: 85000,
      costPrice: 70000,
      unit: 'm3',
      weight: 1600,
      dimensions: null,
      stock: 50,
      minOrder: 5,
      multiOrder: 2,
      label: 'ready_stock',
      isFeatured: false,
      isActive: true,
      categoryId:
        categories.find((cat) => cat.name === 'Material Alam')?.id || '',
      brandId: null,
    },

    // KERAN DAPUR (Kitchen Accessories Category)
    {
      id: generateCustomId('prd'),
      sku: 'KERAN-DAPUR-001',
      name: 'Keran Dapur Stainless Steel',
      slug: 'keran-dapur-stainless-steel',
      description:
        'Keran dapur stainless steel dengan teknologi anti-bocor dan filter air. Desain ergonomis, mudah dibersihkan, dan tahan karat.',
      images: ['/assets/products/keran-dapur-stainless-1.png'],
      price: 350000,
      costPrice: 280000,
      unit: 'unit',
      weight: 1.8,
      dimensions: '25x15x45',
      stock: 50,
      minOrder: 1,
      multiOrder: 1,
      label: 'ready_stock',
      isFeatured: true,
      isActive: true,
      categoryId:
        categories.find((cat) => cat.name === 'Aksesoris Dapur')?.id || '',
      brandId: null,
    },

    // SHOWER (Bathroom Accessories Category)
    {
      id: generateCustomId('prd'),
      sku: 'SHOWER-PREMIUM-001',
      name: 'Shower Set Premium Chrome',
      slug: 'shower-set-premium-chrome',
      description:
        'Set shower premium dengan finish chrome mengkilap. Dilengkapi dengan shower head, selang, dan bracket. Teknologi water saving.',
      images: ['/assets/products/shower-set-premium-1.png'],
      price: 280000,
      costPrice: 220000,
      unit: 'set',
      weight: 2.5,
      dimensions: '30x20x15',
      stock: 75,
      minOrder: 1,
      multiOrder: 1,
      label: 'ready_stock',
      isFeatured: false,
      isActive: true,
      categoryId:
        categories.find((cat) => cat.name === 'Aksesoris Kamar Mandi')?.id ||
        '',
      brandId: null,
    },
  ]

  for (const product of additionalProducts) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        images: product.images,
        price: product.price,
        costPrice: product.costPrice,
        unit: product.unit,
        weight: product.weight,
        dimensions: product.dimensions,
        stock: product.stock,
        minOrder: product.minOrder,
        multiOrder: product.multiOrder,
        label: product.label,
        isFeatured: product.isFeatured,
        isActive: product.isActive,
        categoryId: product.categoryId,
        brandId: product.brandId,
      },
      create: {
        id: generateCustomId('prd'),
        sku: product.sku,
        name: product.name,
        slug: product.slug,
        description: product.description,
        images: product.images,
        price: product.price,
        costPrice: product.costPrice,
        unit: product.unit,
        weight: product.weight,
        dimensions: product.dimensions,
        stock: product.stock,
        minOrder: product.minOrder,
        multiOrder: product.multiOrder,
        label: product.label,
        isFeatured: product.isFeatured,
        isActive: product.isActive,
        categoryId: product.categoryId,
        brandId: product.brandId,
      },
    })
  }

  console.log('Additional products seeded successfully')
}

seedAdditionalProducts()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
