# Pickleball Court Booking and Management Platform

A single-venue pickleball court booking and management platform built as a monorepo with Next.js, NestJS, GraphQL, and MongoDB.

## Architecture

This is a pnpm + Turborepo monorepo with three main apps and one shared package:

```
pickleball-platform/
├── apps/
│   ├── web/          # Next.js 15 customer/public app
│   ├── web-admin/    # Next.js 15 staff/owner administration
│   └── api/          # NestJS + GraphQL backend
├── packages/
│   └── pickleball-kit/  # Shared package (@juls/pickleball-kit)
```

### Apps

**`apps/web` (Customer Frontend)**
- Next.js 15 with App Router, React 19, TypeScript
- Tailwind CSS v4, Ark UI components
- GraphQL client via `@juls/pickleball-kit/sdk`
- Route groups: `(public)` for public pages, `(auth)` for login/register, `(dashboard)` for customer bookings
- Features: Court browsing, availability/booking flow with holds, customer bookings, payments (PayMongo + bank transfer)

**`apps/web-admin` (Administration)**
- Next.js 15 App Router, staff/owner only
- Separate Vercel project and domain
- Operations: overview, bookings, schedule, change requests, payments, customers
- Venue: courts, venue profile, content
- Owner-only: staff/permissions, audit logs
- Uses the same GraphQL API and `@juls/pickleball-kit` contracts
- Planned in Phase 7; see `docs/WEB_ADMIN.md`

**`apps/api` (Backend)**
- NestJS 11 with GraphQL Yoga
- MongoDB + Mongoose ODM
- JWT authentication (access tokens)
- Modules: Auth, Users, Venue, Courts, Content, Bookings, Payments
- Features: Role-based access control, booking concurrency protection, hold expiration, payment processing, webhooks

### Shared Package

**`packages/pickleball-kit` (`@juls/pickleball-kit`)**
- Client-safe shared code only (no server secrets/DB access)
- Subpath exports:
  - `@juls/pickleball-kit/ui` - React components (Button, Card, Input, etc.)
  - `@juls/pickleball-kit/design-tokens` - Design tokens
  - `@juls/pickleball-kit/types` - TypeScript types
  - `@juls/pickleball-kit/schemas` - Zod validation schemas
  - `@juls/pickleball-kit/sdk` - GraphQL client
  - `@juls/pickleball-kit/graphql` - GraphQL operations/fragments
- Built with tsup

## Key Features

- **Court Booking**: Browse courts, check availability, book with 15-min slot granularity
- **Hold System**: 10-minute holds to reserve slots during payment
- **Concurrency Protection**: Unique slot locks prevent double-bookings
- **Change/Cancellation Requests**: Customers can request changes/cancellations, staff approve/reject
- **Payments**: PayMongo integration (GCash, Maya, QRPh) + manual bank transfer with staff verification
- **Administration**: Dedicated `apps/web-admin` for staff/owner operations (Phase 7)
- **Role and Permissions**: Customer, staff, and owner roles; validated staff permissions
- **Audit Logging**: Owner-visible audit trail for critical administrative actions
- **Content Management**: Manage venue info, courts, and site content

## Getting Started

### Prerequisites
- Node.js 20+ 
- pnpm 10+
- MongoDB (local or Atlas)

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local
cp apps/web-admin/.env.local.example apps/web-admin/.env.local   # after Phase 7.5 scaffold
```

### Development

```bash
# Start all apps in development
pnpm dev

# Or start individually
pnpm --filter @app/web dev        # http://localhost:3000
pnpm --filter @app/web-admin dev  # http://localhost:3002 (after Phase 7.5)
pnpm --filter @app/api dev        # http://localhost:3001/graphql
```

### Build

```bash
# Build all packages and apps
pnpm build

# Build specific package
pnpm --filter @juls/pickleball-kit build
pnpm --filter @app/api build
pnpm --filter @app/web build
pnpm --filter @app/web-admin build   # after Phase 7.5
```

### Testing

```bash
# Run API tests
pnpm --filter @app/api test

# Type checking
pnpm typecheck
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Monorepo | pnpm workspaces + Turborepo |
| Frontend | Next.js 15, React 19, Tailwind CSS v4, Ark UI |
| Admin | Next.js 15 (`apps/web-admin`), staff/owner roles |
| Backend | NestJS 11, GraphQL Yoga |
| Database | MongoDB, Mongoose |
| Validation | Zod, class-validator |
| Payments | PayMongo |
| Language | TypeScript (strict) |

## Project Structure Details

### How It Works

1. **Shared Package First**: `@juls/pickleball-kit` contains types, schemas, and UI components used by both frontend and backend. Only client-safe code goes in the shared package.

2. **API-First Design**: All business logic lives in `apps/api`. Both frontends communicate via GraphQL. Backend enforces all validations, permissions, and booking rules.

3. **Booking Flow**:
   - Customer selects court/date → views available 15-min slots
   - Selects time and duration → gets price quote
   - Creates hold (10 min) → reserves slots with unique lock
   - Proceeds to payment → PayMongo or bank transfer
   - On payment success/verification → booking confirmed

4. **Concurrency Safety**: Booking slots use a unique index `{courtId, startAt}` on `BookingSlot` collection. Even with transactions, this prevents double-bookings. Fallback for non-replica-set MongoDB included.

5. **Role-Based Access**: Users have roles (customer, staff, owner). Staff permissions are validated and enforced with `JwtAuthGuard`, `RolesGuard`, and `PermissionsGuard`. Owner-only operations cover refunds, staff management, and audit logs.

6. **Separation of Surfaces**: `apps/web` serves public/customer flows. `apps/web-admin` serves staff/owner operations only. The admin UI is never the security boundary; the API is.

## Scripts

```bash
pnpm dev        # Start all apps
pnpm build      # Build all
pnpm lint       # Lint all
pnpm typecheck  # Type check all
pnpm clean      # Clean build artifacts
```

## License

Private project.
