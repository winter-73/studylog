# Frontend Architecture Notes

## Stack
- React 18
- TypeScript (strict)
- Vite
- Tailwind CSS
- ESLint (typescript-eslint + react-hooks)

## Directory Policy (initial)
- src/features: feature slice (domain types and API)
- src/lib: shared infra (HTTP client, utils)
- src/components: reusable UI components (next phase)

## Commands
```bash
cd frontend
npm install
npm run dev
npm run lint
npm run build
```

## API Integration Policy
- Do not call fetch directly from UI components.
- Access backend only via feature API modules.
- Keep API schema types near feature domain.
