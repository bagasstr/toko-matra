import nodemailer from 'nodemailer'

export const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
})

export const sendOTPEmail = async (toEmail: string, otpCode: Number) => {
  const mailOptions = {
    from: `"Notifikasi" <${process.env.EMAIL}>`,
    to: toEmail,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otpCode}. It will expire in 5 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #333;">Your Verification Code</h2>
        <p>Hello,</p>
        <p>Use the following One-Time Password (OTP) to complete your login process. This code will expire in 5 minutes.</p>
        <div style="font-size: 24px; font-weight: bold; margin: 20px 0; color: #2e86de;">
          ${otpCode}
        </div>
        <p>If you did not request this code, please ignore this email.</p>
        <br>
        <p>Thank you,<br>Your App Team</p>
      </div>
    `,
  }

  try {
    await transport.sendMail(mailOptions)
    console.log('OTP email sent successfully')
  } catch (error) {
    console.error('Failed to send OTP email:', error)
  }
}

export const sendPaymentWaitingEmail = async (
  toEmail: string,
  orderData: any
) => {
  const mailOptions = {
    from: `"Notifikasi Pembayaran" <${process.env.EMAIL}>`,
    to: toEmail,
    subject: 'Menunggu Pembayaran',
    text: `Pesanan #${orderData.id} menunggu pembayaran Anda.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #333;">Menunggu Pembayaran</h2>
        <p>Halo,</p>
        <p>Terima kasih telah berbelanja di toko kami. Pesanan Anda sedang menunggu pembayaran.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2e86de; margin-top: 0;">Detail Pesanan</h3>
          <p><strong>Nomor Pesanan:</strong> ${orderData.id}</p>
          <p><strong>Total Pembayaran:</strong> Rp ${orderData.total.toLocaleString(
            'id-ID'
          )}</p>
          <p><strong>Metode Pembayaran:</strong> ${orderData.paymentMethod}</p>
          <p><strong>Batas Waktu Pembayaran:</strong> ${new Date(
            orderData.paymentDeadline
          ).toLocaleString('id-ID')}</p>
          <p><strong>Virtual Account:</strong> ${orderData.vaNumber}</p>
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
              ${orderData.orderItems
                .map(
                  (item: any) => `
                <tr style="border-bottom: 1px solid #dee2e6;">
                  <td style="padding: 8px;">${item.name}</td>
                  <td style="text-align: right; padding: 8px;">${
                    item.quantity
                  }</td>
                  <td style="text-align: right; padding: 8px;">Rp ${item.price.toLocaleString(
                    'id-ID'
                  )}</td>
                  <td style="text-align: right; padding: 8px;">Rp ${item.total.toLocaleString(
                    'id-ID'
                  )}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>

        <p>Silakan lakukan pembayaran sesuai dengan metode yang dipilih sebelum batas waktu yang ditentukan.</p>
        
        <div style="margin: 20px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderData.id}" 
             style="background-color: #2e86de; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Lihat Detail Pesanan
          </a>
        </div>

        <p>Jika Anda memiliki pertanyaan, silakan hubungi tim dukungan kami.</p>
        
        <br>
        <p>Terima kasih,<br>Tim Kami</p>
      </div>
    `,
  }

  try {
    await transport.sendMail(mailOptions)
    console.log('Payment waiting email sent successfully')
  } catch (error) {
    console.error('Failed to send payment waiting email:', error)
  }
}

export const sendPaymentSuccessEmail = async (
  toEmail: string,
  orderData: any
) => {
  const mailOptions = {
    from: `"Notifikasi Pembayaran" <${process.env.EMAIL}>`,
    to: toEmail,
    subject: 'Pembayaran Berhasil',
    text: `Pembayaran untuk pesanan #${orderData.id} telah berhasil.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #333;">Pembayaran Berhasil</h2>
        <p>Halo,</p>
        <p>Pembayaran untuk pesanan Anda telah berhasil diterima.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2e86de; margin-top: 0;">Detail Pesanan</h3>
          <p><strong>Nomor Pesanan:</strong> ${orderData.id}</p>
          <p><strong>Total Pembayaran:</strong> Rp ${orderData.total.toLocaleString(
            'id-ID'
          )}</p>
          <p><strong>Metode Pembayaran:</strong> ${orderData.paymentMethod}</p>
          <p><strong>Tanggal Pembayaran:</strong> ${new Date(
            orderData.paymentDate
          ).toLocaleString('id-ID')}</p>
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
              ${orderData.orderItems
                .map(
                  (item: any) => `
                <tr style="border-bottom: 1px solid #dee2e6;">
                  <td style="padding: 8px;">${item.name}</td>
                  <td style="text-align: right; padding: 8px;">${
                    item.quantity
                  }</td>
                  <td style="text-align: right; padding: 8px;">Rp ${item.price.toLocaleString(
                    'id-ID'
                  )}</td>
                  <td style="text-align: right; padding: 8px;">Rp ${item.total.toLocaleString(
                    'id-ID'
                  )}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>

        <p>Pesanan Anda akan segera diproses. Kami akan mengirimkan notifikasi ketika pesanan Anda dikirim.</p>
        
        <div style="margin: 20px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderData.id}" 
             style="background-color: #2e86de; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Lihat Detail Pesanan
          </a>
        </div>

        <p>Terima kasih telah berbelanja di toko kami.</p>
        
        <br>
        <p>Terima kasih,<br>Tim Kami</p>
      </div>
    `,
  }

  try {
    await transport.sendMail(mailOptions)
    console.log('Payment success email sent successfully')
  } catch (error) {
    console.error('Failed to send payment success email:', error)
  }
}

// Order Status Notification Functions
export const sendOrderConfirmedEmail = async (
  toEmail: string,
  orderData: any,
  customMessage?: string
) => {
  const mailOptions = {
    from: `"Notifikasi Status Pesanan" <${process.env.EMAIL}>`,
    to: toEmail,
    subject: 'Pesanan Dikonfirmasi - Sedang Diproses',
    text: `Pesanan #${orderData.id} telah dikonfirmasi dan sedang diproses.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #333;">Pesanan Dikonfirmasi</h2>
        <p>Halo,</p>
        <p>${
          customMessage ||
          'Pesanan Anda telah dikonfirmasi dan sedang diproses oleh tim kami.'
        }</p>
        
        <div style="background-color: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196f3;">
          <h3 style="color: #1976d2; margin-top: 0;">Status Pesanan</h3>
          <p><strong>Nomor Pesanan:</strong> ${orderData.id}</p>
          <p><strong>Status:</strong> <span style="color: #1976d2; font-weight: bold;">Diproses</span></p>
          <p><strong>Tanggal Konfirmasi:</strong> ${new Date().toLocaleString(
            'id-ID'
          )}</p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2e86de; margin-top: 0;">Detail Pesanan</h3>
          <p><strong>Total Pembayaran:</strong> Rp ${orderData.total.toLocaleString(
            'id-ID'
          )}</p>
          <p><strong>Alamat Pengiriman:</strong> ${orderData.address}</p>
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
              ${orderData.orderItems
                .map(
                  (item: any) => `
                <tr style="border-bottom: 1px solid #dee2e6;">
                  <td style="padding: 8px;">${item.name}</td>
                  <td style="text-align: right; padding: 8px;">${
                    item.quantity
                  }</td>
                  <td style="text-align: right; padding: 8px;">Rp ${item.price.toLocaleString(
                    'id-ID'
                  )}</td>
                  <td style="text-align: right; padding: 8px;">Rp ${item.total.toLocaleString(
                    'id-ID'
                  )}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>

        <p>Tim kami akan segera memproses pesanan Anda dan mengirimkan notifikasi ketika pesanan dikirim.</p>
        
        <div style="margin: 20px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderData.id}" 
             style="background-color: #2196f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Lihat Detail Pesanan
          </a>
        </div>

        <p>Terima kasih telah berbelanja di Matrakosala!</p>
        
        <br>
        <p>Terima kasih,<br>Tim Matrakosala</p>
      </div>
    `,
  }

  try {
    await transport.sendMail(mailOptions)
    console.log('Order confirmed email sent successfully')
  } catch (error) {
    console.error('Failed to send order confirmed email:', error)
  }
}

export const sendOrderShippedEmail = async (
  toEmail: string,
  orderData: any
) => {
  const mailOptions = {
    from: `"Notifikasi Status Pesanan" <${process.env.EMAIL}>`,
    to: toEmail,
    subject: 'Pesanan Dikirim - Dalam Perjalanan',
    text: `Pesanan #${orderData.id} telah dikirim dan sedang dalam perjalanan.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #333;">Pesanan Dikirim</h2>
        <p>Halo,</p>
        <p>Pesanan Anda telah dikirim dan sedang dalam perjalanan ke alamat Anda.</p>
        
        <div style="background-color: #fff3e0; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ff9800;">
          <h3 style="color: #f57c00; margin-top: 0;">Status Pengiriman</h3>
          <p><strong>Nomor Pesanan:</strong> ${orderData.id}</p>
          <p><strong>Status:</strong> <span style="color: #f57c00; font-weight: bold;">Dikirim</span></p>
          <p><strong>Tanggal Pengiriman:</strong> ${new Date().toLocaleString(
            'id-ID'
          )}</p>
          ${
            orderData.trackingNumber
              ? `<p><strong>Nomor Resi:</strong> ${orderData.trackingNumber}</p>`
              : ''
          }
          ${
            orderData.carrier
              ? `<p><strong>Kurir:</strong> ${orderData.carrier}</p>`
              : ''
          }
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2e86de; margin-top: 0;">Detail Pesanan</h3>
          <p><strong>Total Pembayaran:</strong> Rp ${orderData.total.toLocaleString(
            'id-ID'
          )}</p>
          <p><strong>Alamat Pengiriman:</strong> ${orderData.address}</p>
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
              ${orderData.orderItems
                .map(
                  (item: any) => `
                <tr style="border-bottom: 1px solid #dee2e6;">
                  <td style="padding: 8px;">${item.name}</td>
                  <td style="text-align: right; padding: 8px;">${
                    item.quantity
                  }</td>
                  <td style="text-align: right; padding: 8px;">Rp ${item.price.toLocaleString(
                    'id-ID'
                  )}</td>
                  <td style="text-align: right; padding: 8px;">Rp ${item.total.toLocaleString(
                    'id-ID'
                  )}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>

        <p>Pesanan Anda akan segera tiba. Mohon siapkan pembayaran jika diperlukan dan pastikan ada yang menerima di alamat pengiriman.</p>
        
        <div style="margin: 20px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderData.id}" 
             style="background-color: #ff9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Lihat Detail Pesanan
          </a>
        </div>

        <p>Terima kasih telah berbelanja di Matrakosala!</p>
        
        <br>
        <p>Terima kasih,<br>Tim Matrakosala</p>
      </div>
    `,
  }

  try {
    await transport.sendMail(mailOptions)
    console.log('Order shipped email sent successfully')
  } catch (error) {
    console.error('Failed to send order shipped email:', error)
  }
}

export const sendOrderDeliveredEmail = async (
  toEmail: string,
  orderData: any
) => {
  const mailOptions = {
    from: `"Notifikasi Status Pesanan" <${process.env.EMAIL}>`,
    to: toEmail,
    subject: 'Pesanan Selesai - Terima Kasih!',
    text: `Pesanan #${orderData.id} telah selesai. Terima kasih telah berbelanja!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #333;">Pesanan Selesai</h2>
        <p>Halo,</p>
        <p>Pesanan Anda telah berhasil diterima dan selesai. Terima kasih telah berbelanja di Matrakosala!</p>
        
        <div style="background-color: #e8f5e8; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4caf50;">
          <h3 style="color: #388e3c; margin-top: 0;">Status Pesanan</h3>
          <p><strong>Nomor Pesanan:</strong> ${orderData.id}</p>
          <p><strong>Status:</strong> <span style="color: #388e3c; font-weight: bold;">Selesai</span></p>
          <p><strong>Tanggal Penyelesaian:</strong> ${new Date().toLocaleString(
            'id-ID'
          )}</p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2e86de; margin-top: 0;">Detail Pesanan</h3>
          <p><strong>Total Pembayaran:</strong> Rp ${orderData.total.toLocaleString(
            'id-ID'
          )}</p>
          <p><strong>Alamat Pengiriman:</strong> ${orderData.address}</p>
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
              ${orderData.orderItems
                .map(
                  (item: any) => `
                <tr style="border-bottom: 1px solid #dee2e6;">
                  <td style="padding: 8px;">${item.name}</td>
                  <td style="text-align: right; padding: 8px;">${
                    item.quantity
                  }</td>
                  <td style="text-align: right; padding: 8px;">Rp ${item.price.toLocaleString(
                    'id-ID'
                  )}</td>
                  <td style="text-align: right; padding: 8px;">Rp ${item.total.toLocaleString(
                    'id-ID'
                  )}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>

        <p>Kami berharap Anda puas dengan produk yang telah dibeli. Jika ada pertanyaan atau feedback, silakan hubungi tim dukungan kami.</p>
        
        <div style="margin: 20px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderData.id}" 
             style="background-color: #4caf50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Lihat Detail Pesanan
          </a>
        </div>

        <p>Terima kasih telah mempercayai Matrakosala untuk kebutuhan bahan bangunan Anda!</p>
        
        <br>
        <p>Terima kasih,<br>Tim Matrakosala</p>
      </div>
    `,
  }

  try {
    await transport.sendMail(mailOptions)
    console.log('Order delivered email sent successfully')
  } catch (error) {
    console.error('Failed to send order delivered email:', error)
  }
}

export const sendOrderCancelledEmail = async (
  toEmail: string,
  orderData: any
) => {
  const mailOptions = {
    from: `"Notifikasi Status Pesanan" <${process.env.EMAIL}>`,
    to: toEmail,
    subject: 'Pesanan Dibatalkan',
    text: `Pesanan #${orderData.id} telah dibatalkan.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #333;">Pesanan Dibatalkan</h2>
        <p>Halo,</p>
        <p>Mohon maaf, pesanan Anda telah dibatalkan.</p>
        
        <div style="background-color: #ffebee; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f44336;">
          <h3 style="color: #d32f2f; margin-top: 0;">Status Pesanan</h3>
          <p><strong>Nomor Pesanan:</strong> ${orderData.id}</p>
          <p><strong>Status:</strong> <span style="color: #d32f2f; font-weight: bold;">Dibatalkan</span></p>
          <p><strong>Tanggal Pembatalan:</strong> ${new Date().toLocaleString(
            'id-ID'
          )}</p>
          ${
            orderData.cancellationReason
              ? `<p><strong>Alasan:</strong> ${orderData.cancellationReason}</p>`
              : ''
          }
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2e86de; margin-top: 0;">Detail Pesanan</h3>
          <p><strong>Total Pembayaran:</strong> Rp ${orderData.total.toLocaleString(
            'id-ID'
          )}</p>
          <p><strong>Alamat Pengiriman:</strong> ${orderData.address}</p>
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
              ${orderData.orderItems
                .map(
                  (item: any) => `
                <tr style="border-bottom: 1px solid #dee2e6;">
                  <td style="padding: 8px;">${item.name}</td>
                  <td style="text-align: right; padding: 8px;">${
                    item.quantity
                  }</td>
                  <td style="text-align: right; padding: 8px;">Rp ${item.price.toLocaleString(
                    'id-ID'
                  )}</td>
                  <td style="text-align: right; padding: 8px;">Rp ${item.total.toLocaleString(
                    'id-ID'
                  )}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>

        <p>Jika Anda memiliki pertanyaan mengenai pembatalan ini, silakan hubungi tim dukungan kami.</p>
        
        <div style="margin: 20px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderData.id}" 
             style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Lihat Detail Pesanan
          </a>
        </div>

        <p>Terima kasih telah berbelanja di Matrakosala.</p>
        
        <br>
        <p>Terima kasih,<br>Tim Matrakosala</p>
      </div>
    `,
  }

  try {
    await transport.sendMail(mailOptions)
    console.log('Order cancelled email sent successfully')
  } catch (error) {
    console.error('Failed to send order cancelled email:', error)
  }
}
