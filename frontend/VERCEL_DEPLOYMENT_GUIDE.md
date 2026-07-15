# Vercel Deployment Guide - KXGRID Frontend

This guide will help you deploy the KXGRID frontend to Vercel successfully.

## ✅ Configuration Files Added

The following files have been created for Vercel deployment:

1. **`vercel.json`** (Root level) - Complete Vercel configuration
   - Build settings
   - Rewrites for client-side routing
   - Security headers
   - Caching rules

## 🚀 Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

#### Step 1: Push to Git (if not already done)
```bash
cd "C:\Users\yuvar\Desktop\web_hoster\internship\kotlerx\old projects\Phase-1-App-KX-GRID"
git add .
git commit -m "Add Vercel configuration"
git push origin main
```

#### Step 2: Import Project to Vercel

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/
   - Click "Add New" → "Project"

2. **Import Git Repository**
   - Click "Import Git Repository"
   - Authorize Vercel to access your GitHub/GitLab/Bitbucket
   - Select your repository: `Phase-1-App-KX-GRID`

3. **Configure Project**
   Vercel will auto-detect settings from `vercel.json`, but verify:

   - **Framework Preset:** Create React App
   - **Root Directory:** `./` (leave as root, vercel.json handles it)
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Output Directory:** `frontend/build`
   - **Install Command:** `cd frontend && npm install`

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add the following:
     ```
     Name: REACT_APP_BACKEND_URL
     Value: https://your-backend-api-url.com
     ```
   - Apply to: Production, Preview, and Development

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (2-5 minutes)
   - Your site will be live at `https://your-project-name.vercel.app`

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to project root
cd "C:\Users\yuvar\Desktop\web_hoster\internship\kotlerx\old projects\Phase-1-App-KX-GRID"

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

**Follow the prompts:**
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N** (for first deployment)
- What's your project's name? `kxgrid` (or your preferred name)
- In which directory is your code located? `./`

## 📝 Environment Variables Required

Add these in Vercel Dashboard → Project Settings → Environment Variables:

| Variable | Value | Example |
|----------|-------|---------|
| `REACT_APP_BACKEND_URL` | Your backend API URL | `https://api.kotlerx.in` |

**Important:**
- Don't include trailing slash!
- Add to all environments (Production, Preview, Development)

## 🔧 Vercel Build Settings (Auto-configured)

The `vercel.json` file configures:

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/build",
  "installCommand": "cd frontend && npm install"
}
```

## 🐛 Troubleshooting

### 404 Error on Routes
✅ **Fixed!** The `vercel.json` rewrites handle this.

If you still see 404:
1. Check that `vercel.json` exists in root directory
2. Verify `rewrites` configuration is correct
3. Redeploy with "Redeploy" button in Vercel dashboard

### Build Fails

**Common issues:**

1. **Node version mismatch**
   - Add to `package.json`:
   ```json
   "engines": {
     "node": "18.x"
   }
   ```

2. **Missing dependencies**
   - Check `package.json` has all dependencies
   - Try: `cd frontend && npm install` locally

3. **Build command fails**
   - Check Vercel build logs
   - Test locally: `cd frontend && npm run build`

### Environment Variables Not Working

1. Make sure variable name starts with `REACT_APP_`
2. Check it's added to correct environment (Production/Preview)
3. Redeploy after adding environment variables

### Blank Page After Deployment

- Check browser console for errors
- Verify `REACT_APP_BACKEND_URL` is set correctly
- Check that build output is in `frontend/build`
- Look at Vercel function logs

### API Calls Failing (CORS Issues)

Your backend needs to allow your Vercel domain:

```python
# In your FastAPI backend (server.py)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-project.vercel.app",
        "https://*.vercel.app"  # For preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🎯 Vercel Features Enabled

### Automatic Deployments
- ✅ Every push to `main` = Production deployment
- ✅ Every pull request = Preview deployment with unique URL
- ✅ Instant rollbacks to previous deployments

### Performance Optimizations
- ✅ Global CDN distribution
- ✅ Automatic HTTPS with SSL
- ✅ Image optimization (if using Next.js Image)
- ✅ Edge caching for static assets
- ✅ Gzip/Brotli compression

### Preview Deployments
Each PR gets a unique URL like:
```
https://kxgrid-git-feature-branch-username.vercel.app
```

## 🌐 Custom Domain Setup

1. Go to Project Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `kxgrid.com`)
4. Configure DNS records:
   - **Type:** A Record
   - **Name:** @ (or subdomain)
   - **Value:** 76.76.21.21 (Vercel's IP)

   OR

   - **Type:** CNAME
   - **Name:** @ (or subdomain)
   - **Value:** cname.vercel-dns.com

5. Verify domain ownership
6. Wait for DNS propagation (up to 48 hours)

## 📊 Vercel vs Netlify Comparison

| Feature | Vercel | Netlify |
|---------|--------|---------|
| Build time | Faster | Similar |
| Global CDN | ✅ Yes | ✅ Yes |
| Automatic HTTPS | ✅ Free | ✅ Free |
| Preview deployments | ✅ Yes | ✅ Yes |
| Edge functions | ✅ Better | ✅ Good |
| Analytics | ✅ Built-in | ✅ Built-in |

## 🔄 Deployment Workflow

```
┌─────────────────┐
│  Push to Git    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Vercel Detects  │
│  New Commit     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Run Build      │
│  Command        │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Deploy to      │
│  Global CDN     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Site Live     │
│  🎉 Success!    │
└─────────────────┘
```

## ✅ Post-Deployment Checklist

- [ ] Site loads at Vercel URL
- [ ] All routes work (/, /programs, /team, /kxcraft)
- [ ] Page refresh works on all routes
- [ ] API calls work (check Network tab)
- [ ] Images and assets load
- [ ] Animations work (GSAP, ScrollReveal, GlitchText)
- [ ] Mobile responsive
- [ ] Environment variables configured
- [ ] Custom domain added (optional)

## 📈 Monitoring & Analytics

### Built-in Vercel Analytics
1. Go to Project → Analytics
2. Enable Vercel Analytics
3. View:
   - Page views
   - Unique visitors
   - Top pages
   - Performance metrics

### Build Logs
- Check deployment logs for errors
- Filter by deployment type (Production/Preview)
- Download logs for debugging

## 🔒 Security Headers

The `vercel.json` includes:
```json
{
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block"
}
```

## 🚀 Performance Tips

1. **Enable Compression**
   - Vercel automatically compresses assets

2. **Optimize Images**
   - Use WebP format
   - Compress images before deploying

3. **Code Splitting**
   - Already done by Create React App

4. **Lazy Loading**
   - Components load on demand

## 📱 Testing Your Deployment

### Local Test Before Deploy
```bash
cd frontend
npm run build
npx serve -s build
```
Open http://localhost:3000 and test all routes

### Test Production Deploy
1. Visit your Vercel URL
2. Test all routes:
   - https://your-site.vercel.app/
   - https://your-site.vercel.app/programs
   - https://your-site.vercel.app/team
   - https://your-site.vercel.app/kxcraft
3. Check browser console for errors
4. Test API calls in Network tab

## 🆘 Getting Help

- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Community: https://github.com/vercel/vercel/discussions

## 🎨 Bonus: Environment-Specific Configs

Create different environment files:

**`.env.production`**
```env
REACT_APP_BACKEND_URL=https://api.kotlerx.in
```

**`.env.development`**
```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

Vercel automatically uses `.env.production` for production builds.

---

## 🎉 You're All Set!

Your site should now be live at: `https://your-project-name.vercel.app`

**Key Benefits:**
- ✅ Instant global deployment
- ✅ Automatic HTTPS
- ✅ Zero configuration needed
- ✅ Unlimited bandwidth (on free tier)
- ✅ Automatic scaling
- ✅ Git-based workflow

Happy deploying! 🚀
