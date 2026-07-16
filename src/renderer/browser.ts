import { chromium } from "playwright";

export async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true });
  } catch (error) {
    if (isMissingPlaywrightBrowserError(error)) {
      throw new Error(
        [
          "Playwright Chromium is not installed.",
          "",
          "Install the required browser binary with:",
          "",
          "  pnpm exec playwright install chromium",
          "",
          "Then run `visualize capture` again."
        ].join("\n")
      );
    }

    throw error;
  }
}

function isMissingPlaywrightBrowserError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes("Executable doesn't exist") ||
    error.message.includes("Please run the following command to download new browsers")
  );
}
