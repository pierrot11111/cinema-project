import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // Попробуем стандартный плагин
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})