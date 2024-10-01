// Disabled chalk colors so they don't report color formatting in tests.
// May revert this in the future if needed but for now it cleans the tests focussed more
// on reporting and less on styling.
const chalk = require("chalk");
chalk.level = 0;

import { filePaths, storeOptions, detectBleed, setup } from "./detection";
const mock = require("mock-fs");
const fs = require("fs");

describe("detection", () => {
  afterEach(() => {
    jest.clearAllMocks();
    mock.restore();
  });

  it("storeOptions stores the reporter options for later use in setup", () => {
    storeOptions({});
    expect(fs.readdirSync("./")).toContain(
      filePaths.reporterOptions.replace("./", "")
    );
  });

  describe("logLevel: none", () => {
    it("logs nothing when there is no bleed", () => {
      const consoleSpy = jest.spyOn(console, "log");
      mock({
        [filePaths.testBleed]: "{}",
      });
      detectBleed({ logLevel: "none" });
      expect(consoleSpy).toHaveBeenCalledTimes(0);
    });

    it("logs nothing even when there is bleed", () => {
      const consoleSpy = jest.spyOn(console, "log");
      mock({
        [filePaths.testBleed]: JSON.stringify(testBleedResults),
      });
      detectBleed({ logLevel: "none" });
      expect(consoleSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe("logLevel: info", () => {
    it("logs a message that it is running", () => {
      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});
      mock({
        [filePaths.testBleed]: "{}",
      });
      detectBleed({ logLevel: "info" });
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        `[BleedGuard]: See the temp output (./bleed-guard-test-bleed.json) for details or run with the 'verbose' reporter option enabled`
      );
    });
    it("logs when there is dom bleed", () => {
      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});
      mock({
        [filePaths.testBleed]: JSON.stringify(
          { dom: testBleedResults.dom },
          null,
          4
        ),
      });
      detectBleed({ logLevel: "info" });
      expect(consoleSpy).toHaveBeenCalledTimes(2);
      expect(consoleSpy).toHaveBeenNthCalledWith(
        1,
        `[BleedGuard]: DOM bleed detected!`
      );
      expect(consoleSpy).toHaveBeenNthCalledWith(
        2,
        `[BleedGuard]: See the temp output (./bleed-guard-test-bleed.json) for details or run with the 'verbose' reporter option enabled`
      );
    });

    it("logs when there is window bleed", () => {
      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});
      mock({
        [filePaths.testBleed]: JSON.stringify(
          { window: testBleedResults.window },
          null,
          4
        ),
      });
      detectBleed({ logLevel: "info" });
      expect(consoleSpy).toHaveBeenCalledTimes(2);
      expect(consoleSpy).toHaveBeenNthCalledWith(
        1,
        `[BleedGuard]: Window bleed detected!`
      );
      expect(consoleSpy).toHaveBeenNthCalledWith(
        2,
        `[BleedGuard]: See the temp output (./bleed-guard-test-bleed.json) for details or run with the 'verbose' reporter option enabled`
      );
    });
  });

  describe("logLevel: verbose", () => {
    it("logs when there is dom bleed", () => {
      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});
      mock({
        [filePaths.testBleed]: JSON.stringify(
          { dom: testBleedResults.dom },
          null,
          4
        ),
      });
      detectBleed({ logLevel: "verbose" });
      expect(consoleSpy).toHaveBeenCalledTimes(2);
      expect(consoleSpy).toHaveBeenNthCalledWith(
        1,
        `[BleedGuard]: DOM bleed detected!`
      );
      expect(consoleSpy).toHaveBeenNthCalledWith(2, testBleedResults.dom);
    });

    it("logs when there is window bleed", () => {
      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});
      mock({
        [filePaths.testBleed]: JSON.stringify(
          { window: testBleedResults.window },
          null,
          4
        ),
      });
      detectBleed({ logLevel: "verbose" });
      expect(consoleSpy).toHaveBeenCalledTimes(2);
      expect(consoleSpy).toHaveBeenNthCalledWith(
        1,
        `[BleedGuard]: Window bleed detected!`
      );
      expect(consoleSpy).toHaveBeenNthCalledWith(2, testBleedResults.window);
    });
  });

  describe("throws when shouldThrow is true", () => {
    it("and there is dom bleed", () => {
      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});
      mock({
        [filePaths.testBleed]: JSON.stringify(
          { dom: testBleedResults.dom },
          null,
          4
        ),
      });
      expect(() =>
        detectBleed({ logLevel: "info", shouldThrow: true })
      ).toThrow("[BleedGuard]: Test bleed detected!!! See output for details.");
    });
    it("and there is window bleed", () => {
      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});
      mock({
        [filePaths.testBleed]: JSON.stringify(
          { window: testBleedResults.window },
          null,
          4
        ),
      });
      expect(() =>
        detectBleed({ logLevel: "info", shouldThrow: true })
      ).toThrow("[BleedGuard]: Test bleed detected!!! See output for details.");
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
    setup(beforeAll, afterEach, afterAll);
    expect(beforeAll).toHaveBeenCalledTimes(1);
  });
});

const testBleedResults = {
  dom: [
    {
      before: "<head></head><body></body>",
      after:
        '<head></head><body><button id="button" value="click me"></button></body>',
    },
  ],
  window: [
    {
      before: 207,
      after: 208,
      diff: {
        "206": "button",
        "207": "dispatchEvent",
      },
      newKeys: ["button"],
    },
  ],
};
