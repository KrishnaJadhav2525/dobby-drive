# Setup and Run Instructions for Dobby Drive

## Prerequisites

1. **Node.js** (v14+) - Install from https://nodejs.org
2. **MongoDB** - Either:
   - Install locally from https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas cloud: https://www.mongodb.com/cloud/atlas

## Quick Start

### 1. MongoDB Setup

If using local MongoDB, ensure it's running:
```bash
# Windows (if installed as a service, it should start automatically)
# Or start MongoDB manually:
mongod

# Check if MongoDB is running on localhost:27017
```

If using MongoDB Atlas:
- Create a free account at https://www.mongodb.com/cloud/atlas
- Create a cluster and copy your connection string
- Update `MONGO_URI` in `backend/.env`

### 2. Backend Setup and Run

**Terminal 1 - Backend Server:**
```bash
cd backend
npm install  # (Skip if already done)
npm run dev  # This starts the Express server with hot reload
```

Expected output:
```
✅ Connected to MongoDB
🚀 Server running on port 5000
```

### 3. Frontend Setup and Run

**Terminal 2 - Frontend Dev Server:**
```bash
cd frontend
npm install  # (Skip if already done)
npm run dev  # This starts the Vite dev server
```

Expected output:
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

The browser should automatically open to `http://localhost:5173`

## Using the Application

### First Time Users

1. Click **Sign Up** and create an account:
   - Name: Your Name
   - Email: youremail@example.com
   - Password: Your password (min 6 characters)

2. After signup, you're automatically logged in and redirected to the dashboard

### Test Account (Optional Pre-created)

Once you've set up, you can create test accounts or use:
- Email: test@example.com
- Password: test@123

### Dashboard Features

1. **Create Folder**: Click "+ New Folder" to create folders in the current location
2. **Upload Image**: Click "+ Upload Image" to upload image files
3. **Navigate**: Click any folder to enter it
4. **Breadcrumb**: Use the path at the top to navigate back
5. **Folder Size**: View total size of the folder including nested contents
6. **Delete**: Use the trash icon to delete folders or images

## API Testing (Optional)

### Get a token:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test@123"}'
```

### Create a folder:
```bash
curl -X POST http://localhost:5000/api/folders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Folder"}'
```

### Get all root folders:
```bash
curl http://localhost:5000/api/folders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## MCP Server (Bonus Feature)

To run the MCP server for Claude Desktop integration:

**Terminal 3 - MCP Server:**
```bash
cd backend
npm run mcp
```

This enables Claude Desktop to interact with Dobby Drive through natural language.

## Troubleshooting

### MongoDB Connection Error
- **Error**: "MongoDB connection error"
- **Solution**: 
  1. Ensure MongoDB is running (check if `mongod` is running)
  2. Verify connection string in `backend/.env` is correct
  3. If using MongoDB Atlas, whitelist your IP and ensure the connection string includes credentials

### Port Already in Use
- **Error**: "Port 5000 is already in use" or "Port 5173 is already in use"
- **Solution**:
  1. Kill the process using that port
  2. Or change PORT in `backend/.env` and update frontend `api.js`

### CORS Error in Browser
- **Error**: "Access to XMLHttpRequest blocked by CORS policy"
- **Solution**: Ensure the backend `.env` has correct `CLIENT_URL=http://localhost:5173`

### Images not displaying
- **Error**: 404 error for image URLs
- **Solution**: Ensure the `backend/uploads` directory exists (created automatically on first upload)

### Node modules issues
- **Solution**: 
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

## Production Deployment

### For Frontend
```bash
cd frontend
npm run build
# Upload contents of 'dist' folder to your hosting (Vercel, Netlify, etc.)
```

### For Backend
1. Set environment variables in production hosting:
   - PORT (optional)
   - MONGO_URI (production database)
   - JWT_SECRET (strong random string)
   - CLIENT_URL (production frontend URL)

2. Deploy to Node.js hosting (Heroku, Render, Railway, etc.)

3. Ensure MongoDB Atlas is configured for production

## Database Schema

### User Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Folder Collection
```javascript
{
  name: String,
  parent: ObjectId (reference to parent folder, null for root),
  owner: ObjectId (reference to user),
  createdAt: Date,
  updatedAt: Date
}
```

### Image Collection
```javascript
{
  name: String,
  filename: String (stored filename),
  originalname: String,
  mimetype: String,
  size: Number (in bytes),
  folder: ObjectId (reference to folder),
  owner: ObjectId (reference to user),
  createdAt: Date,
  updatedAt: Date
}
```

## Assignment Submission

When submitting, provide:
1. GitHub repository link
2. Working URL (if deployed)
3. Test account credentials:
   - Email: `test@example.com`
   - Password: `test@123`
   (or the credentials you created during testing)

## Need Help?

- Check the browser console (F12) for frontend errors
- Check the terminal output for backend errors
- Refer to README.md for more documentation
- Check API endpoints in `backend/routes/` for details
