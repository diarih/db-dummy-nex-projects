# Repository Guidelines

## Project Structure & Module Organization
App logic lives in `app/`, split by concern: `models/` for Lucid data mappers, `middleware/` for HTTP guards, and `exceptions/` for typed error classes. Framework bootstrapping is under `start/`, runtime configuration defaults under `config/`, and reusable CLI wiring in `ace.js` and `adonisrc.ts`. Database schema changes are versioned through timestamped TypeScript migrations in `database/migrations/`, while HTTP startup code compiles to `bin/server.js`. Shared testing hooks sit in `tests/bootstrap.ts`, and onboarding env hints are captured in `.env.example`.

## Build, Test, and Development Commands
Run `npm run dev` for the Adonis dev server with HMR. Use `npm run build` to compile to `build/` via the assembler, and `npm run start` to launch the compiled output. Execute `npm run test` to run the Japa suite, `npm run lint` for ESLint, `npm run format` to apply Prettier, and `npm run typecheck` to validate the TypeScript surface.

## Coding Style & Naming Conventions
The repo follows the Adonis ESLint and Prettier presets, with `.editorconfig` enforcing two-space indentation, LF endings, and UTF-8 encoding. Name Lucid models in PascalCase (`User`), services in UpperCamelCase, and files in lowercase-hyphenated or snake_case according to Adonis norms (`create_users_table.ts`). Stick to ESM imports and prefer the configured path aliases (e.g., `import User from '#models/user'`). Keep middleware pure and concise, surfacing domain errors through dedicated exception classes.

## Testing Guidelines
Author specs alongside features in `tests/`, using descriptive filenames such as `users.spec.ts`. Extend `tests/bootstrap.ts` for suite-wide setup. Every bug fix or feature should ship with at least one Japa assertion covering the new behavior. When touching Lucid models or migrations, include database-focused tests and reset state with transactions. Favor fast unit or service coverage; reserve end-to-end flows for critical paths.

## Commit & Pull Request Guidelines
Use Conventional Commit prefixes (`feat:`, `fix:`, `chore:`) to keep change logs readable. Keep commits scoped and note any `npm test` or lint evidence in the body when useful. Pull requests should summarize intent, link tracking tickets, outline test evidence, and attach screenshots or API payloads when customer-facing behavior changes.

## Security & Access Controls
Limit filesystem reads and writes to this repository; never traverse parent directories or shared volumes. Treat `.env` as confidential; use only `.env.example` for reference and inject real secrets through your local environment, not through source control. Avoid logging secrets or persisting credentials in fixtures. Report suspicious files or unexpected access needs before proceeding.
