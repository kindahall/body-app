# Landing Page & Auth System

## Overview

This project includes a modern landing page at `/` and a redesigned authentication system at `/auth` built with Next.js 14 (App Router) and Tailwind CSS.

## Landing Page (`/`)

### Customization

#### Screenshots
1. Replace `/public/hero.png` with your actual app screenshot
2. Add more screenshots to `/public/screenshots/` directory
3. Update the `screenshots` array in `/src/app/page.tsx`:

```typescript
const screenshots = [
  {
    src: '/screenshots/dashboard.png',
    alt: 'Dashboard view',
    title: 'Your Personal Dashboard'
  },
  // Add more screenshots...
]
```

#### Content Updates
1. **Hero Section**: Edit the headline and description in `/src/app/page.tsx`
2. **Features**: Update the features array with your app's key features
3. **Pricing**: Modify the pricing plans in the pricing section
4. **FAQ**: Update the frequently asked questions
5. **Footer**: Change social links and company information

#### Environment Variables
Ensure these are set in your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Authentication System (`/auth`)

### Features
- Two-column layout (brand + form)
- Tabbed interface (Login / Sign up)
- Email/password authentication
- Google OAuth integration
- Password reset functionality
- Responsive design
- Dark mode support

### Routes
- `/auth` - Main login/signup page
- `/auth/reset` - Password reset page
- `/auth/callback` - OAuth callback handler

### Customization
1. **Branding**: Update the brand section in `/src/app/auth/page.tsx`
2. **Styling**: Modify Tailwind classes for custom colors/spacing
3. **OAuth Providers**: Add more providers in the AuthForm component
4. **Redirect URLs**: Update success redirect URLs in AuthForm:
   - Login success → `/home`
   - Signup success → `/onboarding`

### Required Supabase Setup
1. Enable Email authentication
2. Configure Google OAuth provider
3. Set up email templates for:
   - Email confirmation
   - Password reset
4. Configure redirect URLs in Supabase dashboard:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)

## Components Structure

```
src/
├── app/
│   ├── page.tsx                 # Landing page
│   └── auth/
│       ├── page.tsx             # Auth layout
│       └── reset/
│           └── page.tsx         # Password reset
└── components/
    ├── auth/
    │   ├── AuthForm.tsx         # Main auth form
    │   └── ResetForm.tsx        # Password reset form
    └── landing/
        ├── ScreenshotsCarousel.tsx
        ├── FAQAccordion.tsx
        └── CookieConsent.tsx
```

## SEO & Meta Tags

Both pages include proper meta tags:
- Title and description
- Open Graph tags
- `noindex` for beta version

Update these in the respective `page.tsx` files.

## Accessibility

- Proper ARIA labels
- Focus management
- Keyboard navigation
- Screen reader support
- Color contrast compliance

## Performance

- Dynamic imports for heavy components
- Optimized images
- Minimal bundle size
- Server-side rendering where possible

## Deployment Notes

1. Update environment variables for production
2. Configure Supabase redirect URLs
3. Test OAuth flows in production environment
4. Verify email delivery for auth flows