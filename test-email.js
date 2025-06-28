const { sendReminderEmail } = require('./src/lib/email.ts');

async function testEmail() {
  try {
    console.log('Testing email reminder functionality...');
    
    const result = await sendReminderEmail({
      recipientEmail: 'your-email@example.com', // Replace with your email
      recipientName: 'Test User',
      contactName: 'John Doe',
      lastTalked: '2024-01-15',
      reminderDays: 30,
      contactId: 'test-contact-id'
    });
    
    console.log('Email sent successfully!', result);
  } catch (error) {
    console.error('Email test failed:', error);
  }
}

testEmail();