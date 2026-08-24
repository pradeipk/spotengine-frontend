# Frontend Implementation Plan (SpotEngine)

This plan outlines the architecture, design system, and feature rollout for the SpotEngine Next.js Frontend. Our primary goal is to deliver a **premium, highly dynamic, and visually stunning** user interface that integrates seamlessly with the robust backend APIs we just built.

## User Review Required

> [!IMPORTANT]
> Since we are not using Tailwind CSS, a strong CSS architecture is critical to maintain a premium feel. We will implement a **Custom Design System** using CSS Variables (Custom Properties) in `globals.css` combined with **CSS Modules** for component-scoped styling. This ensures high performance, zero style leakage, and complete control over glassmorphism and animations.

## Open Questions

> [!WARNING]
> Please review and provide your preferences on the following:
> 1. **State Management:** To manage the JWT user session, role-based access, and shopping-cart-style booking data, should we use **React Context** (built-in but can cause re-renders) or **Zustand** (lightweight, highly recommended)?
> 2. **Maps Integration:** The catalog search uses latitude/longitude radius tracking. For the UI, do you want to integrate a map provider (like Google Maps or Mapbox) immediately for MVP, or stick to a text/list-based interface first?
> 3. **Color Palette:** Do you have a preferred brand color scheme (e.g., Deep Midnight Blue & Neon Cyan for a tech-heavy look), or should I design a modern dark-mode-first palette?

---

## Architectural Foundation

### 1. The Design System (Premium Aesthetic)
- **Typography:** Integrate a premium font like `Inter` or `Outfit` via `next/font`.
- **CSS Variables:** Define HSL-based color tokens in `globals.css` to easily support Dark/Light modes.
- **Animations:** Build a reusable `animations.css` containing micro-animations (fade-ins, slide-ups, hover glows).
- **Glassmorphism:** Create utility classes for frosted glass effects (backdrop-filter) for modals and navbars.

### 2. API & Authentication Layer
- **Axios Interceptor:** Set up a global Axios client that automatically attaches the JWT `Bearer` token to requests.
- **Token Rotation:** Implement an interceptor that listens for `401 Unauthorized` responses and automatically hits the `POST /auth/refresh` endpoint to seamlessly rotate tokens.
- **Auth Provider:** A top-level wrapper that checks token validity on app load and redirects unauthenticated users away from protected routes.

---

## Proposed Component Implementation (Phased)

We will build the frontend iteratively.

### Phase 1: Foundation & Authentication
- **[NEW]** `src/styles/globals.css`, `src/styles/design-tokens.css` (Colors, spacing, typography)
- **[NEW]** `src/lib/api.ts` (Axios configuration and interceptors)
- **[NEW]** `src/components/ui/...` (Buttons, Inputs, Modals, Spinners built with CSS modules)
- **[NEW]** `/login` and `/register` pages integrating with our JWT endpoints.
- **[NEW]** Role-based routing guards (redirecting Customers vs Engineers).

### Phase 2: Customer Discovery & Booking Flow
- **[NEW]** `/` (Landing Page): Premium hero section, value proposition, and search bar.
- **[NEW]** `/search`: Displays available skill categories and allows customers to input a location/radius to hit `GET /catalog/search`.
- **[NEW]** `/book/[engineerId]`: Fetches a pricing estimate via `POST /pricing/estimate` and submits the job request via `POST /bookings`.
- **[NEW]** `/dashboard/customer`: Lists active and past bookings, allows status tracking and leaving reviews.

### Phase 3: Engineer Dashboard
- **[NEW]** `/dashboard/engineer`: Main hub for incoming job requests.
- **[NEW]** `/dashboard/engineer/profile`: Form to update service radius, bio, and add skills to their profile.
- **[NEW]** `/dashboard/engineer/jobs`: Kanban-style or list view of jobs (Pending -> Accepted -> In Progress -> Completed).
- **[NEW]** `/dashboard/engineer/ledger`: View total earnings and platform fees deducted.

### Phase 4: Admin Dashboard
- **[NEW]** `/dashboard/admin`: High-level metrics showing total active jobs and platform revenue.
- **[NEW]** `/dashboard/admin/verifications`: A queue interface mapping to `GET /admin/verifications` to approve or reject KYC documents.
- **[NEW]** `/dashboard/admin/pricing`: Interface to manage `RateCard` base fees and hourly rates.

---

## Verification Plan

### Automated Checks
- Ensure all Next.js pages build successfully without TypeScript errors (`npm run build`).
- Ensure no ESLint warnings block the build.

### Manual Verification
- **Aesthetic Review:** We will iteratively share screenshots or recordings of the UI to ensure it meets the "Premium / WOW" standard.
- **E2E Flow:** Register a Customer -> Register an Engineer -> Admin Approves Engineer -> Customer searches and books Engineer -> Engineer accepts and completes -> Payment Ledger updates -> Customer leaves a rating.
