import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from 'unplugin-vue-components/vite';
import {PrimeVueResolver} from '@primevue/auto-import-resolver';
import { resolve } from 'path';
import svgLoader from 'vite-svg-loader';
import { CodeInspectorPlugin } from 'code-inspector-plugin';

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    vue(),
    svgLoader(),
    Components({
      resolvers: [
        PrimeVueResolver()
      ]
    }),
    CodeInspectorPlugin({
      bundler: 'vite',
    })
  ],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  }
}));
