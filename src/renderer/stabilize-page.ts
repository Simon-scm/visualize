import type { Page } from "playwright";
import type { VisualizeConfig } from "../config/schema.js";

const DISABLE_ANIMATIONS_CSS = `
*, *::before, *::after {
  animation-duration: 0s !important;
  animation-delay: 0s !important;
  transition-duration: 0s !important;
  transition-delay: 0s !important;
  scroll-behavior: auto !important;
}
`;

export async function stabilizePage(
  page: Page,
  config: VisualizeConfig
): Promise<void> {
  if (config.stabilize.disableAnimations) {
    await page.addStyleTag({ content: DISABLE_ANIMATIONS_CSS });
  }

  if (config.stabilize.waitMs > 0) {
    await page.waitForTimeout(config.stabilize.waitMs);
  }
}
