"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setup = void 0;
const detection_1 = require("../../utils/detection");
class BleedReporter {
    constructor(globalConfig, options) {
        this.options = {};
        // Store options
        this.options = Object.assign({ domCheck: true, globalWindowCheck: true, logLevel: "info", shouldThrow: false }, options);
        (0, detection_1.storeOptions)(this.options);
    }
    // Called when the test suite starts
    onRunStart() {
        switch (this.options.logLevel) {
            case "info":
                console.log(`${detection_1.packageName} Jest Bleed Reporter running...`);
                break;
            case "verbose":
                console.log(`${detection_1.packageName} Jest Bleed Reporter running...`, { options: this.options });
                break;
            case "none":
                // Do nothing, nothing should be logged
                break;
            default:
                throw new Error(`${detection_1.packageName} Invalid logLevel provided!`);
        }
    }
    // Called when the test suite finishes
    onRunComplete() {
        (0, detection_1.detectBleed)(this.options);
    }
}
exports.default = BleedReporter;
// Re-export the setup method from detection for simpler reporter setup
var detection_2 = require("../../utils/detection");
Object.defineProperty(exports, "setup", { enumerable: true, get: function () { return detection_2.setup; } });
