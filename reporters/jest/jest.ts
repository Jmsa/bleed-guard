import type { DetectionOptions } from "../../detection";
import {defaultOptions, detectBleed, logStart, storeOptions} from "../../detection";
export {setup} from "../../detection";

export default class BleedReporter {
    options: DetectionOptions = {};
    constructor(globalConfig, options: DetectionOptions) {

        // Store options
        this.options = {
            ...defaultOptions,
            ...options
        };

        storeOptions(this.options);
    }

    // Called when the test suite starts
    onRunStart() {
        logStart(this.options)
    }

    // Called when the test suite finishes
    onRunComplete() {
        detectBleed(this.options);
    }
}
