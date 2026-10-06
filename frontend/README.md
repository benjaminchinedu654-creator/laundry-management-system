# Laundry Frontend (Next.js 14, App Router)

Customer + admin interface for the Laundry API.

## Requirements
- Node 18+ (Node 20 recommended)
- Backend running at `NEXT_PUBLIC_API_URL`

## Setup

1. Copy `.env.example` to `.env.local` and adjust if needed.
2. `npm install`
3. `npm run dev` → http://localhost:3000

## Folder structure

- `app/(public)/`   — public marketing pages + login/register
- `app/(customer)/` — customer dashboard, orders, notifications, profile
- `app/admin/`      — admin login, dashboard, orders, users, services, payments, reports
- `components/ui/`  — reusable primitives
- `components/layout/` — headers, sidebars, topbar
- `components/forms/`  — login, register, admin login, order form
- `components/order/`, `service/`, `dashboard/`, `notification/` — feature components
- `lib/`            — api client, auth storage, formatters, constants
- `context/`        — Auth, AdminAuth, Toast providers
- `hooks/`          — useAuth, useAdminAuth, useToast, useDebounce
- `types/`          — TypeScript types matching the API
- `middleware.ts`   — route protection

## Auth model
- Customer login stores JWT in `localStorage` + cookie `customer_token`
- Admin login stores JWT in `localStorage` + cookie `admin_token`
- Cookies are only used by `middleware.ts` for redirects
- Real verification happens on every backend API call

## Scripts
- `npm run dev`    — dev server
- `npm run build`  — production build
- `npm run start`  — run the build
- `npm run lint`   — eslint

## Deploy (Vercel)
1. Push to GitHub
2. Import into Vercel
3. Add env vars: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_CURRENCY`
4. Deploy. Done.

Update the backend `FRONTEND_URL` to match your Vercel domain (or custom domain) so CORS works.