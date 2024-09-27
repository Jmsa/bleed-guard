import type { DetectionOptions } from "../../utils/detection";
import {detectBleed, filePaths, packageName, storeOptions} from "../../utils/detection";

export default class BleedReporter {
    options: DetectionOptions = {};
    constructor(globalConfig, options: DetectionOptions) {

        // Store options
        this.options = {
            domCheck: true,
            globalWindowCheck: true,
            logLevel: "info",
            shouldThrow: false,
            ...options
        };

        storeOptions(this.options);
    }

    // Called when the test suite starts
    onRunStart() {
        switch (this.options.logLevel) {
            case "info":
                console.log(`${packageName} Jest Bleed Reporter running...`)
                break;
            case "verbose":
                console.log(`${packageName} Jest Bleed Reporter running...`, { options: this.options })
                break;
            case  "none":
                // Do nothing, nothing should be logged
                break;
            default:
                throw new Error(`${packageName} Invalid logLevel provided!`);
        }
    }

    // Called when the test suite finishes
    onRunComplete() {
        detectBleed(this.options);
    }
}

// Re-export the setup method from detection for simpler reporter setup
export {setup} from "../../utils/detection";
