// Yugam Group — shared page behaviour
(function () {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ===== Header takes the colour of the chapter beneath it =====
    const header = document.querySelector('.site-header');
    const chapters = Array.from(document.querySelectorAll('[data-chapter], main > section, main > figure, .site-footer'));

    function luminance(rgb) {
        const m = rgb.match(/\d+(\.\d+)?/g);
        if (!m) return 1;
        const [r, g, b] = m.slice(0, 3).map(Number).map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    function updateHeader() {
        if (!header) return;
        const probe = header.offsetHeight / 2;
        let current = null;
        for (const el of chapters) {
            const r = el.getBoundingClientRect();
            if (r.top <= probe && r.bottom > probe) current = el;
        }
        if (!current) return;
        const cs = getComputedStyle(current);
        const bg = cs.backgroundColor;
        if (!bg || bg === 'rgba(0, 0, 0, 0)') return;
        header.style.setProperty('--h-bg', bg);
        header.style.setProperty('--h-fg', cs.color);
        header.dataset.ink = luminance(bg) < 0.2 ? 'light' : 'dark';
    }

    // ===== Menu (phones) =====
    const toggle = document.querySelector('.menu-toggle');
    if (toggle && header) {
        toggle.addEventListener('click', () => {
            const open = header.classList.toggle('menu-open');
            toggle.setAttribute('aria-expanded', String(open));
            toggle.textContent = open ? 'Close' : 'Menu';
        });
        header.querySelectorAll('.site-nav ul a').forEach(a => a.addEventListener('click', () => {
            header.classList.remove('menu-open');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.textContent = 'Menu';
        }));
    }

    // ===== Entrances: each part of a section rises in turn =====
    const autoReveal = [
        '.page-title', '.page-subtitle',
        '.section-header > *', '.domain-card', '.service-detail-content > *', '.service-detail-visual',
        '.value-card', '.benefit-card', '.benefit-item', '.stat-card-large', '.process-step',
        '.case-study-card > *', '.team-member > *', '.cta-content > *', '.mission-text > *',
        '.careers-intro-content > h2', '.careers-intro-content > .lead',
        '.contact-info-section', '.form-section'
    ].join(',');
    document.querySelectorAll(autoReveal).forEach(el => el.setAttribute('data-reveal', ''));

    const revealables = document.querySelectorAll('[data-reveal]');
    revealables.forEach(el => {
        const siblings = Array.from(el.parentElement.children).filter(c => c.hasAttribute('data-reveal'));
        el.style.setProperty('--i', String(Math.min(siblings.indexOf(el), 6)));
    });
    if ('IntersectionObserver' in window && !reduceMotion) {
        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-in');
                    io.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px 12% 0px', threshold: 0 });
        revealables.forEach(el => io.observe(el));
    } else {
        revealables.forEach(el => el.classList.add('is-in'));
    }

    // ===== Picture band drifts with the scroll =====
    const bands = document.querySelectorAll('.band img');
    function updateBands() {
        if (reduceMotion) return;
        const vh = window.innerHeight;
        bands.forEach(img => {
            const r = img.parentElement.getBoundingClientRect();
            if (r.bottom < 0 || r.top > vh) return;
            const p = (vh - r.top) / (vh + r.height); // 0 → 1 while it crosses the screen
            img.style.transform = `translate3d(0, ${(-p * 15).toFixed(2)}%, 0)`;
        });
    }

    // Near the foot of the page (or after a jump with End), show whatever has not risen yet
    function revealRest() {
        const doc = document.documentElement;
        if (window.scrollY + window.innerHeight * 2.5 < doc.scrollHeight) return;
        document.querySelectorAll('[data-reveal]:not(.is-in)').forEach(el => el.classList.add('is-in'));
    }

    let ticking = false;
    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            updateHeader();
            updateBands();
            revealRest();
            ticking = false;
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    updateHeader();
    updateBands();

    // ===== Harvest now, decrypt later: exposure check =====
    // Compares how long data must stay secret, and how long migration takes,
    // with the dates in NIST's draft transition plan (deprecate 2030, disallow 2035).
    const exposure = document.querySelector('.exposure');
    if (exposure) {
        const shelf = exposure.querySelector('#shelf');
        const migrate = exposure.querySelector('#migrate');
        const result = exposure.querySelector('[data-exposure]');
        const DEPRECATE = 2030, DISALLOW = 2035;
        const years = n => `${n} year${n === 1 ? '' : 's'}`;

        function render() {
            const now = new Date().getFullYear();
            const s = Number(shelf.value), m = Number(migrate.value);
            exposure.querySelector('[data-out="shelf"]').textContent = years(s);
            exposure.querySelector('[data-out="migrate"]').textContent = years(m);
            const secretUntil = now + s, doneBy = now + m;

            let first;
            if (secretUntil > DISALLOW) first = `Data you encrypt with RSA this year must stay secret until <strong>${secretUntil}</strong>, past 2030, when NIST’s draft plan deprecates RSA-2048, and past 2035, when it disallows it.`;
            else if (secretUntil > DEPRECATE) first = `Data you encrypt with RSA this year must stay secret until <strong>${secretUntil}</strong>, past 2030, when NIST’s draft plan deprecates RSA-2048.`;
            else first = `Data you encrypt this year needs protecting until <strong>${secretUntil}</strong>, inside NIST’s 2030 deadline, but the systems that carry it will outlast that.`;

            const second = doneBy > DEPRECATE
                ? `Starting today, your migration ends in <strong>${doneBy}</strong>, after 2030. Plan it in parallel waves, starting with the longest-lived data.`
                : `Starting today, you finish in <strong>${doneBy}</strong>, ahead of 2030, if the inventory starts now.`;
            result.innerHTML = `${first} ${second}`;
        }
        shelf.addEventListener('input', render);
        migrate.addEventListener('input', render);
        render();
    }

    // ===== Analytics consent =====
    const banner = document.getElementById('cookieConsentBanner');
    if (banner) {
        const consentKey = 'yugam_analytics_consent';
        let stored = null;
        try { stored = localStorage.getItem(consentKey); } catch (e) { /* storage blocked */ }
        if (!stored) banner.classList.add('show');
        const decide = value => {
            try { localStorage.setItem(consentKey, value); } catch (e) { /* storage blocked */ }
            banner.classList.remove('show');
            if (value === 'true' && window.YugamAnalytics) window.YugamAnalytics.grantConsent();
        };
        document.getElementById('cookieAccept')?.addEventListener('click', () => decide('true'));
        document.getElementById('cookieDecline')?.addEventListener('click', () => decide('false'));
    }

    root.classList.add('ready');
})();
