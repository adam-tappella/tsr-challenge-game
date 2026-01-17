# Cursor Rules - TSR-CEO-demo

This document contains project-specific rules and guidelines for AI-assisted development.

## Project Overview

**Project Name**: TSR-CEO-demo  
**Description**: [Brief description of what this app does]  
**Created**: 2026-01-16

## Architecture

```
TSR-CEO-demo/
├── src/                    # Frontend source
│   ├── components/         # React components
│   │   └── ui/            # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── stores/            # Zustand state stores
│   ├── types/             # TypeScript types
│   ├── lib/               # Utility functions
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── backend/               # Express backend
│   └── server.ts          # Server entry point
├── docs/                  # Documentation
│   ├── ai/               # AI-specific docs
│   └── backlog/          # Future work
├── ui/                    # Design system
└── code-templates/        # Code templates
```

## Key Patterns

### Component Creation
1. Use the template in `code-templates/frontend/COMPONENT_TEMPLATE.tsx`
2. Always use `cn()` for class merging
3. Follow the style guide in `ui/STYLE_GUIDE.md`

### State Management
1. Use Zustand for global state
2. Follow the template in `code-templates/frontend/ZUSTAND_STORE_TEMPLATE.ts`

### API Routes
1. Follow REST conventions
2. Use the template in `code-templates/backend/API_ROUTE_TEMPLATE.ts`

## Common Gotchas

<!-- Add project-specific gotchas here -->

## AI Assistant Guidelines

1. Always check `docs/ai/LESSONS_LEARNED.md` before debugging
2. Capture out-of-scope ideas in `docs/backlog/BACKLOG.md`
3. Update `docs/CHANGELOG.md` for user-visible changes
4. Follow the naming conventions in `docs/NOMENCLATURE.md`
