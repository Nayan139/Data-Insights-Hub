## Packages
date-fns | Formatting dates in tables and detail views
recharts | Analytics charts on the dashboard
lucide-react | Icons (already installed, but listed for clarity)
react-hook-form | Form state management
@hookform/resolvers | Zod validation for forms

## Notes
- App uses Replit Auth via `/api/login` and `/api/logout`.
- Unauthenticated users are shown a custom `/login` page with a button redirecting to `/api/login`.
- Authenticated users without a WhatsApp account are forced to `/setup`.
- All API requests use `credentials: "include"`.
