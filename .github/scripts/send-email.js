const nodemailer = require('nodemailer');

// Configuration from environment variables
const gmailUser = process.env.GMAIL_USER || 'yugamsale@gmail.com';
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
const salesEmail = process.env.SALES_EMAIL || 'sales@yugamgroup.com';
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = parseInt(process.env.SMTP_PORT || '465');
const emailType = process.env.EMAIL_TYPE || 'test';
const recipientOverride = process.env.RECIPIENT;

if (!gmailAppPassword) {
    console.error('❌ Error: GMAIL_APP_PASSWORD is not set in GitHub Secrets');
    process.exit(1);
}

// Create transporter
const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: true,
    auth: {
        user: gmailUser,
        pass: gmailAppPassword
    },
    family: 4
});

async function sendTestEmail() {
    const recipient = recipientOverride || salesEmail;
    const mailOptions = {
        from: `"YuGam Group Automation" <${gmailUser}>`,
        to: recipient,
        subject: `✅ Email Test - ${new Date().toISOString()}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1e40af;">Email Service Test Successful</h2>
                <p>This is a test email sent via GitHub Actions using Gmail SMTP.</p>

                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3>Configuration Details:</h3>
                    <ul>
                        <li><strong>From:</strong> ${gmailUser}</li>
                        <li><strong>To:</strong> ${recipient}</li>
                        <li><strong>SMTP Host:</strong> ${smtpHost}</li>
                        <li><strong>SMTP Port:</strong> ${smtpPort}</li>
                        <li><strong>Timestamp:</strong> ${new Date().toLocaleString()}</li>
                    </ul>
                </div>

                <p style="color: #10b981; font-weight: bold;">✅ Gmail SMTP integration is working correctly!</p>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #475569;">
                    <p>Sent from GitHub Actions - YuGam Group Automation</p>
                </div>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
}

async function sendAnalyticsEmail() {
    const recipient = recipientOverride || salesEmail;
    const mailOptions = {
        from: `"YuGam Group Analytics" <${gmailUser}>`,
        to: recipient,
        subject: `YugamGroup Daily Analytics Report - ${new Date().toLocaleDateString()}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px; border-radius: 8px;">
                <h2 style="color: #1e40af; margin-top: 0;">Daily Analytics Report</h2>
                <p style="color: #475569;">Report Date: <strong>${new Date().toLocaleDateString()}</strong></p>

                <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
                    <h3 style="color: #1e40af; margin-top: 0;">Email Service Status</h3>
                    <p><strong>Status:</strong> ✅ Gmail SMTP is configured and working</p>
                    <p><strong>From:</strong> ${gmailUser}</p>
                    <p><strong>Sent via GitHub Actions:</strong> Scheduled daily at 9 AM UTC</p>
                </div>

                <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
                    <h3 style="color: #1e40af; margin-top: 0;">Next Steps</h3>
                    <ol>
                        <li>Verify this email was received successfully</li>
                        <li>Check GitHub Actions workflow runs: <code>.github/workflows/send-email.yml</code></li>
                        <li>Review analytics configuration in your server</li>
                    </ol>
                </div>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #475569; text-align: center;">
                    <p style="margin: 0;">This is an automated analytics report from YugamGroup.</p>
                    <p style="margin: 5px 0 0 0;">Powered by GitHub Actions + Gmail SMTP</p>
                </div>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
}

async function main() {
    try {
        console.log(`📧 Sending ${emailType} email...`);
        console.log(`   From: ${gmailUser}`);
        console.log(`   To: ${recipientOverride || salesEmail}`);

        let result;
        if (emailType === 'analytics') {
            result = await sendAnalyticsEmail();
        } else {
            result = await sendTestEmail();
        }

        console.log(`✅ Email sent successfully!`);
        console.log(`   Message ID: ${result.messageId}`);
        process.exit(0);
    } catch (error) {
        console.error(`❌ Failed to send email:`);
        console.error(`   Error: ${error.message}`);
        console.error(`\nTroubleshooting:`);
        console.error(`   1. Check GitHub Secrets: GMAIL_USER, GMAIL_APP_PASSWORD`);
        console.error(`   2. Ensure GMAIL_APP_PASSWORD is a Gmail App Password (not your regular password)`);
        console.error(`   3. Verify GMAIL_USER is set to: yugamsale@gmail.com`);
        console.error(`   4. Check firewall/network allows outbound SMTP on port 465`);
        process.exit(1);
    }
}

main();
