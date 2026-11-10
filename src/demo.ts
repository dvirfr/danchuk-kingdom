// Local-only demo mode for screenshots/testing without Google sign-in.
// Only active in `vite dev` with VITE_DEMO=1; production builds strip it.
export const DEMO = import.meta.env.DEV && import.meta.env.VITE_DEMO === '1'
export const DEMO_AS: 'admin' | 'dana' = import.meta.env.VITE_DEMO_AS === 'dana' ? 'dana' : 'admin'
