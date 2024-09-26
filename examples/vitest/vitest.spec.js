const { screen } = require("@testing-library/dom");
import { describe, test, beforeEach, afterEach, expect } from 'vitest';


describe("basic example", () => {
    test("expects true to be true", () => {
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

    test("should not error outside the test with because new content is cleaned up", () => {
        const button = screen.getByRole("button");
        expect(button).toBeInTheDocument();
    });
})

describe("dom examples - that fail", () => {
    beforeEach(() => {
        // $("body").append('<button id="button" value="click me"/>')
    })

    test("should error outside the test with new content that isn't cleaned up", () => {
        const button = screen.getByRole("button");
        expect(button).toBeVisible();
    });
});

