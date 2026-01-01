# Deployment Guide - REstart NSAT

## ✅ Build Successful!

Your production build is ready in the `dist/` folder.

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   cd REstart-nsat
   vercel
   ```

3. **Configure Environment Variables:**
   - Go to your Vercel project dashboard
   - Add environment variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_RAZORPAY_KEY_ID`

4. **Deploy Production:**
   ```bash
   vercel --prod
   ```

### Option 2: Netlify

1. **Install Netlify CLI:**
   ```bash
   npm i -g netlify-cli
   ```

2. **Deploy:**
   ```bash
   cd REstart-nsat
   netlify deploy --prod
   ```

3. **Configure:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Add environment variables in Netlify dashboard

### Option 3: GitHub Pages

1. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json:**
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

### Option 4: Self-Hosted (VPS/Server)

1. **Build locally:**
   ```bash
   npm run build
   ```

2. **Upload `dist/` folder to your server**

3. **Configure Nginx:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /path/to/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

## 📝 Pre-Deployment Checklist

- [ ] Set up Supabase database (run SUPABASE_SETUP.md scripts)
- [ ] Configure environment variables
- [ ] Test user registration and login
- [ ] Add sample bundles and content
- [ ] Test payment flow with Razorpay test mode
- [ ] Verify RLS policies are working
- [ ] Test on mobile devices
- [ ] Check all routes and links
- [ ] Set up SSL certificate
- [ ] Configure custom domain

## 🔐 Security Checklist

- [ ] Enable RLS on all Supabase tables
- [ ] Verify Supabase API keys (use anon key, not service key)
- [ ] Use Razorpay test mode for testing
- [ ] Set up Razorpay webhooks for payment verification
- [ ] Enable HTTPS on your domain
- [ ] Review and test all RLS policies
- [ ] Set up rate limiting if needed

## 📊 Post-Deployment

### 1. Monitor Performance
- Use Vercel/Netlify analytics
- Set up error tracking (Sentry, etc.)
- Monitor Supabase usage

### 2. Test Everything
- User registration
- Login/Logout
- Bundle purchase
- Payment flow
- Test submission
- Content access
- Mobile responsiveness

### 3. Add Content
- Create exam bundles
- Upload study materials
- Add tests and questions
- Create notifications
- Set up coupons

## 🔄 Updates

To deploy updates:

```bash
# Make your changes
git add .
git commit -m "Your changes"
git push

# Deploy
vercel --prod  # or netlify deploy --prod
```

## 🐛 Common Issues

### Build Errors
- Run `npm install` to ensure dependencies are installed
- Check environment variables are set
- Verify Node.js version (18+)

### Runtime Errors
- Check browser console for errors
- Verify Supabase connection
- Check RLS policies
- Verify environment variables are deployed

### Payment Issues
- Verify Razorpay key ID is correct
- Check Razorpay is in test mode for testing
- Verify webhook setup
- Check browser console for errors

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Razorpay Documentation](https://razorpay.com/docs)

## 🎉 You're Ready to Deploy!

Your exam preparation platform is production-ready and optimized for deployment.

Good luck with your launch! 🚀
