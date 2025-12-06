# 🐳 Docker Quick Start Guide

## Running the YuGam Group Website with Docker

### ✅ One-Command Setup

```bash
docker-compose up -d
```

**That's it!** The website is now running at: **http://localhost:8080**

---

## 📋 Common Commands

### Start the Website
```bash
docker-compose up -d
```

### Stop the Website
```bash
docker-compose down
```

### Rebuild After Code Changes
```bash
docker-compose up -d --build
```

### View Logs
```bash
docker-compose logs -f
```

### Check Container Status
```bash
docker ps
```

### Complete Cleanup (Remove Everything)
```bash
docker-compose down --rmi all --volumes
```

---

## 🔧 Technical Details

### What's Inside?

- **Base Image**: `nginx:alpine` (lightweight, ~23MB)
- **Web Server**: Nginx with optimized configuration
- **Port Mapping**: 8080 (host) → 80 (container)
- **Features**:
  - ✅ Gzip compression enabled
  - ✅ Static asset caching (1 year)
  - ✅ Security headers configured
  - ✅ Custom error pages

### File Structure
```
├── Dockerfile           # Container build instructions
├── docker-compose.yml   # Container orchestration
├── nginx.conf          # Web server configuration
└── .dockerignore       # Build context exclusions
```

---

## 🎯 Accessing the Website

Once the container is running:

- **Homepage**: http://localhost:8080
- **Services**: http://localhost:8080/services.html
- **About**: http://localhost:8080/about.html

---

## 🐛 Troubleshooting

### Container Won't Start
```bash
# Check if port 8080 is already in use
lsof -i :8080

# Kill the process using the port
kill -9 <PID>

# Or change the port in docker-compose.yml
# Change "8080:80" to "8081:80" or any other available port
```

### Website Not Loading
```bash
# Check container logs
docker-compose logs

# Restart the container
docker-compose restart

# Rebuild from scratch
docker-compose down
docker-compose up -d --build
```

### Permission Issues
```bash
# On Mac/Linux, ensure Docker Desktop is running
# On Linux, you may need to use sudo:
sudo docker-compose up -d
```

---

## 🚀 Production Deployment

For production deployment, consider:

1. **Use a proper domain**: Update nginx.conf `server_name`
2. **Enable HTTPS**: Add SSL certificates and update ports
3. **Use Docker Hub**: Push image to registry
4. **Environment Variables**: Externalize configuration
5. **Health Checks**: Add health check endpoints
6. **Monitoring**: Integrate with monitoring tools

---

## 📊 Performance

**Container Specs:**
- Image Size: ~23MB (alpine-based)
- Memory Usage: ~10-20MB
- Startup Time: <2 seconds
- Request Latency: <5ms (local)

**Optimizations Applied:**
- Gzip compression for text assets
- Browser caching (1 year for static assets)
- Minimal Docker layers
- Alpine Linux base (smaller footprint)

---

## 🆘 Need Help?

- **Docker Issues**: Visit [Docker Documentation](https://docs.docker.com/)
- **Nginx Configuration**: Check [Nginx Docs](https://nginx.org/en/docs/)
- **Website Issues**: Contact YuGam Group support

---

**Last Updated**: November 23, 2024  
**Container Version**: 1.0.0
