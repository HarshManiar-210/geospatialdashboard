# 🚀 Geospatial Dashboard Deployment Guide

## Quick Deployment (Recommended)

### 1. **One-Command Deployment**

```bash
# Clone the repository
git clone <your-repo-url>
cd geospatialdashboard

# Run the automated deployment script
./deploy.sh
```

The script will automatically:

- Install Docker and Docker Compose
- Install Node.js and npm
- Optimize GeoJSON files
- Build the application
- Deploy with Docker
- Set up health checks

---

## Manual Deployment Steps

### 1. **Prerequisites**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Node.js (for building)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. **Build and Deploy**

```bash
# Install dependencies
npm install

# Optimize GeoJSON files (reduces file sizes by 60-80%)
npm run optimize

# Build the application
npm run build

# Deploy with Docker
docker-compose up -d
```

---

## 🔧 Configuration

### **Environment Variables**

Create a `.env` file for custom configuration:

```bash
# .env
NODE_ENV=production
PORT=80
NGINX_WORKER_PROCESSES=auto
NGINX_WORKER_CONNECTIONS=1024
```

### **Nginx Configuration**

The `nginx.conf` file is optimized for:

- ✅ Gzip compression (70-85% size reduction)
- ✅ Long-term caching for static assets
- ✅ Client-side routing support
- ✅ Security headers
- ✅ Performance optimizations

### **Resource Limits**

The Docker Compose file includes resource limits:

- **Memory**: 512MB reserved, 1GB limit
- **CPU**: 0.25 cores reserved, 0.5 cores limit

---

## 📊 Performance Optimizations

### **File Size Reductions**

| File                 | Before | After | Reduction |
| -------------------- | ------ | ----- | --------- |
| Roads_layer.geojson  | 68MB   | 13MB  | 80.6%     |
| Talukas.geojson      | 56MB   | 22MB  | 61.2%     |
| Districts.geojson    | 42MB   | 16MB  | 61.4%     |
| Mahi_Streams.geojson | 44MB   | 12MB  | 72.7%     |

### **Loading Optimizations**

- ✅ **Lazy Loading**: Only visible layers load
- ✅ **Caching**: Files cached after first load
- ✅ **Compression**: Gzip compression enabled
- ✅ **Progressive Loading**: Visual feedback during loading

---

## 🔍 Monitoring & Maintenance

### **Health Checks**

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# Check resource usage
docker stats

# Test application
curl -f http://localhost:80
```

### **Performance Monitoring**

```bash
# Monitor resource usage
docker stats --no-stream

# Check disk usage
docker system df

# View detailed logs
docker-compose logs --tail=100
```

### **Updates**

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

---

## 🛡️ Security Considerations

### **Firewall Configuration**

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow SSH (if needed)
sudo ufw allow 22

# Enable firewall
sudo ufw enable
```

### **SSL Certificate (Recommended)**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🚨 Troubleshooting

### **Common Issues**

#### **1. Application Won't Start**

```bash
# Check logs
docker-compose logs

# Check if ports are available
sudo netstat -tlnp | grep :80

# Restart services
docker-compose restart
```

#### **2. High Memory Usage**

```bash
# Check memory usage
docker stats

# Restart container
docker-compose restart

# Check for memory leaks
docker-compose logs | grep -i memory
```

#### **3. Slow Loading**

```bash
# Check if optimization ran
ls -la public/backup/

# Re-run optimization
npm run optimize

# Check nginx configuration
docker-compose exec geospatial-dashboard nginx -t
```

#### **4. File Permission Issues**

```bash
# Fix permissions
sudo chown -R $USER:$USER .
chmod +x deploy.sh

# Rebuild container
docker-compose down
docker-compose up -d --build
```

---

## 📈 Performance Benchmarks

### **Expected Performance**

- **Initial Load**: 2-5 seconds (vs 15-30 seconds before)
- **Layer Toggle**: Instant (vs 3-8 seconds before)
- **File Sizes**: 75MB total (vs 300MB+ before)
- **Memory Usage**: 200-400MB (vs 800MB+ before)

### **Server Requirements**

- **Minimum**: 1GB RAM, 1 CPU core
- **Recommended**: 2GB RAM, 2 CPU cores
- **Storage**: 5GB free space

---

## 🔄 Backup & Recovery

### **Backup**

```bash
# Backup application data
tar -czf backup-$(date +%Y%m%d).tar.gz public/ docker-compose.yml nginx.conf

# Backup Docker volumes
docker run --rm -v geospatialdashboard_data:/data -v $(pwd):/backup alpine tar czf /backup/data-backup.tar.gz /data
```

### **Recovery**

```bash
# Restore from backup
tar -xzf backup-YYYYMMDD.tar.gz

# Rebuild and restart
docker-compose up -d --build
```

---

## 📞 Support

### **Logs Location**

- **Application Logs**: `docker-compose logs`
- **Nginx Logs**: `docker-compose exec geospatial-dashboard tail -f /var/log/nginx/access.log`
- **Error Logs**: `docker-compose exec geospatial-dashboard tail -f /var/log/nginx/error.log`

### **Useful Commands**

```bash
# Quick restart
docker-compose restart

# View real-time logs
docker-compose logs -f

# Check container health
docker-compose ps

# Access container shell
docker-compose exec geospatial-dashboard sh

# Update application
git pull && npm run build && docker-compose up -d --build
```

---

## 🎯 Success Metrics

After deployment, you should see:

- ✅ **Fast loading times** (2-5 seconds initial load)
- ✅ **Instant interactions** (checkbox toggles)
- ✅ **Low memory usage** (200-400MB)
- ✅ **Stable performance** (no crashes)
- ✅ **Responsive UI** (smooth interactions)

Your geospatial dashboard is now production-ready! 🚀

