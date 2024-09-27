"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sum = sum;
const vitest_1 = require("vitest");
function sum(a, b) {
    return a + b;
}
(0, vitest_1.test)('adds 1 + 2 to equal 3', () => {
    (0, vitest_1.expect)(sum(1, 2)).toBe(3);
});
