import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Contact {
  id: string
  user_id: string
  name: string
  email?: string
  birthday?: string
  next_reminder?: string
  email_reminders: boolean
  birthday_reminder: boolean
  reminder_days: number
}

interface Profile {
  id: string
  email?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    // Get contacts that need reminders today
    const { data: overdueContacts, error: contactsError } = await supabaseClient
      .from('contacts')
      .select(`
        id,
        user_id,
        name,
        email,
        birthday,
        next_reminder,
        email_reminders,
        birthday_reminder,
        reminder_days,
        profiles!inner(id, email)
      `)
      .eq('email_reminders', true)
      .lte('next_reminder', today.toISOString())

    if (contactsError) {
      console.error('Error fetching overdue contacts:', contactsError)
      throw contactsError
    }

    // Get contacts with birthdays today
    const { data: birthdayContacts, error: birthdayError } = await supabaseClient
      .from('contacts')
      .select(`
        id,
        user_id,
        name,
        email,
        birthday,
        next_reminder,
        email_reminders,
        birthday_reminder,
        reminder_days,
        profiles!inner(id, email)
      `)
      .eq('birthday_reminder', true)
      .like('birthday', `%-${todayStr.slice(5)}`) // Match MM-DD part of birthday

    if (birthdayError) {
      console.error('Error fetching birthday contacts:', birthdayError)
      throw birthdayError
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not set')
    }

    let emailsSent = 0

    // Send overdue reminder emails
    for (const contact of overdueContacts || []) {
      const userEmail = contact.profiles.email
      if (!userEmail) continue

      const emailData = {
        from: 'Friendly Reminder <noreply@yourdomain.com>',
        to: userEmail,
        subject: `Time to reconnect with ${contact.name}`,
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif;">
            <h2 style="color: #1f2937;">Time to reach out to ${contact.name}!</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              It's been ${contact.reminder_days} days since your last conversation with ${contact.name}. 
              Why not send them a quick message to catch up?
            </p>
            ${contact.email ? `
              <p style="color: #4b5563; font-size: 14px;">
                📧 Email: ${contact.email}
              </p>
            ` : ''}
            <div style="margin: 32px 0;">
              <a href="https://yourdomain.com/contacts/${contact.id}" 
                 style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Contact Details
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              This reminder was sent because you have email reminders enabled for ${contact.name}.
              You can update your preferences in your contact settings.
            </p>
          </div>
        `,
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      })

      if (response.ok) {
        emailsSent++
        console.log(`Sent reminder email for ${contact.name} to ${userEmail}`)
      } else {
        console.error(`Failed to send email for ${contact.name}:`, await response.text())
      }
    }

    // Send birthday reminder emails
    for (const contact of birthdayContacts || []) {
      const userEmail = contact.profiles.email
      if (!userEmail) continue

      const emailData = {
        from: 'Friendly Reminder <noreply@yourdomain.com>',
        to: userEmail,
        subject: `🎉 ${contact.name}'s birthday is today!`,
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif;">
            <h2 style="color: #1f2937;">🎉 It's ${contact.name}'s birthday!</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              Don't forget to wish ${contact.name} a happy birthday today! 
              A simple message can really brighten someone's day.
            </p>
            ${contact.email ? `
              <p style="color: #4b5563; font-size: 14px;">
                📧 Email: ${contact.email}
              </p>
            ` : ''}
            <div style="margin: 32px 0;">
              <a href="https://yourdomain.com/contacts/${contact.id}" 
                 style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Contact Details
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              This reminder was sent because you have birthday reminders enabled for ${contact.name}.
              You can update your preferences in your contact settings.
            </p>
          </div>
        `,
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      })

      if (response.ok) {
        emailsSent++
        console.log(`Sent birthday email for ${contact.name} to ${userEmail}`)
      } else {
        console.error(`Failed to send birthday email for ${contact.name}:`, await response.text())
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent,
        overdueContacts: overdueContacts?.length || 0,
        birthdayContacts: birthdayContacts?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in send-reminders function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})