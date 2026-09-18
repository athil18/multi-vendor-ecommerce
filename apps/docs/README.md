# Nexus — Multi-Vendor Marketplace

> A production-grade multi-vendor marketplace built with Next.js 16, MongoDB, Stripe Connect, and Tailwind CSS 4.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secrets, and Stripe keys

# Run development server
npm run dev

# Production build
npm run build
npm start
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | ✅ | Secret for signing refresh tokens |
| `NEXT_PUBLIC_APP_URL` | ✅ | Application base URL |
| `STRIPE_SECRET_KEY` | ✅ | Stripe secret API key |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe webhook signing secret |

## Architecture

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Database**: MongoDB Atlas + Mongoose 9
- **Payments**: Stripe Connect (Transfer model)
- **Auth**: JWT access/refresh tokens + bcrypt
- **Styling**: Tailwind CSS 4 with custom design tokens
- **State**: React Context + localStorage

## Project Structure

```
src/
├── app/                  # Pages and API routes
│   ├── api/             # Backend API routes
│   │   ├── auth/        # Authentication endpoints
│   │   ├── products/    # Product CRUD
│   │   ├── orders/      # Order management
│   │   ├── seller/      # Seller-specific endpoints
│   │   ├── admin/       # Admin moderation
│   │   ├── payments/    # Stripe integration
│   │   └── categories/  # Category listing
│   ├── auth/            # Login/Register pages
│   ├── checkout/        # Checkout page
│   ├── seller/          # Seller dashboard
│   ├── customer/        # Customer dashboard
│   └── admin/           # Admin moderation
├── components/          # Reusable React components
├── context/             # React Context providers
├── lib/                 # Shared utilities
│   ├── auth.ts          # Auth middleware
│   ├── db.ts            # MongoDB connection
│   ├── jwt.ts           # JWT utilities
│   ├── stripe.ts        # Stripe client
│   ├── pagination.ts    # Pagination utility
│   └── schemas/         # Zod validation schemas
└── models/              # Mongoose models (14 entities)
```

## Documentation

All project documentation is in the `docs/` directory:

| Document | Purpose |
|----------|---------|
| [prd.md](docs/prd.md) | Product Requirements (WHAT and WHY) |
| [techspec.md](docs/techspec.md) | Technical Specification (HOW) |
| [appflow.md](docs/appflow.md) | User Journeys and State Machines |
| [design.md](docs/design.md) | Design System and UX Standards |
| [schema.md](docs/schema.md) | Database Schema Documentation |
| [implementationplan.md](docs/implementationplan.md) | Phased Implementation Plan |
| [tracker.md](docs/tracker.md) | Current Project State |
| [rules.md](docs/rules.md) | Engineering Rules and Standards |
| [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) | API Reference |
| [ADR.md](docs/ADR.md) | Architectural Decision Records |

## Key Features

- 🛍️ Multi-vendor product catalog with filtering, sorting, and search
- 🏪 Seller storefronts with analytics dashboards
- 💳 Stripe Connect payments with automatic multi-seller payouts
- 🛡️ Admin moderation queue for catalog quality control
- 🔐 JWT-based authentication with role-based access control
- 🎨 Premium glassmorphism UI with dark mode
- 📦 Transactional order processing with atomic inventory locking
- 🎫 Coupon system with global and seller-scoped discounts

## License

Private — All rights reserved.
