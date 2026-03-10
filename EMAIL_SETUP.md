# YuGam Group - Email Configuration Guide

## Overview
The contact form on your website now sends emails through Gmail's SMTP server. When a user submits the enquiry form, their message is sent to `sales@yugamgroup.com`, and they receive a confirmation email.

## Setup & Configuration

### Environment Variables
Email credentials are stored in `.env` file (not committed to git for security):

```
GMAIL_USER=yugamsale@gmail.com
GMAIL_PASSWORD=BlueSt0ne0123!@#
SALES_EMAIL=sales@yugamgroup.com
PORT=3000
NODE_ENV=development
```

### Important Security Notes
- ⚠️ **The `.env` file is in `.gitignore`** - it won't be committed to the repository
- ✅ Sensitive credentials are kept out of version control
- 🔒 Never share or hardcode credentials in code

## Running the Server

### Start the Email-Enabled Server

```bash
npm start
# or
npm run dev
```

The server will run on `http://localhost:3000`

### Email Features
1. **Contact Form Submission** → Sends to `sales@yugamgroup.com`
2. **Auto Confirmation Email** → Sent to the user's email address
3. **HTML Email Templates** → Professional email formatting
4. **Error Handling** → Graceful error messages to users

## API Endpoint

### POST `/api/contact`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Tech Corp",
  "subject": "ai-services",
  "message": "We are interested in your AI services...",
  "consent": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Thank you! Your message has been sent successfully."
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "message": "Error description"
}
```

## Gmail SMTP Configuration

### App Passwords (If Using 2FA)
If the Gmail account has 2-factor authentication enabled:
1. Go to https://myaccount.google.com/security
2. Enable "App passwords"
3. Generate a 16-character app password
4. Use that password instead of your Gmail password in `.env`

### Without 2FA
If 2FA is disabled, you may need to:
1. Enable "Less secure apps" access (not recommended for production)
2. Or use an App Password (recommended)

## Testing

To test the email functionality:

1. Start the server: `npm start`
2. Open `http://localhost:3000/contact.html`
3. Fill out the form and submit
4. Check your emails - you should receive:
   - Confirmation email at your submitted email address
   - Sales team notification at `sales@yugamgroup.com`

## Deployed Environment

When deploying to production, ensure:
1. `.env` file is properly set up on the server
2. Gmail credentials are secure
3. Use environment variables from your hosting platform (not `.env` file)
4. Consider using app-specific passwords for additional security

## Troubleshooting

### "Gmail connection error"
- Check credentials in `.env`
- Verify app-specific password if 2FA is enabled
- Check that "Less secure apps" is enabled (if no 2FA)

### "Email not received"
- Check spam folder
- Verify reply-to address is correct
- Check server logs for errors

### Server won't start
```bash
npm install  # Reinstall dependencies
npm start    # Try again
```

## Security Best Practices

✅ **Do's:**
- Use app-specific passwords
- Keep `.env` file in `.gitignore`
- Use environment variables in production
- Validate and sanitize all form inputs
- Use HTTPS in production

❌ **Don'ts:**
- Don't commit `.env` to version control
- Don't use plain passwords for Gmail accounts
- Don't disable SSL/TLS in production
- Don't expose credentials in logs

## Next Steps

1. Test the contact form locally
2. Configure proper email verification (SPF, DKIM, DMARC)
3. Set up production environment with secure credential management
4. Monitor email delivery and error logs
5. Consider adding email rate limiting for security

## Support

For issues or questions about email setup, check the server logs or contact your hosting provider's support team.
