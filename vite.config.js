import { defineConfig } from 'vite';

// Pages uses /invite-weading/; local development and Vercel use /.
export default defineConfig({
  base: process.env.DEPLOY_BASE_PATH || '/',
});
