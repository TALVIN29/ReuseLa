# ReuseLa - Sustainable Item Sharing Platform

A modern web application built with Next.js 14, TypeScript, and Supabase that enables users to share and request items, promoting sustainability and community building.

## 🌟 Features

- **Item Sharing**: Post items you no longer need
- **Item Discovery**: Browse and search available items
- **Request System**: Request items with messaging
- **Real-time Updates**: Live updates for item status changes
- **User Profiles**: Track your sharing activity and impact
- **Impact Dashboard**: See platform-wide environmental impact
- **Rating System**: Rate your sharing experiences
- **Email Notifications**: Get notified about requests
- **Responsive Design**: Works on all devices

## 🚀 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Git

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ReuseLa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Set up the database**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Run the contents of `database-setup-final.sql`

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

Run the `database-setup-final.sql` file in your Supabase SQL Editor to create:

- Ratings table with proper constraints
- Helper functions for rating calculations
- Auto-expire function for items
- Row Level Security policies

## 📱 App Structure

```
ReuseLa/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   ├── browse/            # Browse items page
│   ├── dashboard/         # Impact dashboard
│   ├── item/[id]/         # Item details page
│   ├── login/             # Authentication page
│   ├── post/              # Post new item page
│   ├── profile/           # User profile page
│   └── requests/          # Manage requests page
├── components/            # Reusable components
├── contexts/              # React contexts
├── lib/                   # Utility functions
└── scripts/               # Setup scripts
```

## 🔧 Key Features Explained

### Real-time Updates
- Uses Supabase real-time subscriptions
- Items update automatically across all users
- Request status changes are reflected immediately

### Item Status Management
- **Available**: Item is up for grabs
- **Requested**: Someone has requested the item
- **Taken**: Item has been collected
- **Expired**: Item listing has expired (after 3 days)

### Request System
- Users can request items with custom messages
- Item owners receive email notifications
- Owners can approve/reject requests
- Automatic status updates

### Impact Tracking
- Tracks items shared, requested, and completed
- Calculates environmental impact
- Shows community statistics

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables
   - Deploy!

### Environment Variables for Production

Make sure to set these in your Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with Next.js 14 and Supabase
- Icons from Lucide React
- Styling with Tailwind CSS
- Community-driven development

## 📞 Support

If you have any questions or need help:
- Open an issue on GitHub
- Check the documentation
- Contact the development team

---

**ReuseLa** - Making sharing sustainable, one item at a time! ♻️ 