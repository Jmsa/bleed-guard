import '@testing-library/jest-dom/vitest'
import { beforeAll, afterEach, afterAll } from 'vitest';
require("../../reporters/jest/jest").setup(beforeAll, afterEach, afterAll);
const $ = require("jquery");
global.$ = $;
global.jQuery = $;