const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Gmail SMTP Configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.GMAIL_USER || 'yugamsale@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD
    },
    family: 4 // Force IPv4
});

// Verify SMTP connection on startup
transporter.verify((error, success) => {
    if (error) {
        console.log('❌ Gmail SMTP connection error:', error.message);
    } else {
        console.log('✅ Gmail SMTP is ready to send emails');
    }
});

async function sendEmail({ from, fromName, to, replyTo, subject, html }) {
    try {
        const mailOptions = {
            from: `"${fromName || 'YuGam Group'}" <${from}>`,
            to: Array.isArray(to) ? to.join(',') : to,
            subject,
            html,
            replyTo
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('❌ Email sending error:', error);
        throw error;
    }
}

// Analytics storage
const analyticsDir = path.join(__dirname, '.analytics');
if (!fs.existsSync(analyticsDir)) {
    fs.mkdirSync(analyticsDir, { recursive: true });
}

// Visitor tracking storage
const visitorsFile = path.join(analyticsDir, 'visitors.json');
const loadVisitors = () => {
    if (fs.existsSync(visitorsFile)) {
        try {
            return JSON.parse(fs.readFileSync(visitorsFile, 'utf8'));
        } catch (error) {
            return {};
        }
    }
    return {};
};

const saveVisitors = (visitors) => {
    fs.writeFileSync(visitorsFile, JSON.stringify(visitors, null, 2));
};

let visitors = loadVisitors();

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

// Get client IP address
function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return req.socket.remoteAddress || req.connection.remoteAddress || req.ip || 'Unknown';
}

// Visitor tracking middleware
app.use((req, res, next) => {
    // Only track page visits (HTML requests, not API calls or static assets)
    if (req.path === '/' || req.path.endsWith('.html')) {
        const ip = getClientIp(req);
        const now = new Date().toISOString();

        if (!visitors[ip]) {
            visitors[ip] = {
                ip: ip,
                firstVisit: now,
                lastVisit: now,
                visitCount: 1,
                pages: [req.path]
            };
        } else {
            visitors[ip].lastVisit = now;
            visitors[ip].visitCount += 1;
            if (!visitors[ip].pages.includes(req.path)) {
                visitors[ip].pages.push(req.path);
            }
        }

        saveVisitors(visitors);
    }
    next();
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

        // Note: We keep visitor data for future reports, but clear pageview metrics
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

    // Get visitor list sorted by visit count
    const visitorList = Object.values(visitors)
        .sort((a, b) => b.visitCount - a.visitCount)
        .slice(0, 50); // Top 50 visitors

    return {
        date: new Date().toLocaleDateString(),
        totalVisitors: Object.keys(visitors).length,
        totalPageviews: analyticsData.pageviews.length,
        avgTimeOnPage,
        topPages,
        trafficSources,
        devices,
        formSubmissions: analyticsData.formSubmissions.length,
        totalClicks: analyticsData.clicks.length,
        visitorList
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

    const visitorsHtml = summary.visitorList
        .map(v => `
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-family: monospace; font-size: 0.9em;">${escapeHtml(v.ip)}</td>
                <td style="padding: 10px; text-align: center;">${v.visitCount}</td>
                <td style="padding: 10px; font-size: 0.9em;">${escapeHtml(v.pages.slice(0, 2).join(', '))}</td>
                <td style="padding: 10px; font-size: 0.9em;">${new Date(v.lastVisit).toLocaleString()}</td>
            </tr>
        `)
        .join('');

    return `
        <div style="font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; background: #f8fafc; padding: 20px; border-radius: 8px;">
            <h2 style="color: #1e40af; margin-top: 0;">Daily Analytics Report</h2>
            <p style="color: #475569;">Report Date: <strong>${summary.date}</strong></p>

            <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #1e40af; margin-top: 0;">Key Metrics</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="background: #f0f4f8;">
                        <td style="padding: 12px; font-weight: 600;">Total Unique Visitors</td>
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
                <h3 style="color: #1e40af; margin-top: 0;">🌐 Visitor Details</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">
                    <thead>
                        <tr style="background: #f0f4f8;">
                            <th style="padding: 12px; text-align: left; font-weight: 600;">Public IP</th>
                            <th style="padding: 12px; text-align: center; font-weight: 600;">Visits</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600;">Pages Visited</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600;">Last Visit</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${visitorsHtml || '<tr><td colspan="4" style="padding: 10px;">No visitors yet</td></tr>'}
                    </tbody>
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
                <p style="margin: 5px 0 0 0;">Powered by Privacy-Respecting Analytics</p>
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

// API endpoint to get current visitors (for dashboard)
app.get('/api/visitors', (req, res) => {
    try {
        const visitorList = Object.values(visitors)
            .sort((a, b) => b.visitCount - a.visitCount);

        res.json({
            totalVisitors: visitorList.length,
            visitors: visitorList
        });
    } catch (error) {
        console.error('Visitors endpoint error:', error);
        res.status(500).json({ success: false });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`\nYuGam Group server running on http://localhost:${PORT}`);
    console.log(`Contact form API available at POST http://localhost:${PORT}/api/contact`);
    console.log(`Analytics API available at POST http://localhost:${PORT}/api/analytics`);
    console.log(`Visitors API available at GET http://localhost:${PORT}/api/visitors`);
    console.log(`Current visitors being tracked: ${Object.keys(visitors).length}\n`);

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
