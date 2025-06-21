#!/usr/bin/env node

/**
 * Test script untuk memverifikasi sistem email notifikasi
 * Usage: node test-email-notification.js [template]
 */

const nodemailer = require('nodemailer')
require('dotenv').config({ path: '.env.local' })

// Test data
const testOrderData = {
  id: 'TEST_ORDER_123',
  total: 1500000,
  address: 'Jl. Test No. 123, Jakarta Selatan',
  orderItems: [
    {
      id: 'item_1',
      name: 'Semen Portland Tipe I',
      quantity: 10,
      price: 75000,
      total: 750000,
    },
    {
      id: 'item_2',
      name: 'Bata Merah Press',
      quantity: 500,
      price: 1500,
      total: 750000,
    },
  ],
  trackingNumber: 'JNE123456789',
  carrier: 'JNE Express',
  cancellationReason: 'Stok tidak tersedia',
}

// Email templates
const emailTemplates = {
  confirmed: {
    subject: 'Pesanan Dikonfirmasi - Sedang Diproses',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #333;">Pesanan Dikonfirmasi</h2>
        <p>Halo,</p>
        <p>Pesanan Anda telah dikonfirmasi dan sedang diproses oleh tim kami.</p>
        
        <div style="background-color: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196f3;">
          <h3 style="color: #1976d2; margin-top: 0;">Status Pesanan</h3>
          <p><strong>Nomor Pesanan:</strong> ${testOrderData.id}</p>
          <p><strong>Status:</strong> <span style="color: #1976d2; font-weight: bold;">Diproses</span></p>
          <p><strong>Tanggal Konfirmasi:</strong> ${new Date().toLocaleString('id-ID')}</p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2e86de; margin-top: 0;">Detail Pesanan</h3>
          <p><strong>Total Pembayaran:</strong> Rp ${testOrderData.total.toLocaleString('id-ID')}</p>
          <p><strong>Alamat Pengiriman:</strong> ${testOrderData.address}</p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2e86de; margin-top: 0;">Item Pesanan</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid #dee2e6;">
                <th style="text-align: left; padding: 8px;">Produk</th>
                <th style="text-align: right; padding: 8px;">Jumlah</th>
                <th style="text-align: right; padding: 8px;">Harga</th>
                <th style="text-align: right; padding: 8px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${testOrderData.orderItems
                .map(
                  (item) => `
                <tr style="border-bottom: 1px solid #dee2e6;">
                  <td style="padding: 8px;">${item.name}</td>
                  <td style="text-align: right; padding: 8px;">${item.quantity}</td>
                  <td style="text-align: right; padding: 8px;">Rp ${item.price.toLocaleString('id-ID')}</td>
                  <td style="text-align: right; padding: 8px;">Rp ${item.total.toLocaleString('id-ID')}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>

        <p>Tim kami akan segera memproses pesanan Anda dan mengirimkan notifikasi ketika pesanan dikirim.</p>
        
        <div style="margin: 20px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders/${testOrderData.id}" 
             style="background-color: #2196f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Lihat Detail Pesanan
          </a>
        </div>

        <p>Terima kasih telah berbelanja di Matrakosala!</p>
        
        <br>
        <p>Terima kasih,<br>Tim Matrakosala</p>
      </div>
    `,
  },
  shipped: {
    subject: 'Pesanan Dikirim - Dalam Perjalanan',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #333;">Pesanan Dikirim</h2>
        <p>Halo,</p>
        <p>Pesanan Anda telah dikirim dan sedang dalam perjalanan ke alamat Anda.</p>
        
        <div style="background-color: #fff3e0; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ff9800;">
          <h3 style="color: #f57c00; margin-top: 0;">Status Pengiriman</h3>
          <p><strong>Nomor Pesanan:</strong> ${testOrderData.id}</p>
          <p><strong>Status:</strong> <span style="color: #f57c00; font-weight: bold;">Dikirim</span></p>
          <p><strong>Tanggal Pengiriman:</strong> ${new Date().toLocaleString('id-ID')}</p>
          <p><strong>Nomor Resi:</strong> ${testOrderData.trackingNumber}</p>
          <p><strong>Kurir:</strong> ${testOrderData.carrier}</p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2e86de; margin-top: 0;">Detail Pesanan</h3>
          <p><strong>Total Pembayaran:</strong> Rp ${testOrderData.total.toLocaleString('id-ID')}</p>
          <p><strong>Alamat Pengiriman:</strong> ${testOrderData.address}</p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2e86de; margin-top: 0;">Item Pesanan</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid #dee2e6;">
                <th style="text-align: left; padding: 8px;">Produk</th>
                <th style="text-align: right; padding: 8px;">Jumlah</th>
                <th style="text-align: right; padding: 8px;">Harga</th>
                <th style="text-align: right; padding: 8px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${testOrderData.orderItems
                .map(
                  (item) => `
                <tr style="border-bottom: 1px solid #dee2e6;">
                  <td style="padding: 8px;">${item.name}</td>
                  <td style="text-align: right; padding: 8px;">${item.quantity}</td>
                  <td style="text-align: right; padding: 8px;">Rp ${item.price.toLocaleString('id-ID')}</td>
                  <td style="text-align: right; padding: 8px;">Rp ${item.total.toLocaleString('id-ID')}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>

        <p>Pesanan Anda akan segera tiba. Mohon siapkan pembayaran jika diperlukan dan pastikan ada yang menerima di alamat pengiriman.</p>
        
        <div style="margin: 20px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders/${testOrderData.id}" 
             style="background-color: #ff9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Lihat Detail Pesanan
          </a>
        </div>

        <p>Terima kasih telah berbelanja di Matrakosala!</p>
        
        <br>
        <p>Terima kasih,<br>Tim Matrakosala</p>
      </div>
    `,
  },
  delivered: {
    subject: 'Pesanan Selesai - Terima Kasih!',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #333;">Pesanan Selesai</h2>
        <p>Halo,</p>
        <p>Pesanan Anda telah berhasil diterima dan selesai. Terima kasih telah berbelanja di Matrakosala!</p>
        
        <div style="background-color: #e8f5e8; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4caf50;">
          <h3 style="color: #388e3c; margin-top: 0;">Status Pesanan</h3>
          <p><strong>Nomor Pesanan:</strong> ${testOrderData.id}</p>
          <p><strong>Status:</strong> <span style="color: #388e3c; font-weight: bold;">Selesai</span></p>
          <p><strong>Tanggal Penyelesaian:</strong> ${new Date().toLocaleString('id-ID')}</p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2e86de; margin-top: 0;">Detail Pesanan</h3>
          <p><strong>Total Pembayaran:</strong> Rp ${testOrderData.total.toLocaleString('id-ID')}</p>
          <p><strong>Alamat Pengiriman:</strong> ${testOrderData.address}</p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2e86de; margin-top: 0;">Item Pesanan</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid #dee2e6;">
                <th style="text-align: left; padding: 8px;">Produk</th>
                <th style="text-align: right; padding: 8px;">Jumlah</th>
                <th style="text-align: right; padding: 8px;">Harga</th>
                <th style="text-align: right; padding: 8px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${testOrderData.orderItems
                .map(
                  (item) => `
                <tr style="border-bottom: 1px solid #dee2e6;">
                  <td style="padding: 8px;">${item.name}</td>
                  <td style="text-align: right; padding: 8px;">${item.quantity}</td>
                  <td style="text-align: right; padding: 8px;">Rp ${item.price.toLocaleString('id-ID')}</td>
                  <td style="text-align: right; padding: 8px;">Rp ${item.total.toLocaleString('id-ID')}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>

        <p>Kami berharap Anda puas dengan produk yang telah dibeli. Jika ada pertanyaan atau feedback, silakan hubungi tim dukungan kami.</p>
        
        <div style="margin: 20px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders/${testOrderData.id}" 
             style="background-color: #4caf50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Lihat Detail Pesanan
          </a>
        </div>

        <p>Terima kasih telah mempercayai Matrakosala untuk kebutuhan bahan bangunan Anda!</p>
        
        <br>
        <p>Terima kasih,<br>Tim Matrakosala</p>
      </div>
    `,
  },
  cancelled: {
    subject: 'Pesanan Dibatalkan',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #333;">Pesanan Dibatalkan</h2>
        <p>Halo,</p>
        <p>Mohon maaf, pesanan Anda telah dibatalkan.</p>
        
        <div style="background-color: #ffebee; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f44336;">
          <h3 style="color: #d32f2f; margin-top: 0;">Status Pesanan</h3>
          <p><strong>Nomor Pesanan:</strong> ${testOrderData.id}</p>
          <p><strong>Status:</strong> <span style="color: #d32f2f; font-weight: bold;">Dibatalkan</span></p>
          <p><strong>Tanggal Pembatalan:</strong> ${new Date().toLocaleString('id-ID')}</p>
          <p><strong>Alasan:</strong> ${testOrderData.cancellationReason}</p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2e86de; margin-top: 0;">Detail Pesanan</h3>
          <p><strong>Total Pembayaran:</strong> Rp ${testOrderData.total.toLocaleString('id-ID')}</p>
          <p><strong>Alamat Pengiriman:</strong> ${testOrderData.address}</p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2e86de; margin-top: 0;">Item Pesanan</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid #dee2e6;">
                <th style="text-align: left; padding: 8px;">Produk</th>
                <th style="text-align: right; padding: 8px;">Jumlah</th>
                <th style="text-align: right; padding: 8px;">Harga</th>
                <th style="text-align: right; padding: 8px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${testOrderData.orderItems
                .map(
                  (item) => `
                <tr style="border-bottom: 1px solid #dee2e6;">
                  <td style="padding: 8px;">${item.name}</td>
                  <td style="text-align: right; padding: 8px;">${item.quantity}</td>
                  <td style="text-align: right; padding: 8px;">Rp ${item.price.toLocaleString('id-ID')}</td>
                  <td style="text-align: right; padding: 8px;">Rp ${item.total.toLocaleString('id-ID')}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>

        <p>Jika Anda memiliki pertanyaan mengenai pembatalan ini, silakan hubungi tim dukungan kami.</p>
        
        <div style="margin: 20px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders/${testOrderData.id}" 
             style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Lihat Detail Pesanan
          </a>
        </div>

        <p>Terima kasih telah berbelanja di Matrakosala.</p>
        
        <br>
        <p>Terima kasih,<br>Tim Matrakosala</p>
      </div>
    `,
  },
}

// Main function
async function testEmail(templateName = 'confirmed') {
  console.log('🧪 Testing Email Notification System')
  console.log('─'.repeat(50))

  // Check environment variables
  if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD) {
    console.error('❌ Environment variables not found!')
    console.log('Please set EMAIL and EMAIL_PASSWORD in .env.local')
    process.exit(1)
  }

  // Get template
  const template = emailTemplates[templateName]
  if (!template) {
    console.error(`❌ Template '${templateName}' not found!`)
    console.log('Available templates:', Object.keys(emailTemplates).join(', '))
    process.exit(1)
  }

  // Create transporter
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  // Test email configuration
  try {
    console.log('📧 Testing email configuration...')
    await transporter.verify()
    console.log('✅ Email configuration is valid')
  } catch (error) {
    console.error('❌ Email configuration failed:', error.message)
    process.exit(1)
  }

  // Send test email
  const testEmail = process.env.TEST_EMAIL || process.env.EMAIL
  const mailOptions = {
    from: `"Test Email Notification" <${process.env.EMAIL}>`,
    to: testEmail,
    subject: `[TEST] ${template.subject}`,
    html: template.template,
  }

  try {
    console.log(`📤 Sending test email (${templateName}) to ${testEmail}...`)
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Test email sent successfully!')
    console.log('📧 Message ID:', info.messageId)
    console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info))
  } catch (error) {
    console.error('❌ Failed to send test email:', error.message)
    process.exit(1)
  }

  console.log('─'.repeat(50))
  console.log('🎉 Email notification test completed!')
}

// Run test
const templateName = process.argv[2] || 'confirmed'
testEmail(templateName).catch(console.error) 