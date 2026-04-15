import path from "path"
import { fileURLToPath } from "url"
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
<<<<<<< HEAD
  plugins: [react()],
=======
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
>>>>>>> 006d165c34ee3c88bd1c6cb0d8afdd1ed173849e
})
