// vite.config.ts
import { defineConfig } from "file:///Users/yuan/CodeProject/vue/groove-genie/node_modules/vite/dist/node/index.js";
import vue from "file:///Users/yuan/CodeProject/vue/groove-genie/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import Components from "file:///Users/yuan/CodeProject/vue/groove-genie/node_modules/unplugin-vue-components/dist/vite.js";
import { PrimeVueResolver } from "file:///Users/yuan/CodeProject/vue/groove-genie/node_modules/@primevue/auto-import-resolver/index.mjs";
import { resolve } from "path";
import svgLoader from "file:///Users/yuan/CodeProject/vue/groove-genie/node_modules/vite-svg-loader/index.js";
import { CodeInspectorPlugin } from "file:///Users/yuan/CodeProject/vue/groove-genie/node_modules/code-inspector-plugin/dist/index.mjs";
var __vite_injected_original_dirname = "/Users/yuan/CodeProject/vue/groove-genie";
var vite_config_default = defineConfig(async () => ({
  plugins: [
    vue(),
    svgLoader(),
    Components({
      resolvers: [
        PrimeVueResolver()
      ]
    }),
    CodeInspectorPlugin({
      bundler: "vite"
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
      ignored: ["**/src-tauri/**"]
    }
  },
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "src")
    },
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"]
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMveXVhbi9Db2RlUHJvamVjdC92dWUvZ3Jvb3ZlLWdlbmllXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMveXVhbi9Db2RlUHJvamVjdC92dWUvZ3Jvb3ZlLWdlbmllL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy95dWFuL0NvZGVQcm9qZWN0L3Z1ZS9ncm9vdmUtZ2VuaWUvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHZ1ZSBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tdnVlXCI7XG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy92aXRlJztcbmltcG9ydCB7UHJpbWVWdWVSZXNvbHZlcn0gZnJvbSAnQHByaW1ldnVlL2F1dG8taW1wb3J0LXJlc29sdmVyJztcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcbmltcG9ydCBzdmdMb2FkZXIgZnJvbSAndml0ZS1zdmctbG9hZGVyJztcbmltcG9ydCB7IENvZGVJbnNwZWN0b3JQbHVnaW4gfSBmcm9tICdjb2RlLWluc3BlY3Rvci1wbHVnaW4nO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKGFzeW5jICgpID0+ICh7XG4gIHBsdWdpbnM6IFtcbiAgICB2dWUoKSxcbiAgICBzdmdMb2FkZXIoKSxcbiAgICBDb21wb25lbnRzKHtcbiAgICAgIHJlc29sdmVyczogW1xuICAgICAgICBQcmltZVZ1ZVJlc29sdmVyKClcbiAgICAgIF1cbiAgICB9KSxcbiAgICBDb2RlSW5zcGVjdG9yUGx1Z2luKHtcbiAgICAgIGJ1bmRsZXI6ICd2aXRlJyxcbiAgICB9KVxuICBdLFxuXG4gIC8vIFZpdGUgb3B0aW9ucyB0YWlsb3JlZCBmb3IgVGF1cmkgZGV2ZWxvcG1lbnQgYW5kIG9ubHkgYXBwbGllZCBpbiBgdGF1cmkgZGV2YCBvciBgdGF1cmkgYnVpbGRgXG4gIC8vXG4gIC8vIDEuIHByZXZlbnQgdml0ZSBmcm9tIG9ic2N1cmluZyBydXN0IGVycm9yc1xuICBjbGVhclNjcmVlbjogZmFsc2UsXG4gIC8vIDIuIHRhdXJpIGV4cGVjdHMgYSBmaXhlZCBwb3J0LCBmYWlsIGlmIHRoYXQgcG9ydCBpcyBub3QgYXZhaWxhYmxlXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDE0MjAsXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSxcbiAgICB3YXRjaDoge1xuICAgICAgLy8gMy4gdGVsbCB2aXRlIHRvIGlnbm9yZSB3YXRjaGluZyBgc3JjLXRhdXJpYFxuICAgICAgaWdub3JlZDogW1wiKiovc3JjLXRhdXJpLyoqXCJdLFxuICAgIH0sXG4gIH0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0AnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYycpLFxuICAgIH0sXG4gICAgZXh0ZW5zaW9uczogWycubWpzJywgJy5qcycsICcudHMnLCAnLmpzeCcsICcudHN4JywgJy5qc29uJywgJy52dWUnXVxuICB9XG59KSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTBTLFNBQVMsb0JBQW9CO0FBQ3ZVLE9BQU8sU0FBUztBQUNoQixPQUFPLGdCQUFnQjtBQUN2QixTQUFRLHdCQUF1QjtBQUMvQixTQUFTLGVBQWU7QUFDeEIsT0FBTyxlQUFlO0FBQ3RCLFNBQVMsMkJBQTJCO0FBTnBDLElBQU0sbUNBQW1DO0FBU3pDLElBQU8sc0JBQVEsYUFBYSxhQUFhO0FBQUEsRUFDdkMsU0FBUztBQUFBLElBQ1AsSUFBSTtBQUFBLElBQ0osVUFBVTtBQUFBLElBQ1YsV0FBVztBQUFBLE1BQ1QsV0FBVztBQUFBLFFBQ1QsaUJBQWlCO0FBQUEsTUFDbkI7QUFBQSxJQUNGLENBQUM7QUFBQSxJQUNELG9CQUFvQjtBQUFBLE1BQ2xCLFNBQVM7QUFBQSxJQUNYLENBQUM7QUFBQSxFQUNIO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFLQSxhQUFhO0FBQUE7QUFBQSxFQUViLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLFlBQVk7QUFBQSxJQUNaLE9BQU87QUFBQTtBQUFBLE1BRUwsU0FBUyxDQUFDLGlCQUFpQjtBQUFBLElBQzdCO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxRQUFRLGtDQUFXLEtBQUs7QUFBQSxJQUMvQjtBQUFBLElBQ0EsWUFBWSxDQUFDLFFBQVEsT0FBTyxPQUFPLFFBQVEsUUFBUSxTQUFTLE1BQU07QUFBQSxFQUNwRTtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
