"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
// lib/prisma.ts
const client_1 = require("@prisma/client");
const globalForPrisma = globalThis;
exports.prisma = (_a = globalForPrisma.prisma) !== null && _a !== void 0 ? _a : new client_1.PrismaClient(Object.assign({ datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    }, 
    // Explicitly disable all logging
    log: [], 
    // Additional logging configuration to ensure no logs
    errorFormat: 'minimal' }, (process.env.NODE_ENV === 'production' && {
    transactionOptions: {
        maxWait: 5000, // 5 seconds
        timeout: 10000, // 10 seconds
    },
})));
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
