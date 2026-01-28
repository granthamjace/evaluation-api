# Evaluation API - Frontend

Vue 3 + TypeScript SPA for the Evaluation API project.

> For full project documentation, see the [root README](../README.md).

## Tech Stack

- **Framework:** Vue 3 + TypeScript
- **Build:** Vite
- **State:** Pinia (composition API style)
- **Router:** Vue Router (HTML5 history mode)
- **UI:** PrimeVue
- **Testing:** Vitest

## Project Structure

```
src/
├── api/           # HTTP client with auth
├── stores/        # Pinia state management
├── views/         # Page components
├── types/         # TypeScript types
├── router/        # Route definitions
├── App.vue        # Root component
└── main.ts        # App entry point
```

## Setup

```bash
npm install
```

## Development

```bash
npm run dev              # Start dev server (http://localhost:5173)
npm run build            # Type-check and build for production
npm run test:unit        # Run tests with Vitest
npm run lint             # Lint with ESLint
npm run format           # Format with Prettier
npm run type-check       # Run vue-tsc type checking
```

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3000
```

## IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- Disable Vetur if installed

## Browser DevTools

- [Vue.js devtools for Chrome](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- [Vue.js devtools for Firefox](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
