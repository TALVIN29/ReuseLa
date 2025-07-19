# Security Guidelines for ReuseLa

## 🔐 Environment Variables Security

### ✅ What's Protected
- `.env.local` - Your local environment variables (automatically ignored by git)
- `.env.development.local` - Development-specific variables
- `.env.production.local` - Production-specific variables
- `.env.test.local` - Test-specific variables

### ❌ What's NOT Protected (and shouldn't be)
- `env.example` - Template file with placeholder values (safe to commit)
- `README.md` - Documentation (safe to commit)

## 🚨 Critical Security Rules

1. **Never commit API keys to version control**
   - Your `.env.local` file is already in `.gitignore`
   - If you accidentally commit keys, rotate them immediately

2. **Use different keys for different environments**
   - Development: Use test/development API keys
   - Production: Use production API keys
   - Never use production keys in development

3. **Regular key rotation**
   - Rotate your Supabase keys every 90 days
   - Rotate immediately if keys are compromised

## 🛠️ Setup Commands

### Create Environment File
```bash
npm run setup-env
```

### Check for Exposed Keys

**Windows PowerShell:**
```powershell
# Use the provided security check script
npm run check-security

# Or manually search for patterns
Get-ChildItem -Recurse -File | Where-Object { $_.FullName -notmatch "node_modules|\.git" } | Select-String "eyJ"
Get-ChildItem -Recurse -File | Where-Object { $_.FullName -notmatch "node_modules|\.git" } | Select-String "sk_"
Get-ChildItem -Recurse -File | Where-Object { $_.FullName -notmatch "node_modules|\.git" } | Select-String "pk_"
```

**Linux/Mac:**
```bash
# Search for potential API keys in your codebase
grep -r "eyJ" . --exclude-dir=node_modules --exclude-dir=.git
grep -r "sk_" . --exclude-dir=node_modules --exclude-dir=.git
grep -r "pk_" . --exclude-dir=node_modules --exclude-dir=.git
```

## 📋 Security Checklist

### Before Committing Code
- [ ] No API keys in committed files
- [ ] No hardcoded secrets
- [ ] `.env.local` is not tracked by git
- [ ] Environment variables are properly validated

### Before Deployment
- [ ] Production API keys are set in hosting platform
- [ ] No development keys in production
- [ ] Row Level Security (RLS) is enabled in Supabase
- [ ] Proper database policies are in place

### Regular Maintenance
- [ ] API keys are rotated regularly
- [ ] Dependencies are updated
- [ ] Security audits are performed
- [ ] Access logs are monitored

## 🔍 Monitoring

### Check for Exposed Keys
If you suspect keys have been exposed:

1. **Immediate Actions**
   - Rotate all exposed API keys
   - Check git history for commits with keys
   - Review access logs

2. **Supabase Key Rotation**
   - Go to Supabase Dashboard > Settings > API
   - Generate new anon key
   - Update your environment variables
   - Update deployment platform variables

3. **Google Maps Key Rotation** (if used)
   - Go to Google Cloud Console
   - Create new API key
   - Restrict the old key
   - Update environment variables

## 🚀 Production Deployment Security

### Vercel
```bash
# Set environment variables in Vercel dashboard
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Netlify
```bash
# Set environment variables in Netlify dashboard
# Or use netlify.toml file (but don't commit secrets)
```

### Other Platforms
- Always use the platform's environment variable system
- Never commit production secrets to your repository
- Use different keys for staging and production

## 📞 Emergency Contacts

If you discover a security issue:

1. **Immediate Response**
   - Rotate all affected API keys
   - Check for unauthorized access
   - Document the incident

2. **Reporting**
   - Create a security issue in the repository
   - Contact the development team
   - Consider responsible disclosure if it's a public repository

## 🔒 Additional Security Measures

### Database Security
- Enable Row Level Security (RLS) in Supabase
- Use parameterized queries
- Validate all user inputs
- Implement proper authentication

### API Security
- Rate limiting
- Input validation
- CORS configuration
- HTTPS only in production

### Client Security
- Sanitize user inputs
- Validate file uploads
- Implement proper error handling
- Use Content Security Policy (CSP)

---

**Remember**: Security is everyone's responsibility. When in doubt, ask for help rather than risking exposure of sensitive information. 