// ===== Theme Toggle System =====
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Check for saved theme preference or default to system preference
const getSavedTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    
    return 'light';
};

// Initialize theme
const currentTheme = getSavedTheme();
html.setAttribute('data-theme', currentTheme);

// Theme toggle handler
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Dispatch custom event for particle colors update
        document.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: newTheme } }));
        
        // Add transition effect
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    });
}

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        html.setAttribute('data-theme', newTheme);
        document.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: newTheme } }));
    }
});

// ===== Typing Effect =====
class TypingEffect {
    constructor(element, texts, options = {}) {
        this.element = element;
        this.texts = texts;
        this.textIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        this.typeSpeed = options.typeSpeed || 100;
        this.deleteSpeed = options.deleteSpeed || 50;
        this.pauseTime = options.pauseTime || 2000;
        
        this.init();
    }
    
    init() {
        this.element.innerHTML = '<span class="typing-text"></span><span class="typing-cursor"></span>';
        this.textElement = this.element.querySelector('.typing-text');
        this.type();
    }
    
    type() {
        const currentText = this.texts[this.textIndex];
        
        if (this.isDeleting) {
            this.textElement.textContent = currentText.substring(0, this.charIndex - 1);
            this.charIndex--;
        } else {
            this.textElement.textContent = currentText.substring(0, this.charIndex + 1);
            this.charIndex++;
        }
        
        let typeTimeout = this.isDeleting ? this.deleteSpeed : this.typeSpeed;
        
        if (!this.isDeleting && this.charIndex === currentText.length) {
            typeTimeout = this.pauseTime;
            this.isDeleting = true;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.textIndex = (this.textIndex + 1) % this.texts.length;
        }
        
        setTimeout(() => this.type(), typeTimeout);
    }
}

// Initialize typing effect on hero title
document.addEventListener('DOMContentLoaded', () => {
    const typingElement = document.querySelector('[data-typing]');
    if (typingElement) {
        const texts = typingElement.getAttribute('data-typing').split('|');
        new TypingEffect(typingElement, texts, {
            typeSpeed: 100,
            deleteSpeed: 50,
            pauseTime: 2000
        });
    }
});

// ===== 3D Tilt Effect =====
class TiltEffect {
    constructor(elements, options = {}) {
        this.elements = elements;
        this.maxTilt = options.maxTilt || 15;
        this.perspective = options.perspective || 1000;
        this.scale = options.scale || 1.05;
        this.speed = options.speed || 400;
        
        this.init();
    }
    
    init() {
        this.elements.forEach(element => {
            element.style.transformStyle = 'preserve-3d';
            element.style.transition = `transform ${this.speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`;
            
            element.addEventListener('mouseenter', (e) => this.handleMouseEnter(e, element));
            element.addEventListener('mousemove', (e) => this.handleMouseMove(e, element));
            element.addEventListener('mouseleave', (e) => this.handleMouseLeave(e, element));
        });
    }
    
    handleMouseEnter(e, element) {
        element.style.transition = `transform ${this.speed / 2}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`;
    }
    
    handleMouseMove(e, element) {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const percentX = (x - centerX) / centerX;
        const percentY = (y - centerY) / centerY;
        
        const tiltX = percentY * this.maxTilt;
        const tiltY = -percentX * this.maxTilt;
        
        element.style.transform = `perspective(${this.perspective}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${this.scale}, ${this.scale}, ${this.scale})`;
    }
    
    handleMouseLeave(e, element) {
        element.style.transition = `transform ${this.speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`;
        element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }
}

// Initialize 3D tilt on desktop
if (window.innerWidth > 768) {
    document.addEventListener('DOMContentLoaded', () => {
        const tiltElements = document.querySelectorAll('.service-card, .dashboard-widget, .dashboard-card');
        if (tiltElements.length > 0) {
            new TiltEffect(tiltElements, {
                maxTilt: 10,
                perspective: 1000,
                scale: 1.03,
                speed: 400
            });
        }
    });
}

// ===== Animated Counter =====
class AnimatedCounter {
    constructor(element, options = {}) {
        this.element = element;
        this.target = parseInt(element.getAttribute('data-target')) || parseInt(element.textContent.replace(/[^0-9]/g, ''));
        this.duration = options.duration || 2000;
        this.suffix = element.getAttribute('data-suffix') || '';
        this.hasStarted = false;
    }
    
    animate() {
        if (this.hasStarted) return;
        this.hasStarted = true;
        
        const start = 0;
        const increment = this.target / (this.duration / 16);
        let current = start;
        
        const updateCounter = () => {
            current += increment;
            if (current < this.target) {
                this.element.textContent = Math.floor(current).toLocaleString() + this.suffix;
                requestAnimationFrame(updateCounter);
            } else {
                this.element.textContent = this.target.toLocaleString() + this.suffix;
            }
        };
        
        updateCounter();
    }
}

// ===== Scroll Reveal Animations =====
const scrollReveal = () => {
    const reveals = document.querySelectorAll('[data-animate]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Trigger counter animation if element has counter
                if (entry.target.hasAttribute('data-target') || entry.target.querySelector('[data-target]')) {
                    const counterElements = entry.target.hasAttribute('data-target') 
                        ? [entry.target] 
                        : entry.target.querySelectorAll('[data-target]');
                    
                    counterElements.forEach(el => {
                        const counter = new AnimatedCounter(el);
                        counter.animate();
                    });
                }
                
                // Optionally unobserve after animation
                // observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });
    
    reveals.forEach(reveal => observer.observe(reveal));
};

// Initialize scroll reveal
document.addEventListener('DOMContentLoaded', scrollReveal);

// ===== Mobile Menu Toggle =====
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinks = document.getElementById('navLinks');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
    });
});

// ===== Navbar Scroll Effect =====
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// ===== Active Navigation Link =====
const sections = document.querySelectorAll('section[id]');
const navLinksAll = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinksAll.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) {
            link.classList.add('active');
        }
    });
});

// ===== Security Assessment =====
const assessmentBtn = document.getElementById('assessmentBtn');
const assessmentResults = document.getElementById('assessmentResults');
const scoreValue = document.getElementById('scoreValue');
const scoreDescription = document.getElementById('scoreDescription');
const findingsList = document.getElementById('findingsList');
const recommendationsList = document.getElementById('recommendationsList');

if (assessmentBtn) {
    assessmentBtn.addEventListener('click', () => {
        // Get selected values
        const infrastructure = document.querySelector('input[name="infrastructure"]:checked');
        const monitoring = document.querySelector('input[name="monitoring"]:checked');
        
        if (!infrastructure || !monitoring) {
            alert('Please answer all questions to get your assessment.');
            return;
        }
        
        // Calculate score based on selections
        let score = 50; // Base score
        
        // Infrastructure scoring
        if (infrastructure.value === 'multi') score += 15;
        else if (infrastructure.value === 'aws' || infrastructure.value === 'azure' || infrastructure.value === 'gcp') score += 10;
        
        // Monitoring scoring
        if (monitoring.value === 'managed') score += 25;
        else if (monitoring.value === 'automated') score += 20;
        else if (monitoring.value === 'manual') score += 10;
        else if (monitoring.value === 'none') score -= 10;
        
        // Generate findings based on selections
        const findings = [];
        const recommendations = [];
        
        if (infrastructure.value === 'multi') {
            findings.push('<li><i class="fas fa-check-circle"></i> Multi-cloud infrastructure provides redundancy</li>');
        } else {
            findings.push('<li><i class="fas fa-info-circle"></i> Single cloud provider detected</li>');
            recommendations.push('<li>Consider multi-cloud strategy for better resilience</li>');
        }
        
        if (monitoring.value === 'managed') {
            findings.push('<li><i class="fas fa-check-circle"></i> Professional security monitoring in place</li>');
        } else if (monitoring.value === 'automated') {
            findings.push('<li><i class="fas fa-check-circle"></i> Automated security monitoring active</li>');
            recommendations.push('<li>Consider upgrading to managed security service for 24/7 expert support</li>');
        } else if (monitoring.value === 'manual') {
            findings.push('<li><i class="fas fa-exclamation-triangle"></i> Manual security review may miss critical threats</li>');
            recommendations.push('<li>Implement automated threat detection immediately</li>');
        } else {
            findings.push('<li><i class="fas fa-exclamation-triangle"></i> No active security monitoring detected - HIGH RISK</li>');
            recommendations.push('<li>Implement immediate security monitoring solution</li>');
            recommendations.push('<li>Conduct comprehensive security audit</li>');
        }
        
        // Additional universal recommendations
        recommendations.push('<li>Regular security audits and penetration testing</li>');
        recommendations.push('<li>Ensure compliance with industry standards (SOC 2, ISO 27001)</li>');
        recommendations.push('<li>Implement zero-trust security architecture</li>');
        
        // Determine risk level
        let riskLevel = '';
        if (score >= 80) {
            riskLevel = 'Low Risk - Excellent Security Posture';
        } else if (score >= 60) {
            riskLevel = 'Moderate Risk - Good Foundation';
        } else if (score >= 40) {
            riskLevel = 'Elevated Risk - Improvements Needed';
        } else {
            riskLevel = 'High Risk - Immediate Action Required';
        }
        
        // Animate score
        let currentScore = 0;
        const targetScore = score;
        const increment = targetScore / 50;
        
        const scoreInterval = setInterval(() => {
            currentScore += increment;
            if (currentScore >= targetScore) {
                currentScore = targetScore;
                clearInterval(scoreInterval);
            }
            scoreValue.textContent = Math.round(currentScore);
        }, 20);
        
        // Update results
        scoreDescription.textContent = riskLevel;
        findingsList.innerHTML = findings.join('');
        recommendationsList.innerHTML = recommendations.join('');
        
        // Show results with animation
        assessmentResults.style.display = 'block';
        assessmentResults.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
}

// ===== Real-Time Dashboard Updates =====
function updateDashboardMetrics() {
    // Animate threats blocked
    const threatsBlocked = document.getElementById('threatsBlocked');
    if (threatsBlocked) {
        let currentValue = parseInt(threatsBlocked.textContent.replace(/,/g, ''));
        const increment = Math.floor(Math.random() * 5) + 1;
        currentValue += increment;
        threatsBlocked.textContent = currentValue.toLocaleString();
    }
    
    // Randomly update health metrics
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach(bar => {
        const currentWidth = parseInt(bar.style.width);
        const change = Math.floor(Math.random() * 10) - 5; // -5 to +5
        let newWidth = currentWidth + change;
        newWidth = Math.max(20, Math.min(90, newWidth)); // Keep between 20-90%
        bar.style.width = newWidth + '%';
        
        // Update corresponding value text
        const healthItem = bar.closest('.health-item');
        if (healthItem) {
            const valueSpan = healthItem.querySelector('.health-value');
            if (valueSpan) {
                valueSpan.textContent = newWidth + '%';
            }
        }
    });
}

// Update dashboard every 3 seconds
setInterval(updateDashboardMetrics, 3000);

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// ===== Intersection Observer for Animations =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe cards and sections for fade-in animation
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll(
        '.service-card, .dashboard-widget, .question-card, .assessment-results'
    );
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// ===== Simple Chart Animation for Dashboard =====
const chartCanvas = document.getElementById('threatsChart');
if (chartCanvas) {
    const ctx = chartCanvas.getContext('2d');
    const width = chartCanvas.parentElement.clientWidth;
    const height = 150;
    chartCanvas.width = width;
    chartCanvas.height = height;
    
    const dataPoints = 20;
    const data = Array.from({ length: dataPoints }, () => Math.random() * 100);
    
    function drawChart() {
        ctx.clearRect(0, 0, width, height);
        
        // Draw gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0.05)');
        
        ctx.fillStyle = gradient;
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        
        const xStep = width / (dataPoints - 1);
        
        for (let i = 0; i < dataPoints; i++) {
            const x = i * xStep;
            const y = height - (data[i] / 100 * height * 0.8) - 10;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
        
        // Fill area under curve
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();
    }
    
    drawChart();
    
    // Animate chart
    setInterval(() => {
        data.shift();
        data.push(Math.random() * 100);
        drawChart();
    }, 2000);
}

// ===== Console Easter Egg =====
console.log(
    '%c🔒 YuGam Group - Enterprise Security',
    'font-size: 20px; font-weight: bold; color: #6366f1;'
);
console.log(
    '%cSecure your cloud infrastructure with expert solutions.',
    'font-size: 14px; color: #94a3b8;'
);
console.log(
    '%cInterested in joining our team? Email: careers@yugamgroup.com',
    'font-size: 12px; color: #10b981;'
);
