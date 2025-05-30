"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCurrency = formatCurrency;
exports.generateProductId = generateProductId;
exports.generateCartId = generateCartId;
exports.generateCartItemId = generateCartItemId;
exports.generateOrderId = generateOrderId;
exports.generateAddressId = generateAddressId;
exports.generateCategoryId = generateCategoryId;
exports.generateBrandId = generateBrandId;
exports.generateUserId = generateUserId;
exports.generateCustomId = generateCustomId;
// Format currency in Indonesian Rupiah
function formatCurrency(amount) {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numAmount);
}
function generateProductId() {
    const randomNum = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0');
    return `PRD-${Date.now()}`;
}
function generateCartId() {
    const randomNum = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0');
    return `CRT-${Date.now()}`;
}
function generateCartItemId() {
    const randomNum = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0');
    return `CIT-${Date.now()}`;
}
function generateOrderId() {
    const randomNum = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0');
    return `ORD-${Date.now()}`;
}
function generateAddressId() {
    const randomNum = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0');
    return `ADR-${Date.now()}`;
}
function generateCategoryId() {
    const randomNum = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0');
    return `CAT-${Date.now()}`;
}
function generateBrandId() {
    const randomNum = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0');
    return `BRD-${Date.now()}`;
}
function generateUserId() {
    const randomNum = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0');
    return `USR-${Date.now()}`;
}
function generateRandomSegment(length = 4) {
    return Math.floor(Math.random() * Math.pow(10, length))
        .toString()
        .padStart(length, '0');
}
function padRandomNumber() {
    return Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0');
}
function generateCustomId(prefix) {
    const timestamp = Date.now(); // milliseconds
    const randomSegment = generateRandomSegment(6);
    return `${prefix}-${randomSegment}`;
}
