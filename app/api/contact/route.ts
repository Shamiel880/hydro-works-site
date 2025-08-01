import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: Request) {
  // Parse JSON data from the request body
  const data = await req.json()
  
  // Destructure form fields sent from frontend
  const { firstName, lastName, email, phone, company, inquiryType, subject, message, budget, timeline } = data

  try {
    // Setup nodemailer transporter using env variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,               // e.g. 'aserve.co.za'
      port: Number(process.env.SMTP_PORT),       // e.g. 2010
      secure: process.env.SMTP_SECURE === 'false',// true if port 465, else false
      auth: {
        user: process.env.SMTP_USER,             // your SMTP user/email
        pass: process.env.SMTP_PASS,             // your SMTP password
      },
    })

    // Define email options
    const mailOptions = {
      from: `"Hydro Works Contact Form" <${process.env.SMTP_USER}>`,
      to: 'info@hydroworks.co.za',
      subject: `New Inquiry: ${subject || 'No Subject'}`,
      html: `
        <h2>Contact Form Submission</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Inquiry Type:</strong> ${inquiryType}</p>
        <p><strong>Budget:</strong> ${budget}</p>
        <p><strong>Timeline:</strong> ${timeline}</p>
        <p><strong>Message:</strong><br>${message}</p>
      `,
    }

    // Send the email
    await transporter.sendMail(mailOptions)

    // Return success response to client
    return NextResponse.json({ success: true, message: 'Email sent successfully.' })
  } catch (error) {
    console.error('Error sending email:', error)
    // Return error response
    return NextResponse.json({ success: false, message: 'Failed to send email.' }, { status: 500 })
  }
}
