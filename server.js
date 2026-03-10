const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));
app.use(cors());

// Create Nodemailer transporter for Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
    }
});

// Verify transporter connection
transporter.verify((error, success) => {
    if (error) {
        console.log('❌ Gmail connection error:', error);
    } else {
        console.log('✅ Gmail SMTP server is ready to send emails');
    }
});

// Contact form submission endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, company, subject, message, consent } = req.body;

        // Validate required fields
        if (!name || !email || !message || !consent) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Email template
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: process.env.SALES_EMAIL,
            replyTo: email,
            subject: `New Enquiry from ${name} - ${subject || 'General Inquiry'}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1e40af;">New Contact Form Submission</h2>

                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
                        <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
                        ${company ? `<p><strong>Company:</strong> ${escapeHtml(company)}</p>` : ''}
                        <p><strong>Subject:</strong> ${escapeHtml(subject || 'Not specified')}</p>
                    </div>

                    <h3 style="color: #1e40af; margin-top: 20px;">Message:</h3>
                    <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #1e40af;">
                        <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
                    </div>

                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #475569;">
                        <p>This email was sent from your YuGam Group website contact form.</p>
                        <p>Reply directly to this email to respond to the inquiry.</p>
                    </div>
                </div>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);

        // Send confirmation to user
        const userMailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'We Received Your Inquiry - YuGam Group',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1e40af;">Thank You for Contacting YuGam Group</h2>

                    <p>Hi ${escapeHtml(name)},</p>

                    <p>We've received your inquiry and appreciate you reaching out to us. Our team will review your message and get back to you as soon as possible.</p>

                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Your Message Summary:</strong></p>
                        <p>${escapeHtml(message).substring(0, 200)}${escapeHtml(message).length > 200 ? '...' : ''}</p>
                    </div>

                    <h3 style="color: #1e40af;">Quick Links:</h3>
                    <ul>
                        <li><a href="https://yugamgroup.com/services.html">View Our Services</a></li>
                        <li><a href="https://yugamgroup.com/case-studies.html">See Our Case Studies</a></li>
                        <li><a href="https://yugamgroup.com/about.html">Learn About Us</a></li>
                    </ul>

                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #475569;">
                        <p><strong>YuGam Group</strong></p>
                        <p>📞 +1 (224) 442-0650<br>
                        📧 info@yugamgroup.com<br>
                        📍 Chicago, Illinois | São Paulo, Brazil | Chennai, India</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(userMailOptions);

        return res.status(200).json({
            success: true,
            message: 'Thank you! Your message has been sent successfully.'
        });

    } catch (error) {
        console.error('Email sending error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while sending your message. Please try again later.'
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 YuGam Group server running on http://localhost:${PORT}`);
    console.log(`📧 Contact form API available at POST http://localhost:${PORT}/api/contact\n`);
});

// Utility function to escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
