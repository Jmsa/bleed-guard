// Disabled chalk colors so they don't report color formatting in tests.
// May revert this in the future if needed but for now it cleans the tests focussed more
// on reporting and less on styling.
const chalk = require("chalk");
chalk.level = 0;

import BleedReporter from "./jest";
import * as detection from "../../detection";

jest.mock("../../detection", () => ({
  storeOptions: jest.fn(),
  logStart: jest.fn(),
  detectBleed: jest.fn()
}))

describe("BleedReporter: Jest", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("new reporter initialization calls storeOptions", () => {
    new BleedReporter(null, {});
    expect(detection.storeOptions).toHaveBeenCalledTimes(1);
  });

  it("onRunStart calls logStart", () => {
    const reporter = new BleedReporter({}, { logLevel: undefined });
    reporter.onRunStart();
    expect(detection.logStart).toHaveBeenCalledTimes(1);
  });

  it("onRunComplete calls detectBleed", () => {
    const reporter = new BleedReporter({}, {});
    reporter.onRunComplete();
    expect(detection.detectBleed).toHaveBeenCalledTimes(1)
  });
});
