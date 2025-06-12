# 🚀 AlphaScroll Deployment Guide

## Quick Deploy Links

### Frontend (React App)
- **Vercel**: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/alphascroll&project-name=alphascroll&root-directory=src/webapp)
- **Netlify**: [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/alphascroll)

### Backend (API Server)
- **Railway**: [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)
- **Render**: [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

---

## 🎯 Frontend Deployment (Vercel - Recommended)

### Option 1: One-Click Deploy
1. Click the Vercel deploy button above
2. Connect your GitHub account
3. Set build settings:
   - **Root Directory**: `src/webapp`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Deploy!

### Option 2: Manual Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend
cd src/webapp

# Deploy
vercel --prod
```

**Live URL**: Your app will be available at `https://alphascroll-[random].vercel.app`

---

## 🔧 Backend Deployment (Railway - Recommended)

### Option 1: Railway Deploy
1. Go to [Railway.app](https://railway.app)
2. Connect GitHub and select your repo
3. Railway will auto-detect Node.js
4. Set environment variables:
   ```
   NODE_ENV=production
   PORT=3003
   COINGECKO_API_KEY=your_key_here
   OPENAI_API_KEY=your_key_here
   ```
5. Deploy!

### Option 2: Docker Deploy
```bash
# Build image
docker build -t alphascroll-api .

# Run container
docker run -p 3003:3003 -e NODE_ENV=production alphascroll-api
```

**API URL**: Your API will be available at `https://alphascroll-api-[random].railway.app`

---

## 🔗 Connect Frontend to Deployed API

Update your frontend API base URL:

```typescript
// src/webapp/src/api/alphaService.ts
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-domain.railway.app'
  : 'http://localhost:3003';
```

---

## 🌍 Environment Variables

### Frontend (.env)
```bash
VITE_API_URL=https://your-api-domain.railway.app
VITE_APP_NAME=AlphaScroll
```

### Backend (.env)
```bash
NODE_ENV=production
PORT=3003
COINGECKO_API_KEY=your_coingecko_key
OPENAI_API_KEY=your_openai_key
XMTP_PRIVATE_KEY=your_xmtp_private_key
```

---

## 📱 Platform Support

- ✅ **Web**: Deployed and live
- 🔄 **iOS**: React Native conversion in progress
- 🔄 **Android**: React Native conversion in progress

---

## 🚀 Live Demo

- **Frontend**: https://alphascroll.vercel.app
- **API**: https://alphascroll-api.railway.app
- **Health Check**: https://alphascroll-api.railway.app/health

---

## 🔧 Troubleshooting

### Common Issues:
1. **CORS Errors**: Ensure API URL is correctly set in frontend
2. **Build Failures**: Check Node.js version (requires 18+)
3. **API Timeouts**: Verify environment variables are set
4. **Missing Dependencies**: Run `npm install` in both directories

### Support:
- Check deployment logs in Vercel/Railway dashboard
- Test API endpoints directly: `curl https://your-api.railway.app/health`
- Verify environment variables are properly set 