import { prisma } from './src/lib/prisma'
import { generateCustomId } from './src/lib/helpper'

async function seedProducts() {
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

  const products = [
    // TIGA RODA PRODUCTS (3 products)
    {
      id: generateCustomId('prd'),
      sku: 'TR-SEM-001',
      name: 'Semen Portland Tiga Roda 50kg',
      slug: 'semen-portland-tiga-roda-50kg',
      description:
        'Semen Portland berkualitas tinggi untuk konstruksi bangunan. Cocok untuk berbagai jenis konstruksi seperti rumah, gedung, dan infrastruktur. Tahan lama dan memiliki daya rekat yang kuat.',
      images: [
        '/assets/products/semen-tiga-roda-50kg-1.jpg',
        '/assets/products/semen-tiga-roda-50kg-2.jpg',
        '/assets/products/semen-tiga-roda-50kg-3.jpg',
      ],
      price: 85000,
      unit: 'sak',
      weight: 50,
      dimensions: '50x30x15',
      stock: 500,
      minOrder: 1,
      multiOrder: 1,
      label: 'ready_stock',
      isFeatured: true,
      isActive: true,
      categoryId:
        categories.find((cat) => cat.name === 'Semen dan Sejenisnya')?.id || '',
      brandId: brands.find((brand) => brand.name === 'Tiga Roda')?.id || '',
    },
    {
      id: generateCustomId('prd'),
      sku: 'TR-MOR-001',
      name: 'Mortar Tiga Roda Premium 40kg',
      slug: 'mortar-tiga-roda-premium-40kg',
      description:
        'Mortar premium untuk perekat keramik dan bata. Kualitas tinggi dengan daya rekat yang kuat, anti retak, dan mudah digunakan.',
      images: [
        '/assets/products/mortar-tiga-roda-40kg-1.jpg',
        '/assets/products/mortar-tiga-roda-40kg-2.jpg',
      ],
      price: 65000,
      unit: 'sak',
      weight: 40,
      dimensions: '40x25x12',
      stock: 300,
      minOrder: 5,
      multiOrder: 1,
      label: 'ready_stock',
      isFeatured: false,
      isActive: true,
      categoryId:
        categories.find((cat) => cat.name === 'Semen dan Sejenisnya')?.id || '',
      brandId: brands.find((brand) => brand.name === 'Tiga Roda')?.id || '',
    },
    {
      id: generateCustomId('prd'),
      sku: 'TR-PUT-001',
      name: 'Plester Tiga Roda Putih 25kg',
      slug: 'plester-tiga-roda-putih-25kg',
      description:
        'Plester putih untuk finishing dinding. Memberikan hasil yang halus, putih bersih, dan siap untuk dicat.',
      images: [
        '/assets/products/plester-tiga-roda-1.jpg',
        '/assets/products/plester-tiga-roda-2.jpg',
      ],
      price: 45000,
      unit: 'sak',
      weight: 25,
      dimensions: '40x25x12',
      stock: 0,
      minOrder: 10,
      multiOrder: 5,
      label: 'indent',
      isFeatured: false,
      isActive: true,
      categoryId:
        categories.find((cat) => cat.name === 'Semen dan Sejenisnya')?.id || '',
      brandId: brands.find((brand) => brand.name === 'Tiga Roda')?.id || '',
    },

    // HOLCIM PRODUCTS (3 products)
    {
      id: generateCustomId('prd'),
      sku: 'HOL-SEM-001',
      name: 'Semen Holcim PowerMax 50kg',
      slug: 'semen-holcim-powermax-50kg',
      description:
        'Semen Holcim PowerMax dengan kekuatan tinggi untuk konstruksi berat. Ideal untuk proyek infrastruktur dan bangunan bertingkat.',
      images: [
        '/assets/products/semen-holcim-powermax-1.jpg',
        '/assets/products/semen-holcim-powermax-2.jpg',
      ],
      price: 95000,
      unit: 'sak',
      weight: 50,
      dimensions: '50x30x15',
      stock: 0,
      minOrder: 10,
      multiOrder: 5,
      label: 'indent',
      isFeatured: true,
      isActive: true,
      categoryId:
        categories.find((cat) => cat.name === 'Semen dan Sejenisnya')?.id || '',
      brandId: brands.find((brand) => brand.name === 'Holcim')?.id || '',
    },
    {
      id: generateCustomId('prd'),
      sku: 'HOL-READY-001',
      name: 'Beton Ready Mix Holcim',
      slug: 'beton-ready-mix-holcim',
      description:
        'Beton ready mix Holcim untuk proyek konstruksi skala besar. Kualitas konsisten, mudah digunakan, dan hemat waktu.',
      images: [
        '/assets/products/beton-holcim-1.jpg',
        '/assets/products/beton-holcim-2.jpg',
      ],
      price: 750000,
      unit: 'm3',
      weight: 2400,
      dimensions: null,
      stock: 0,
      minOrder: 5,
      multiOrder: 1,
      label: 'suplier',
      isFeatured: false,
      isActive: true,
      categoryId:
        categories.find((cat) => cat.name === 'Semen dan Sejenisnya')?.id || '',
      brandId: brands.find((brand) => brand.name === 'Holcim')?.id || '',
    },
    {
      id: generateCustomId('prd'),
      sku: 'HOL-MOR-001',
      name: 'Mortar Holcim Acian 25kg',
      slug: 'mortar-holcim-acian-25kg',
      description:
        'Mortar acian Holcim untuk finishing dinding. Memberikan hasil yang halus dan siap untuk dicat.',
      images: [
        '/assets/products/mortar-holcim-acian-1.jpg',
        '/assets/products/mortar-holcim-acian-2.jpg',
      ],
      price: 55000,
      unit: 'sak',
      weight: 25,
      dimensions: '40x25x12',
      stock: 200,
      minOrder: 5,
      multiOrder: 1,
      label: 'ready_stock',
      isFeatured: false,
      isActive: true,
      categoryId:
        categories.find((cat) => cat.name === 'Semen dan Sejenisnya')?.id || '',
      brandId: brands.find((brand) => brand.name === 'Holcim')?.id || '',
    },

    // TOTO PRODUCTS (2 products)
    {
      id: generateCustomId('prd'),
      sku: 'TOTO-WC-001',
      name: 'Kloset Duduk TOTO Washlet',
      slug: 'kloset-duduk-toto-washlet',
      description:
        'Kloset duduk premium TOTO dengan teknologi washlet. Dilengkapi dengan bidet otomatis, pemanas duduk, dan remote control.',
      images: [
        '/assets/products/kloset-toto-washlet-1.jpg',
        '/assets/products/kloset-toto-washlet-2.jpg',
        '/assets/products/kloset-toto-washlet-3.jpg',
      ],
      price: 3500000,
      unit: 'unit',
      weight: 45,
      dimensions: '70x40x80',
      stock: 15,
      minOrder: 1,
      multiOrder: 1,
      label: 'ready_stock',
      isFeatured: true,
      isActive: true,
      categoryId:
        categories.find((cat) => cat.name === 'Sanitari & Aksesoris')?.id || '',
      brandId: brands.find((brand) => brand.name === 'Toto')?.id || '',
    },
    {
      id: generateCustomId('prd'),
      sku: 'TOTO-KERAN-001',
      name: 'Keran Dapur TOTO Premium',
      slug: 'keran-dapur-toto-premium',
      description:
        'Keran dapur TOTO dengan desain modern dan teknologi anti-bocor. Tersedia dalam berbagai warna dan finish yang elegan.',
      images: [
        '/assets/products/keran-toto-premium-1.jpg',
        '/assets/products/keran-toto-premium-2.jpg',
      ],
      price: 850000,
      unit: 'unit',
      weight: 2.5,
      dimensions: '30x20x50',
      stock: 0,
      minOrder: 5,
      multiOrder: 1,
      label: 'suplier',
      isFeatured: false,
      isActive: true,
      categoryId:
        categories.find((cat) => cat.name === 'Aksesoris Dapur')?.id || '',
      brandId: brands.find((brand) => brand.name === 'Toto')?.id || '',
    },

    // ROCKWOOL PRODUCTS (2 products)
    {
      id: generateCustomId('prd'),
      sku: 'ROC-INS-001',
      name: 'Rockwool Insulation 50mm',
      slug: 'rockwool-insulation-50mm',
      description:
        'Rockwool insulation dengan ketebalan 50mm untuk atap dan dinding. Tahan api, kedap suara, dan isolasi panas yang efektif.',
      images: [
        '/assets/products/rockwool-insulation-50mm-1.jpg',
        '/assets/products/rockwool-insulation-50mm-2.jpg',
      ],
      price: 45000,
      unit: 'm2',
      weight: 1.2,
      dimensions: '120x60x5',
      stock: 200,
      minOrder: 10,
      multiOrder: 5,
      label: 'ready_stock',
      isFeatured: false,
      isActive: true,
      categoryId:
        categories.find((cat) => cat.name === 'Atap & Rangka')?.id || '',
      brandId: brands.find((brand) => brand.name === 'Rockwool')?.id || '',
    },
    {
      id: generateCustomId('prd'),
      sku: 'ROC-ACO-001',
      name: 'Rockwool Acoustic Panel',
      slug: 'rockwool-acoustic-panel',
      description:
        'Panel akustik Rockwool untuk studio musik dan ruang meeting. Mengurangi gema dan meningkatkan kualitas suara.',
      images: [
        '/assets/products/rockwool-acoustic-panel-1.jpg',
        '/assets/products/rockwool-acoustic-panel-2.jpg',
        '/assets/products/rockwool-acoustic-panel-3.jpg',
      ],
      price: 125000,
      unit: 'm2',
      weight: 3.5,
      dimensions: '60x60x2.5',
      stock: 0,
      minOrder: 20,
      multiOrder: 10,
      label: 'indent',
      isFeatured: true,
      isActive: true,
      categoryId:
        categories.find((cat) => cat.name === 'Plafon & Partisi')?.id || '',
      brandId: brands.find((brand) => brand.name === 'Rockwool')?.id || '',
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        id: product.id,
        sku: product.sku,
        name: product.name,
        slug: product.slug,
        description: product.description,
        images: product.images,
        price: product.price,
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
        id: product.id,
        sku: product.sku,
        name: product.name,
        slug: product.slug,
        description: product.description,
        images: product.images,
        price: product.price,
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

  console.log('Products seeded successfully')
}

seedProducts()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
