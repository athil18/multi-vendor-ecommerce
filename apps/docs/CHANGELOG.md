# Changelog — Nexus Marketplace

> All notable changes to this project will be documented in this file.
> The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
> and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Comprehensive Engineering Operating System documentation in `docs/` folder (18 files).
- Multi-vendor marketplace foundation with Next.js 16 and MongoDB.
- User authentication system with JWT access and refresh tokens.
- Role-based access control for customers, sellers, and admins.
- Product catalog with variants, options, and status lifecycle.
- Seller dashboard for store management and order fulfillment.
- Stripe Connect integration for multi-seller payouts.
- Transactional order creation with atomic inventory locking.
- Global and seller-scoped coupon system.
- Admin moderation queue for approving/rejecting products.
- Responsive UI with glassmorphism design language and dark mode.

### Fixed
- Client-side build error in `checkout/page.tsx` caused by importing Node.js `mongoose` module directly in a `'use client'` component.

### Security
- Passwords hashed using bcrypt.
- JWT refresh tokens stored as secure, httpOnly cookies.
- Refresh tokens hashed before storage in database.
- Suspended user check added to auth middleware.

---

## [1.0.0] - 2026-06-14 (Initial Baseline)

### Added
- Initial project scaffolding.
- MongoDB connection configuration.
- Basic routing structure.
