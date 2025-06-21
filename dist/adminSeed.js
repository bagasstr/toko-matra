"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("./src/lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const helpper_1 = require("./src/lib/helpper");
async function seedAdmin() {
    const existingAdmin = await prisma_1.prisma.user.findFirst({
        where: { profile: { email: 'matra@gmail.com' } },
    });
    if (!existingAdmin) {
        await prisma_1.prisma.$transaction(async (tx) => {
            const { id } = await tx.user.create({
                data: {
                    id: (0, helpper_1.generateCustomId)('usr'),
                    email: 'matra@gmail.com',
                    emailVerified: new Date(),
                    password: await bcryptjs_1.default.hash('matrakosala123', 10),
                    typeUser: 'perusahaan',
                    role: 'SUPER_ADMIN',
                    profile: {
                        create: {
                            id: (0, helpper_1.generateCustomId)('prf'),
                            email: 'matra@gmail.com',
                            fullName: 'Matra',
                            phoneNumber: null,
                        },
                    },
                },
            });
            await tx.account.create({
                data: {
                    id: (0, helpper_1.generateCustomId)('acc'),
                    userId: id,
                    type: 'credentials',
                    provider: 'credentials',
                    providerAccountId: 'matra@gmail.com',
                },
            });
            return { id };
        });
        console.log('Admin seeded successfully');
    }
}
seedAdmin()
    .then(() => process.exit(0))
    .catch((e) => {
    console.error(e);
    process.exit(1);
});
