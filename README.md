# Musicclient

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.3.

## Workflow and Tooling

- Work tracking: use the Beads CLI (`bd`) for all task creation and status updates; keep issues descriptive and up to date.
- Package manager: stick to the pinned `npm@11.7.0` (Node 22) to avoid lockfile drift; install dependencies with `npm ci`.
- Angular style: the app uses Angular v21 standalone components by default—do not add the `standalone` flag to component decorators.

## Linting and formatting

- Lint: `npm run lint` (Angular ESLint with OnPush enforcement, template control flow, and host binding restrictions).
- Auto-fix: `npm run lint:fix`.
- Format: `npm run format` (or `npm run format:check` to verify) using the repo Prettier config.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

Unit tests are not a current focus for this project; you can skip them while iterating on features.

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
