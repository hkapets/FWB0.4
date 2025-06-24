# Fantasy World Builder

## Overview

Fantasy World Builder is a comprehensive full-stack web application for creating and managing fantasy worlds. The application provides extensive lore management capabilities, character development tools, and world-building features with a beautiful dark fantasy-themed interface. It supports multilingual content (Ukrainian and English) and includes real-time synchronization, audio controls, and export functionality.

## System Architecture

### Frontend Architecture

- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: 
  - Zustand for global state (language preferences, audio settings)
  - React Query (TanStack Query) for server state management and caching
- **UI Framework**: 
  - Radix UI primitives for accessible components
  - UnoCSS for utility-first styling
  - Custom fantasy theme with dark colors and purple/gold accents
- **Build Tool**: Vite for fast development and optimized builds
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture

- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript for full-stack type safety
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **File Uploads**: Express-fileupload for handling image uploads
- **Session Management**: Connect-pg-simple for PostgreSQL session storage

### Data Storage Solutions

- **Primary Database**: PostgreSQL hosted on Neon Database
- **ORM**: Drizzle ORM with migrations support
- **Schema**: Comprehensive schema supporting:
  - Users and authentication
  - Worlds and world templates
  - Locations with map coordinates
  - Characters with detailed profiles
  - Creatures/bestiary entries
  - Magic systems and artifacts
  - Events and timeline management
  - Races, classes, and lore entries

## Key Components

### World Management
- Create and manage multiple fantasy worlds
- World templates for different fantasy settings (classic, dark, steampunk, etc.)
- Import/export world configurations
- Multilingual world content support

### Lore System
- **Geography**: Locations, regions, and interactive maps
- **Bestiary**: Creatures, monsters, and magical beings
- **Magic System**: Spells, rituals, and magical schools
- **Artifacts**: Magical items and legendary objects
- **Events**: Historical events and timeline management
- **Races**: Fantasy races with detailed characteristics
- **Writing Systems**: Languages, scripts, and calendars
- **Politics**: Governments, factions, and power structures
- **History**: Eras, periods, and historical events

### Character Management
- Detailed character profiles with relationships
- Character classes and progression systems
- Family trees and character connections
- Image uploads for character portraits

### User Interface Features
- Fantasy-themed dark UI with purple and gold accents
- Responsive design for desktop and mobile
- Audio controls with background music and sound effects
- Global search functionality
- Bulk operations and filtering
- Drag-and-drop reordering
- Real-time updates

## Data Flow

1. **Client Requests**: React components make API calls using React Query
2. **Server Processing**: Express routes handle requests and validate data
3. **Database Operations**: Drizzle ORM performs type-safe database operations
4. **Response Caching**: React Query caches responses for optimal performance
5. **State Updates**: UI updates automatically based on cached data changes

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Hook Form)
- UI components (Radix UI primitives)
- Styling (UnoCSS, Tailwind CSS reset)
- State management (Zustand, TanStack Query)
- Utilities (date-fns, clsx, class-variance-authority)
- Drag and drop (@dnd-kit packages)

### Backend Dependencies
- Express.js framework
- Drizzle ORM with PostgreSQL driver
- Neon Database serverless driver
- File upload handling (express-fileupload)
- Session management (express-session, connect-pg-simple)

### Development Dependencies
- TypeScript compiler
- Vite build tool
- TSX for development server
- Concurrently for running multiple processes
- ESBuild for server bundling

## Deployment Strategy

The application is configured for deployment on Replit with autoscaling:

- **Development**: Concurrent client and server development with hot reloading
- **Build Process**: 
  1. Vite builds the client application
  2. TypeScript compiles server code
  3. ESBuild bundles server for production
- **Production**: Single Node.js process serving both API and static files
- **Database**: Neon PostgreSQL database with connection pooling
- **Assets**: Static files served from Express with file upload support

## Changelog

- June 24, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.