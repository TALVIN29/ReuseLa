# ReuseLa - Community Reuse & Donation Matching App

ReuseLa is a fully functional platform that connects communities for sustainable reuse of pre-loved items, helping B40 families and fresh graduates in Malaysia access essential items while reducing waste.

## 🎯 Problem Statement

Every day, Malaysians throw away usable items (e.g., books, furniture, stationery, unopened food) due to lack of access to organized reuse channels. Meanwhile, B40 families, fresh graduates, and students quietly struggle with basic needs. Existing donation platforms are either commercialized, too complex, or socially awkward.

## 🚀 Features

### ✅ Implemented Features
- **User Registration & Authentication** - Email/phone-based registration and login with Supabase Auth
- **Item Upload** - Post items with photos, descriptions, categories, and location using Supabase Storage
- **Browse & Filter** - Search items by category, location, and keywords with real-time updates
- **Request System** - Request items with contact information and messaging
- **Request Management** - Approve, reject, and mark items as collected
- **Real-time Updates** - Live updates when items are posted, collected, or status changes
- **Item Status Management** - Automatic status updates (Available → Reserved → Collected)
- **Impact Tracking** - Monitor items reused and weight diverted from landfill

### Tech Stack
- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage, Real-time)
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## 📱 Pages

1. **Home (`/`)** - Welcome banner, quick stats, and item browsing with real-time updates
2. **Browse (`/browse`)** - Dedicated page for searching and filtering items with manual refresh
3. **Post Item (`/post`)** - Upload new items with photos and details
4. **Login/Register (`/login`)** - User authentication with Supabase
5. **My Requests (`/requests`)** - Track posted items and requests with status management
6. **Item Details (`/item/[id]`)** - View item details and submit requests

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ReuseLa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   **⚠️ IMPORTANT: Never commit your actual API keys to version control!**
   
   Create a `.env.local` file in the root directory (this file is already in .gitignore):
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```
   
   **How to get your Supabase credentials:**
   1. Go to [supabase.com](https://supabase.com) and create a new project
   2. Navigate to Settings > API in your project dashboard
   3. Copy the "Project URL" and "anon public" key
   4. Paste them in your `.env.local` file

4. **Set up Supabase Database**
   
   **Option 1: Use the provided SQL files**
   - Run `database-setup.sql` to create the basic tables
   - Run `storage-policies.sql` to set up storage bucket policies
   - Run `complete-fix.sql` to add all necessary columns and policies
   
   **Option 2: Manual setup**
   Follow the detailed instructions in `SUPABASE_SETUP.md`

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔒 Security Features

### Row Level Security (RLS)
- Users can only view, edit, and delete their own items
- Request visibility is restricted to item owners and requesters
- Storage bucket policies protect uploaded images

### Environment Variables
- ✅ **DO**: Use `.env.local` for local development (already in .gitignore)
- ✅ **DO**: Use environment variables in your deployment platform
- ❌ **DON'T**: Commit API keys to version control
- ❌ **DON'T**: Share your `.env.local` file

## 📁 Project Structure

```
ReuseLa/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page with real-time updates
│   ├── browse/            # Browse items page with filters
│   ├── post/              # Post item page with image upload
│   ├── login/             # Login/register page
│   ├── requests/          # My requests page with status management
│   ├── item/[id]/         # Item details page
│   └── api/requests/      # API route for request handling
├── components/            # Reusable components
│   ├── Header.tsx         # Navigation header
│   ├── ItemCard.tsx       # Item display card
│   └── RequestModal.tsx   # Request submission modal
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication context
├── lib/                   # Utility libraries
│   └── supabase.ts        # Supabase client configuration
├── public/                # Static assets
├── .env.local             # Local environment variables (not in git)
├── env.example            # Example environment variables
├── *.sql                  # Database setup files
├── .gitignore             # Git ignore rules
└── package.json           # Dependencies and scripts
```

## 🎨 Design System

### Colors
- **Primary**: Green (`#22c55e`) - Represents sustainability and growth
- **Secondary**: Blue (`#3b82f6`) - Trust and reliability
- **Background**: Gradient from blue to green tones

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 400, 500, 600, 700

### Components
- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Primary actions in green, secondary in blue
- **Forms**: Clean inputs with focus states
- **Navigation**: Bottom tab bar for mobile-first design

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Key Features Implemented
1. ✅ **Supabase Integration** - Full database integration with real-time subscriptions
2. ✅ **Image Upload** - Supabase Storage for item photos
3. ✅ **Authentication** - Complete Supabase Auth integration
4. ✅ **Request System** - Full request lifecycle management
5. ✅ **Real-time Updates** - Live updates across all pages
6. ✅ **Item Status Management** - Automatic status transitions
7. ✅ **Email Notifications** - Request notifications (console logging)

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- **Netlify**: Similar to Vercel setup
- **Railway**: Supports Node.js applications
- **Heroku**: Traditional deployment option

## 📊 Database Schema

### Items Table
- `id`: UUID primary key
- `title`: Item title
- `description`: Item description
- `category`: Books, Appliances, Furniture, Others
- `condition`: New, Good, Fair, Damaged
- `postcode`: Location postcode
- `city`: Derived city from postcode
- `image_url`: Supabase Storage URL
- `user_id`: Owner reference
- `status`: Available, Reserved, Collected
- `created_at`, `updated_at`: Timestamps

### Requests Table
- `id`: UUID primary key
- `item_id`: Item reference
- `requester_id`: Requester reference
- `requester_email`, `requester_name`: Contact info
- `message`: Request message
- `preferred_contact`: Email or phone
- `status`: Pending, Approved, Rejected, Completed
- `created_at`, `updated_at`: Timestamps

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. 