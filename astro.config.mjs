import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://auroraongithub.github.io',
  output: 'static',
  build: {
    format: 'directory'
  }
});
