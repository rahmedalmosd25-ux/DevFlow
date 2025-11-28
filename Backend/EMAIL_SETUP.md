# Email Configuration Setup

This application uses Nodemailer to send ticket confirmation emails to users after they book an event ticket.

## Required Environment Variables

Add the following environment variables to your `.env` file in the `Backend` directory:

```env
# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Gmail Setup (Recommended for Development)

1. **Enable 2-Step Verification** on your Google account
2. **Generate an App Password**:
   - Go to your Google Account settings
   - Navigate to Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this app password as `SMTP_PASS`

## Other Email Providers

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

## Email Features

When a user books a ticket, they will receive:
- **HTML Email** with event details and QR code
- **PDF Attachment** containing the ticket with QR code
- **Plain Text Version** for email clients that don't support HTML

## Testing

The email service will gracefully handle missing configuration. If SMTP credentials are not configured, the application will:
- Log a warning message
- Continue processing the ticket booking
- Not send the email (but ticket booking will still succeed)

This ensures the application works even without email configuration during development.

