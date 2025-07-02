# 🔗 MongoDB Connection String Setup Guide

## 📍 **Where to Add Your Connection String**

### **Step 1: Get Your MongoDB Atlas Connection String**

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free account and cluster
   - Click "Connect" on your cluster

2. **Get Connection String**
   - Choose "Connect your application"
   - Select "Node.js" and version "4.1 or later"
   - Copy the connection string (looks like this):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

3. **Replace Placeholders**
   - Replace `<username>` with your database username
   - Replace `<password>` with your database password
   - Add `/quiz-master` before the `?` to specify the database name

   **Final format:**
   ```
   mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/quiz-master?retryWrites=true&w=majority
   ```

---

## 🎯 **Where to Add the Connection String**

### **Option 1: Local Development**

**File: `backend/.env`**
```env
# Replace the MongoDB URI with your Atlas connection string
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/quiz-master?retryWrites=true&w=majority

# Other required variables
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_characters
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
REDIS_URL=redis://localhost:6379
```

**How to create this file:**
```bash
# Copy the example file
cp backend/.env.example backend/.env

# Then edit backend/.env and replace the MONGODB_URI value
```

---

### **Option 2: Railway Deployment**

**In Railway Dashboard:**
1. Go to your Railway project
2. Click on your backend service
3. Go to "Variables" tab
4. Add these environment variables:

```
MONGODB_URI = mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/quiz-master?retryWrites=true&w=majority
NODE_ENV = production
JWT_SECRET = your_super_secret_jwt_key_here_minimum_32_characters
JWT_EXPIRES_IN = 24h
FRONTEND_URL = https://your-frontend-domain.vercel.app
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_SECURE = false
SMTP_USER = your_email@gmail.com
SMTP_PASS = your_gmail_app_password
REDIS_URL = redis://red-xxxxx:6379
```

---

### **Option 3: Render Deployment**

**In Render Dashboard:**
1. Go to your web service
2. Click "Environment"
3. Add these environment variables:

```
MONGODB_URI = mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/quiz-master?retryWrites=true&w=majority
NODE_ENV = production
JWT_SECRET = your_super_secret_jwt_key_here_minimum_32_characters
JWT_EXPIRES_IN = 24h
FRONTEND_URL = https://your-frontend-domain.netlify.app
```

---

### **Option 4: Docker Deployment**

**File: `docker-compose.yml`**

Update the backend service environment section:
```yaml
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile
  ports:
    - "5001:5001"
  environment:
    - NODE_ENV=production
    - PORT=5001
    - MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/quiz-master?retryWrites=true&w=majority
    - JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_characters
    - JWT_EXPIRES_IN=24h
    - FRONTEND_URL=http://localhost
    # ... other variables
```

**Or create a `.env` file for Docker Compose:**

**File: `.env` (in root directory)**
```env
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/quiz-master?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_characters
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost
```

Then update `docker-compose.yml` to use the .env file:
```yaml
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile
  ports:
    - "5001:5001"
  env_file:
    - .env
```

---

## 🔧 **Quick Setup Commands**

### **For Local Development:**
```bash
# 1. Create the .env file
cp backend/.env.example backend/.env

# 2. Edit the file (replace YOUR_CONNECTION_STRING)
echo "MONGODB_URI=YOUR_CONNECTION_STRING_HERE" > backend/.env
```

### **For Testing Connection:**
```bash
# Test if your connection string works
cd backend
node -e "
const mongoose = require('mongoose');
mongoose.connect('YOUR_CONNECTION_STRING_HERE')
  .then(() => { console.log('✅ Connected to MongoDB!'); process.exit(0); })
  .catch((err) => { console.log('❌ Connection failed:', err.message); process.exit(1); });
"
```

---

## 🛡️ **Security Best Practices**

1. **Never commit `.env` files to git** (already in .gitignore)
2. **Use different databases for different environments**:
   - Development: `quiz-master-dev`
   - Production: `quiz-master-prod`
   - Testing: `quiz-master-test`

3. **Create database-specific users** with minimal required permissions
4. **Enable MongoDB Atlas IP whitelisting** for production
5. **Use environment-specific connection strings**

---

## 🚨 **Common Issues & Solutions**

### **Issue 1: "Authentication failed"**
- **Solution**: Check username and password in connection string
- **Check**: User has correct permissions for the database

### **Issue 2: "Network timeout"**
- **Solution**: Add `0.0.0.0/0` to IP whitelist in MongoDB Atlas
- **Check**: Firewall settings

### **Issue 3: "Database not found"**
- **Solution**: Make sure `/quiz-master` is in the connection string
- **Check**: Database name matches your application

### **Issue 4: "Connection string format"**
- **Wrong**: `mongodb://...`
- **Correct**: `mongodb+srv://...` (for Atlas)

---

## 🎯 **Connection String Examples**

### **Local MongoDB:**
```
mongodb://localhost:27017/quiz-master
```

### **MongoDB Atlas (Cloud):**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/quiz-master?retryWrites=true&w=majority
```

### **MongoDB with Authentication:**
```
mongodb://username:password@localhost:27017/quiz-master
```

### **MongoDB Atlas with Additional Options:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/quiz-master?retryWrites=true&w=majority&appName=QuizMaster
```

---

## ✅ **Quick Verification**

After adding your connection string, verify it works:

```bash
cd backend
npm start
```

You should see:
```
✅ Connected to MongoDB
✅ Server running on port 5001
```

If you see connection errors, double-check your connection string format and credentials. 