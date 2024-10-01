// Disabled chalk colors so they don't report color formatting in tests.
// May revert this in the future if needed but for now it cleans the tests focussed more
// on reporting and less on styling.
const chalk = require("chalk");
chalk.level = 0;

import BleedReporter from "./jest";
import * as detection from "../../detection";
const mock = require("mock-fs");
const fs = require("fs");

describe("BleedReporter: Jest", () => {
  afterEach(() => {
    jest.clearAllMocks();
    mock.restore();
  });

  it("stores the reporter options for later use", () => {
    new BleedReporter(null, {});
    expect(fs.readdirSync("./")).toContain(
      detection.filePaths.reporterOptions.replace("./", "")
    );
  });

  it("logLevel: invalid - throws an error on run start", () => {
    mock({
      [detection.filePaths.testBleed]: "{}",
    });

    const reporter = new BleedReporter({}, { logLevel: undefined });
    expect(() => reporter.onRunStart()).toThrow(
      "[BleedGuard]: Invalid logLevel provided!"
    );
  });

  it("onRunComplete calls detectBleed", () => {
    jest.spyOn(console, "log").mockImplementation();
    jest.spyOn(detection, "detectBleed");
    const reporter = new BleedReporter({}, {});
    reporter.onRunComplete();
    expect(detection.detectBleed).toHaveBeenCalledTimes(1)
  });
});
