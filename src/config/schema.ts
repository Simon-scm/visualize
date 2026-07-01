import { z } from "zod";

export const visualizeConfigSchema = z.object({
  baseUrl: z.string(),
  routes: z.array(
    z.object({
      name: z.string(),
      path: z.string()
    })
  ),
  viewports: z.array(
    z.object({
      name: z.string(),
      width: z.number(),
      height: z.number()
    })
  ),
  outputDir: z.string(),
  watch: z.object({
    enabled: z.boolean(),
    include: z.array(z.string()),
    exclude: z.array(z.string())
  }),
  stabilize: z.object({
    waitUntil: z.enum(["load", "domcontentloaded", "networkidle"]),
    disableAnimations: z.boolean(),
    waitMs: z.number()
  })
});

export type VisualizeConfig = z.infer<typeof visualizeConfigSchema>;
