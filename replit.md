# Overview

This is a Progressive Web Application (PWA) for field team management called "Netmon Saha Yönetimi" (Netmon Field Management). The application is designed for managing field tasks and reports for Netmon, a fiber optic installation and maintenance company. It features a mobile-first design with offline capabilities, role-based access control (admin/technician), and comprehensive task and report management functionality.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built using React with TypeScript, utilizing a modern component-based architecture:

- **Framework**: React 18 with TypeScript for type safety and development efficiency
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui for consistent, accessible design components
- **Styling**: Tailwind CSS with CSS custom properties for theming and responsive design
- **PWA Features**: Service worker for offline functionality, web app manifest for native-like installation
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture

The backend follows a RESTful API design using Node.js and Express:

- **Runtime**: Node.js with ESM modules for modern JavaScript support
- **Framework**: Express.js for HTTP server and API routing
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Authentication**: Replit Auth integration with OpenID Connect for secure user authentication
- **Session Management**: Express sessions with PostgreSQL storage for persistent login state
- **File Structure**: Modular architecture separating routes, storage layer, and database configuration

## Data Storage Solutions

The application uses PostgreSQL as the primary database with the following approach:

- **Database**: PostgreSQL via Neon serverless for scalability and reliability
- **ORM**: Drizzle ORM for type-safe database queries and migrations
- **Schema Design**: Well-structured relational schema with users, field tasks, field reports, and session tables
- **Migrations**: Drizzle Kit for database schema versioning and deployment
- **Connection Pooling**: Neon serverless connection pooling for efficient database connections

## Authentication and Authorization

Security is implemented through a multi-layered approach:

- **Authentication Provider**: Replit Auth with OpenID Connect for secure identity verification
- **Authorization**: Role-based access control with admin and technician roles
- **Email Restriction**: Access limited to users with @netmon.com.tr email domains
- **Session Management**: Server-side sessions stored in PostgreSQL with configurable TTL
- **API Protection**: Middleware-based authentication checks on all protected routes

## External Dependencies

- **Database**: Neon PostgreSQL serverless database for data persistence
- **Authentication**: Replit Auth service for user identity and authentication
- **UI Components**: Radix UI for accessible, unstyled component primitives
- **Geolocation**: Browser Geolocation API for location-based features
- **PWA**: Service worker and manifest for progressive web app capabilities
- **Development Tools**: Replit-specific plugins for development environment integration