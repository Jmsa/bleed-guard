# Bleed Guard

[![npm version](https://badge.fury.io/js/bleed-guard.svg)](https://badge.fury.io/js/bleed-guard) ![NPM](https://img.shields.io/npm/l/bleed-guard)

[![Maintainability](https://api.codeclimate.com/v1/badges/4dd5c8eedd533903cd99/maintainability)](https://codeclimate.com/github/Jmsa/bleed-guard/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/4dd5c8eedd533903cd99/test_coverage)](https://codeclimate.com/github/Jmsa/bleed-guard/test_coverage)

**Bleed Guard** is a set of test reporters designed to help ensure clean test environments across various testing frameworks. It tracks potential issues like leftover DOM content, global window pollution, and incomplete network requests, making sure your tests are isolated and reliable.

*Note: some test runners, like Jest, already have options like `resetMocks` and `resetModules` which do a great job at isolating tests and cleaning up. If that's all you're after you probably don't need these reporters. If on the otherhand you want to find and tix those places where you have bleed, either in your tests or your source, then read on.*

## Features

- **Framework Support**  
  Bleed Guard supports popular testing frameworks like:
  - [Jest](https://jestjs.io/)
- **Frameworks in progress** (aka coming soon)
  - [Vite](https://vitejs.dev/)
  
- **Issue Tracking**  
  Each reporter can track and report the following issues:
  - **DOM Cleanup**: Detects if any DOM elements were left behind after tests run.
  - **Global State Changes**: Ensures no changes persist in the global `window` object that might bleed into subsequent tests.
  - **Incomplete Network Requests**: Identifies if there are any ongoing or incomplete network requests when a test completes.

## Installation

| NPM                                       | Yarn                                   |
| ----------------------------------------- | -------------------------------------- |
| `npm install -D bleed-guard` | `yarn add -D bleed-guard` |

## Usage

Simply add the relevant Bleed Guard reporter to your test configuration and call the `setup` method from the reporter once you have a test environment. Below are some examples:

### Jest

In your `jest.config.js`:

```js
module.exports = {
  testEnvironment: 'jsdom', // A browser-like environment is required if you want to enable dom checking
  reporters: [
    'default',  
    ['bleed-guard/jest', {
      domCheck: true,
      globalWindowCheck: true,
      shouldThrow: false
    }]
  ],
};
```

Then in a test setup file where you have access to the environment before tests start running, usually provided via `setupFilesAfterEnv`:

```js
require("./jest-bleed-reporter").setup(beforeAll, afterEach, afterAll);
```

### Vite

In your `vite.config.js`:

```js
import { defineConfig } from 'vite';
import bleedGuardReporter from 'bleed-guard/vite';

export default defineConfig({
  test: {
    environment: 'jsdom',   // A browser-like environment is required if you want to enable dom checking
    reporters: [
      'default', 
      ['bleed-guard/vite', {
        domCheck: true,
        globalWindowCheck: true,
        shouldThrow: false
      }]
    ],
  },
});
```

Then in a test setup file where you have access to the environment before tests start running:

```js
require("./vite-bleed-reporter").setup(beforeAll, afterEach, afterAll);
```

## Reporter Options

Each reporter comes with customizable options to fit your testing setup. For example:

```json
{
  "domCheck": true,
  "globalWindowCheck": true,
  "shouldThrow": false,
  "logLevel": 1
}
```

| Option | Default | Usage |
| --- | --- | --- |
| domCheck | true | Enables or disables tracking of leftover DOM elements |
| globalWindowCheck | true | Monitors changes in the global window object |
| shouldThrow | false | Will throw an error if any bleed is detected. |
| logLevel | "info" | Determines how much output will be logged to the console from the reporter. |

## Contributing

First off, thank you for considering contributing. We are always happy to accept contributions and will do our best to ensure they receive the appropriate feedback.

Things to know:

- Commits are required to follow the [Conventional Commits Specification](https://www.conventionalcommits.org/en/v1.0.0/).
- There is no planned/automated cadence for releases. Because of this once changes are merged they will be manually published, at least for the time being.

## License

Bleed Guard is licensed under the MIT License. See the LICENSE file for details.
