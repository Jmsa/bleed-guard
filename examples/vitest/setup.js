import '@testing-library/jest-dom/vitest'
import { beforeAll, afterEach, afterAll } from 'vitest';
require("../../reporters/vitest/vitest").setup(beforeAll, afterEach, afterAll);
const $ = require("jquery");
global.$ = $;
global.jQuery = $;