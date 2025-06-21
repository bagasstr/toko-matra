"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("./src/lib/prisma");
const helpper_1 = require("./src/lib/helpper");
async function seedBrands() {
    const brands = [
        {
            id: (0, helpper_1.generateCustomId)('cat'),
            name: 'Tiga Roda',
            image: '/assets/brands/tigaroda.png',
        },
        {
            id: (0, helpper_1.generateCustomId)('cat'),
            name: 'Holcim',
            image: '/assets/brands/holcim.png',
        },
        {
            id: (0, helpper_1.generateCustomId)('cat'),
            name: 'Toto',
            image: '/assets/brands/toto.png',
        },
        {
            id: (0, helpper_1.generateCustomId)('cat'),
            name: 'Rockwool',
            image: '/assets/brands/rockwool.png',
        },
    ];
    for (const brand of brands) {
        await prisma_1.prisma.brand.upsert({
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
        });
    }
    console.log('Brands seeded successfully');
}
seedBrands()
    .then(() => process.exit(0))
    .catch((e) => {
    console.error(e);
    process.exit(1);
});
