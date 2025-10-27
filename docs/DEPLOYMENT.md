# Deployment Guide

## Overview

InstaGoods can be deployed to various platforms. This guide covers the most common deployment scenarios.

---

## Prerequisites

Before deploying, ensure you have:

- ✅ Completed database setup in Supabase
- ✅ Set up environment variables
- ✅ Tested the application locally
- ✅ Run a production build successfully (`npm run build`)

---

## Vercel Deployment (Recommended)

Vercel is the recommended platform as it provides seamless integration with the API functions.

### Initial Setup

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel
```

Follow the prompts to configure your project.

### Environment Variables

Add these in the Vercel dashboard (Settings → Environment Variables):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

### Automatic Deployments

Connect your GitHub repository to enable automatic deployments:

1. Go to Vercel dashboard
2. Import your GitHub repository
3. Configure build settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variables
5. Deploy!

### Custom Domain

1. Go to your project settings in Vercel
2. Navigate to **Domains**
3. Add your custom domain
4. Update DNS records as instructed

---

## Netlify Deployment

### Using Netlify CLI

1. **Install Netlify CLI:**
```bash
npm install -g netlify-cli
```

2. **Login:**
```bash
netlify login
```

3. **Initialize:**
```bash
netlify init
```

4. **Deploy:**
```bash
netlify deploy --prod
```

### Using Git Integration

1. Create `netlify.toml` in project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

2. Connect repository in Netlify dashboard
3. Configure environment variables
4. Deploy automatically on push

### Netlify Functions

The API endpoints need to be converted to Netlify Functions format:

Create `netlify/functions/` directory and adapt the API files:

```javascript
// netlify/functions/optimize-proxy.js
exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  
  const response = await fetch('https://ex2-lo.vercel.app/api/optimize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  const data = await response.json();
  
  return {
    statusCode: response.status,
    body: JSON.stringify(data)
  };
};
```

Update API calls in code to use `/.netlify/functions/` prefix.

---

## GitHub Pages

### Setup

1. **Install gh-pages:**
```bash
npm install --save-dev gh-pages
```

2. **Add deployment scripts to package.json:**
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://[username].github.io/[repo-name]"
}
```

3. **Update vite.config.ts for correct base path:**
```typescript
export default defineConfig({
  base: '/[repo-name]/',
  // ... other config
});
```

4. **Deploy:**
```bash
npm run deploy
```

### Limitations

⚠️ **Note:** GitHub Pages doesn't support server-side functions. The API endpoints won't work unless you:
- Use alternative hosting for API functions
- Update API calls to use external URLs directly

---

## AWS S3 + CloudFront

### Build and Upload

1. **Build the project:**
```bash
npm run build
```

2. **Create S3 bucket:**
```bash
aws s3 mb s3://instagoods-app
```

3. **Configure for static hosting:**
```bash
aws s3 website s3://instagoods-app \
  --index-document index.html \
  --error-document index.html
```

4. **Upload files:**
```bash
aws s3 sync dist/ s3://instagoods-app --delete
```

5. **Set bucket policy for public access:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::instagoods-app/*"
    }
  ]
}
```

### CloudFront Setup

1. Create CloudFront distribution
2. Point to S3 bucket
3. Configure SSL certificate
4. Set up custom domain

### API Functions

Deploy API functions separately using AWS Lambda:

1. Create Lambda functions for each API endpoint
2. Set up API Gateway
3. Update frontend to use API Gateway URLs

---

## Azure Static Web Apps

### Using Azure CLI

1. **Install Azure CLI:**
```bash
npm install -g @azure/static-web-apps-cli
```

2. **Build:**
```bash
npm run build
```

3. **Deploy:**
```bash
az login
az staticwebapp create \
  --name instagoods \
  --resource-group myResourceGroup \
  --source . \
  --location "East US 2" \
  --branch main \
  --app-location "/" \
  --output-location "dist"
```

### Configuration

Create `staticwebapp.config.json`:

```json
{
  "routes": [
    {
      "route": "/api/*",
      "methods": ["POST"],
      "allowedRoles": ["anonymous"]
    }
  ],
  "navigationFallback": {
    "rewrite": "/index.html"
  },
  "globalHeaders": {
    "content-security-policy": "default-src https: 'unsafe-eval' 'unsafe-inline'; object-src 'none'"
  }
}
```

---

## Docker Deployment

### Dockerfile

Create `Dockerfile` in project root:

```dockerfile
# Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (if needed)
    location /api/ {
        proxy_pass https://your-api-server.com/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Build and Run

```bash
# Build image
docker build -t instagoods .

# Run container
docker run -p 80:80 instagoods
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
      - VITE_GOOGLE_MAPS_API_KEY=${VITE_GOOGLE_MAPS_API_KEY}
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

---

## Environment-Specific Configuration

### Production Build

```bash
# Standard production build
npm run build

# Development build (with source maps)
npm run build:dev
```

### Environment Variables

Create `.env.production`:

```env
VITE_SUPABASE_URL=https://production-project.supabase.co
VITE_SUPABASE_ANON_KEY=production-key
VITE_GOOGLE_MAPS_API_KEY=production-key
```

---

## Post-Deployment Checklist

After deploying, verify:

- [ ] Application loads correctly
- [ ] All routes work (check 404 handling)
- [ ] Environment variables are set
- [ ] API endpoints are accessible
- [ ] Authentication works
- [ ] Images and assets load
- [ ] Mobile responsiveness
- [ ] SSL certificate is valid
- [ ] Custom domain configured (if applicable)
- [ ] Error tracking set up (e.g., Sentry)
- [ ] Analytics configured (e.g., Google Analytics)

---

## Monitoring and Maintenance

### Error Tracking

Consider integrating error tracking services:

**Sentry:**
```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE
});
```

### Performance Monitoring

Monitor key metrics:
- Page load time
- API response time
- Error rate
- User engagement

### Regular Updates

- Keep dependencies updated
- Monitor Supabase usage
- Check API rate limits
- Review error logs
- Test critical user flows

---

## Rollback Procedure

If deployment fails:

### Vercel
```bash
vercel rollback [deployment-url]
```

### Netlify
Use the Netlify dashboard to revert to a previous deployment.

### Manual
```bash
# Revert to previous commit
git revert HEAD
git push

# Redeploy
npm run deploy
```

---

## Scaling Considerations

### Database
- Monitor Supabase metrics
- Upgrade plan if needed
- Add database indexes for better performance

### CDN
- Use CloudFlare or similar for static assets
- Enable caching

### API Rate Limits
- Implement request throttling
- Consider API caching
- Add retry logic for failed requests

---

## Troubleshooting

### Build Fails

**Issue:** Build fails with TypeScript errors
**Solution:** Run `npm run lint` locally and fix errors

**Issue:** Out of memory during build
**Solution:** Increase Node memory: `NODE_OPTIONS=--max_old_space_size=4096 npm run build`

### API Issues

**Issue:** API calls fail in production
**Solution:** Verify CORS settings and environment variables

### Routing Issues

**Issue:** 404 on page refresh
**Solution:** Configure server to redirect all routes to index.html

---

## Support

For deployment issues:
- Check platform-specific documentation
- Review deployment logs
- Test locally with `npm run preview`
- Contact platform support

---

**Deployment Checklist Summary:**

1. ✅ Build passes locally
2. ✅ Environment variables configured
3. ✅ Database connected
4. ✅ API endpoints working
5. ✅ SSL enabled
6. ✅ Custom domain (optional)
7. ✅ Error tracking enabled
8. ✅ Monitoring configured
9. ✅ Backup strategy in place
10. ✅ Team notified

---

**Happy Deploying! 🚀**
