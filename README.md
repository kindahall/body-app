# BodyCount - Relationship Tracking App

A modern, mobile-first application for tracking romantic, sexual, and friendship relationships with AI-powered insights.

## 🚀 Features

- **Relationship Tracking**: Record romantic, sexual, friendship, and other relationships
- **Rich Data**: Track emotions, places, ratings, duration, and private notes
- **AI Insights**: Get personalized recommendations powered by Claude 4
- **Subscription Tiers**: Free (1 relationship), Standard ($5/month, 10 relationships), Premium ($10/month, unlimited)
- **Multi-language Support**: English, Spanish, French, German, Italian, Portuguese
- **Secure Authentication**: Magic link email + Google OAuth via Supabase
- **Real-time Data**: PostgreSQL with Row-Level Security

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Magic Links + OAuth)
- **Payments**: Stripe + Make.com webhooks
- **AI**: Claude 4 via Cline AI SDK
- **Deployment**: Vercel
- **Testing**: Vitest

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Stripe account (for payments)
- Claude API access
- Make.com account (for webhooks)

## 🔧 Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd bodycount
npm install
```

### 2. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
- `CLAUDE_API_KEY`: Your Claude API key

### 3. Database Setup

1. Create a new Supabase project
2. Run the SQL schema:

```sql
-- Copy and paste the contents of supabase_schema.sql into your Supabase SQL editor
```

3. Enable Google OAuth in Supabase:
   - Go to Authentication > Providers
   - Enable Google provider
   - Add your Google OAuth credentials

### 4. Stripe Setup

1. Create products and prices in Stripe Dashboard:
   - Standard: $5/month
   - Premium: $10/month
2. Copy the price IDs to your `.env.local`
3. Set up webhooks pointing to your Make.com scenario

### 5. Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗 Architecture

### Multi-Component Protocols (MCPs)

The app is built using independent TypeScript modules:

1. **AuthHandlerMCP** (`/src/lib/auth/AuthHandlerMCP.tsx`)
   - Handles Supabase authentication
   - Manages user sessions and profiles
   - Provides `useAuth` hook with subscription status

2. **SubscriptionMCP** (Coming next)
   - Quota enforcement
   - Stripe integration
   - Webhook handling

3. **RelationshipMCP** (Coming next)
   - Relationship CRUD operations
   - Form validation
   - Quota checking

4. **InsightsMCP** (Coming next)
   - Claude 4 integration
   - AI recommendation generation
   - Insights display

5. **LanguageMCP** (Coming next)
   - Multi-language support
   - Auto-detection
   - Locale management

6. **UIRouterMCP** (Coming next)
   - App Router configuration
   - Route protection
   - Navigation

7. **ClaudeAnalysisMCP** (Coming next)
   - Data aggregation
   - Pattern detection
   - AI analysis

### Database Schema

- `users`: User profiles with subscription status
- `relationships`: Relationship records with rich metadata
- `recommendations`: AI-generated insights and advice
- `subscriptions`: Stripe subscription tracking

All tables use Row-Level Security (RLS) for data isolation.

## 🔒 Security

- Row-Level Security on all database tables
- Environment variables for sensitive data
- Secure authentication flows
- HTTPS-only in production

## 📱 Mobile-First Design

- Responsive Tailwind CSS
- Touch-friendly interfaces
- Progressive Web App features
- Lighthouse score target: 90+

## 🚀 Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

Ensure all environment variables are set in your Vercel project settings.

## 🧪 Testing

```bash
npm run test
```

Tests cover:
- Authentication flows
- Database operations
- Business logic
- Component rendering

## 📝 Development Status

### ✅ Completed
- [x] Next.js 14 project setup
- [x] Supabase integration
- [x] Database schema
- [x] AuthHandlerMCP implementation
- [x] Authentication pages (login, onboarding)
- [x] Basic home page
- [x] Middleware for route protection
- [x] TypeScript configuration
- [x] Tailwind CSS setup

### 🚧 In Progress
- [ ] SubscriptionMCP
- [ ] RelationshipMCP
- [ ] Stripe integration
- [ ] Claude 4 integration
- [ ] Multi-language support

### 📋 Upcoming
- [ ] InsightsMCP
- [ ] LanguageMCP
- [ ] UIRouterMCP
- [ ] ClaudeAnalysisMCP
- [ ] Testing suite
- [ ] Production deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For issues and questions, please create a GitHub issue or contact the development team.

---

**Note**: This is a production application. Ensure all environment variables are properly configured before deployment.
