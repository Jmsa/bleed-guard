const fs = require("fs");
const chalk = require("chalk");
const { diff } = require("deep-object-diff");

// Make sure we can print the entire object to the console
require("util").inspect.defaultOptions.depth = null;

export const filePaths = {
  testBleed: "./bleed-guard-test-bleed.json",
  reporterOptions: "./bleed-guard-reporter-options.json",
};

export const packageName = chalk.bold.yellow("[BleedGuard]:");

// Set several generic log level options to allow for various levels of feedback
export type LogLevel = "none" | "info" | "verbose";

export interface DetectionOptions {
  domCheck?: boolean;
  globalWindowCheck?: boolean;
  logLevel?: LogLevel;
  shouldThrow?: boolean;
  library?: "Jest" | "Vitest";
}

export const defaultOptions: DetectionOptions = {
  domCheck: true,
  globalWindowCheck: true,
  logLevel: "info",
  shouldThrow: false,
};

export const detectBleed = (options: DetectionOptions) => {
  const bleed = JSON.parse(fs.readFileSync(filePaths.testBleed).toString());
  const domLeaks = checkForDOMLeaks(bleed);
  const windowLeaks = checkForWindowLeaks(bleed);

  // Log results based on various possible issues and logging levels
  switch (options.logLevel) {
    case "info":
      if (domLeaks) console.log(`${packageName} DOM bleed detected!`);
      if (windowLeaks) console.log(`${packageName} Window bleed detected!`);
      console.log(
        `${packageName} See the temp output (${chalk.underline.yellow(
          filePaths.testBleed
        )}) for details or run with the 'verbose' reporter option enabled`
      );
      break;
    case "verbose":
      if (domLeaks) {
        console.log(`${packageName} DOM bleed detected!`);
        console.log(bleed.dom);
      }
      if (windowLeaks) {
        console.log(`${packageName} Window bleed detected!`);
        console.log(bleed.window);
      }
      break;
    case "none":
    default:
      break;
  }

  if (options.shouldThrow && (domLeaks || windowLeaks)) {
    throw new Error(
      `${packageName} Test bleed detected!!! See output for details.`
    );
  }
};

export interface Bleed {
  dom: any[];
  window: any[];
}

const checkForDOMLeaks = (bleed: Bleed) => {
  if (bleed?.dom?.length > 0) return true;
  return false;
};

const checkForWindowLeaks = (bleed: Bleed) => {
  if (bleed?.window?.length > 0) return true;
  return false;
};

// Runs the required setup steps in jest to support the reporter
// TODO: consider adding types that match those from jest/vitest and enabling strict checks
export const setup = (beforeAll, afterEach, afterAll) => {
  // Since the reporter and the test runner don't have access to the same global instances
  // results will be written to temp files each run.

  const cleanUp: any[] = [];
  // TODO: add open network requests
  const bleed: {
    dom: any[];
    window: any[];
  } = {
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

  beforeAll(async () => {
    // Wipe the tracking file so there is a clean slate and grab the options
    fs.writeFileSync(filePaths.testBleed, JSON.stringify(bleed, null, 4));
    const options = JSON.parse(
      fs.readFileSync(filePaths.reporterOptions).toString()
    );

    // Enable different trackers based on options
    if (options.domCheck) domCheck();
    if (options.globalWindowCheck) globalWindowCheck();
  });

  afterEach(() => {
    // Loop over the cleanup tasks - which ih this case are the search for test bleed
    cleanUp.forEach((task) => {
      task();
    });
  });

  afterAll(() => {
    // Write the results to the temp file
    fs.writeFileSync(filePaths.testBleed, JSON.stringify(bleed, null, 4));
  });
};

// Misc clean up
const teardown = () => {
  fs.stat(filePaths.testBleed, () => fs.rmSync(filePaths.testBleed));
  fs.stat(filePaths.reporterOptions, () =>
    fs.rmSync(filePaths.reporterOptions)
  );
};

export const storeOptions = (options: DetectionOptions) => {
  // Store the reporter options so that setup() will have access to them later
  fs.writeFileSync(filePaths.reporterOptions, JSON.stringify(options));
};

export const logStart = (options: DetectionOptions) => {
  switch (options.logLevel) {
    case "info":
      console.log(`${packageName} ${options.library} Bleed Reporter running...`);
      break;
    case "verbose":
      console.log(`${packageName} ${options.library} Bleed Reporter running...`, { options });
      break;
    case "none":
      // Do nothing, nothing should be logged
      break;
    default:
      throw new Error(`${packageName} Invalid logLevel provided!`);
  }
};
 