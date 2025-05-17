import { prisma } from './src/lib/prisma'
import { generateCustomId } from './src/lib/helpper'
async function seedCategories() {
  const categories = [
    {
      id: generateCustomId('CAT'),
      name: 'Dinding',
      image: '/assets/categories/bata.png',
    },
    {
      id: generateCustomId('CAT'),
      name: 'Besi Beton & Wiremesh',
      image: '/assets/categories/besi-beton.png',
    },
    {
      id: generateCustomId('CAT'),
      name: 'Semen',
      image: '/assets/categories/semen.png',
    },
    {
      id: generateCustomId('CAT'),
      name: 'Lantai',
      image: '/assets/categories/keramik.png',
    },
    {
      id: generateCustomId('CAT'),
      name: 'Atap & Rangka',
      image: '/assets/categories/atap.png',
    },
    {
      id: generateCustomId('CAT'),
      name: 'Plafon & Partisi',
      image: '/assets/categories/partisi.png',
    },
    {
      id: generateCustomId('CAT'),
      name: 'Sistem Pemipaan',
      image: '/assets/categories/pipa.png',
    },
    {
      id: generateCustomId('CAT'),
      name: 'Material Alam',
      image: '/assets/categories/batu-kerikil.png',
    },

    {
      id: generateCustomId('CAT'),
      name: 'Aksesoris Dapur',
      image: '/assets/categories/keran.png',
    },
    {
      id: generateCustomId('CAT'),
      name: 'Sanitari & Aksesoris',
      image: '/assets/categories/sanitari.png',
    },
    {
      id: generateCustomId('CAT'),
      name: 'Aksesoris Kamar Mandi',
      image: '/assets/categories/shower.png',
    },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {},
      create: {
        id: category.id,
        name: category.name,
        imageUrl: category.image,
        slug: category.name
          .toLowerCase()
          .replace(/ /g, '-')
          .replace(/&/g, 'dan'),
      },
    })
  }

  console.log('Categories seeded successfully')
}

seedCategories()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
