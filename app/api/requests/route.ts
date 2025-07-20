import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header (user's session token)
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      )
    }

    // Create Supabase client with user's session
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    })

    const body = await request.json()
    const {
      item_id,
      requester_id,
      requester_email,
      requester_name,
      message,
      preferred_contact,
      owner_email,
      owner_name,
      item_title
    } = body

    // Validate required fields
    if (!item_id || !requester_id || !requester_email || !message || !owner_email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert request into database
    const { data: requestData, error: insertError } = await supabase
      .from('requests')
      .insert([
        {
          item_id,
          requester_id,
          requester_email,
          requester_name,
          message,
          preferred_contact,
          status: 'Pending',
          created_at: new Date().toISOString()
        }
      ])
      .select()

    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json(
        { error: `Database error: ${insertError.message}` },
        { status: 500 }
      )
    }

    // Send email notification to item owner
    try {
      await sendEmailToOwner({
        ownerEmail: owner_email,
        ownerName: owner_name,
        itemTitle: item_title,
        requesterName: requester_name,
        requesterEmail: requester_email,
        message,
        preferredContact: preferred_contact
      })
    } catch (emailError) {
      console.error('Email sending error:', emailError)
      // Don't fail the request if email fails, just log it
    }

    return NextResponse.json({
      success: true,
      data: requestData[0]
    })

  } catch (error) {
    console.error('Request API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function sendEmailToOwner({
  ownerEmail,
  ownerName,
  itemTitle,
  requesterName,
  requesterEmail,
  message,
  preferredContact
}: {
  ownerEmail: string
  ownerName: string
  itemTitle: string
  requesterName: string
  requesterEmail: string
  message: string
  preferredContact: string
}) {
  const emailContent = `
    Hi ${ownerName},

    Someone is interested in your item "${itemTitle}" on ReuseLa!

    Requester Details:
    - Name: ${requesterName}
    - Email: ${requesterEmail}
    - Preferred Contact: ${preferredContact}

    Message:
    ${message}

    Please respond to ${requesterEmail} if you'd like to proceed with the request.

    Best regards,
    The ReuseLa Team
  `

  // Log the email for debugging
  console.log('=== EMAIL TO OWNER ===')
  console.log('To:', ownerEmail)
  console.log('Subject: New request for your item on ReuseLa')
  console.log('Content:', emailContent)
  console.log('======================')

  // Send email using Resend
  if (process.env.RESEND_API_KEY) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'ReuseLa <onboarding@resend.dev>',
        to: [ownerEmail],
        subject: 'New request for your item on ReuseLa',
        text: emailContent,
      })

      if (error) {
        console.error('Resend email error:', error)
        throw error
      }

      console.log('Email sent successfully:', data)
      return { success: true, data }
    } catch (resendError) {
      console.error('Failed to send email via Resend:', resendError)
      throw resendError
    }
  } else {
    console.log('RESEND_API_KEY not configured - email not sent')
    // In development, you might want to just log the email
    return { success: true, message: 'Email logged (RESEND_API_KEY not configured)' }
  }
} 