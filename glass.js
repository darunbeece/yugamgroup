// Yugam Group — liquid glass on the floating header
// Uses liquid-glass-js (vendor/liquid-glass, MIT) to refract the page behind
// the header with WebGL. Loaded by site.js only on larger screens with a fine
// pointer, WebGL and motion allowed; everyone else keeps the CSS glass.
(function () {
    const header = document.querySelector('.site-header');
    if (!header || typeof Container === 'undefined' || typeof html2canvas === 'undefined') return;

    const root = document.documentElement;
    const desktop = window.matchMedia('(min-width: 901px)');
    let glass = null;
    let failed = false;

    // Leave floating things out of the snapshot the glass refracts
    [header, document.getElementById('cookieConsentBanner')].forEach(el => el && el.setAttribute('data-glass-ignore', ''));

    Container.onError = () => {
        // Fall back to the CSS glass, quietly, and don't try again on this page
        failed = true;
        header.classList.remove('has-liquid-glass');
        if (glass && glass.element) glass.element.remove();
        glass = null;
    };
    Container.onReady = () => {
        header.classList.add('has-liquid-glass');
    };

    function start() {
        if (glass || failed || !desktop.matches) return;
        glass = new Container({ type: 'pill', tintOpacity: 0.12 });
        glass.element.setAttribute('aria-hidden', 'true');
        header.prepend(glass.element);
        new ResizeObserver(() => glass && glass.updateSizeFromDOM()).observe(header);
    }

    // New snapshot when the page reflows (width change, late images or fonts)
    let lastWidth = window.innerWidth;
    let lastHeight = root.scrollHeight;
    let timer = 0;
    function maybeRefresh() {
        clearTimeout(timer);
        timer = setTimeout(() => {
            if (!desktop.matches) {
                header.classList.remove('has-liquid-glass');
                return;
            }
            if (!glass) { start(); return; }
            if (failed) return;
            if (glass.webglInitialized) header.classList.add('has-liquid-glass');
            const w = window.innerWidth, h = root.scrollHeight;
            if (w === lastWidth && Math.abs(h - lastHeight) < 40) return;
            lastWidth = w; lastHeight = h;
            Container.refreshSnapshot();
        }, 500);
    }
    window.addEventListener('resize', maybeRefresh);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(maybeRefresh);

    start();
})();
