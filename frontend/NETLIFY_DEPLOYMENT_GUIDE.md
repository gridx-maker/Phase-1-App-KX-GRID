# Netlify Deployment Guide - KXGRID Frontend

This guide will help you deploy the KXGRID frontend to Netlify successfully.

## ✅ Configuration Files Added

The following files have been created/configured for Netlify deployment:

1. **`public/_redirects`** - Handles client-side routing for React Router
2. **`netlify.toml`** - Build configuration and deployment settings

## 🚀 Deployment Steps

### Option 1: Deploy via Netlify UI (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Add Netlify configuration"
   git push origin main
   ```

2. **Go to Netlify Dashboard**
   - Visit https://app.netlify.com/
   - Click "Add new site" → "Import an existing project"

3. **Connect your Git repository**
   - Choose your Git provider (GitHub/GitLab/Bitbucket)
   - Authorize Netlify
   - Select your repository: `Phase-1-App-KX-GRID`

4. **Configure Build Settings**
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/build`
   - **Node version:** 18 (set in netlify.toml)

5. **Set Environment Variables**
   - Go to Site settings → Environment variables
   - Add the following:
     ```
     REACT_APP_BACKEND_URL = https://your-backend-api-url.com
     ```
   - Replace with your actual backend API URL

6. **Deploy**
   - Click "Deploy site"
   - Wait for the build to complete (usually 2-5 minutes)

### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Navigate to frontend directory
cd frontend

# Login to Netlify
netlify login

# Initialize Netlify project
netlify init

# Deploy
netlify deploy --prod
```

## 🔧 Build Settings Summary

If you need to manually configure in Netlify UI:

```
Base directory: frontend
Build command: npm run build
Publish directory: frontend/build
Node version: 18
```

## 📝 Environment Variables Required

Add these in Netlify Dashboard → Site settings → Environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `REACT_APP_BACKEND_URL` | Your backend API URL | FastAPI backend endpoint |

**Example Production Value:**
```
REACT_APP_BACKEND_URL=https://api.kotlerx.in
```

**Important:** Don't include trailing slash in the URL!

## 🐛 Troubleshooting

### 404 Error on Page Refresh
✅ **Fixed!** The `_redirects` file handles this.

If you still see 404 errors:
1. Check that `public/_redirects` file exists
2. Verify it contains: `/*    /index.html   200`
3. Clear Netlify cache and redeploy

### Build Fails
- Check Node version is set to 18
- Verify all dependencies are in `package.json`
- Check build logs in Netlify dashboard

### API Calls Not Working
- Verify `REACT_APP_BACKEND_URL` environment variable is set
- Check CORS settings on your backend
- Ensure backend URL doesn't have trailing slash

### Blank Page After Deployment
- Check browser console for errors
- Verify `build` folder is being published
- Check that all assets are loading correctly

## 📦 Files Modified for Netlify

1. **`public/_redirects`** (CREATED)
   ```
   /*    /index.html   200
   ```

2. **`netlify.toml`** (CREATED)
   - Build configuration
   - Redirect rules
   - Security headers
   - Caching rules

## 🔄 Continuous Deployment

Once connected to Git, Netlify will automatically:
- Deploy every push to `main` branch
- Create preview deployments for pull requests
- Show build status in your Git provider

## 🎯 Post-Deployment Checklist

- [ ] Site loads without errors
- [ ] All routes work (/, /programs, /team, etc.)
- [ ] Page refresh doesn't cause 404
- [ ] API calls work correctly
- [ ] Images and assets load
- [ ] Animations work smoothly
- [ ] Mobile responsive design works
- [ ] Custom domain configured (if needed)

## 🌐 Custom Domain Setup (Optional)

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Enter your domain (e.g., `kxgrid.com`)
4. Configure DNS records as shown by Netlify
5. Wait for DNS propagation (can take 24-48 hours)

## 📊 Performance Tips

The `netlify.toml` file includes:
- ✅ Optimized caching for static assets
- ✅ Security headers
- ✅ Client-side routing support
- ✅ Immutable caching for JS/CSS

## 🆘 Need Help?

- Check Netlify build logs: Site → Deploys → Latest deploy → Deploy log
- Netlify Docs: https://docs.netlify.com/
- Netlify Support: https://www.netlify.com/support/

---

**Your site should now be live at:** `https://your-site-name.netlify.app`

Once deployed, you can:
- Share the URL
- Configure custom domain
- Enable automatic HTTPS (enabled by default)
- Monitor analytics and performance
