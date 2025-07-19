#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔐 ReuseLa Environment Setup');
console.log('============================\n');

const envPath = path.join(process.cwd(), '.env.local');

// Check if .env.local already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local file already exists!');
  console.log('If you want to recreate it, please delete the existing file first.\n');
  process.exit(0);
}

// Create .env.local template
const envTemplate = `# Supabase Configuration
# Get these from your Supabase project settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: Google Maps API (for future location features)
# NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Optional: Other API keys
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
# NEXT_PUBLIC_SENDGRID_API_KEY=SG...
`;

try {
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env.local file successfully!');
  console.log('\n📝 Next steps:');
  console.log('1. Go to https://supabase.com and create a new project');
  console.log('2. Navigate to Settings > API in your project dashboard');
  console.log('3. Copy the "Project URL" and "anon public" key');
  console.log('4. Replace the placeholder values in .env.local with your actual keys');
  console.log('\n⚠️  Remember: Never commit your .env.local file to version control!');
  console.log('   It\'s already added to .gitignore for your safety.\n');
} catch (error) {
  console.error('❌ Error creating .env.local file:', error.message);
  process.exit(1);
} 