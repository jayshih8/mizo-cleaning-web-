import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import multiImageGalleryPlugin from './vite-multi-image-plugin.js'

// https://vite.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [multiImageGalleryPlugin(), react()],
  // Use absolute paths in production to support clean routing
  base: '/',
  publicDir: isSsrBuild ? false : 'public',
}))
