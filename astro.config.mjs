import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://novax-alux.github.io',
  base: '/parts-catalog',
  build: {
    assets: 'assets'
  }
});
