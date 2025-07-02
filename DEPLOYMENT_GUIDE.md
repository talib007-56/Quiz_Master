# 🚀 Quiz Master Deployment Guide

This guide will help you deploy your Quiz Master application to production using modern cloud platforms.

## 📋 Architecture Overview

- **Frontend**: React/Vite app deployed on Vercel
- **Backend**: Node.js/Express API deployed on Railway
- **Database**: MongoDB Atlas (Cloud)
- **Redis**: Railway Redis or Upstash Redis
- **Email**: Gmail SMTP or SendGrid

## 🏗️ Deployment Architecture

```
Frontend (Vercel) → Backend (Railway) → Database (MongoDB Atlas)
                            ↓
                    Redis (Railway/Upstash)
```

## 🎯 Step-by-Step Deployment

### **Phase 1: Database Setup (MongoDB Atlas)**

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free account
   - Create a new cluster (choose free tier)

2. **Configure Database**
   - Create a database named `quiz-master`
   - Create a database user with read/write permissions
   - Get your connection string

3. **Network Access**
   - Add IP address `0.0.0.0/0` (allow from anywhere)
   - Or add specific IPs for better security

### **Phase 2: Backend Deployment (Railway)**

1. **Create Railway Account**
   - Go to [Railway](https://railway.app)
   - Sign up with GitHub
   - Create a new project

2. **Deploy Backend**
   ```bash
   # Clone your repository (if not already)
   git clone https://github.com/yourusername/quiz-master.git
   cd quiz-master
   
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Initialize Railway project
   railway init
   
   # Deploy backend
   cd backend
   railway up
   ```

3. **Set Environment Variables in Railway**
   Go to your Railway project dashboard and add:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/quiz-master
   JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_characters
   JWT_EXPIRES_IN=24h
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   REDIS_URL=redis://localhost:6379
   ```

4. **Add Redis to Railway**
   - In Railway dashboard, add Redis service
   - Copy the Redis URL and update `REDIS_URL` environment variable

### **Phase 3: Frontend Deployment (Vercel)**

1. **Create Vercel Account**
   - Go to [Vercel](https://vercel.com)
   - Sign up with GitHub
   - Import your repository

2. **Configure Frontend**
   - Select the `frontend` folder as root directory
   - Set build command: `npm run build`
   - Set output directory: `dist`

3. **Set Environment Variables in Vercel**
   ```
   VITE_API_URL=https://your-backend-domain.railway.app/api
   VITE_APP_NAME=Quiz Master
   VITE_APP_VERSION=1.0.0
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your frontend

### **Phase 4: Update CORS Configuration**

1. **Update Backend Environment Variables**
   - In Railway, update `FRONTEND_URL` with your Vercel domain
   - Example: `FRONTEND_URL=https://quiz-master-frontend.vercel.app`

2. **Redeploy Backend**
   - Railway will automatically redeploy with new environment variables

## 🔧 Alternative Deployment Options

### **Option A: Render (Alternative to Railway)**

1. **Backend on Render**
   - Go to [Render](https://render.com)
   - Create Web Service from GitHub
   - Select backend folder
   - Set environment variables
   - Deploy

2. **Redis on Render**
   - Add Redis service in Render
   - Update `REDIS_URL` environment variable

### **Option B: Netlify (Alternative to Vercel)**

1. **Frontend on Netlify**
   - Go to [Netlify](https://netlify.com)
   - Connect GitHub repository
   - Set build settings:
     - Base directory: `frontend`
     - Build command: `npm run build`
     - Publish directory: `frontend/dist`

### **Option C: Full Docker Deployment**

1. **Create Docker Compose**
   ```yaml
   version: '3.8'
   services:
     backend:
       build: ./backend
       ports:
         - "5001:5001"
       environment:
         - NODE_ENV=production
         - MONGODB_URI=mongodb://mongo:27017/quiz-master
         - REDIS_URL=redis://redis:6379
       depends_on:
         - mongo
         - redis
     
     frontend:
       build: ./frontend
       ports:
         - "80:80"
       depends_on:
         - backend
     
     mongo:
       image: mongo:latest
       ports:
         - "27017:27017"
       volumes:
         - mongo_data:/data/db
     
     redis:
       image: redis:alpine
       ports:
         - "6379:6379"
   
   volumes:
     mongo_data:
   ```

2. **Deploy with Docker**
   ```bash
   docker-compose up -d
   ```

## 🔐 Security Configuration

### **Environment Variables Setup**

**Backend (.env)**
```env
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRES_IN=24h
FRONTEND_URL=https://your-frontend-domain.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
REDIS_URL=your_redis_connection_string
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend (.env)**
```env
VITE_API_URL=https://your-backend-domain.railway.app/api
VITE_APP_NAME=Quiz Master
VITE_APP_VERSION=1.0.0
```

## 📧 Email Configuration

### **Gmail Setup**
1. Enable 2-Factor Authentication
2. Generate App Password
3. Use App Password in `SMTP_PASS`

### **SendGrid Alternative**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
```

## 🚀 Deployment Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Backend deployed on Railway with all environment variables
- [ ] Redis service added to Railway
- [ ] Frontend deployed on Vercel with correct API URL
- [ ] CORS configured with production frontend URL
- [ ] Email SMTP configured and tested
- [ ] SSL certificates enabled (automatic on Vercel/Railway)
- [ ] Domain names configured (optional)
- [ ] Monitoring and logs configured

## 📊 Monitoring & Maintenance

### **Health Checks**
- Backend: `https://your-backend-domain.railway.app/`
- API: `https://your-backend-domain.railway.app/api/`

### **Logs**
- Railway: View logs in Railway dashboard
- Vercel: View logs in Vercel dashboard

### **Performance Monitoring**
- Set up monitoring with Railway/Vercel built-in tools
- Consider adding services like LogRocket or Sentry for error tracking

## 🆘 Troubleshooting

### **Common Issues**

1. **CORS Errors**
   - Check `FRONTEND_URL` environment variable
   - Ensure backend allows your frontend domain

2. **Database Connection**
   - Verify MongoDB Atlas connection string
   - Check network access settings

3. **API Not Responding**
   - Check Railway logs
   - Verify environment variables
   - Check Redis connection

4. **Build Failures**
   - Check package.json scripts
   - Verify Node.js version compatibility

## 💡 Cost Optimization

### **Free Tier Limits**
- **Vercel**: 100GB bandwidth, 1000 builds/month
- **Railway**: 500 hours/month, 1GB RAM, 1GB storage
- **MongoDB Atlas**: 512MB storage, shared clusters
- **Upstash Redis**: 10,000 commands/day

### **Scaling Tips**
- Use CDN for static assets
- Implement caching strategies
- Optimize database queries
- Use compression middleware

---

## 🎉 Your Quiz Master is Now Live!

Once deployed, your application will be accessible at:
- **Frontend**: `https://your-frontend-domain.vercel.app`
- **Backend API**: `https://your-backend-domain.railway.app/api`

For any deployment issues, check the platform-specific documentation or reach out for support! 