# Phoenix Invoice System

## Overview

Phoenix Invoice System is a comprehensive invoice and sales representative management platform built with modern web technologies. The system provides automated JSON file processing, advanced financial calculations, and a Persian-language user interface with an elegant obsidian and gold theme.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom obsidian and gold theme
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful endpoints with type-safe request/response handling

### Database Architecture
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema updates
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### Authentication System
- **Provider**: Replit Auth integration with OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **User Management**: Automatic user creation and profile management
- **Security**: Secure session cookies with HTTP-only and secure flags

### Data Models
- **Users**: Profile management with admin roles
- **Sales Collaborators**: Commission-based sales team management
- **Representatives**: Customer representative tracking with contact information
- **Invoices**: Comprehensive invoice management with line items
- **Payments**: Payment tracking with multiple methods (bank transfer, cash, cheque)
- **Commission System**: Automated commission calculations and payouts

### File Processing System
- **JSON Upload**: Automated processing of Marzban-format activity records
- **Data Standardization**: Conversion from raw JSON to standardized activity records
- **Smart Pricing**: Dynamic pricing calculations based on usage tiers
- **Representative Creation**: Automatic representative creation from upload data

### User Interface
- **Theme**: Custom obsidian and gold color scheme with Persian typography
- **Components**: Comprehensive UI component library with consistent styling
- **Responsiveness**: Mobile-first design with adaptive layouts
- **Animations**: Smooth transitions using Framer Motion
- **Accessibility**: ARIA-compliant components with keyboard navigation

## Data Flow

1. **Authentication Flow**: Users authenticate via Replit Auth, sessions stored in PostgreSQL
2. **Data Upload Flow**: JSON files processed, representatives auto-created, invoices generated
3. **Commission Flow**: Sales activities trigger commission calculations and balance updates
4. **Payment Flow**: Payments recorded, allocated to invoices, commission payouts processed
5. **Reporting Flow**: Dashboard aggregates data for real-time insights

## External Dependencies

### Core Dependencies
- **Database**: PostgreSQL (provisioned via Replit)
- **Authentication**: Replit Auth service
- **File Storage**: Local file system for temporary uploads
- **WebSocket**: Native WebSocket support for real-time features

### Third-Party Libraries
- **UI Components**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS for utility-first styling
- **Forms**: React Hook Form with Zod validation
- **Date Handling**: date-fns for internationalized date operations
- **Charts**: Recharts for data visualization

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 runtime
- **Database**: PostgreSQL 16 with automatic provisioning
- **Hot Reload**: Vite HMR for instant development feedback
- **Process Management**: tsx for TypeScript execution in development

### Production Build
- **Frontend**: Vite build with optimized bundles and asset compression
- **Backend**: esbuild compilation to ESM format with external dependencies
- **Static Assets**: Served from dist/public directory
- **Process**: PM2-style process management with automatic restarts

### Configuration
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, REPL_ID
- **Port Configuration**: Port 5000 for development, 80 for production
- **SSL**: Automatic HTTPS in production environment
- **Scaling**: Replit Autoscale deployment target for automatic scaling

## Changelog

Changelog:
- June 14, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.