# Visitor Tracking System

## Overview
The visitor tracking system captures and logs all website visitors with their public IP addresses, visit counts, pages visited, and timestamps.

## Features

### 1. **Automatic IP Capture**
- Captures public IP addresses from all page visits
- Supports X-Forwarded-For header (for proxy/load balancer environments)
- Fallback to direct socket IP if proxy headers unavailable

### 2. **Visitor Data Storage**
- Stored in `.analytics/visitors.json` for persistence
- Data includes:
  - Public IP address
  - First visit timestamp
  - Last visit timestamp
  - Visit count (total)
  - Pages visited (array of paths)

### 3. **Daily Analytics Email**
Email report includes:
- **Key Metrics**: Total unique visitors, pageviews, avg time on page, form submissions
- **Visitor Details Table**:
  - Public IP addresses
  - Visit counts
  - Pages visited by each IP
  - Last visit timestamp
- **Top Pages**: Most visited pages
- **Traffic Sources**: Where visitors came from
- **Device Breakdown**: Device types

## Endpoints

### View Visitors (GET)
```bash
GET /api/visitors
```

**Response:**
```json
{
  "totalVisitors": 42,
  "visitors": [
    {
      "ip": "192.168.1.100",
      "firstVisit": "2026-03-13T10:30:00.000Z",
      "lastVisit": "2026-03-13T15:45:00.000Z",
      "visitCount": 5,
      "pages": ["/", "/services.html", "/about.html"]
    }
  ]
}
```

## Email Report Schedule

**Default**: Daily at 8 AM CST (1 PM UTC)

Configure via GitHub Actions: `.github/workflows/send-email.yml`

## Data Privacy

### What's Tracked
✅ Public IP address
✅ Visit timestamps
✅ Pages visited
✅ Visit count

### What's NOT Tracked
❌ Personal identifiable information (name, email from IP)
❌ User behavior analytics
❌ Cookies or session data
❌ Device fingerprinting

## Example Visitor Record

```json
{
  "ip": "203.0.113.45",
  "firstVisit": "2026-03-12T09:15:22.000Z",
  "lastVisit": "2026-03-13T14:30:45.000Z",
  "visitCount": 3,
  "pages": ["/", "/services.html"]
}
```

## Configuration

### Email Recipients
- Set in `.env` file: `SALES_EMAIL=sales@yugamgroup.com`

### Storage Location
- Visitor data: `.analytics/visitors.json`
- Automatically created if directory doesn't exist

### Proxy/Load Balancer Setup
The system automatically checks for `X-Forwarded-For` header when behind proxies:
- Nginx: `proxy_set_header X-Forwarded-For $remote_addr;`
- Apache: `ProxyPreserveHost On`

## Sample Daily Email Report

The email includes a formatted table showing:

| Public IP | Visits | Pages Visited | Last Visit |
|-----------|--------|---------------|-----------|
| 203.0.113.45 | 5 | /, /services.html | Mar 13, 2:30 PM |
| 198.51.100.22 | 3 | / | Mar 13, 1:15 PM |
| 192.0.2.88 | 2 | /, /about.html | Mar 13, 12:45 PM |

## Testing

### Manual Email Trigger
```bash
node -e "const s = require('./server.js'); setTimeout(() => process.exit(), 1000);"
```

### Check Visitor Data
```bash
cat .analytics/visitors.json
```

### Query API
```bash
curl http://localhost:3000/api/visitors
```

## Notes

- Visitor data persists across server restarts
- Top 50 most active visitors shown in daily email
- Data stored in local JSON (portable, no database needed)
- Suitable for privacy-conscious tracking without cookies
