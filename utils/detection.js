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
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeOptions = exports.setup = exports.detectBleed = exports.packageName = exports.filePaths = void 0;
const fs = require("fs");
const chalk = require("chalk");
const { diff } = require("deep-object-diff");
// Make sure we can print the entire object to the console
require("util").inspect.defaultOptions.depth = null;
// TODO: make these options?
exports.filePaths = {
    testBleed: "./bleed-guard-test-bleed.json",
    reporterOptions: "./bleed-guard-jest-reporter-options.json",
};
exports.packageName = chalk.bold.yellow("[BleedGuard]:");
const detectBleed = (options) => {
    const bleed = JSON.parse(fs.readFileSync(exports.filePaths.testBleed).toString());
    const domLeaks = checkForDOMLeaks(bleed);
    const windowLeaks = checkForWindowLeaks(bleed);
    // Log results based on various possible issues and logging levels
    switch (options.logLevel) {
        case "info":
            if (domLeaks)
                console.log(`${exports.packageName} DOM bleed detected!`);
            if (windowLeaks)
                console.log(`${exports.packageName} Window bleed detected!`);
            console.log(`${exports.packageName} See the temp output (${chalk.underline.yellow(exports.filePaths.testBleed)}) for details or run with the 'verbose' reporter option enabled`);
            break;
        case "verbose":
            if (domLeaks) {
                console.log(`${exports.packageName} DOM bleed detected!`);
                console.log(bleed.dom);
            }
            if (windowLeaks) {
                console.log(`${exports.packageName} Window bleed detected!`);
                console.log(bleed.window);
            }
            break;
        case "none":
        default:
            break;
    }
    if (options.shouldThrow && (domLeaks || windowLeaks)) {
        throw new Error(`${exports.packageName} Test bleed detected!!! See output for details.`);
    }
};
exports.detectBleed = detectBleed;
const checkForDOMLeaks = (bleed) => {
    var _a;
    if (((_a = bleed === null || bleed === void 0 ? void 0 : bleed.dom) === null || _a === void 0 ? void 0 : _a.length) > 0)
        return true;
    return false;
};
const checkForWindowLeaks = (bleed) => {
    var _a;
    if (((_a = bleed === null || bleed === void 0 ? void 0 : bleed.window) === null || _a === void 0 ? void 0 : _a.length) > 0)
        return true;
    return false;
};
// Runs the required setup steps in jest to support the reporter
// TODO: consider adding types that match those from jest/vitest and enabling strict checks
const setup = (beforeAll, afterEach, afterAll) => {
    // Since the reporter and the test runner don't have access to the same global instances
    // results will be written to temp files each run.
    const cleanUp = [];
    // TODO: add open network requests
    const bleed = {
        dom: [],
        window: [],
    };
    // Track changes to the dom by comparing the original html to the finished set
    const domCheck = () => {
        const $ = require("jquery");
        const before = $("html").html();
        cleanUp.push(() => {
            const after = $("html").html();
            if (after !== before) {
                bleed.dom.push({ before, after });
            }
        });
    };
    // Track changes to the window by comparing the original keys to the finished set
    const globalWindowCheck = () => {
        const before = Object.keys(window);
        cleanUp.push(() => {
            const after = Object.keys(window);
            if (after != before) {
                const newKeys = after.filter((key) => !before.includes(key));
                bleed.window.push({
                    before: before.length,
                    after: after.length,
                    diff: diff(before, after),
                    newKeys,
                });
            }
        });
    };
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Wipe the tracking file so there is a clean slate and grab the options
        fs.writeFileSync(exports.filePaths.testBleed, JSON.stringify(bleed, null, 4));
        const options = JSON.parse(fs.readFileSync(exports.filePaths.reporterOptions).toString());
        // Enable different trackers based on options
        if (options.domCheck)
            domCheck();
        if (options.globalWindowCheck)
            globalWindowCheck();
    }));
    afterEach(() => {
        // Loop over the cleanup tasks - which ih this case are the search for test bleed
        cleanUp.forEach((task) => {
            task();
        });
    });
    afterAll(() => {
        // Write the results to the temp file
        fs.writeFileSync(exports.filePaths.testBleed, JSON.stringify(bleed, null, 4));
    });
};
exports.setup = setup;
// Misc clean up
const teardown = () => {
    fs.stat(exports.filePaths.testBleed, () => fs.rmSync(exports.filePaths.testBleed));
    fs.stat(exports.filePaths.reporterOptions, () => fs.rmSync(exports.filePaths.reporterOptions));
};
const storeOptions = (options) => {
    // Store the reporter options so that setup() will have access to them later
    fs.writeFileSync(exports.filePaths.reporterOptions, JSON.stringify(options));
};
exports.storeOptions = storeOptions;
