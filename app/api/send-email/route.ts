import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { to, subject, text } = await request.json()

    if (!to || !subject || !text) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, text' },
        { status: 400 }
      )
    }

    // Send email using Resend
    if (process.env.RESEND_API_KEY) {
      const { data, error } = await resend.emails.send({
        from: 'ReuseLa <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        text: text,
      })

      if (error) {
        console.error('Resend email error:', error)
        return NextResponse.json(
          { error: `Email sending failed: ${error.message}` },
          { status: 500 }
        )
      }

      console.log('Email sent successfully:', data)
      return NextResponse.json({ success: true, data })
    } else {
      console.log('RESEND_API_KEY not configured - email not sent')
      return NextResponse.json(
        { success: true, message: 'Email logged (RESEND_API_KEY not configured)' }
      )
    }
  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 