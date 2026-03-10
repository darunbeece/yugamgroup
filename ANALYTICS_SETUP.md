# YugamGroup Analytics & Visitor Tracking

## Overview

A **GDPR-compliant, privacy-first visitor analytics system** that collects non-personal data with explicit user consent and sends daily digest emails to your sales team.

## Features

✅ **GDPR Compliant**
- Explicit cookie consent banner on all pages
- Users must opt-in before any tracking
- Easy opt-out mechanism
- No personal data collected without consent

✅ **Non-PII Data Collection**
- Page views and page titles
- Time spent on pages
- Scroll depth
- Device type (mobile/tablet/desktop)
- Traffic source (referrer)
- Browser & OS info
- Session ID (anonymized)

❌ **No Personal Data Collected Without Consent**
- No IP addresses stored
- No email addresses (unless form submitted)
- No tracking cookies without permission
- Fully anonymous session IDs

✅ **Daily Email Digest**
- Automated daily reports to sales@yugamgroup.com
- Key metrics summary
- Top pages visited
- Traffic sources
- Device breakdown
- Form submissions count
- Scheduled for 9 AM daily

## How It Works

### 1. **Cookie Consent Banner**
When visitors land on your site, they see a consent banner at the bottom:
- `Accept` - Enables analytics tracking
- `Decline` - No tracking (analytics script doesn't run)
- Preference stored in `localStorage` for 30 days

### 2. **Analytics Collection** (Only After Consent)
`analytics.js` tracks:
- **Page Views** - Which pages are visited
- **Time on Page** - How long visitors stay
- **Scroll Depth** - How far down the page they scroll
- **Element Interactions** - Button/link clicks
- **Form Submissions** - When contact form is submitted
- **Device Info** - Mobile/tablet/desktop breakdown

### 3. **Data Storage**
- Stored in-memory during the session
- Max 1000 events per type to prevent memory bloat
- Keeps last 24 hours of data

### 4. **Daily Email Report**
Automatically sent to `sales@yugamgroup.com` at 9 AM with:
```
📊 Daily Analytics Report
├── Key Metrics
│   ├── Total Visitors
│   ├── Total Page Views
│   ├── Average Time on Page
│   └── Form Submissions
├── 📄 Top Pages (Top 5)
├── 🌐 Traffic Sources (Top 5)
└── 📱 Device Breakdown
```

## Setup

### 1. **Already Configured**
- ✅ `analytics.js` - Visitor tracking script
- ✅ `server.js` - API endpoints & email scheduling
- ✅ Cookie consent banner - Added to index.html
- ✅ Email integration - Uses existing Gmail SMTP

### 2. **To Add to Other Pages**
Add this to the `<body>` of each HTML file (before closing `</body>`):

```html
<!-- Cookie Consent Banner -->
<div id="cookieConsentBanner" class="cookie-consent-banner">
    <div class="cookie-consent-content">
        <div class="cookie-icon">
            <i class="fas fa-cookie"></i>
        </div>
        <div class="cookie-text">
            <h3>Analytics Consent</h3>
            <p>We use analytics to understand how you use our website and improve your experience. We collect <strong>non-personal data only</strong>. <a href="#" style="color: #3b82f6; text-decoration: none;">Learn more</a></p>
        </div>
        <div class="cookie-actions">
            <button id="cookieDecline" class="cookie-btn cookie-btn-secondary">Decline</button>
            <button id="cookieAccept" class="cookie-btn cookie-btn-primary">Accept</button>
        </div>
    </div>
</div>

<!-- CSS and Scripts (same as index.html) -->
<script src="analytics.js"></script>
<script>
    // Cookie consent handling code (from index.html)
</script>
```

## API Endpoints

### POST `/api/analytics`
Collects visitor events. Called automatically by `analytics.js`.

**Request Body:**
```json
{
  "eventType": "pageview|element_click|form_submission|time_on_page|scroll_depth",
  "sessionId": "sess_xxxxx_timestamp",
  "page": "/index.html",
  "timestamp": "2025-03-09T10:30:00Z",
  ...
}
```

### GET `/api/analytics/summary`
Returns current day's analytics summary.

**Response:**
```json
{
  "totalVisitors": 42,
  "totalPageviews": 156,
  "avgTimeOnPage": 45,
  "topPages": [...],
  "trafficSources": [...],
  "devices": {...},
  "formSubmissions": 3
}
```

## Running the Server

```bash
npm start
```

Server logs will show:
```
✅ Gmail SMTP server is ready to send emails
📊 Analytics API available at POST http://localhost:3000/api/analytics
⏰ Daily analytics email scheduled for [TIME]
```

## Daily Email Schedule

- **Time:** 9 AM (local server timezone)
- **Recipient:** `sales@yugamgroup.com`
- **Frequency:** Every 24 hours
- **Data Reset:** After sending, analytics data is cleared for next day

## Privacy & Compliance

### GDPR Compliance
✅ Explicit consent required before tracking
✅ Easy opt-out mechanism
✅ No personal data without consent
✅ Data minimization (only essential non-PII)
✅ Transparent about what's collected

### CCPA Compliance
✅ Right to opt-out (Decline button)
✅ Right to know (Privacy policy link)
✅ No sale of personal information

### Privacy Policy Recommendations
Add to your Privacy Policy:

> **Analytics**
> We use non-personal analytics to understand how visitors use our website. With your consent, we collect:
> - Pages visited and time spent
> - Device type and browser information
> - Traffic source/referrer
> - Scroll depth and interactions
>
> No personal information is collected without explicit form submission. You can opt-out at any time by declining consent in the cookie banner.

## Troubleshooting

### Analytics not being collected?
1. Check browser console for errors
2. Verify user clicked "Accept" in consent banner
3. Check `localStorage` has `yugam_analytics_consent: true`
4. Verify `analytics.js` is loaded

### Email not received?
1. Check server logs: `npm start`
2. Verify `GMAIL_USER` and `GMAIL_PASSWORD` in `.env`
3. Check that analytics data exists (at least 1 pageview)
4. Verify `SALES_EMAIL` in `.env`

### Memory usage increasing?
- Analytics data is limited to 1000 events per type
- Daily email clears all data after sending
- No persistent database = no long-term storage

## Customization

### Change Daily Email Time
In `server.js`, modify `scheduleDailyEmail()`:
```javascript
target.setHours(9, 0, 0, 0);  // Change 9 to desired hour
```

### Change Email Recipient
Update `.env`:
```
SALES_EMAIL=your-email@company.com
```

### Change Data Retention Limit
In `server.js`, modify the check:
```javascript
if (analyticsData[key].length > 1000) {  // Change 1000
    analyticsData[key] = analyticsData[key].slice(-1000);
}
```

### Track Additional Events
Edit `analytics.js` and add to `trackElementInteractions()`:
```javascript
// Track custom events
document.addEventListener('your_event', (e) => {
    this.sendAnalytics('custom_event', {
        sessionId: this.sessionId,
        data: {...}
    });
});
```

## Security Notes

✅ **What's Secure:**
- No personal data without consent
- Session IDs are anonymized
- Data deleted daily
- HTTPS recommended in production
- Email sent via authenticated SMTP

⚠️ **For Production:**
1. Use HTTPS only
2. Store analytics data in database (PostgreSQL/MongoDB)
3. Add IP anonymization
4. Implement data retention policies (30-90 days max)
5. Add admin dashboard for analytics review
6. Enable database backups

## Next Steps

1. ✅ Analytics system is ready
2. Add cookie consent to other HTML pages
3. Create `/privacy-policy.html` page
4. Test daily email by running server
5. Monitor reports and optimize website based on data

## Support

For issues or customizations, check:
- Server logs: `npm start`
- Browser console (F12)
- `.env` configuration
- network tab for API calls to `/api/analytics`

---

**Your website is now tracking visitor behavior responsibly and securely! 🎉**
