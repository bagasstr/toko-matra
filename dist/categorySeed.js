"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("./src/lib/prisma");
const helpper_1 = require("./src/lib/helpper");
async function seedCategories() {
    const categories = [
        {
            id: (0, helpper_1.generateCustomId)('cat'),
            name: 'Dinding',
            image: '/assets/categories/bata.png',
        },
        {
            id: (0, helpper_1.generateCustomId)('cat'),
            name: 'Besi Beton & Wiremesh',
            image: '/assets/categories/besi-beton.png',
        },
        {
            id: (0, helpper_1.generateCustomId)('cat'),
            name: 'Semen',
            image: '/assets/categories/semen.png',
        },
        {
            id: (0, helpper_1.generateCustomId)('cat'),
            name: 'Lantai',
            image: '/assets/categories/keramik.png',
        },
        {
            id: (0, helpper_1.generateCustomId)('cat'),
            name: 'Atap & Rangka',
            image: '/assets/categories/atap.png',
        },
        {
            id: (0, helpper_1.generateCustomId)('cat'),
            name: 'Plafon & Partisi',
            image: '/assets/categories/partisi.png',
        },
        {
            id: (0, helpper_1.generateCustomId)('cat'),
            name: 'Sistem Pemipaan',
            image: '/assets/categories/pipa.png',
        },
        {
            id: (0, helpper_1.generateCustomId)('cat'),
            name: 'Material Alam',
            image: '/assets/categories/batu-kerikil.png',
        },
        {
            id: (0, helpper_1.generateCustomId)('cat'),
            name: 'Aksesoris Dapur',
            image: '/assets/categories/keran.png',
        },
        {
            id: (0, helpper_1.generateCustomId)('cat'),
            name: 'Sanitari & Aksesoris',
            image: '/assets/categories/sanitari.png',
        },
        {
            id: (0, helpper_1.generateCustomId)('cat'),
            name: 'Aksesoris Kamar Mandi',
            image: '/assets/categories/shower.png',
        },
    ];
    for (const category of categories) {
        await prisma_1.prisma.category.upsert({
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
        });
    }
    console.log('Categories seeded successfully');
}
seedCategories()
    .then(() => process.exit(0))
    .catch((e) => {
    console.error(e);
    process.exit(1);
});
