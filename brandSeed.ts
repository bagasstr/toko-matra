import { prisma } from './src/lib/prisma'
import { generateCustomId } from './src/lib/helpper'
async function seedBrands() {
  const brands = [
    {
      id: generateCustomId('cat'),
      name: 'Tiga Roda',
      image: '/assets/brands/tigaroda.png',
    },
    {
      id: generateCustomId('cat'),
      name: 'Holcim',
      image: '/assets/brands/holcim.png',
    },
    {
      id: generateCustomId('cat'),
      name: 'Toto',
      image: '/assets/brands/toto.png',
    },
    {
      id: generateCustomId('cat'),
      name: 'Rockwool',
      image: '/assets/brands/rockwool.png',
    },
  ]

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { id: brand.id },
      update: {
        id: brand.id,
        name: brand.name,
        logo: brand.image,
        slug: brand.name.toLowerCase().replace(/ /g, '-').replace(/&/g, 'dan'),
      },
      create: {
        id: brand.id,
        name: brand.name,
        logo: brand.image,
        slug: brand.name.toLowerCase().replace(/ /g, '-').replace(/&/g, 'dan'),
      },
    })
  }

  console.log('Brands seeded successfully')
}

seedBrands()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
