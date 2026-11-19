import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

const page = (name) => fileURLToPath(new URL(name, import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  // Path aset relatif agar CSS/JS tetap termuat saat di-deploy
  // baik di root maupun di subpath (mis. GitHub Pages /nama-repo/).
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: page('index.html'),
        about: page('about.html'),
        content: page('content.html'),
        gallery: page('gallery.html'),
        contact: page('contact.html'),
      },
    },
  },
})
