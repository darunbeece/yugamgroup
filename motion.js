/*
 * YugamGroup motion layer (GSAP + ScrollTrigger)
 * Calm, editorial motion: staggered page intros, scroll reveals for cards,
 * count-up stats, a hero parallax and a reading progress bar.
 * Everything is skipped for visitors who prefer reduced motion.
 */
(function () {
    var root = document.documentElement;
    function release() { root.classList.remove('motion-pending'); }

    if (!window.gsap || !window.ScrollTrigger) { release(); return; }
    gsap.registerPlugin(ScrollTrigger);

    var EASE = 'power3.out';

    // Groups of elements that reveal together, staggered, as they scroll in
    var CARD_GROUPS = [
        '.service-card', '.option-card', '.question-card', '.case-study-card',
        '.value-card', '.benefit-card', '.benefit-item', '.process-step',
        '.stats-banner-item', '.stat-card-large', '.contact-item',
        '.framework-item', '.coverage-item', '.team-member', '.platform-badge',
        '.footer-col', '.deadline-list li'
    ];

    // Single blocks that rise in on their own
    var BLOCKS = [
        '.section-header', '.service-detail', '.mission-text', '.careers-intro-content',
        '.form-section', '.cta-content', '.results-card'
    ];

    function q(sel) { return gsap.utils.toArray(sel); }

    var mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', function () {
        // 1. Page intro: hero on the homepage, page header everywhere else
        var intro = q('.hero-text > *, .hero-visual, .page-header .container > *');
        if (intro.length) {
            gsap.from(intro, {
                y: 28, autoAlpha: 0, duration: 0.9, ease: EASE, stagger: 0.12, delay: 0.05
            });
        }
        release();

        // 2. Section headers and standalone blocks
        BLOCKS.forEach(function (sel) {
            q(sel).forEach(function (el) {
                gsap.from(el, {
                    y: 32, autoAlpha: 0, duration: 0.9, ease: EASE,
                    scrollTrigger: { trigger: el, start: 'top 85%', once: true }
                });
            });
        });

        // 3. Card groups, batched so cards entering together stagger nicely
        CARD_GROUPS.forEach(function (sel) {
            var items = q(sel);
            if (!items.length) return;
            gsap.set(items, { y: 36, autoAlpha: 0 });
            ScrollTrigger.batch(items, {
                start: 'top 88%',
                once: true,
                onEnter: function (batch) {
                    gsap.to(batch, {
                        y: 0, autoAlpha: 1, duration: 0.8, ease: EASE, stagger: 0.1, overwrite: true
                    });
                }
            });
        });

        // 4. Count-up for stats that start with a number ("15+ years", "3 locations")
        q('.stats-banner-value, .stat-number-large').forEach(function (el) {
            var match = el.textContent.trim().match(/^(\d+)(.*)$/);
            if (!match) return;
            var end = parseInt(match[1], 10), rest = match[2], counter = { v: 0 };
            el.textContent = '0' + rest;
            gsap.to(counter, {
                v: end, duration: 1.4, ease: 'power2.out',
                scrollTrigger: { trigger: el, start: 'top 90%', once: true },
                onUpdate: function () { el.textContent = Math.round(counter.v) + rest; }
            });
        });

        // 5. Section rules draw in from the left
        q('.section-header').forEach(function (el) {
            el.classList.add('motion-rule');
            ScrollTrigger.create({
                trigger: el, start: 'top 85%', once: true,
                onEnter: function () { el.classList.add('is-drawn'); }
            });
        });

        // 6. Reading progress bar
        var bar = document.createElement('div');
        bar.className = 'scroll-progress';
        bar.setAttribute('aria-hidden', 'true');
        document.body.appendChild(bar);
        gsap.to(bar, {
            scaleX: 1, ease: 'none',
            scrollTrigger: { start: 0, end: 'max', scrub: 0.3 }
        });

        return function () { bar.remove(); };
    });

    // 7. Gentle hero parallax, desktop only
    mm.add('(prefers-reduced-motion: no-preference) and (min-width: 960px)', function () {
        var visual = document.querySelector('.hero-visual');
        if (!visual) return;
        gsap.to(visual, {
            yPercent: -8, ease: 'none',
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
        });
    });

    // Reduced motion or anything else: make sure content is visible
    mm.add('(prefers-reduced-motion: reduce)', release);

    // Recalculate trigger points once fonts and images have settled
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
