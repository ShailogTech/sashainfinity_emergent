# 🚀 START THE ADMIN PANEL NOW

## Step-by-Step Instructions

### **Step 1: Open Two Terminals**

You need two separate terminal windows:
- **Terminal 1** - For Backend (port 8000)
- **Terminal 2** - For Frontend (port 3000)

---

### **Step 2: Start Backend (Terminal 1)**

```bash
# Navigate to backend directory
cd C:/Users/dvshr/OneDrive/Documents/DEVESH/sashainfinity_emergent/backend

# Install dependencies (first time only)
pip install python-dotenv fastapi uvicorn motor pydantic

# Start backend server
python -m uvicorn server:app --reload --port 8000
```

**Wait until you see:**
```
Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

---

### **Step 3: Start Frontend (Terminal 2)**

```bash
# Navigate to frontend directory
cd C:/Users/dvshr/OneDrive/Documents/DEVESH/sashainfinity_emergent/frontend

# Install dependencies (first time only)
yarn install

# Start frontend server
yarn start
```

**Wait until you see:**
```
Compiled successfully!
You can now view frontend in the browser.
  Local:            http://localhost:3000
```

---

### **Step 4: Open Admin Panel**

Open your web browser and go to:

```
http://localhost:3000/admin
```

---

## 🎯 What You'll See

### **Admin Dashboard:**
- 📊 Total users, courses, blog posts
- 💰 Revenue tracking
- 🕐 Recent activity
- 📈 Growth statistics

### **Admin Features:**
- **Dashboard** - `/admin`
- **Course Management** - `/admin/courses`
- **User Management** - `/admin/users`

---

## 🔥 Quick Reference

| What | URL | Port |
|------|-----|------|
| **Admin Panel** | http://localhost:3000/admin | 3000 |
| **Main Site** | http://localhost:3000 | 3000 |
| **Backend API** | http://localhost:8000/api | 8000 |
| **API Docs** | http://localhost:8000/docs | 8000 |

---

## 🛑 How to Stop

**Press `Ctrl+C` in both terminals** to stop the servers.

---

## ❌ Troubleshooting

### **"Port already in use" error:**
```bash
# Windows - Find and kill process on port 8000
netstat -ano | findstr ":8000"
taskkill /PID <PID> /F

# Windows - Find and kill process on port 3000
netstat -ano | findstr ":3000"
taskkill /PID <PID> /F
```

### **"Module not found" error:**
```bash
# Make sure you installed dependencies:
cd backend
pip install python-dotenv fastapi uvicorn motor pydantic

cd ../frontend
yarn install
```

### **MongoDB connection error:**
```bash
# The admin panel works without MongoDB!
# It currently uses mock data for demonstration.
```

---

## ✅ Success Checklist

- [ ] Terminal 1 shows backend running on port 8000
- [ ] Terminal 2 shows frontend running on port 3000
- [ ] Browser opens http://localhost:3000/admin
- [ ] Admin dashboard is visible
- [ ] Can navigate to /admin/courses and /admin/users

---

**Start now! Open two terminals and follow the steps above.**

Your admin panel will be live in under 2 minutes! 🚀
