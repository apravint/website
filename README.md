# Website

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.0.6.

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

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

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

## Local Development Setup

To run the project locally with Firebase features enabled:

1. Open `src/environments/environment.ts`.
2. Replace `YOUR_FIREBASE_API_KEY` and `YOUR_FIREBASE_APP_ID` with your actual Firebase credentials.
3. Run the following command to prevent your local changes to this file from being tracked by Git:
   ```bash
   git update-index --assume-unchanged src/environments/environment.ts
   ```
   If you ever need to track changes to this file again, run:
   ```bash
   git update-index --no-assume-unchanged src/environments/environment.ts
   ```

## Notes & Maintenance 🔧

- Tests: Unit tests can be run headless in CI with `npm test -- --watch=false` (we fixed failing specs by adding `RouterTestingModule` to two component tests).
- Build: Production build: `npm run build -- --configuration production`.
- Security: The repository currently reports dependency vulnerabilities in Dependabot/GitHub Security alerts — consider running `npm audit` and addressing high/critical results.

If you'd like, I can open a PR with these test fixes (already pushed to the `release` branch) and optionally address dependency updates.
