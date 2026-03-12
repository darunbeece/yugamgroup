# GitHub Secrets Setup - Gmail SMTP Configuration

This guide explains how to configure GitHub Secrets for email sending via Gmail SMTP with GitHub Actions.

## Prerequisites

- Gmail account (yugamsale@gmail.com)
- GitHub repository access
- Gmail App Password (not your regular Gmail password)

## Step 1: Generate Gmail App Password

1. Go to your Google Account: https://myaccount.google.com
2. Click **Security** in the left navigation
3. Enable **2-Step Verification** (if not already enabled)
4. Return to Security settings and find **App passwords**
5. Select "Mail" and "Windows Computer" (or your device)
6. Google will generate a 16-character password
7. **Copy this password** - you'll need it for GitHub Secrets

## Step 2: Add GitHub Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add these secrets:

### Secret 1: GMAIL_USER
- **Name:** `GMAIL_USER`
- **Value:** `yugamsale@gmail.com`

### Secret 2: GMAIL_APP_PASSWORD
- **Name:** `GMAIL_APP_PASSWORD`
- **Value:** `[16-character app password from Step 1]`

### Secret 3: SALES_EMAIL
- **Name:** `SALES_EMAIL`
- **Value:** `sales@yugamgroup.com`

## Step 3: Verify Configuration

### Option A: Manual Trigger (Recommended for Testing)

1. Go to **Actions** tab in your repository
2. Select **"Send Email via Gmail SMTP"** workflow
3. Click **Run workflow**
4. Select email type: `test`
5. Click **Run workflow**
6. Wait for the job to complete
7. Check your inbox for the test email

### Option B: View Scheduled Runs

The workflow is configured to run daily at 9 AM UTC. You can:
- View runs in the **Actions** tab
- Check logs for any errors
- Modify the schedule in `.github/workflows/send-email.yml` if needed

## Step 4: Email Sending from Your Application

Your Express server now uses Gmail SMTP. The contact form will automatically send emails to `sales@yugamgroup.com` when someone submits the form.

### Configuration in server.js:
```javascript
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'yugamsale@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD
    }
});
```

### Environment Variables (.env):
```
GMAIL_USER=yugamsale@gmail.com
GMAIL_APP_PASSWORD=[your app password]
SALES_EMAIL=sales@yugamgroup.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
```

## Troubleshooting

### Issue: "Invalid login credentials"
- **Solution:** Verify your Gmail App Password is correct (16 characters, generated from Google Account settings)
- Check you're using an App Password, not your regular Gmail password

### Issue: "Connection timeout"
- **Solution:** Gmail SMTP requires port 465 with SSL enabled
- Check your firewall/network allows outbound SMTP connections

### Issue: GitHub Secrets not found
- **Solution:** Ensure secrets are named exactly as specified:
  - `GMAIL_USER`
  - `GMAIL_APP_PASSWORD`
  - `SALES_EMAIL`

### Issue: Email not received
1. Check GitHub Actions logs for error messages
2. Verify the recipient email address is correct
3. Check spam/junk folder
4. Test with the manual workflow trigger first

## Workflow Files

- **Workflow Definition:** `.github/workflows/send-email.yml`
- **Email Script:** `.github/scripts/send-email.js`

## Manual Email Test

To test email sending from your local machine:

```bash
# Install dependencies
npm install

# Create/update .env with your Gmail credentials
echo "GMAIL_USER=yugamsale@gmail.com" >> .env
echo "GMAIL_APP_PASSWORD=[your app password]" >> .env
echo "SALES_EMAIL=sales@yugamgroup.com" >> .env

# Run the test script
node .github/scripts/send-email.js
```

## Security Best Practices

✅ **Do's:**
- Store Gmail App Password in GitHub Secrets (never in code)
- Use App Passwords, not your main Gmail password
- Rotate App Passwords periodically
- Review GitHub Actions logs for suspicious activity

❌ **Don'ts:**
- Don't commit `.env` file with credentials to Git
- Don't share GMAIL_APP_PASSWORD with anyone
- Don't use your main Gmail password in applications
- Don't log sensitive credentials

## Next Steps

1. ✅ Add GitHub Secrets
2. ✅ Test the workflow manually
3. ✅ Monitor scheduled runs
4. ✅ Update your contact form from address if needed

## Support

For issues with:
- **Gmail:** https://support.google.com/accounts/answer/185833
- **GitHub Actions:** https://docs.github.com/en/actions
- **Nodemailer:** https://nodemailer.com/smtp/
