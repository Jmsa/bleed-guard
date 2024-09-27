module.exports = async () => {
    return {
        testEnvironment: 'jsdom',
        testEnvironmentOptions: {
            // html: '<html><div id="test-content"></div></html>'
        },
        verbose: false,
        setupFiles: ["./setup.js"],
        setupFilesAfterEnv: ['./setup-after-env.js'],
        reporters: [
            "default",
            ['../../reporters/jest/jest.js', {domCheck: true, globalWindowCheck: true, logLevel: "info", shouldThrow: false}]
          ]
    };
};