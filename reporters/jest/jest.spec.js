"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Disabled chalk colors so they don't report color formatting in tests.
// May revert this in the future if needed but for now it cleans the tests focussed more 
// on reporting and less on styling.
const chalk = require('chalk');
chalk.level = 0;
const jest_1 = __importDefault(require("./jest"));
const detection_1 = require("../../utils/detection");
const mock = require("mock-fs");
const fs = require("fs");
describe('BleedReporter', () => {
    afterEach(() => {
        jest.clearAllMocks();
        mock.restore();
    });
    it("stores the reporter options for later use in setup", () => {
        new jest_1.default(null, {});
        expect(fs.readdirSync("./")).toContain(detection_1.filePaths.reporterOptions.replace("./", ""));
    });
    describe("logLevel: invalid", () => {
        it("throws an error if the log level is invalid on run start", () => {
            const consoleSpy = jest.spyOn(console, 'log');
            mock({
                [detection_1.filePaths.testBleed]: "{}"
            });
            const reporter = new jest_1.default({}, { logLevel: undefined });
            expect(() => reporter.onRunStart()).toThrow("[BleedGuard]: Invalid logLevel provided!");
        });
    });
    describe("logLevel: none", () => {
        it("logs nothing when there is no bleed", () => {
            const consoleSpy = jest.spyOn(console, 'log');
            mock({
                [detection_1.filePaths.testBleed]: "{}"
            });
            const reporter = new jest_1.default({}, { logLevel: "none" });
            reporter.onRunStart();
            expect(consoleSpy).toHaveBeenCalledTimes(0);
        });
        it("logs nothing even when there is bleed", () => {
            const consoleSpy = jest.spyOn(console, 'log');
            mock({
                [detection_1.filePaths.testBleed]: JSON.stringify(testBleedResults),
            });
            const reporter = new jest_1.default({}, { logLevel: "none" });
            reporter.onRunStart();
            expect(consoleSpy).toHaveBeenCalledTimes(0);
        });
    });
    describe("logLevel: info", () => {
        it("logs a message that it is running", () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
            mock({
                [detection_1.filePaths.testBleed]: "{}"
            });
            const reporter = new jest_1.default({}, { logLevel: "info" });
            reporter.onRunStart();
            expect(consoleSpy).toHaveBeenCalledTimes(1);
            expect(consoleSpy).toHaveBeenCalledWith(`[BleedGuard]: Jest Bleed Reporter running...`);
        });
        it("logs when there is dom bleed", () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
            mock({
                [detection_1.filePaths.testBleed]: JSON.stringify({ dom: testBleedResults.dom }, null, 4)
            });
            const reporter = new jest_1.default({}, { logLevel: "info" });
            reporter.onRunComplete();
            expect(consoleSpy).toHaveBeenCalledTimes(2);
            expect(consoleSpy).toHaveBeenNthCalledWith(1, `[BleedGuard]: DOM bleed detected!`);
            expect(consoleSpy).toHaveBeenNthCalledWith(2, `[BleedGuard]: See the temp output (./bleed-guard-test-bleed.json) for details or run with the 'verbose' reporter option enabled`);
        });
        it("logs when there is window bleed", () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
            mock({
                [detection_1.filePaths.testBleed]: JSON.stringify({ window: testBleedResults.window }, null, 4)
            });
            const reporter = new jest_1.default({}, { logLevel: "info" });
            reporter.onRunComplete();
            expect(consoleSpy).toHaveBeenCalledTimes(2);
            expect(consoleSpy).toHaveBeenNthCalledWith(1, `[BleedGuard]: Window bleed detected!`);
            expect(consoleSpy).toHaveBeenNthCalledWith(2, `[BleedGuard]: See the temp output (./bleed-guard-test-bleed.json) for details or run with the 'verbose' reporter option enabled`);
        });
    });
    describe("logLevel: verbose", () => {
        it("logs a message that it is running", () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
            mock({
                [detection_1.filePaths.testBleed]: "{}"
            });
            const reporter = new jest_1.default({}, { logLevel: "verbose" });
            reporter.onRunStart();
            expect(consoleSpy).toHaveBeenCalledTimes(1);
            expect(consoleSpy).toHaveBeenCalledWith(`[BleedGuard]: Jest Bleed Reporter running...`, { options: { domCheck: true, globalWindowCheck: true, logLevel: "verbose", shouldThrow: false } });
        });
        it("logs when there is dom bleed", () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
            mock({
                [detection_1.filePaths.testBleed]: JSON.stringify({ dom: testBleedResults.dom }, null, 4)
            });
            const reporter = new jest_1.default({}, { logLevel: "verbose" });
            reporter.onRunComplete();
            expect(consoleSpy).toHaveBeenCalledTimes(2);
            expect(consoleSpy).toHaveBeenNthCalledWith(1, `[BleedGuard]: DOM bleed detected!`);
            expect(consoleSpy).toHaveBeenNthCalledWith(2, testBleedResults.dom);
        });
        it("logs when there is window bleed", () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
            mock({
                [detection_1.filePaths.testBleed]: JSON.stringify({ window: testBleedResults.window }, null, 4)
            });
            const reporter = new jest_1.default({}, { logLevel: "verbose" });
            reporter.onRunComplete();
            expect(consoleSpy).toHaveBeenCalledTimes(2);
            expect(consoleSpy).toHaveBeenNthCalledWith(1, `[BleedGuard]: Window bleed detected!`);
            expect(consoleSpy).toHaveBeenNthCalledWith(2, testBleedResults.window);
        });
    });
    describe("throws when shouldThrow is true", () => {
        it("and there is dom bleed", () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
            mock({
                [detection_1.filePaths.testBleed]: JSON.stringify({ dom: testBleedResults.dom }, null, 4)
            });
            const reporter = new jest_1.default({}, { logLevel: "info", shouldThrow: true });
            expect(() => reporter.onRunComplete()).toThrow("[BleedGuard]: Test bleed detected!!! See output for details.");
        });
        it("and there is window bleed", () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
            mock({
                [detection_1.filePaths.testBleed]: JSON.stringify({ window: testBleedResults.window }, null, 4)
            });
            const reporter = new jest_1.default({}, { logLevel: "info", shouldThrow: true });
            expect(() => reporter.onRunComplete()).toThrow("[BleedGuard]: Test bleed detected!!! See output for details.");
        });
    });
});
describe("setup()", () => {
    afterEach(() => {
        jest.clearAllMocks();
        mock.restore();
    });
    it("calls the expected before hooks", () => __awaiter(void 0, void 0, void 0, function* () {
        const beforeAll = jest.fn((fn) => __awaiter(void 0, void 0, void 0, function* () { return fn(); }));
        const afterEach = jest.fn((fn) => __awaiter(void 0, void 0, void 0, function* () { return fn(); }));
        const afterAll = jest.fn((fn) => __awaiter(void 0, void 0, void 0, function* () { return fn(); }));
        require("./jest").setup(beforeAll, afterEach, afterAll);
        expect(beforeAll).toHaveBeenCalledTimes(1);
    }));
});
const testBleedResults = {
    "dom": [
        {
            "before": "<head></head><body></body>",
            "after": "<head></head><body><button id=\"button\" value=\"click me\"></button></body>"
        }
    ],
    "window": [
        {
            "before": 207,
            "after": 208,
            "diff": {
                "206": "button",
                "207": "dispatchEvent"
            },
            "newKeys": [
                "button"
            ]
        }
    ]
};
