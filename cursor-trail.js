// ===== Cursor Particle Trail System =====
class CursorTrail {
    constructor(options = {}) {
        this.particles = [];
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.isRunning = false;
        this.mouse = { x: 0, y: 0 };
        this.lastMouse = { x: 0, y: 0 };
        
        // Configuration
        this.config = {
            maxParticles: options.maxParticles || 30,
            particleLifespan: options.particleLifespan || 60,
            particleSize: options.particleSize || 4,
            particleColor: options.particleColor || '#00d4ff',
            spawnRate: options.spawnRate || 2,
            enabled: options.enabled !== false
        };
        
        // Only enable on desktop
        if (window.innerWidth > 768 && this.config.enabled) {
            this.init();
        }
    }
    
    init() {
        this.createCanvas();
        this.setupEventListeners();
        this.start();
    }
    
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9999';
        document.body.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.resize();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.resize());
        
        document.addEventListener('mousemove', (e) => {
            this.lastMouse.x = this.mouse.x;
            this.lastMouse.y = this.mouse.y;
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }
    
    spawnParticle() {
        const dx = this.mouse.x - this.lastMouse.x;
        const dy = this.mouse.y - this.lastMouse.y;
        const velocity = Math.sqrt(dx * dx + dy * dy);
        
        if (velocity > 2) {
            for (let i = 0; i < this.config.spawnRate; i++) {
                this.particles.push({
                    x: this.mouse.x + (Math.random() - 0.5) * 10,
                    y: this.mouse.y + (Math.random() - 0.5) * 10,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    life: this.config.particleLifespan,
                    maxLife: this.config.particleLifespan,
                    size: this.config.particleSize * (0.5 + Math.random() * 0.5)
                });
            }
        }
        
        // Remove excess particles
        if (this.particles.length > this.config.maxParticles) {
            this.particles.splice(0, this.particles.length - this.config.maxParticles);
        }
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            
            // Gravity effect
            particle.vy += 0.1;
            
            return particle.life > 0;
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            const opacity = particle.life / particle.maxLife;
            const size = particle.size * opacity;
            
            // Gradient circle
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, size
            );
            
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const color = isDark ? '0, 212, 255' : '43, 88, 118';
            
            gradient.addColorStop(0, `rgba(${color}, ${opacity * 0.8})`);
            gradient.addColorStop(1, `rgba(${color}, 0)`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.spawnParticle();
        this.updateParticles();
        this.drawParticles();
        
        if (this.isRunning) {
            this.animationId = requestAnimationFrame(() => this.animate());
        }
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.animate();
        }
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    destroy() {
        this.stop();
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Initialize cursor trail on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion && window.innerWidth > 768) {
        new CursorTrail({
            maxParticles: 30,
            particleLifespan: 60,
            particleSize: 3,
            spawnRate: 2,
            enabled: true
        });
    }
});
