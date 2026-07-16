import { describe, expect, it } from "vitest";
import {
  createScreenshotFileName,
  toSafeFileSegment
} from "../../src/utils/filename.js";

describe("filename utilities", () => {
  it("normalizes route and viewport names for screenshot files", () => {
    expect(
      createScreenshotFileName({
        routeName: "Login / Sign Up",
        viewportName: "Mobile XL"
      })
    ).toBe("login-sign-up.mobile-xl.png");
  });

  it("removes diacritics and unsafe punctuation", () => {
    expect(toSafeFileSegment("\u00dcber Caf\u00e9: 100%")).toBe("uber-cafe-100");
  });

  it("falls back when a segment has no usable characters", () => {
    expect(toSafeFileSegment("!!!")).toBe("untitled");
  });
});
