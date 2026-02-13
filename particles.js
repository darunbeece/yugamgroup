// ===== Particle Network Animation System =====
class ParticleNetwork {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.animationId = null;
        this.isRunning = false;
        
        // Configuration
        this.config = {
            particleCount: options.particleCount || 80,
            particleSpeed: options.particleSpeed || 0.5,
            connectionDistance: options.connectionDistance || 150,
            particleSize: options.particleSize || 2,
            lineWidth: options.lineWidth || 1,
            particleColor: options.particleColor || '#00d4ff',
            lineColor: options.lineColor || '#00d4ff',
            mouseRadius: options.mouseRadius || 200,
            mouseRepel: options.mouseRepel || false,
        };
        
        this.mouse = {
            x: null,
            y: null,
            radius: this.config.mouseRadius
        };
        
        this.init();
    }
    
    init() {
        this.resize();
        this.createParticles();
        this.setupEventListeners();
        this.start();
    }
    
    resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        this.width = rect.width;
        this.height = rect.height;
    }
    
    createParticles() {
        this.particles = [];
        const area = this.width * this.height;
        const particleCount = Math.floor(area / 15000 * this.config.particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * this.config.particleSpeed,
                vy: (Math.random() - 0.5) * this.config.particleSpeed,
                radius: this.config.particleSize
            });
        }
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resize();
            this.createParticles();
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            // Mouse interaction
            if (this.mouse.x !== null && this.mouse.y !== null) {
                const dx = this.mouse.x - particle.x;
                const dy = this.mouse.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.mouse.radius) {
                    const force = (this.mouse.radius - distance) / this.mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    
                    if (this.config.mouseRepel) {
                        particle.vx -= Math.cos(angle) * force * 0.5;
                        particle.vy -= Math.sin(angle) * force * 0.5;
                    } else {
                        particle.vx += Math.cos(angle) * force * 0.2;
                        particle.vy += Math.sin(angle) * force * 0.2;
                    }
                }
            }
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Boundary collision
            if (particle.x < 0 || particle.x > this.width) {
                particle.vx *= -1;
                particle.x = Math.max(0, Math.min(this.width, particle.x));
            }
            if (particle.y < 0 || particle.y > this.height) {
                particle.vy *= -1;
                particle.y = Math.max(0, Math.min(this.height, particle.y));
            }
            
            // Damping
            particle.vx *= 0.99;
            particle.vy *= 0.99;
            
            // Ensure minimum movement
            if (Math.abs(particle.vx) < 0.1) particle.vx = (Math.random() - 0.5) * this.config.particleSpeed;
            if (Math.abs(particle.vy) < 0.1) particle.vy = (Math.random() - 0.5) * this.config.particleSpeed;
        });
    }
    
    drawParticles() {
        this.ctx.fillStyle = this.config.particleColor;
        
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.config.connectionDistance) {
                    const opacity = 1 - (distance / this.config.connectionDistance);
                    this.ctx.strokeStyle = `${this.config.lineColor}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
                    this.ctx.lineWidth = this.config.lineWidth;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.updateParticles();
        this.drawConnections();
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
        window.removeEventListener('resize', this.resize);
    }
}

// Initialize particle network on page load
document.addEventListener('DOMContentLoaded', () => {
    const particleCanvases = document.querySelectorAll('.particle-canvas');
    
    particleCanvases.forEach(canvas => {
        // Get theme-aware colors
        const getThemeColors = () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            return {
                particleColor: isDark ? '#00d4ff' : '#2B5876',
                lineColor: isDark ? '#00d4ff' : '#2B5876',
            };
        };
        
        const colors = getThemeColors();
        
        const network = new ParticleNetwork(canvas, {
            particleCount: window.innerWidth < 768 ? 40 : 80,
            particleSpeed: 0.3,
            connectionDistance: 150,
            particleSize: 2,
            lineWidth: 1,
            particleColor: colors.particleColor,
            lineColor: colors.lineColor,
            mouseRadius: 200,
            mouseRepel: false
        });
        
        // Pause animation when not visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    network.start();
                } else {
                    network.stop();
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(canvas);
        
        // Update colors on theme change
        document.addEventListener('themeChange', () => {
            const newColors = getThemeColors();
            network.config.particleColor = newColors.particleColor;
            network.config.lineColor = newColors.lineColor;
        });
    });
});
