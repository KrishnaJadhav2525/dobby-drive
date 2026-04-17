# Dobby Drive - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Ensure MongoDB is Running

**Option A: Local MongoDB**
```bash
# If MongoDB is installed locally, ensure it's running
mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Create account at: https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Copy connection string
- Update `backend/.env` MONGO_URI with your connection string

### Step 2: Start Backend Server

Open **Command Prompt** or **PowerShell**:
```bash
cd "c:\internshala assignments\dobby ads\backend"
npm run dev
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on port 5000
```

### Step 3: Start Frontend Server

Open **another Command Prompt** or **PowerShell**:
```bash
cd "c:\internshala assignments\dobby ads\frontend"
npm run dev
```

You should see:
```
➜  Local:   http://localhost:5173/
```

The browser will automatically open the app.

### Step 4: Test the App

1. **Create Account**: Click "Sign Up"
   - Fill in Name, Email, Password
   - Click "Sign Up"

2. **Create Folder**: Click "+ New Folder"
   - Enter folder name
   - Click "Create Folder"

3. **Upload Image**: Click "+ Upload Image"
   - Choose image file
   - Enter image name
   - Click "Upload Image"

4. **Navigate**: Click folder to enter it
5. **Delete**: Click trash icon

Done! 🎉

---

## Alternative: Use the Startup Script

Simply double-click:
```
START_DEV.bat
```

This will open two command windows and start both servers automatically.

---

## Troubleshooting

### MongoDB Error
**Problem**: "MongoDB connection error"
- Make sure MongoDB is running
- Check `backend/.env` for correct `MONGO_URI`

### Port Already in Use
**Problem**: "Port 5000 is already in use"
- Kill the process using that port
- Or change PORT in `backend/.env`

### CORS Error
**Problem**: "CORS policy" error in browser
- Ensure `backend/.env` has `CLIENT_URL=http://localhost:5173`

### Still Having Issues?
See **SETUP.md** for detailed troubleshooting.

---

## Project Features

✅ **User Authentication** - Register, Login, Logout
✅ **Nested Folders** - Create folders inside folders
✅ **Image Upload** - Upload images to folders  
✅ **Folder Size** - See total size including nested images
✅ **Private Data** - Only see your own folders and images
✅ **Responsive UI** - Works on desktop and tablet

---

## Test Credentials

Create your own account through signup, or test with:
- **Email**: test@example.com
- **Password**: test@123

---

## File Locations

```
Backend:  c:\internshala assignments\dobby ads\backend
Frontend: c:\internshala assignments\dobby ads\frontend
```

---

**Need Help?** Check README.md or SETUP.md for detailed documentation.
