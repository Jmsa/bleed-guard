const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { diff } = require("deep-object-diff");

// Make sure we can print the entire object to the console
require("util").inspect.defaultOptions.depth = null;

export const filePaths = {
  testBleed: "./bleed-guard-test-bleed.json",
  reporterOptions: "bleed-guard-reporter-options.json",
  tempDir: "./temp",
};

export const packageName = chalk.bold.yellow("[BleedGuard]:");

// Set several generic log level options to allow for various levels of feedback
export type LogLevel = "none" | "info" | "verbose";

export interface DetectionOptions {
  domCheck?: boolean;
  globalWindowCheck?: boolean;
  networkCheck?: boolean;
  logLevel?: LogLevel;
  shouldThrow?: boolean;
  library?: "Jest" | "Vitest" | "";
}

export const defaultOptions: DetectionOptions = {
  domCheck: true,
  globalWindowCheck: true,
  networkCheck: true,
  logLevel: "info",
  shouldThrow: false,
  library: "",
};

export const detectBleed = (options: DetectionOptions) => {
  const file = fs.readFileSync(filePaths.testBleed);
  let bleed = {} as Bleed;
  bleed = JSON.parse(file.toString());
  const domLeaks = checkForDOMLeaks(bleed);
  const windowLeaks = checkForWindowLeaks(bleed);
  const networkLeaks = checkForNetworkLeaks(bleed);

  // Log results based on various possible issues and logging levels
  switch (options.logLevel) {
    case "info":
      if (domLeaks) console.log(`${packageName} DOM bleed detected!`);
      if (windowLeaks) console.log(`${packageName} Window bleed detected!`);
      if (networkLeaks)
        console.log(`${packageName} Network requests still pending!`);
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
      if (networkLeaks) {
        console.log(`${packageName} Network requests still pending!`);
        console.log(bleed.network);
      }
      break;
    case "none":
    default:
      break;
  }

  if (options.shouldThrow && (domLeaks || windowLeaks || networkLeaks)) {
    throw new Error(
      `${packageName} Test bleed detected!!! See output for details.`
    );
  }
};

export interface Bleed {
  dom: any[];
  window: any[];
  network: any[];
}

const checkForDOMLeaks = (bleed: Bleed) => {
  if (bleed?.dom?.length > 0) return true;
  return false;
};

const checkForWindowLeaks = (bleed: Bleed) => {
  if (bleed?.window?.length > 0) return true;
  return false;
};

const checkForNetworkLeaks = (bleed: Bleed) => {
  if (bleed?.network?.length > 0) return true;
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
    network: any[];
  } = {
    dom: [],
    window: [],
    network: [],
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

  // Track any open XMLHttpRequests or fetch requests
  const networkCheck = () => {
    const originalXHR = window.XMLHttpRequest;
    const originalFetch = window.fetch;
    const activeRequests = new Set();

    // Track XHR requests
    window.XMLHttpRequest = function () {
      const xhr = new originalXHR();
      const send = xhr.send;
      xhr.send = function (...args) {
        activeRequests.add(xhr);
        xhr.addEventListener("loadend", () => {
          activeRequests.delete(xhr);
        });
        return send.apply(xhr, args);
      };
      return xhr;
    } as any;

    // Track fetch requests
    window.fetch = function (...args) {
      const promise = originalFetch.apply(window, args);
      activeRequests.add(promise);
      promise.finally(() => {
        activeRequests.delete(promise);
      });
      return promise;
    } as any;

    // TODO: sanity check the way packages like axios work

    cleanUp.push(() => {
      if (activeRequests.size > 0) {
        bleed.network.push({
          pendingRequests: activeRequests.size,
          timestamp: new Date().toISOString(),
        });
      }
      // Restore original implementations
      window.XMLHttpRequest = originalXHR;
      window.fetch = originalFetch;
    });
  };

  beforeAll(async () => {
    // Wipe the tracking file so there is a clean slate and grab the options
    fs.writeFileSync(filePaths.testBleed, JSON.stringify(bleed, null, 4));
    const location = path.join(filePaths.tempDir, filePaths.reporterOptions);
    const options = JSON.parse(fs.readFileSync(location).toString());

    // Enable different trackers based on options
    if (options.domCheck) domCheck();
    if (options.globalWindowCheck) globalWindowCheck();
    if (options.networkCheck) networkCheck();
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

export const storeOptions = async (options: DetectionOptions) => {
  // Store the reporter options so that setup() will have access to them later
  // Since these are meant to be temporary, and only important during the lifespan of the reporter,
  // they can be stored in the "temp" directory
  if (!fs.existsSync(filePaths.tempDir)) {
    await fs.mkdirSync(filePaths.tempDir, { recursive: true });
  }

  const location = path.join(filePaths.tempDir, filePaths.reporterOptions);
  await fs.writeFileSync(location, JSON.stringify(options));
};

export const logStart = (options: DetectionOptions) => {
  const reporterName = options.library
    ? `${packageName} ${options.library}`
    : packageName;
  switch (options.logLevel) {
    case "info":
      console.log(`${reporterName} Bleed Reporter running...`);
      break;
    case "verbose":
      console.log(`${reporterName} Bleed Reporter running...`, { options });
      break;
    case "none":
      // Do nothing, nothing should be logged
      break;
    default:
      throw new Error(`${reporterName} Invalid logLevel provided!`);
  }
};
