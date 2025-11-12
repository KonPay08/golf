# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A golf score tracking web application built as a monorepo with pnpm workspaces. The system consists of a REST API server (Clean Architecture + DDD) and a React frontend for score registration and analysis.

## Monorepo Structure

```
apps/
  server/          # Node.js REST API (Express + TypeScript)
  web/             # React frontend (Vite + React Router + TanStack Query)
packages/
  shared/          # Shared TypeScript types between server and client
```

**Package Manager**: pnpm with workspaces
**Shared Types**: `@golf/shared` package for HTTP/domain DTOs used by both apps

## Architecture Overview

### Server (apps/server/)

**Pattern**: Clean Architecture + DDD with strict layer separation

See `apps/server/CLAUDE.md` for detailed server architecture documentation.

Key points:
- 4-layer structure: domain → application → interface → infra
- Pure domain logic with zero framework dependencies
- Type-safe constants with derived types (e.g., `ParValue` from `GOLF_RULES.PAR_VALUES`)
- 77 tests with 98%+ coverage
- REST API on port 3000

### Frontend (apps/web/)

**Stack**: React 19 + TypeScript + Vite + TailwindCSS v4

**Key Libraries**:
- React Router 7 (file-based routing convention)
- TanStack Query v5 (server state management)
- Motion (Framer Motion) for animations
- Storybook for component development

**Directory Structure**:
```
src/
  api/
    client.ts          # API client with fetchApi helper
    hooks.ts           # TanStack Query hooks (useRound, useEntryScore)
    types.ts           # Re-exports from @golf/shared
  presentation/        # Reusable UI components
    FocusNavigator/    # Up/down navigation arrows
    ScoreInput/        # Score input with +/- buttons
    ScoreSummary/      # Statistics display (total, toPar, birdies, etc.)
    ScoreTable/        # Generic table with focus state
    SwitchTabs/        # OUT/IN tab switcher
  routes/              # Route components (React Router convention)
    home/
    score-registration/
  index.css            # Tailwind v4 @theme design tokens
  main.tsx             # App entry point with QueryClient + Router
```

## Commands

### Development

**Root level (run both apps)**:
```bash
# Not yet set up - run apps individually for now
```

**Server (apps/server/)**:
```bash
npm start           # Start API server on port 3000 (nodemon)
npm run test        # Run tests in watch mode
npm run test-all    # Run all tests with coverage
```

**Frontend (apps/web/)**:
```bash
pnpm dev            # Start Vite dev server (default: http://localhost:5173)
pnpm build          # Build for production (TypeScript check + Vite build)
pnpm lint           # Run ESLint
pnpm preview        # Preview production build
pnpm storybook      # Run Storybook on port 6006
pnpm build-storybook # Build Storybook for deployment
```

**Shared Package (packages/shared/)**:
```bash
pnpm build          # Compile TypeScript to dist/
pnpm clean          # Remove dist/ folder
```

### Testing

**Server**: Jest + SWC (77 tests covering domain, application, infra layers)
**Frontend**: Vitest + Playwright (Storybook integration tests only - no unit tests yet)

## Frontend Architecture Details

### State Management Philosophy

**Server State**: TanStack Query with optimistic updates
- `useRound(roundId)` - Fetch round data with 5min staleTime
- `useEntryScore(roundId)` - Score submission with optimistic UI + rollback on error

**Local State**: React useState
- `courseType` - OUT/IN tab selection
- `focusedIndex` - Currently focused hole (0-based)
- `pendingScore` - Unsaved score edits (saved on focus change)

**Why this pattern**: Server state is cached and synchronized via TanStack Query. Local UI state (focus, pending edits) stays in component state. Score edits are batched - only sent to API when user moves to next hole.

### Score Submission Pattern

**Key behavior**: Scores are NOT sent immediately on +/- button click.

1. User clicks +/- → Update `pendingScore` state (no API call)
2. User moves focus (arrow, tab switch, row click) → Save `pendingScore` to API
3. API success → Clear `pendingScore`, optimistic update reflects in UI
4. API failure → Rollback to previous data, user must re-enter

**Implementation**: `savePendingScore()` helper called in all focus change handlers:
- `handleFocusMove` - Arrow navigation
- `handleFocusChange` - Table row click
- `handleCourseTypeChange` - OUT/IN tab switch

### Component Organization

**Presentation components** are organized in feature folders with:
- `ComponentName.tsx` - Component implementation
- `ComponentName.stories.tsx` - Storybook stories
- `index.ts` - Re-export for clean imports

**Route components** follow React Router conventions:
- Directory name = URL path segment
- `index.ts` exports the component

### Styling with Tailwind v4

**Design tokens** defined in `index.css` using `@theme` directive:
```css
@theme {
  --color-brand: #49C47B;
  --color-bg: white;
  --color-fg: oklch(0.22 0.03 254);
  /* ... */
}
```

**Always use canonical Tailwind classes** instead of `var(--color-*)`:
- ✅ `bg-bg`, `text-fg`, `border-border`
- ❌ `bg-[var(--color-bg)]`

**Custom utilities**:
- `.num-tabular` - Tabular numbers for scores
- `.h-screen-safe` - 100dvh for mobile
- `.scrollbar` - Custom scrollbar styling

### Performance Optimization

**When to use `useMemo`**:
- Expensive computations (array filters, statistics calculations)
- Derived data from API responses

**When NOT to use `useCallback`**:
- Components are not `React.memo`'d (no benefit, adds complexity)
- Only add after profiling shows actual performance issues

**Current optimizations in ScoreRegistration**:
- `COLUMNS` constant outside component (stable reference)
- `allRows`, `outRows`, `inRows` memoized with `useMemo`
- `summary` calculation memoized

## Data Flow: Score Registration

```
User clicks +/- button
  → handleScoreChange updates pendingScore state (local only)
  → ScoreInput shows pendingScore value immediately

User moves to next hole (arrow click)
  → handleFocusMove calls savePendingScore()
  → entryScoreMutation.mutate(pendingScore)
  → TanStack Query: onMutate (optimistic update)
  → API POST /rounds/:id/scores
  → TanStack Query: onSuccess (clear cache) or onError (rollback)
  → queryClient.invalidateQueries (refetch latest data)
```

## Type Sharing Pattern

**Shared package** (`@golf/shared`) contains:
- `http/` - `SuccessResponse<T>`, `ErrorResponse` (HTTP wrappers)
- `rounds/` - All Round-related DTOs matching server's `application/dto.ts`

**Usage in frontend**:
```typescript
import type { GetRoundResult, EntryScoreCommand } from "@golf/shared";
```

**Why**: Ensures type safety between server responses and client expectations. Single source of truth for API contracts.

## Environment Variables

**Frontend** (apps/web/):
- `VITE_API_BASE_URL` - API endpoint (default: `http://localhost:3000/api`)

**Server** (apps/server/):
- `NODE_ENV` - `development` or `production`
- See `config/default.json` for configuration

## Development Workflow

### Adding a New Feature

1. **Server side** (if API changes needed):
   - Update domain layer (`domain/entities.ts`, `domain/services.ts`)
   - Add use case to `application/usecases.ts` with DTOs in `application/dto.ts`
   - Add HTTP endpoint (validator, controller, route)
   - Update `@golf/shared` types
   - Write tests (domain → application → E2E)

2. **Frontend side**:
   - Add API client function to `api/client.ts`
   - Add TanStack Query hook to `api/hooks.ts`
   - Create/update presentation components with Storybook stories
   - Update route component to use new hook
   - Consider optimistic updates for mutations

3. **Build shared package**: `cd packages/shared && pnpm build`

### Creating New Presentation Components

Follow existing pattern:
```
presentation/
  MyComponent/
    MyComponent.tsx        # Implementation with TypeScript types
    MyComponent.stories.tsx # At least 1 story
    index.ts               # export { default } from "./MyComponent"
```

**Component guidelines**:
- Export prop types (e.g., `export type MyComponentProps`)
- Use Motion for animations with `useReducedMotion` check
- Use canonical Tailwind classes (not CSS variables)
- Support `className` prop for composition

### Storybook Development

```bash
pnpm storybook  # Run on http://localhost:6006
```

**Story structure**:
- Use CSF3 format (`satisfies Meta<typeof Component>`)
- Name stories with Japanese descriptions if appropriate
- Include interactive examples with hooks where relevant

## Known Patterns & Conventions

### React Hooks Rules

**Critical**: All hooks must be called BEFORE early returns (loading/error states).

```typescript
// ✅ Correct
export default function MyComponent() {
  const { data, isLoading, error } = useQuery(...);
  const mutation = useMutation(...);
  const memoValue = useMemo(...);

  if (isLoading) return <Loading />;
  if (error) return <Error />;

  return <div>{data}</div>;
}

// ❌ Wrong - hooks after conditional return
export default function MyComponent() {
  if (condition) return <div />;

  const { data } = useQuery(...); // Error!
}
```

### TanStack Query Patterns

**Query keys** use factory pattern:
```typescript
export const roundKeys = {
  all: ["rounds"] as const,
  details: () => [...roundKeys.all, "detail"] as const,
  detail: (id: string) => [...roundKeys.details(), id] as const,
};
```

**Optimistic updates** in mutations:
1. `onMutate` - Cancel queries, save snapshot, apply optimistic update
2. `onError` - Rollback using saved snapshot
3. `onSettled` - Invalidate queries to refetch from server

### TypeScript Patterns

**Avoid parameter properties** (erasableSyntaxOnly error):
```typescript
// ❌ Wrong
class MyClass {
  constructor(public foo: string) {}
}

// ✅ Correct
class MyClass {
  foo: string;
  constructor(foo: string) {
    this.foo = foo;
  }
}
```

### Motion (Framer Motion) Usage

```typescript
import { motion, useReducedMotion } from "motion/react";

const reduced = useReducedMotion();
const duration = (reduced ? 120 : 180) / 1000;

<motion.div
  animate={{ opacity: isFocused ? 1 : 0 }}
  transition={{ duration }}
/>
```

## Current Implementation Status

### ✅ Server (Complete MVP)
- All 5 use cases implemented (CreateRound, EntryScore, GetRound, etc.)
- 77 tests with 98%+ coverage
- REST API fully functional
- In-memory repository (MongoDB not yet implemented)

### ✅ Frontend (Score Registration Complete)
- Score registration UI with all components
- API integration with optimistic updates
- Pending score pattern (save on focus change)
- Storybook stories for all components

### 🚧 Not Yet Implemented
- MongoDB persistence (server using in-memory only)
- Authentication/authorization
- Course master data
- Round history/statistics views
- Dark mode toggle UI (theme CSS ready, no toggle)
- Unit tests for frontend (only Storybook tests exist)
