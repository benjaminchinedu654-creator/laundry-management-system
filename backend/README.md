# Laundry Service Backend API

A PHP backend API for a laundry service application with admin panel functionality.

## Structure

- `public/` - Web root directory (point your domain here)
- `config/` - Configuration files (database, CORS, app constants)
- `src/` - Application source code
  - `Core/` - Core framework components (Router, Request, Response, etc.)
  - `Controllers/` - Request handlers for both customer and admin functionality
  - `Models/` - Database models
  - `Middleware/` - Authentication and authorization middleware
  - `Helpers/` - Utility classes
  - `Routes/` - Route definitions
- `database/` - Database migrations and seeders
- `storage/` - File storage (logs, uploads)
- `vendor/` - Composer dependencies

## Setup

1. Copy `.env.example` to `.env` and configure your environment variables
2. Install dependencies: `composer install`
3. Run database migrations
4. Seed initial data
5. Point your web server to the `public/` directory

## Features

- Customer authentication and profile management
- Service catalog and pricing
- Order management
- Payment processing
- Admin panel with full CRUD operations
- Notification system
- File upload support