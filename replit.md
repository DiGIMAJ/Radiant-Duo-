# RadiantDuo - Valorant Gaming Duo Finder

## Overview

RadiantDuo is a Valorant-themed dating/matching application built with React, TypeScript, and Vite. The platform allows Valorant players to find gaming partners (duos) by swiping through profiles, matching based on rank and playstyle preferences, and communicating through an integrated chat system. The application features a gaming-inspired design system with Valorant-style colors, tactical UI elements, and a premium upgrade system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: React Router DOM for client-side navigation with protected routes
- **State Management**: React Context API for authentication and TanStack Query for server state management
- **UI Components**: shadcn/ui component library with Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with custom gaming-themed design system including Valorant-inspired colors and typography
- **Theme**: Custom gaming design system with dark mode support using next-themes

### Component Architecture
- **Layout Components**: Navigation component with bottom tab bar for mobile-first design
- **UI Components**: Custom gaming-themed buttons, cards, and interactive elements
- **Page Components**: Modular page structure for Landing, Auth, Onboarding, Swipe, Matches, Chat, Profile, Settings, and Upgrade
- **Protected Routes**: Authentication wrapper component to secure private pages

### Authentication System
- **Provider**: Supabase Auth for user authentication with email/password and social logins
- **Context**: Custom AuthContext hook providing user state management across the application
- **Route Protection**: ProtectedRoute component that redirects unauthenticated users to auth pages

### Data Management
- **ORM**: Drizzle ORM with Neon serverless PostgreSQL for type-safe database operations
- **Real-time**: Supabase real-time subscriptions for chat messaging and live updates
- **Caching**: TanStack Query for intelligent server state caching and synchronization

### Mobile-First Design
- **Responsive**: Mobile-first approach with responsive breakpoints
- **Touch Interactions**: Optimized for touch gestures including swipe functionality
- **Navigation**: Bottom tab navigation optimized for mobile thumb zones

## External Dependencies

### Backend Services
- **Supabase**: Backend-as-a-Service providing authentication, real-time database, and API endpoints
- **Neon Database**: Serverless PostgreSQL database with connection pooling
- **Drizzle ORM**: Type-safe database client for PostgreSQL operations

### UI and Styling
- **shadcn/ui**: Comprehensive component library built on Radix UI primitives
- **Radix UI**: Unstyled, accessible UI primitives for complex components
- **Tailwind CSS**: Utility-first CSS framework with custom gaming theme configuration
- **Lucide React**: Icon library providing gaming and UI icons
- **next-themes**: Theme management for dark/light mode switching

### Development Tools
- **TypeScript**: Static type checking with relaxed configuration for rapid development
- **ESLint**: Code linting with React and TypeScript rules
- **Vite**: Development server and build tool with HMR support
- **React Hook Form**: Form management with validation using Zod resolvers

### Additional Libraries
- **date-fns**: Date manipulation and formatting utilities
- **class-variance-authority**: Type-safe variant-based component styling
- **cmdk**: Command palette component for search functionality
- **embla-carousel**: Touch-friendly carousel component
- **input-otp**: OTP input component for verification flows
- **sonner**: Toast notification system
- **vaul**: Drawer component library for mobile interfaces

### Fonts and Assets
- **Google Fonts**: Rajdhani and Inter font families for gaming aesthetics
- **Custom Design System**: Valorant-inspired color palette and gaming UI elements