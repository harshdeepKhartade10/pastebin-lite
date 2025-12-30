# 🔧 Environment Setup Guide

## 📁 Environment Files Created

I've created the following environment configuration files for you:

### **Backend Environment Files**
- `backend/.env.production` - Production configuration
- `backend/env.local.example` - Local development template
- `backend/.env` - Will be created by setup script

### **Frontend Environment Files**
- `frontend/.env.production` - Production configuration
- `frontend/env.local.example` - Local development template
- `frontend/.env` - Will be created by setup script

---

## 🚀 Quick Setup

### **Option 1: Automatic Setup (Recommended)**
```bash
node setup-environment.js
```

### **Option 2: Manual Setup**

#### **Backend Setup**
```bash
# Copy production environment
cp backend/.env.production backend/.env

# For local development
cp backend/env.local.example backend/.env.local
```

#### **Frontend Setup**
```bash
# Copy production environment
cp frontend/.env.production frontend/.env

# For local development
cp frontend/env.local.example frontend/.env.local
```

---

## 🌐 Environment Variables

### **Backend (.env)**
```env
REDIS_URL=redis://:qKnPPX5ZjoSsgnkW2qIfsrvDR0rtUaBl@redis-10037.crce217.ap-south-1-1.ec2.cloud.redislabs.com:10037
NODE_ENV=production
PORT=10000
BASE_URL=https://pastebin-lite-phi.vercel.app
USE_MEMORY_STORE=false
TEST_MODE=0
```

### **Frontend (.env)**
```env
VITE_API_URL=https://pastebin-lite-backend-6uu2.onrender.com
VITE_BASE_URL=https://pastebin-lite-phi.vercel.app
```

---

## 🔄 Local vs Production

### **Local Development**
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:5173`
- Use `.env.local` files

### **Production**
- Backend: `https://pastebin-lite-backend-6uu2.onrender.com`
- Frontend: `https://pastebin-lite-phi.vercel.app`
- Use `.env` files

---

## 🎯 Deployment Configuration

### **Render (Backend)**
Set these environment variables in Render Dashboard:
```
REDIS_URL=redis://:qKnPPX5ZjoSsgnkW2qIfsrvDR0rtUaBl@redis-10037.crce217.ap-south-1-1.ec2.cloud.redislabs.com:10037
NODE_ENV=production
PORT=10000
BASE_URL=https://pastebin-lite-phi.vercel.app
USE_MEMORY_STORE=false
TEST_MODE=0
```

### **Vercel (Frontend)**
Set these environment variables in Vercel Dashboard:
```
VITE_API_URL=https://pastebin-lite-backend-6uu2.onrender.com
VITE_BASE_URL=https://pastebin-lite-phi.vercel.app
```

---

## 🧪 Testing

### **Test Production API**
```bash
node test-api.js
```

### **Test Local Development**
1. Uncomment line 8 in `test-api.js`
2. Start backend: `cd backend && npm start`
3. Run tests: `node test-api.js`

---

## 📋 File Structure After Setup

```
d:\Aganitha\
├── backend/
│   ├── .env                    # Production environment
│   ├── .env.local              # Local development
│   ├── .env.production         # Production template
│   └── env.local.example       # Local template
├── frontend/
│   ├── .env                    # Production environment
│   ├── .env.local              # Local development
│   ├── .env.production         # Production template
│   └── env.local.example       # Local template
├── setup-environment.js        # Setup script
└── ENVIRONMENT-SETUP.md        # This guide
```

---

## 🎉 Complete Setup Checklist

- [ ] Run `node setup-environment.js`
- [ ] Verify `.env` files are created
- [ ] Set environment variables on Render
- [ ] Set environment variables on Vercel
- [ ] Test with `node test-api.js`
- [ ] Test full application flow
- [ ] Commit changes to GitHub

---

**🚀 Your project is now fully configured for both local development and production deployment!**
