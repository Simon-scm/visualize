import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getPackageVersion } from "../../src/version.js";

describe("getPackageVersion", () => {
  it("uses package.json as the single version source", () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8")
    ) as { version: string };

    expect(getPackageVersion()).toBe(packageJson.version);
  });
});
