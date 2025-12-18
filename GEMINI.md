# Gemini CLI Agent Notes for Musicclient

This document summarizes key information and conventions for working with the `musicclient` project, based on `README.md` and `AGENTS.md`.

## General Information

- Project generated with Angular CLI version 21.0.3.
- The application reloads automatically on source file modifications during development.
- Unit tests are not a current focus; `ng test` uses Vitest.
- End-to-end testing is not pre-configured.

## Workflow and Tooling

- **Task Management**: All work tracking, task creation, planning, and status updates **MUST** be done using the Beads CLI (`bd`). Keep issues descriptive and up to date.
- **Package Manager**: Use the pinned `npm@11.7.0` (Node 22). Install dependencies with `npm ci`.
- **Linting**: `npm run lint` (Angular ESLint with OnPush enforcement, template control flow, and host binding restrictions).
- **Auto-fix**: `npm run lint:fix`.
- **Formatting**: `npm run format` (or `npm run format:check` to verify) using Prettier.
- **Pre-commit hook**: Runs `npm run format` and `npm run lint`. Bypass with `SKIP_PRECOMMIT_LINT=1`.
- **Development Server**: `ng serve` (access at `http://localhost:4200/`).
- **Code Scaffolding**: `ng generate component component-name` (use `ng generate --help` for more options).
- **Building**: `ng build` (artifacts in `dist/`).

## Angular and TypeScript Best Practices (from AGENTS.md)

- **TypeScript**: Strict type checking, prefer type inference, avoid `any` (use `unknown`).
- **Angular**:
  - Always use standalone components; **DO NOT** set `standalone: true` in decorators (it's implicit in v20+).
  - Use signals for state management; Observables for data/loading flows (convert to signals for view when needed).
  - Implement lazy loading for feature routes.
  - **DO NOT** use `@HostBinding` and `@HostListener` decorators; use the `host` object in `@Component` or `@Directive`.
  - Use `NgOptimizedImage` for all static images (does not work for inline base64).
  - Pass all AXE checks and follow WCAG AA minimums (focus management, color contrast, ARIA attributes).
- **Components**:
  - Small, focused, single responsibility.
  - Use `input()` and `output()` functions instead of decorators.
  - Use `computed()` for derived state.
  - Set `changeDetection: ChangeDetectionStrategy.OnPush`.
  - Always prefer separate HTML files for templates.
  - Prefer Reactive forms.
  - **DO NOT** use `ngClass`, use `class` bindings.
  - **DO NOT** use `ngStyle`, use `style` bindings.
  - Use paths relative to the component TS file for external templates/styles.
- **State Management**:
  - Signals for local component state.
  - `computed()` for derived state.
  - Pure and predictable state transformations.
  - **DO NOT** use `mutate` on signals; use `update` or `set`.
- **Templates**:
  - Simple, avoid complex logic.
  - Use native control flow (`@if`, `@for`, `@switch`).
  - Use the async pipe for observables.
  - Do not assume globals (e.g., `new Date()`).
  - Do not write arrow functions.
- **Services**:
  - Single responsibility.
  - `providedIn: 'root'` for singletons.
  - Use `inject()` function.
- **Icons**:
  - Add/edit icons in `src/app/ui/icon/icons.ts` (define `viewBox` and `paths` arrays).
  - Use `<app-icon>` for inline icons and `<app-icon-button>` for icon-only actions; always pass a descriptive `label` to `app-icon-button`.
