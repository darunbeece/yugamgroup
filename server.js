const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// SendPulse REST API email sender
let sendpulseToken = null;
let tokenExpiry = 0;

async function getSendPulseToken() {
    if (sendpulseToken && Date.now() < tokenExpiry) return sendpulseToken;
    const res = await fetch('https://api.sendpulse.com/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            grant_type: 'client_credentials',
            client_id: process.env.SENDPULSE_CLIENT_ID,
            client_secret: process.env.SENDPULSE_CLIENT_SECRET
        })
    });
    const data = await res.json();
    sendpulseToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return sendpulseToken;
}

async function sendEmail({ from, fromName, to, replyTo, subject, html }) {
    const token = await getSendPulseToken();
    const body = {
        email: {
            subject,
            html: Buffer.from(html).toString('base64'),
            from: { name: fromName || 'YuGam Group', email: from },
            to: Array.isArray(to) ? to.map(e => ({ email: e })) : [{ email: to }]
        }
    };
    if (replyTo) body.email.reply_to = { email: replyTo };
    const res = await fetch('https://api.sendpulse.com/smtp/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'SendPulse API error');
    return result;
}

// Verify API credentials on startup
(async () => {
    try {
        await getSendPulseToken();
        console.log('✅ SendPulse API is ready to send emails');
    } catch (error) {
        console.log('❌ SendPulse API error:', error.message);
    }
})();

// Analytics storage
const analyticsDir = path.join(__dirname, '.analytics');
if (!fs.existsSync(analyticsDir)) {
    fs.mkdirSync(analyticsDir, { recursive: true });
}

// In-memory analytics for current session
let analyticsData = {
    pageviews: [],
    clicks: [],
    formSubmissions: [],
    timeOnPage: [],
    scrollDepth: []
};

// Middleware
app.use(express.json());
app.use(express.static('.'));
app.use(cors());

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

        // Send notification email to sales team
        await sendEmail({
            from: 'prasoona@yugamgroup.com',
            fromName: 'YuGam Group',
            to: process.env.SALES_EMAIL,
            replyTo: email,
            subject: `New Enquiry from ${escapeHtml(name)} - ${escapeHtml(subject || 'General Inquiry')}`,
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
        });

        // Send confirmation to user
        await sendEmail({
            from: 'prasoona@yugamgroup.com',
            fromName: 'YuGam Group',
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
                        <p>+1 (224) 442-0650<br>
                        prasoona@yugamgroup.com<br>
                        Chicago, Illinois | Sao Paulo, Brazil | Chennai, India</p>
                    </div>
                </div>
            `
        });

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

// Analytics collection endpoint
app.post('/api/analytics', (req, res) => {
    try {
        const { eventType, ...eventData } = req.body;

        // Store analytics based on event type
        switch (eventType) {
            case 'pageview':
                analyticsData.pageviews.push(eventData);
                break;
            case 'element_click':
                analyticsData.clicks.push(eventData);
                break;
            case 'form_submission':
                analyticsData.formSubmissions.push(eventData);
                break;
            case 'time_on_page':
                analyticsData.timeOnPage.push(eventData);
                break;
            case 'scroll_depth':
                analyticsData.scrollDepth.push(eventData);
                break;
        }

        // Keep only last 1000 events per type to prevent memory bloat
        Object.keys(analyticsData).forEach(key => {
            if (analyticsData[key].length > 1000) {
                analyticsData[key] = analyticsData[key].slice(-1000);
            }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ success: false });
    }
});

// Analytics summary endpoint
app.get('/api/analytics/summary', (req, res) => {
    try {
        const summary = generateAnalyticsSummary();
        res.json(summary);
    } catch (error) {
        console.error('Analytics summary error:', error);
        res.status(500).json({ success: false });
    }
});

// Send daily analytics email
async function sendDailyAnalyticsEmail() {
    try {
        if (analyticsData.pageviews.length === 0) {
            console.log('No analytics data to send today');
            return;
        }

        const summary = generateAnalyticsSummary();
        const emailHtml = generateAnalyticsEmailHtml(summary);

        await sendEmail({
            from: 'prasoona@yugamgroup.com',
            fromName: 'YuGam Group Analytics',
            to: process.env.SALES_EMAIL,
            subject: `YugamGroup Daily Analytics Report - ${new Date().toLocaleDateString()}`,
            html: emailHtml
        });

        console.log('✅ Daily analytics email sent to', process.env.SALES_EMAIL);

        // Clear analytics data after sending
        analyticsData = {
            pageviews: [],
            clicks: [],
            formSubmissions: [],
            timeOnPage: [],
            scrollDepth: []
        };
    } catch (error) {
        console.error('Error sending analytics email:', error);
    }
}

// Generate analytics summary
function generateAnalyticsSummary() {
    const uniqueSessions = new Set(analyticsData.pageviews.map(p => p.sessionId)).size;
    const pages = {};
    const devices = {};
    const referrers = {};

    // Group pageviews by page
    analyticsData.pageviews.forEach(pv => {
        const page = pv.page || '/';
        pages[page] = (pages[page] || 0) + 1;
        devices[pv.deviceType || 'unknown'] = (devices[pv.deviceType] || 0) + 1;
        referrers[pv.referrer || 'direct'] = (referrers[pv.referrer] || 0) + 1;
    });

    // Calculate average time on page
    let totalTime = 0;
    let pageCount = analyticsData.timeOnPage.length;
    analyticsData.timeOnPage.forEach(t => {
        totalTime += t.timeSeconds || 0;
    });
    const avgTimeOnPage = pageCount > 0 ? Math.round(totalTime / pageCount) : 0;

    // Get top pages
    const topPages = Object.entries(pages)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([page, count]) => ({ page, visits: count }));

    // Get traffic sources
    const trafficSources = Object.entries(referrers)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([source, count]) => ({ source, visits: count }));

    return {
        date: new Date().toLocaleDateString(),
        totalVisitors: uniqueSessions,
        totalPageviews: analyticsData.pageviews.length,
        avgTimeOnPage,
        topPages,
        trafficSources,
        devices,
        formSubmissions: analyticsData.formSubmissions.length,
        totalClicks: analyticsData.clicks.length
    };
}

// Generate HTML email for analytics
function generateAnalyticsEmailHtml(summary) {
    const topPagesHtml = summary.topPages
        .map(p => `<tr><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${escapeHtml(p.page)}</td><td style="padding: 10px; text-align: right;">${p.visits}</td></tr>`)
        .join('');

    const trafficSourcesHtml = summary.trafficSources
        .map(s => `<tr><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${escapeHtml(s.source)}</td><td style="padding: 10px; text-align: right;">${s.visits}</td></tr>`)
        .join('');

    const deviceBreakdown = Object.entries(summary.devices)
        .map(([device, count]) => `<li>${device}: ${count}</li>`)
        .join('');

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px; border-radius: 8px;">
            <h2 style="color: #1e40af; margin-top: 0;">Daily Analytics Report</h2>
            <p style="color: #475569;">Report Date: <strong>${summary.date}</strong></p>

            <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #1e40af; margin-top: 0;">Key Metrics</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="background: #f0f4f8;">
                        <td style="padding: 12px; font-weight: 600;">Total Visitors</td>
                        <td style="padding: 12px; text-align: right; font-size: 1.5em; color: #1e40af; font-weight: 600;">${summary.totalVisitors}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px;">Total Page Views</td>
                        <td style="padding: 12px; text-align: right; font-weight: 500;">${summary.totalPageviews}</td>
                    </tr>
                    <tr style="background: #f0f4f8;">
                        <td style="padding: 12px;">Avg. Time on Page</td>
                        <td style="padding: 12px; text-align: right; font-weight: 500;">${summary.avgTimeOnPage}s</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px;">Form Submissions</td>
                        <td style="padding: 12px; text-align: right; font-weight: 500; color: #10b981;">${summary.formSubmissions}</td>
                    </tr>
                </table>
            </div>

            <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #1e40af; margin-top: 0;">Top Pages</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f0f4f8;">
                            <th style="padding: 10px; text-align: left; font-weight: 600;">Page</th>
                            <th style="padding: 10px; text-align: right; font-weight: 600;">Visits</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${topPagesHtml || '<tr><td colspan="2" style="padding: 10px;">No data</td></tr>'}
                    </tbody>
                </table>
            </div>

            <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #1e40af; margin-top: 0;">Traffic Sources</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f0f4f8;">
                            <th style="padding: 10px; text-align: left; font-weight: 600;">Source</th>
                            <th style="padding: 10px; text-align: right; font-weight: 600;">Visits</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${trafficSourcesHtml || '<tr><td colspan="2" style="padding: 10px;">No data</td></tr>'}
                    </tbody>
                </table>
            </div>

            <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #1e40af; margin-top: 0;">Device Breakdown</h3>
                <ul style="margin: 0; padding: 0 0 0 20px; color: #475569;">
                    ${deviceBreakdown || '<li>No data</li>'}
                </ul>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #475569; text-align: center;">
                <p style="margin: 0;">This is an automated daily analytics report from YugamGroup website.</p>
                <p style="margin: 5px 0 0 0;">Powered by GDPR-Compliant Analytics</p>
            </div>
        </div>
    `;
}

// Schedule daily email at 9 AM
function scheduleDailyEmail() {
    const now = new Date();
    const target = new Date();
    target.setHours(9, 0, 0, 0);

    if (now > target) {
        target.setDate(target.getDate() + 1);
    }

    const timeUntilTarget = target.getTime() - now.getTime();

    setTimeout(() => {
        sendDailyAnalyticsEmail();
        // Schedule for every 24 hours after first run
        setInterval(sendDailyAnalyticsEmail, 24 * 60 * 60 * 1000);
    }, timeUntilTarget);

    console.log(`Daily analytics email scheduled for ${target.toLocaleString()}`);
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`\nYuGam Group server running on http://localhost:${PORT}`);
    console.log(`Contact form API available at POST http://localhost:${PORT}/api/contact`);
    console.log(`Analytics API available at POST http://localhost:${PORT}/api/analytics\n`);

    // Schedule daily analytics email
    scheduleDailyEmail();
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
