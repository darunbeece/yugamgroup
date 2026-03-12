#!/bin/bash

# Local Email Configuration Test Script
# This script helps verify Gmail SMTP configuration before pushing to GitHub

set -e

echo "════════════════════════════════════════════"
echo "YuGam Group - Email Configuration Test"
echo "════════════════════════════════════════════"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found"
    echo "Please create .env file with:"
    echo "   GMAIL_USER=yugamsale@gmail.com"
    echo "   GMAIL_APP_PASSWORD=your_app_password"
    echo "   SALES_EMAIL=sales@yugamgroup.com"
    exit 1
fi

# Check if npm dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

echo "🔐 Environment Configuration:"
echo "   GMAIL_USER: ${GMAIL_USER:-NOT SET}"
echo "   GMAIL_APP_PASSWORD: ${GMAIL_APP_PASSWORD:+[SET - $(echo -n "$GMAIL_APP_PASSWORD" | wc -c) chars]}"
echo "   SALES_EMAIL: ${SALES_EMAIL:-NOT SET}"
echo "   SMTP_HOST: ${SMTP_HOST:-smtp.gmail.com}"
echo "   SMTP_PORT: ${SMTP_PORT:-465}"
echo ""

# Validate environment variables
if [ -z "$GMAIL_USER" ]; then
    echo "❌ Error: GMAIL_USER is not set in .env"
    exit 1
fi

if [ -z "$GMAIL_APP_PASSWORD" ]; then
    echo "❌ Error: GMAIL_APP_PASSWORD is not set in .env"
    exit 1
fi

if [ -z "$SALES_EMAIL" ]; then
    echo "❌ Error: SALES_EMAIL is not set in .env"
    exit 1
fi

echo "✅ All environment variables are set"
echo ""

# Test SMTP Connection
echo "🔌 Testing SMTP Connection..."
node -e "
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: '${SMTP_HOST:-smtp.gmail.com}',
    port: ${SMTP_PORT:-465},
    secure: true,
    auth: {
        user: '${GMAIL_USER}',
        pass: '${GMAIL_APP_PASSWORD}'
    },
    family: 4
});

transporter.verify((error, success) => {
    if (error) {
        console.log('❌ SMTP Connection Failed:');
        console.log('   Error:', error.message);
        console.log('');
        console.log('Troubleshooting:');
        console.log('   1. Verify GMAIL_APP_PASSWORD is correct (16 chars from Google Account)');
        console.log('   2. Check that 2-Step Verification is enabled on your Google Account');
        console.log('   3. Ensure you are using App Password, not your regular Gmail password');
        console.log('   4. Verify network allows outbound SMTP on port 465');
        process.exit(1);
    } else {
        console.log('✅ SMTP Connection Successful');
        console.log('   Host: ${SMTP_HOST:-smtp.gmail.com}');
        console.log('   Port: ${SMTP_PORT:-465}');
        console.log('   User: ${GMAIL_USER}');
        process.exit(0);
    }
});
"

if [ $? -ne 0 ]; then
    exit 1
fi

echo ""
echo "📧 Testing Email Sending..."

# Send test email
RECIPIENT="${SALES_EMAIL}"

node -e "
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: '${SMTP_HOST:-smtp.gmail.com}',
    port: ${SMTP_PORT:-465},
    secure: true,
    auth: {
        user: '${GMAIL_USER}',
        pass: '${GMAIL_APP_PASSWORD}'
    },
    family: 4,
    connectionTimeout: 10000,
    socketTimeout: 10000
});

const mailOptions = {
    from: '\"YuGam Group Test\" <${GMAIL_USER}>',
    to: '${RECIPIENT}',
    subject: '✅ Local Email Test - ' + new Date().toISOString(),
    html: \`
        <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">
            <h2 style=\"color: #1e40af;\">Local Email Test Successful</h2>
            <p>This email was sent from your local machine via Gmail SMTP.</p>
            <div style=\"background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;\">
                <p><strong>From:</strong> ${GMAIL_USER}</p>
                <p><strong>To:</strong> ${RECIPIENT}</p>
                <p><strong>Time:</strong> \${new Date().toLocaleString()}</p>
            </div>
            <p style=\"color: #10b981; font-weight: bold;\">✅ Gmail SMTP is configured correctly!</p>
        </div>
    \`
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.log('❌ Email Sending Failed:');
        console.log('   Error:', error.message);
        process.exit(1);
    } else {
        console.log('✅ Email Sent Successfully');
        console.log('   Message ID:', info.messageId);
        console.log('   To:', '${RECIPIENT}');
        console.log('');
        console.log('Check your inbox for the test email (it may take a moment to arrive)');
        process.exit(0);
    }
});
" || exit 1

echo ""
echo "════════════════════════════════════════════"
echo "✅ All Tests Passed!"
echo "════════════════════════════════════════════"
echo ""
echo "Next Steps:"
echo "1. ✅ Gmail SMTP is configured correctly"
echo "2. ✅ Check your inbox for the test email"
echo "3. Add GitHub Secrets (GMAIL_USER, GMAIL_APP_PASSWORD, SALES_EMAIL)"
echo "4. Push changes to GitHub"
echo "5. Test GitHub Actions workflow"
echo ""
echo "For GitHub Secrets setup, see: GITHUB_SECRETS_SETUP.md"
echo ""
