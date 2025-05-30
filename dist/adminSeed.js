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
        where: { profile: { email: 'admin@gmail.com' } },
    });
    if (!existingAdmin) {
        await prisma_1.prisma.$transaction(async (tx) => {
            const { id } = await tx.user.create({
                data: {
                    id: (0, helpper_1.generateCustomId)('usr'),
                    email: 'admin@gmail.com',
                    emailVerified: new Date(),
                    password: await bcryptjs_1.default.hash('admin123', 10),
                    typeUser: '',
                    role: 'ADMIN',
                    profile: {
                        create: {
                            id: (0, helpper_1.generateCustomId)('prf'),
                            email: 'admin@gmail.com',
                            fullName: 'Admin',
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
                    providerAccountId: 'admin@gmail.com',
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
