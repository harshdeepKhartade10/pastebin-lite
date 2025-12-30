# 📁 Environment Files

## 🎯 Only 2 Environment Files

### **Backend: `backend/.env`**
```env
REDIS_URL=redis://:qKnPPX5ZjoSsgnkW2qIfsrvDR0rtUaBl@redis-10037.crce217.ap-south-1-1.ec2.cloud.redislabs.com:10037
NODE_ENV=production
TEST_MODE=0
PORT=10000
BASE_URL=https://pastebin-lite-phi.vercel.app
USE_MEMORY_STORE=false
```

### **Frontend: `frontend/.env`**
```env
VITE_API_URL=https://pastebin-lite-backend-6uu2.onrender.com
VITE_BASE_URL=https://pastebin-lite-phi.vercel.app
```

---

## 🔧 How Variables Are Used

### **Backend Files Access:**
- `server.js` → `process.env.BASE_URL`
- `server.js` → `process.env.REDIS_URL`
- `server.js` → `process.env.NODE_ENV`
- `server.js` → `process.env.PORT`

### **Frontend Files Access:**
- `src/services/api.js` → `import.meta.env.VITE_API_URL`
- `src/pages/HomePage.jsx` → `import.meta.env.VITE_API_URL`

---

## 🌐 Environment Setup

### **For Production (Deployed):**
- Use the exact values shown above
- Set same variables on Render and Vercel dashboards

### **For Local Development:**
- Backend: Change `BASE_URL=http://localhost:5173`
- Frontend: Change `VITE_API_URL=http://localhost:3001`

---

## 🧪 Testing

```bash
# Test deployed backend
node test-api.js

# Test local backend (uncomment line 8 in test-api.js)
node test-api.js
```

---

## 📋 Setup Commands

```bash
# Clean up and set environment
node clean-env.js

# Test the setup
node test-api.js
```

**🚀 Simple, clean, and consistent!**
