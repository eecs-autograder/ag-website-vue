import vue2 from '@vitejs/plugin-vue2'
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
        // IMPORTANT: Keep these up to date with the paths
        // in tsconfig.json.
        "@/tests": path.resolve(__dirname, 'tests'),
        "@": path.resolve(__dirname, 'src',)
    }
  },
  plugins: [
    // @ts-ignore
    vue2(),
  ],
  test: {
    include: ["tests/**/test_*.ts"],
    globals: true,
    environment: 'jsdom',
    setupFiles: ["./tests/setup.ts"],
    restoreMocks: true,
},
});
