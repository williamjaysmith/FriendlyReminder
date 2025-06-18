-- Create email reminder function that can be called via SQL
-- This is an alternative to Edge Functions for sending email reminders

-- First, create a table to store email jobs
CREATE TABLE public.email_jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Enable RLS on email_jobs table
ALTER TABLE public.email_jobs ENABLE ROW LEVEL SECURITY;

-- Create policy for email jobs (only system can insert)
CREATE POLICY "System can manage email jobs" ON public.email_jobs
    FOR ALL USING (true);

-- Create function to queue reminder emails
CREATE OR REPLACE FUNCTION public.queue_reminder_emails()
RETURNS TABLE(
    queued_count INTEGER,
    birthday_count INTEGER
) AS $$
DECLARE
    reminder_count INTEGER := 0;
    birthday_count INTEGER := 0;
    contact_rec RECORD;
    user_email TEXT;
    email_subject TEXT;
    email_html TEXT;
BEGIN
    -- Queue overdue contact reminder emails
    FOR contact_rec IN 
        SELECT 
            c.id,
            c.user_id,
            c.name,
            c.email as contact_email,
            c.reminder_days,
            p.email as user_email
        FROM contacts c
        JOIN profiles p ON c.user_id = p.id
        WHERE c.email_reminders = true
        AND c.next_reminder <= NOW()
        AND p.email IS NOT NULL
    LOOP
        email_subject := 'Time to reconnect with ' || contact_rec.name;
        email_html := '<div style="max-width: 600px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif;">
            <h2 style="color: #1f2937;">Time to reach out to ' || contact_rec.name || '!</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
                It''s been ' || contact_rec.reminder_days || ' days since your last conversation with ' || contact_rec.name || '. 
                Why not send them a quick message to catch up?
            </p>' ||
            CASE 
                WHEN contact_rec.contact_email IS NOT NULL THEN
                    '<p style="color: #4b5563; font-size: 14px;">📧 Email: ' || contact_rec.contact_email || '</p>'
                ELSE ''
            END ||
            '<div style="margin: 32px 0;">
                <a href="https://yourdomain.com/contacts/' || contact_rec.id || '" 
                   style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    View Contact Details
                </a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
                This reminder was sent because you have email reminders enabled for ' || contact_rec.name || '.
                You can update your preferences in your contact settings.
            </p>
        </div>';
        
        INSERT INTO public.email_jobs (recipient_email, subject, html_content)
        VALUES (contact_rec.user_email, email_subject, email_html);
        
        reminder_count := reminder_count + 1;
    END LOOP;
    
    -- Queue birthday reminder emails
    FOR contact_rec IN 
        SELECT 
            c.id,
            c.user_id,
            c.name,
            c.email as contact_email,
            c.birthday,
            p.email as user_email
        FROM contacts c
        JOIN profiles p ON c.user_id = p.id
        WHERE c.birthday_reminder = true
        AND c.birthday IS NOT NULL
        AND EXTRACT(MONTH FROM c.birthday) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(DAY FROM c.birthday) = EXTRACT(DAY FROM CURRENT_DATE)
        AND p.email IS NOT NULL
    LOOP
        email_subject := '🎉 ' || contact_rec.name || '''s birthday is today!';
        email_html := '<div style="max-width: 600px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif;">
            <h2 style="color: #1f2937;">🎉 It''s ' || contact_rec.name || '''s birthday!</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
                Don''t forget to wish ' || contact_rec.name || ' a happy birthday today! 
                A simple message can really brighten someone''s day.
            </p>' ||
            CASE 
                WHEN contact_rec.contact_email IS NOT NULL THEN
                    '<p style="color: #4b5563; font-size: 14px;">📧 Email: ' || contact_rec.contact_email || '</p>'
                ELSE ''
            END ||
            '<div style="margin: 32px 0;">
                <a href="https://yourdomain.com/contacts/' || contact_rec.id || '" 
                   style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    View Contact Details
                </a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
                This reminder was sent because you have birthday reminders enabled for ' || contact_rec.name || '.
                You can update your preferences in your contact settings.
            </p>
        </div>';
        
        INSERT INTO public.email_jobs (recipient_email, subject, html_content)
        VALUES (contact_rec.user_email, email_subject, email_html);
        
        birthday_count := birthday_count + 1;
    END LOOP;
    
    RETURN QUERY SELECT reminder_count, birthday_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to test email queueing
CREATE OR REPLACE FUNCTION public.test_email_reminders()
RETURNS TABLE(
    message TEXT,
    queued_reminders INTEGER,
    queued_birthdays INTEGER
) AS $$
DECLARE
    result RECORD;
BEGIN
    SELECT * INTO result FROM public.queue_reminder_emails();
    
    RETURN QUERY SELECT 
        'Email reminders queued successfully' as message,
        result.queued_count as queued_reminders,
        result.birthday_count as queued_birthdays;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;