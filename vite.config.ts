import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    css: {
      postcss: './postcss.config.cjs'
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      include: ['@tailwindcss/forms'],
    },
    // Pass environment variables to the client
    define: {
      'process.env': { ...env, VITE_GOOGLE_CLIENT_ID: env.VITE_GOOGLE_CLIENT_ID }
    },
    server: {
      port: 3000,
      open: true
    }
  }
})
