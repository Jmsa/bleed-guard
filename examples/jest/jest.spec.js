const { screen } = require("@testing-library/dom");
require('@testing-library/jest-dom/jest-globals');

describe("basic example", () => {
    it("expects true to be true", () => {
        expect(true).toBe(true);
    })
})

describe("dom examples - that pass", () => {
    beforeEach(() => {
        $("body").append('<button id="button" value="click me"/>')
    })

    afterEach(() => {
        $("body").html("")
    })

    it("should not error outside the test with because new content is cleaned up", () => {
        const button = screen.getByRole("button");
        expect(button).toBeVisible();
    });
})

describe("dom examples - that fail", () => {
    beforeEach(() => {
        $("body").append('<button id="button" value="click me"/>')
    })

    it("should error outside the test with new content that isn't cleaned up", () => {
        const button = screen.getByRole("button");
        expect(button).toBeVisible();
    });
});

