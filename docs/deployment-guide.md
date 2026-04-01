# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (or MongoDB instance)
- Gemini API key from Google AI Studio
- Vercel account (for frontend)
- Railway/Render account (for backend)

## Environment Variables

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/recruitment?retryWrites=true&w=majority

# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# CORS
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# Umurava API (if available)
UMURAVA_API_URL=https://api.umurava.africa
UMURAVA_API_KEY=your_umurava_api_key
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.railway.app/api
```

## MongoDB Atlas Setup

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create new cluster (free tier available)
3. Configure network access (allow all IPs: 0.0.0.0/0 for production)
4. Create database user with read/write permissions
5. Get connection string and add to backend .env

## Backend Deployment (Railway)

### Option 1: Railway CLI
```bash
cd backend
npm install -g @railway/cli
railway login
railway init
railway add
railway up
```

### Option 2: Railway Dashboard
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Set root directory to `backend`
5. Add environment variables from .env
6. Deploy

### Post-Deployment
- Note the deployed URL (e.g., https://your-app.railway.app)
- Update CORS_ORIGIN in backend environment variables
- Update NEXT_PUBLIC_API_URL in frontend environment variables

## Frontend Deployment (Vercel)

### Option 1: Vercel CLI
```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

### Option 2: Vercel Dashboard
1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Set root directory to `frontend`
5. Add environment variable: NEXT_PUBLIC_API_URL
6. Deploy

### Build Settings
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

## Health Checks

### Backend Health Check
```bash
curl https://your-backend-domain.railway.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-03-31T10:00:00Z",
  "database": "connected"
}
```

### Frontend Health Check
Visit: https://your-frontend-domain.vercel.app

## Monitoring and Logging

### Backend Logs
- Railway: View logs in Railway dashboard
- Winston logs stored in `logs/` directory

### Frontend Logs
- Vercel: View logs in Vercel dashboard
- Browser console for client-side errors

## Scaling Considerations

### Backend
- Enable auto-scaling in Railway (scales based on CPU/memory)
- Consider Redis for caching Gemini API responses
- Implement job queue (Bull/BullMQ) for screening tasks

### Database
- MongoDB Atlas auto-scales storage
- Consider upgrading to dedicated cluster for production
- Enable backups and point-in-time recovery

### Frontend
- Vercel automatically handles CDN and edge caching
- Enable ISR (Incremental Static Regeneration) for static pages

## Pre-Deployment Checklist

Ensure all items are verified before pushing to production:

### Environment & Configuration
- [ ] `GEMINI_API_KEY` is set and valid.
- [ ] `MONGODB_URI` points to a production cluster (Atlas).
- [ ] `CORS_ORIGIN` is restricted to the production frontend domain.
- [ ] `NODE_ENV` is set to `production`.
- [ ] `JWT_SECRET` is changed from default to a strong random string.

### Database
- [ ] MongoDB network access excludes local IP (use 0.0.0.0/0 or specific CIDR).
- [ ] Database user has minimal required permissions.
- [ ] Indexes are created for `jobId` and `applicantId` fields.

### Security & Compliance
- [ ] Rate limiting is enabled on `/api/screening/*` and `/api/auth/*`.
- [ ] Input validation (Joi/Zod) is active on all POST/PUT routes.
- [ ] HTTPS is enforced on all endpoints.
- [ ] Sensitive headers are removed or masked in logs.
- [ ] MIT License file is included in the root.

### Final Verification
- [ ] All automated tests pass (`npm test` in both frontend and backend).
- [ ] Build process completes without warnings.
- [ ] Sample applicant data is removed from production database.
- [ ] Frontend responsive breakpoints (Mobile, Tablet, Desktop) verified.

## Troubleshooting

### Backend won't start
- Check MongoDB connection string
- Verify Gemini API key is valid
- Check logs for specific error messages

### Frontend can't connect to backend
- Verify NEXT_PUBLIC_API_URL is correct
- Check CORS configuration on backend
- Verify backend is running and accessible

### Screening fails
- Check Gemini API quota and rate limits
- Verify API key has necessary permissions
- Check backend logs for specific errors

## Rollback Procedure

### Railway
```bash
railway rollback
```

### Vercel
1. Go to Vercel dashboard
2. Select deployment
3. Click "Redeploy" on previous successful deployment

## Cost Estimates

- MongoDB Atlas: Free tier (512MB storage)
- Railway: $5/month (500 hours, 512MB RAM)
- Vercel: Free tier (100GB bandwidth)
- Gemini API: Free tier (60 requests/minute)

Total: ~$5/month for small-scale deployment
