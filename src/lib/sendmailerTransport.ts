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
