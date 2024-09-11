const fs = require("fs");
const chalk = require("chalk");
const { diff } = require("deep-object-diff");

// Make sure we can print the entire object to the console
require("util").inspect.defaultOptions.depth = null;

// TODO: make these options?
const filePaths = {
    testBleed: "./bleed-guard-test-bleed.json",
    reporterOptions: "./bleed-guard-jest-reporter-options.json"
}

// Set several generic log level options to allow for various levels of feedback
const logLevel = {
    none: "none",
    info: "info",
    verbose: "verbose"
}

const packageName = chalk.bold.yellow("[BleedGuard]:")

class BleedReporter {
    constructor(globalConfig, options) {
        this.globalConfig = globalConfig;

        // Store options
        this.options = {
            domCheck: true,
            globalWindowCheck: true,
            logLevel: logLevel.info,
            shouldThrow: false,
            ...options,
        };

        // Store the reporter options so that setup() will have access to them later
        fs.writeFileSync(filePaths.reporterOptions, JSON.stringify(this.options))
    }

    // Called when the test suite starts
    onRunStart(aggregatedResults, options) {
        switch (this.options.logLevel) {
            case logLevel.info:
                console.log(`${packageName} Jest Bleed Reporter running...`)
                break;
            case logLevel.verbose:
                console.log(`${packageName} Jest Bleed Reporter running...`, { options: this.options })
                break;
            case logLevel.none:
            case logLevel.none:
                // Do nothing, nothing should be logged
                break;
            default:
                throw new Error(`${packageName} Invalid logLevel provided!`);
        }
    }

    // Called when each individual test suite completes
    onTestResult(test, testResult, aggregatedResult) {


    }

    // Called when the test suite finishes
    onRunComplete(contexts, results) {
        // console.log('Test run complete.');
        // console.log(`Total Tests: ${results.numTotalTests}`);
        // console.log(`Passed: ${results.numPassedTests}`);
        // console.log(`Failed: ${results.numFailedTests}`);
        // console.log(`Skipped: ${results.numPendingTests}`);

        // You can add any custom summary or report logic here
        // Pull temp file results and pass along to the checker
        const bleed = JSON.parse(fs.readFileSync(filePaths.testBleed).toString());
        const domLeaks = this.checkForDOMLeaks(bleed);
        const windowLeaks = this.checkForWindowLeaks(bleed);

        // Log results based on various possible issues and logging levels
        switch (this.options.logLevel) {
            case logLevel.info:
                if (domLeaks) console.log(`${packageName} DOM bleed detected!`);
                if (windowLeaks) console.log(`${packageName} Window bleed detected!`);
                console.log(`${packageName} See the temp output (${chalk.underline.yellow(filePaths.testBleed)}) for details or run with the 'verbose' reporter option enabled`)
                break;
            case logLevel.verbose:
                if (domLeaks) {
                    console.log(`${packageName} DOM bleed detected!`);
                    console.log(bleed.dom)
                }
                if (windowLeaks) {
                    console.log(`${packageName} Window bleed detected!`);
                    console.log(bleed.window)
                }
                break;
            case logLevel.none:
            default:
                break;
        }

        if (this.options.shouldThrow && (domLeaks || windowLeaks)) {
            throw new Error(`${packageName} Test bleed detected!!! See output for details.`)
        }
    }

    checkForDOMLeaks(bleed) {
        if (bleed?.dom?.length > 0) return true;
        return false;
    }

    checkForWindowLeaks(bleed) {
        if (bleed?.window?.length > 0) return true;
        return false;
    }
}

// Runs the required setup steps in jest to support the reporter
const setup = (beforeAll, afterEach, afterAll) => {
    // Since the reporter and the test runner don't have access to the same global instances
    // results will be written to temp files each run.

    const cleanUp = [];
    // TODO: add open network requests
    const bleed = {
        dom: [],
        window: []
    }

    // Track changes to the dom by comparing the original html to the finished set
    const domCheck = () => {
        const $ = require("jquery");
        const before = $("html").html();
        cleanUp.push(() => {
            const after = $("html").html();
            if (after !== before) {
                bleed.dom.push({ before, after })
            }
        })
    };

    // Track changes to the window by comparing the original keys to the finished set
    const globalWindowCheck = () => {
        const before = Object.keys(window);
        cleanUp.push(() => {
            const after = Object.keys(window);
            if (after != before) {
                const newKeys = after.filter(key => !before.includes(key))
                bleed.window.push({ before: before.length, after: after.length, diff: diff(before, after), newKeys })
            }
        });
    }

    beforeAll(async () => {
        // Wipe the tracking file so there is a clean slate and grab the options
        fs.writeFileSync(filePaths.testBleed, JSON.stringify(bleed, null, 4))
        const options = JSON.parse(fs.readFileSync(filePaths.reporterOptions).toString());

        // Enable different trackers based on options
        if (options.domCheck) domCheck();
        if (options.globalWindowCheck) globalWindowCheck();
    })

    afterEach(() => {
        // Loop over the cleanup tasks - which ih this case are the search for test bleed
        cleanUp.forEach(task => {
            task();
        })
    })

    afterAll(() => {
        // Write the results to the temp file
        fs.writeFileSync(filePaths.testBleed, JSON.stringify(bleed, null, 4))
    })
}

// Misc clean up 
const teardown = () => {
    fs.stat(filePaths.testBleed, () => fs.rmSync(filePaths.testBleed))
    fs.stat(filePaths.reporterOptions, () => fs.rmSync(filePaths.reporterOptions))
}

module.exports = BleedReporter;
module.exports.setup = setup;
module.exports.teardown = teardown;
module.exports.logLevel = logLevel;
module.exports.filePaths = filePaths;
