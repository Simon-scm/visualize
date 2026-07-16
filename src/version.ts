import fs from "node:fs";

type PackageMetadata = {
  version?: unknown;
};

export function getPackageVersion(): string {
  const packageJsonPath = new URL("../package.json", import.meta.url);
  const metadata = JSON.parse(
    fs.readFileSync(packageJsonPath, "utf8")
  ) as PackageMetadata;

  if (typeof metadata.version !== "string" || metadata.version.length === 0) {
    throw new Error("Package version is missing from package.json.");
  }

  return metadata.version;
}
