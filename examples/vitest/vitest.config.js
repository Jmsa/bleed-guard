
import { defineConfig } from 'vitest/config';
import BleedReporter from './../../reporters/vitest/vitest';

export default defineConfig({
  test: {
    environment: "jsdom",
    reporters: ['verbose', new BleedReporter()],
    setupFiles: ["./examples/vitest/setup"]
  },
})