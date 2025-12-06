# YuGam Group - Enterprise Cloud & Security Solutions

A modern, premium website for YuGam Group, a leading enterprise cloud security consulting firm. This website showcases comprehensive security services, real-time monitoring capabilities, and expert solutions for cloud infrastructure protection.

## 🌟 Features

### Interactive Elements
- **Security Risk Assessment Tool** - 2-minute interactive assessment that provides personalized security recommendations
- **Real-Time Security Dashboard** - Live metrics showing threat detection, system health, and compliance status
- **Animated Charts** - Dynamic visualization of security metrics using Canvas API
- **Smooth Animations** - Premium micro-interactions and transitions throughout the site

### Pages
1. **Home** (`index.html`)
   - Hero section with animated background
   - Interactive security assessment
   - Real-time dashboard preview
   - Services overview
   - Contact CTA

2. **Services** (`services.html`)
   - Detailed service descriptions with pricing
   - Security Audits & Penetration Testing
   - Cloud Migration Services
   - Compliance Management
   - 24/7 Security Monitoring

3. **About** (`about.html`)
   - Company mission and values
   - Leadership team profiles
   - Company timeline
   - Certifications and partnerships

### Design Features
- **Dark Theme** - Modern, professional dark color scheme
- **Glassmorphism** - Frosted glass effects with backdrop blur
- **Gradient Accents** - Vibrant gradient overlays and text effects
- **Responsive Design** - Fully responsive across all devices
- **Custom Animations** - Smooth transitions, hover effects, and scroll animations
- **Grid Backgrounds** - Animated grid patterns for visual depth

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- **Docker** (recommended) - [Install Docker](https://docs.docker.com/get-docker/)
- OR Python 3 for local development server

### Quick Start with Docker (Recommended)

The easiest way to run the website is using Docker:

```bash
# Navigate to the repository
cd YugamGroup

# Build and start the container
docker-compose up -d

# The website will be available at:
# http://localhost:8080
```

**Docker Commands:**
```bash
# Stop the container
docker-compose down

# Rebuild after changes
docker-compose up -d --build

# View logs
docker-compose logs -f

# Remove container and image
docker-compose down --rmi all
```

### Alternative: Local Development Server

If you prefer not to use Docker:

1. Clone this repository:
```bash
git clone <repository-url>
cd YugamGroup
```

2. Open the website:
```bash
# Simply open index.html in your browser
open index.html

# Or use a local server (recommended)
python3 -m http.server 8000
# Visit http://localhost:8000
```

### File Structure
```
YugamGroup/
├── index.html          # Homepage
├── services.html       # Services page
├── about.html          # About page
├── styles.css          # Complete stylesheet
├── script.js           # Interactive functionality
└── README.md          # This file
```

## 🎨 Design System

### Color Palette
- **Primary**: `#6366f1` (Indigo)
- **Secondary**: `#06b6d4` (Cyan)
- **Accent**: `#f59e0b` (Amber)
- **Background**: Dark slate with gradient overlays
- **Text**: Light grays for excellent readability

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800

### Key Features
- CSS Variables for easy theming
- Mobile-first responsive design
- Smooth transitions and animations
- Accessible color contrasts

## 📱 Responsive Breakpoints

- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: < 768px
- **Small Mobile**: < 480px

## ⚡ Performance

- Pure vanilla JavaScript (no frameworks)
- Optimized CSS with efficient selectors
- Minimal external dependencies
- Font Awesome icons via CDN
- Google Fonts with display=swap

## 🔧 Customization

### Update Company Information
Edit the contact details in the footer and CTA sections:
- Phone: `224 442 0650`
- Email: `info@yugamgroup.com`
- Locations: Chicago, São Paulo, Mumbai

### Modify Colors
Update CSS variables in `styles.css`:
```css
:root {
    --primary: #6366f1;
    --secondary: #06b6d4;
    /* ... more variables */
}
```

### Add New Services
Follow the pattern in `services.html`:
```html
<div class="service-detail">
    <!-- Service content -->
</div>
```

## 📊 Interactive Features

### Security Assessment
The assessment tool in `index.html` calculates a security score based on:
- Cloud infrastructure setup (AWS, Azure, GCP, Multi-Cloud)
- Security monitoring approach (Manual, Automated, Managed, None)

### Real-Time Dashboard
The dashboard automatically updates every 3 seconds with:
- Simulated threat detection metrics
- System health monitoring
- Resource usage percentages

### Chart Animation
Canvas-based chart in the dashboard section updates in real-time with procedurally generated data.

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

© 2024 YuGam Group. All rights reserved.

## 🤝 Contributing

This is a proprietary website for YuGam Group. For questions or modifications, please contact the development team.

## 📞 Contact

- **Phone**: [224 442 0650](tel:224-442-0650)
- **Email**: info@yugamgroup.com
- **Locations**: Chicago, Illinois | São Paulo, Brazil | Mumbai, India

---

**Built with ❤️ using modern web technologies**
# yugamgroup
