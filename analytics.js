// YugamGroup Analytics - GDPR Compliant Visitor Tracking
// Collects non-PII data only after user consent

class YugamAnalytics {
    constructor() {
        this.consentKey = 'yugam_analytics_consent';
        this.sessionId = this.generateSessionId();
        this.hasConsent = this.checkConsent();

        if (this.hasConsent) {
            this.initTracking();
        }
    }

    generateSessionId() {
        return 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    checkConsent() {
        return localStorage.getItem(this.consentKey) === 'true';
    }

    grantConsent() {
        localStorage.setItem(this.consentKey, 'true');
        this.hasConsent = true;
        this.initTracking();
    }

    revokeConsent() {
        localStorage.removeItem(this.consentKey);
        this.hasConsent = false;
    }

    initTracking() {
        // Track page view
        this.trackPageView();

        // Track time on page
        this.trackTimeOnPage();

        // Track scroll depth
        this.trackScrollDepth();

        // Track clicks on key elements
        this.trackElementInteractions();
    }

    trackPageView() {
        const data = {
            sessionId: this.sessionId,
            page: window.location.pathname,
            title: document.title,
            timestamp: new Date().toISOString(),
            referrer: document.referrer || 'direct',
            userAgent: navigator.userAgent,
            deviceType: this.getDeviceType(),
            screenResolution: `${window.innerWidth}x${window.innerHeight}`,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        this.sendAnalytics('pageview', data);
    }

    trackTimeOnPage() {
        let timeOnPage = 0;
        const interval = setInterval(() => {
            timeOnPage += 5;
        }, 5000);

        window.addEventListener('beforeunload', () => {
            clearInterval(interval);
            if (timeOnPage > 0) {
                this.sendAnalytics('time_on_page', {
                    sessionId: this.sessionId,
                    page: window.location.pathname,
                    timeSeconds: timeOnPage,
                    timestamp: new Date().toISOString()
                });
            }
        });
    }

    trackScrollDepth() {
        let maxScroll = 0;

        window.addEventListener('scroll', () => {
            const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            if (scrollPercentage > maxScroll) {
                maxScroll = scrollPercentage;
            }
        });

        window.addEventListener('beforeunload', () => {
            this.sendAnalytics('scroll_depth', {
                sessionId: this.sessionId,
                page: window.location.pathname,
                scrollDepth: Math.round(maxScroll),
                timestamp: new Date().toISOString()
            });
        });
    }

    trackElementInteractions() {
        // Track button clicks
        document.addEventListener('click', (e) => {
            const button = e.target.closest('a, button, .btn');
            if (button) {
                this.sendAnalytics('element_click', {
                    sessionId: this.sessionId,
                    page: window.location.pathname,
                    elementType: button.tagName.toLowerCase(),
                    elementText: button.textContent.substring(0, 50),
                    elementHref: button.href || button.getAttribute('data-action'),
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Track form submissions
        document.addEventListener('submit', (e) => {
            const form = e.target;
            this.sendAnalytics('form_submission', {
                sessionId: this.sessionId,
                page: window.location.pathname,
                formId: form.id || 'unknown',
                formAction: form.action || 'unknown',
                timestamp: new Date().toISOString()
            });
        });
    }

    getDeviceType() {
        const ua = navigator.userAgent;
        if (/mobile|android|iphone|ipad|phone/i.test(ua.toLowerCase())) {
            return /ipad/i.test(ua) ? 'tablet' : 'mobile';
        }
        return 'desktop';
    }

    sendAnalytics(eventType, data) {
        if (!this.hasConsent) return;

        fetch('https://yugamgroup-backend.onrender.com/api/analytics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                eventType,
                ...data
            })
        }).catch(err => console.log('Analytics error:', err));
    }
}

// Initialize analytics
const yugamAnalytics = new YugamAnalytics();

// Export for use in other scripts
window.YugamAnalytics = yugamAnalytics;
