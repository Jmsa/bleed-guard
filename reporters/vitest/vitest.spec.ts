// Disabled chalk colors so they don't report color formatting in tests.
// May revert this in the future if needed but for now it cleans the tests focussed more
// on reporting and less on styling.
const chalk = require("chalk");
chalk.level = 0;

import BleedReporter from "./vitest";
import * as detection from "../../detection";

jest.mock("../../detection", () => ({
  storeOptions: jest.fn(),
  logStart: jest.fn(),
  detectBleed: jest.fn()
}))

describe("BleedReporter: Vitest", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("new reporter initialization calls storeOptions", () => {
    new BleedReporter(null, {});
    expect(detection.storeOptions).toHaveBeenCalledTimes(1);
  });

  it("onInit calls logStart", () => {
    const reporter = new BleedReporter({}, { logLevel: undefined });
    reporter.onInit();
    expect(detection.logStart).toHaveBeenCalledTimes(1);
  });

  it("onFinished calls detectBleed", () => {
    const reporter = new BleedReporter({}, {});
    reporter.onFinished();
    expect(detection.detectBleed).toHaveBeenCalledTimes(1)
  });
});
