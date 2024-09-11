// Disabled chalk colors so they don't report color formatting in tests.
// May revert this in the future if needed but for now it cleans the tests focussed more 
// on reporting and less on styling.
const chalk = require('chalk');
chalk.level = 0;

const BleedReporter = require('./jest');
const logLevel = require('./jest').logLevel
const filePaths = require('./jest').filePaths
const mock = require("mock-fs");
const fs = require("fs");

describe('BleedReporter', () => {

  afterEach(() => {
    jest.clearAllMocks();
    mock.restore();
  });

  it("stores the reporter options for later use in setup", () => {
    new BleedReporter();
    expect(fs.readdirSync("./")).toContain(filePaths.reporterOptions.replace("./", ""));
  })

  describe("logLevel: invalid", () => {
    it("throws an error if the log level is invalid on run start", () => {
      const consoleSpy = jest.spyOn(console, 'log');
      mock({
        [filePaths.testBleed]: "{}"
      });

      const reporter = new BleedReporter({}, { logLevel: 5 });
      expect(() => reporter.onRunStart()).toThrow("[BleedGuard]: Invalid logLevel provided!");
    });
  });

  describe("logLevel: none", () => {
    it("logs nothing when there is no bleed", () => {
      const consoleSpy = jest.spyOn(console, 'log');
      mock({
        [filePaths.testBleed]: "{}"
      });
      const reporter = new BleedReporter({}, { logLevel: logLevel.none });
      reporter.onRunStart();
      expect(consoleSpy).toHaveBeenCalledTimes(0);
    });

    it("logs nothing even when there is bleed", () => {
      const consoleSpy = jest.spyOn(console, 'log');
      mock({
        [filePaths.testBleed]: JSON.stringify(testBleedResults),
      });
      const reporter = new BleedReporter({}, { logLevel: logLevel.none });
      reporter.onRunStart();
      expect(consoleSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe("logLevel: info", () => {
    it("logs a message that it is running", () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
      mock({
        [filePaths.testBleed]: "{}"
      });
      const reporter = new BleedReporter({}, { logLevel: logLevel.info });
      reporter.onRunStart();
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(`[BleedGuard]: Jest Bleed Reporter running...`);
    });
    it("logs when there is dom bleed", () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
      mock({
        [filePaths.testBleed]: JSON.stringify({ dom: testBleedResults.dom }, null, 4)
      });
      const reporter = new BleedReporter({}, { logLevel: logLevel.info });
      reporter.onRunComplete();
      expect(consoleSpy).toHaveBeenCalledTimes(2);
      expect(consoleSpy).toHaveBeenNthCalledWith(1, `[BleedGuard]: DOM bleed detected!`);
      expect(consoleSpy).toHaveBeenNthCalledWith(2, `[BleedGuard]: See the temp output (./bleed-guard-test-bleed.json) for details or run with the 'verbose' reporter option enabled`);
    });

    it("logs when there is window bleed", () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
      mock({
        [filePaths.testBleed]: JSON.stringify({ window: testBleedResults.window }, null, 4)
      });
      const reporter = new BleedReporter({}, { logLevel: logLevel.info });
      reporter.onRunComplete();
      expect(consoleSpy).toHaveBeenCalledTimes(2);
      expect(consoleSpy).toHaveBeenNthCalledWith(1, `[BleedGuard]: Window bleed detected!`);
      expect(consoleSpy).toHaveBeenNthCalledWith(2, `[BleedGuard]: See the temp output (./bleed-guard-test-bleed.json) for details or run with the 'verbose' reporter option enabled`);
    });
  })

  describe("logLevel: verbose", () => {
    it("logs a message that it is running", () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
      mock({
        [filePaths.testBleed]: "{}"
      });
      const reporter = new BleedReporter({}, { logLevel: logLevel.verbose });
      reporter.onRunStart();
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(`[BleedGuard]: Jest Bleed Reporter running...`, { options: { domCheck: true, globalWindowCheck: true, logLevel: "verbose", shouldThrow: false } });
    });
    it("logs when there is dom bleed", () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
      mock({
        [filePaths.testBleed]: JSON.stringify({ dom: testBleedResults.dom }, null, 4)
      });
      const reporter = new BleedReporter({}, { logLevel: logLevel.verbose });
      reporter.onRunComplete();
      expect(consoleSpy).toHaveBeenCalledTimes(2);
      expect(consoleSpy).toHaveBeenNthCalledWith(1, `[BleedGuard]: DOM bleed detected!`);
      expect(consoleSpy).toHaveBeenNthCalledWith(2, testBleedResults.dom);
    });

    it("logs when there is window bleed", () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
      mock({
        [filePaths.testBleed]: JSON.stringify({ window: testBleedResults.window }, null, 4)
      });
      const reporter = new BleedReporter({}, { logLevel: logLevel.verbose });
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
        [filePaths.testBleed]: JSON.stringify({ dom: testBleedResults.dom }, null, 4)
      });
      const reporter = new BleedReporter({}, { logLevel: logLevel.info, shouldThrow: true });
      expect(() => reporter.onRunComplete()).toThrow("[BleedGuard]: Test bleed detected!!! See output for details.")
    });
    it("and there is window bleed", () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
      mock({
        [filePaths.testBleed]: JSON.stringify({ window: testBleedResults.window }, null, 4)
      });
      const reporter = new BleedReporter({}, { logLevel: logLevel.info, shouldThrow: true });
      expect(() => reporter.onRunComplete()).toThrow("[BleedGuard]: Test bleed detected!!! See output for details.")
    });
  });
});

describe("setup()", () => {

  afterEach(() => {
    jest.clearAllMocks();
    mock.restore();
  });

  it("calls the expected before hooks", async () => {
    const beforeAll = jest.fn(async (fn) => fn());
    const afterEach = jest.fn(async (fn) => fn());
    const afterAll = jest.fn(async (fn) => fn());
    require("./jest").setup(beforeAll, afterEach, afterAll);
    expect(beforeAll).toHaveBeenCalledTimes(1)
  })
})

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