import type { DetectionOptions } from "../../detection";
import {
  defaultOptions,
  detectBleed,
  logStart,
  storeOptions,
} from "../../detection";
export { setup } from "../../detection";

export default class BleedReporter {
  options: DetectionOptions = {};
  constructor(globalConfig, options: DetectionOptions) {
    // Store options
    this.options = {
      library: "Vitest",
      ...defaultOptions,
      ...options,
    };

    storeOptions(this.options);
  }

  // Called when the test suite starts
  onInit() {
    logStart(this.options);
  }

  // Called when the test suite finishes
  onFinished() {
    detectBleed(this.options);
  }
}
