# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start the development server on port 3456
- `npm run build` - Build the application for production

## Architecture Overview

This is a modern React application built with TanStack Start (React-based meta-framework) for full-stack web development. The app is called ".envShare" and appears to be a landing page for a service that helps teams manage environment variables securely.

### Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Meta-framework**: TanStack Start (v1.131.27)
- **Routing**: TanStack React Router with file-based routing
- **Build Tool**: Vite 6 with TypeScript paths support
- **Styling**: TailwindCSS 4 with PostCSS and CSS custom properties
- **UI Components**: shadcn/ui components (New York style) with Radix UI primitives
- **Icons**: Lucide React
- **Theme**: Dark/light mode support with system preference detection

### Project Structure

- `src/routes/` - File-based routing with TanStack Router
  - `__root.tsx` - Root layout with ThemeProvider and meta tags
  - `index.tsx` - Main landing page component
- `src/components/` - React components
  - `ui/` - shadcn/ui components (Button, Card, Badge, etc.)
  - `theme-provider.tsx` - Theme context and localStorage integration
- `src/lib/utils.ts` - Utility functions
- `src/styles/app.css` - TailwindCSS styles with custom CSS variables and theme definitions

### Key Configuration Files

- `components.json` - shadcn/ui configuration with alias mappings
- `vite.config.ts` - Vite configuration with TanStack Start plugin
- `tsconfig.json` - TypeScript configuration with path mapping (@/ alias)
- `postcss.config.ts` - PostCSS with TailwindCSS plugin

### Development Notes

- Uses ESM modules throughout
- The app runs on port 3456 by default (configured in vite.config.ts)
- File-based routing is auto-generated in `routeTree.gen.ts`
- Theme switching is handled via localStorage with "vite-ui-theme" key
- All components follow TypeScript strict mode patterns
- Uses the `@/` path alias for cleaner imports