import { defineConfig } from 'cypress';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

export default defineConfig({
  e2e: {
    baseUrl: `http://localhost:${process.env.PORT || 4000}`,
    supportFile: false,
    setupNodeEvents(on, config) {
      return config;
    }
  }
});