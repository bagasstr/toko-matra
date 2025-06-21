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
