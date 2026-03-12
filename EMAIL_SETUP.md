# YuGam Group Email Setup - Gmail SMTP

This document describes the complete email configuration for YuGam Group, including local development and GitHub Actions automation.

## 🎯 Overview

The email system uses **Gmail SMTP** via **Nodemailer** for sending transactional and automated emails:

- **Contact Form Emails**: Sent when users submit the contact form
- **Confirmation Emails**: Sent to users confirming receipt of their inquiry
- **Daily Analytics**: Scheduled emails sent to sales team (9 AM UTC)

## 📧 Email Configuration

### SMTP Settings

```
Host: smtp.gmail.com
Port: 465
Security: SSL/TLS
User: yugamsale@gmail.com
Password: [Gmail App Password - stored in .env or GitHub Secrets]
Family: IPv4
```

### Sender Information

- **From Email**: `yugamsale@gmail.com`
- **From Name**: YuGam Group
- **Reply-To**: User's email (for contact form submissions)
- **To**: `sales@yugamgroup.com` (sales team)

## 🚀 Quick Start

### Step 1: Get Gmail App Password

1. Visit: https://myaccount.google.com
2. Go to **Security** → **App passwords**
3. Select "Mail" and "Windows Computer"
4. Copy the 16-character password

### Step 2: Configure Local Environment

```bash
# Edit .env file with your credentials
GMAIL_USER=yugamsale@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
SALES_EMAIL=sales@yugamgroup.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
```

### Step 3: Test Locally

```bash
# Run the test script
bash .github/scripts/test-local-email.sh
```

### Step 4: Set GitHub Secrets

1. Go to Repository → **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:
   - `GMAIL_USER`: `yugamsale@gmail.com`
   - `GMAIL_APP_PASSWORD`: `[your 16-char app password]`
   - `SALES_EMAIL`: `sales@yugamgroup.com`

### Step 5: Test GitHub Actions

1. Go to **Actions** tab → **Send Email via Gmail SMTP**
2. Click **Run workflow** → Select email type: `test`
3. Verify email is received

## 📁 Files Created

- `.github/workflows/send-email.yml` - Main email workflow (daily + manual trigger)
- `.github/workflows/test-email-config.yml` - Configuration testing workflow
- `.github/scripts/send-email.js` - Email sending script
- `.github/scripts/test-local-email.sh` - Local testing script
- `GITHUB_SECRETS_SETUP.md` - Detailed setup guide
- Updated `server.js` - Now uses Gmail SMTP via Nodemailer

## 🔒 Security

✅ **Do's:**
- Use Gmail App Passwords (not main password)
- Store credentials in GitHub Secrets
- Keep `.env` in `.gitignore`

❌ **Don'ts:**
- Commit `.env` to Git
- Share GMAIL_APP_PASSWORD
- Use main Gmail password

## 🐛 Troubleshooting

1. **Invalid credentials**: Verify app password is 16 characters from Google Account
2. **Connection timeout**: Check firewall allows port 465 outbound
3. **Email not received**: Check Gmail account limits and spam folder
4. **GitHub Actions failing**: Verify all GitHub Secrets are set correctly

See `GITHUB_SECRETS_SETUP.md` for detailed troubleshooting.
