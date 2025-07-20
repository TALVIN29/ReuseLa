# ReuseLa ♻️

A sustainable item sharing platform that connects people who want to give away items with those who need them, promoting a circular economy and reducing waste.

## 🌟 Features

### Core Functionality
- **Item Posting**: Users can post items they want to give away
- **Item Browsing**: Browse available items by category and location
- **Request System**: Request items with personalized messages
- **Status Management**: Track request status (Pending, Approved, Rejected, Completed)
- **Email Notifications**: Automated email notifications for all request status changes

### User Experience
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Real-time Updates**: Live status updates and notifications
- **User Authentication**: Secure login system with Supabase Auth
- **Profile Management**: User profiles and dashboard
- **Rating System**: Rate transactions after completion

### Technical Features
- **Next.js 14**: Modern React framework with App Router
- **TypeScript**: Type-safe development
- **Supabase**: Backend-as-a-Service for database and authentication
- **Resend**: Email delivery service
- **Responsive Design**: Works on all devices

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Resend account (for email notifications)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/reusela.git
   cd reusela
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Email Configuration (Resend)
   RESEND_API_KEY=your_resend_api_key
   ```

4. **Set up the database**
   - Run the SQL script in `database-setup-final.sql` in your Supabase SQL editor
   - Run the SQL script in `fix-update-item-status.sql` to fix the update function

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📧 Email Notifications

The platform sends automated emails for:
- **New Requests**: Item owners are notified when someone requests their item
- **Request Approval**: Requesters are notified when their request is approved
- **Request Rejection**: Requesters are notified when their request is declined

## 🗄️ Database Schema

### Key Tables
- **items**: Posted items with details and status
- **requests**: Item requests with status tracking
- **ratings**: User ratings for completed transactions
- **users**: User profiles and authentication

### Status Flow
1. **Available** → Item is posted and ready for requests
2. **Requested** → Item has an approved request
3. **Taken** → Item has been collected
4. **Expired** → Item automatically expires after 3 days

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Project Structure
```
reusela/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── browse/            # Item browsing page
│   ├── dashboard/         # User dashboard
│   ├── item/[id]/         # Individual item page
│   ├── login/             # Authentication
│   ├── post/              # Item posting
│   ├── profile/           # User profile
│   └── requests/          # Request management
├── components/            # Reusable components
├── contexts/              # React contexts
├── lib/                   # Utility functions
└── scripts/               # Setup scripts
```

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Enable Row Level Security (RLS)
3. Set up authentication providers
4. Run the database setup scripts

### Email Setup
1. Create a Resend account
2. Get your API key
3. Add the key to your environment variables

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- **Netlify**: Similar to Vercel setup
- **Railway**: Full-stack deployment
- **AWS**: Manual deployment with EC2

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** for the backend infrastructure
- **Resend** for email delivery
- **Next.js** for the amazing framework
- **Tailwind CSS** for the beautiful styling

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation
- Contact the development team

---

**Made with ❤️ for a more sustainable future** 