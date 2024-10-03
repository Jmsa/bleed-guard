// Disabled chalk colors so they don't report color formatting in tests.
// May revert this in the future if needed but for now it cleans the tests focussed more
// on reporting and less on styling.
const chalk = require("chalk");
chalk.level = 0;

// Mock the fs to prevent real file being left behind during test runs
jest.mock("fs");
import { vol } from "memfs";

import {
  filePaths,
  storeOptions,
  detectBleed,
  setup,
  logStart,
} from "./detection";
const fs = require("fs");

describe("detection", () => {
  afterEach(() => {
    jest.clearAllMocks();
    vol.reset();
  });

  it("storeOptions creates the folder it needs to store the option in if it doesn't exist", () => {
    storeOptions({});
    expect(fs.readdirSync("./")).toContain("temp");
  });

  it("storeOptions stores the reporter options for later use in setup", () => {
    vol.mkdirSync("./temp", { recursive: true });

    storeOptions({});
    expect(fs.readdirSync("./temp")).toContain(filePaths.reporterOptions);
  });

  it("logStart logs nothing when logLevel: none", () => {
    const consoleSpy = jest.spyOn(console, "log");
    logStart({ logLevel: "none" });
    expect(consoleSpy).toHaveBeenCalledTimes(0);
  });

  it("logStart logs the start message when logLevel: info", () => {
    const consoleSpy = jest
      .spyOn(console, "log")
      .mockImplementationOnce(() => {});
    logStart({ logLevel: "info" });
    expect(consoleSpy).toHaveBeenCalledWith(
      "[BleedGuard]: Bleed Reporter running..."
    );
  });

  it("logStart logs the start message and options when logLevel: verbose", () => {
    const consoleSpy = jest
      .spyOn(console, "log")
      .mockImplementationOnce(() => {});
    logStart({ logLevel: "verbose" });
    expect(consoleSpy).toHaveBeenCalledWith(
      "[BleedGuard]: Bleed Reporter running...",
      { options: { logLevel: "verbose" } }
    );
  });

  it("logStart logs the start message without library details if one provided", () => {
    const consoleSpy = jest
      .spyOn(console, "log")
      .mockImplementationOnce(() => {});
    logStart({ logLevel: "info", library: "Jest" });
    expect(consoleSpy).toHaveBeenCalledWith(
      "[BleedGuard]: Jest Bleed Reporter running..."
    );
  });

  it("logStart throws when an invalid logLevel provided", () => {
    const consoleSpy = jest
      .spyOn(console, "log")
      .mockImplementationOnce(() => {});
    expect(() => logStart({ logLevel: "adaaf" as "info" })).toThrow(
      "[BleedGuard]: Invalid logLevel provided!"
    );
    expect(consoleSpy).toHaveBeenCalledTimes(0);
  });

  describe("logLevel: none", () => {
    it("logs nothing when there is no bleed", () => {
      const consoleSpy = jest.spyOn(console, "log");
      vol.fromJSON(
        {
          [filePaths.testBleed]: "{}",
        },
        "./"
      );

      detectBleed({ logLevel: "none" });
      expect(consoleSpy).toHaveBeenCalledTimes(0);
    });

    it("logs nothing even when there is bleed", () => {
      const consoleSpy = jest.spyOn(console, "log");
      vol.fromJSON(
        {
          [filePaths.testBleed]: JSON.stringify(testBleedResults),
        },
        "./"
      );

      detectBleed({ logLevel: "none" });
      expect(consoleSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe("logLevel: info", () => {
    it("logs a message that it is running", () => {
      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});
      vol.fromJSON({
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
      vol.fromJSON({
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
      vol.fromJSON({
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
      vol.fromJSON({
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
      vol.fromJSON({
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
      vol.fromJSON({
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
      vol.fromJSON({
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
    vol.reset();
  });

  it("calls the expected before hooks", async () => {
    const beforeAll = jest.fn(async (fn) => {});
    const afterEach = jest.fn(async (fn) => {});
    const afterAll = jest.fn(async (fn) => {});
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
