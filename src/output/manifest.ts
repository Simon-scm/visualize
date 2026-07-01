export type ManifestCapture = {
  routeName: string;
  path: string;
  viewport: string;
  width: number;
  height: number;
  screenshot: string;
  status: "pending" | "ok" | "failed";
  error?: string;
};

export type VisualizeManifest = {
  generatedAt: string;
  baseUrl: string;
  captures: ManifestCapture[];
};
