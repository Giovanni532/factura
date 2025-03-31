# Factura - Invoicing and Business Management Application

A modern invoicing and business management web application built with Next.js, allowing users to manage clients, quotes, invoices, and payments.

## Prerequisites

- Node.js 18 or later
- pnpm package manager
- PostgreSQL database
- Docker and Docker Compose (optional, for local database setup)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/factura.git
cd factura
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up your environment variables by creating a `.env` file in the root directory with the following variables:

```
BETTER_AUTH_SECRET=your_auth_secret
NEXT_PUBLIC_APP_URL=your_app_url
DATABASE_URL=your_database_url
RESEND_API_KEY=your_resend_api_key
```

4. Database setup:

   - **Option 1**: Use Docker Compose to set up a local PostgreSQL database:

   ```bash
   docker-compose up -d
   ```

   - **Option 2**: Connect to an existing PostgreSQL database by setting the correct `DATABASE_URL` in your `.env` file.

5. Initialize and set up the database:

```bash
pnpm dlx prisma db push
```

## Development

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Build for Production

```bash
pnpm build
pnpm start
```

## Features

- User authentication and management
- Client management
- Quote and invoice creation
- Item and service catalog
- Payment tracking
- Business profile management
- Subscription management

## Tech Stack

- Next.js 15
- TypeScript
- Prisma ORM
- PostgreSQL
- TailwindCSS
- Shadcn UI
- Better Auth
- Resend (for emails)

## Restrictions d'utilisation ®

Cette application Factura® est protégée par des droits de propriété intellectuelle. Seul le propriétaire original est autorisé à déployer cette application en environnement de production. Toute reproduction, distribution ou déploiement par un tiers est strictement interdit sans autorisation écrite explicite.

