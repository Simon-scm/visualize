import path from "node:path";
import fs from "fs-extra";
import {
  buildManagedWorkflowBlock,
  buildVisualizeMd,
  type VisualizeWorkflow,
  WORKFLOW_END_MARKER,
  WORKFLOW_START_MARKER
} from "./build-visualize-md.js";

const VISUALIZE_MD_FILE_NAME = "VISUALIZE.md";

export async function syncVisualizeMd(
  workflow: VisualizeWorkflow
): Promise<{
  path: string;
  created: boolean;
}> {
  const visualizeMdPath = path.join(process.cwd(), VISUALIZE_MD_FILE_NAME);

  if (!(await fs.pathExists(visualizeMdPath))) {
    await fs.outputFile(visualizeMdPath, buildVisualizeMd(workflow));

    return {
      path: visualizeMdPath,
      created: true
    };
  }

  const existing = await fs.readFile(visualizeMdPath, "utf8");
  const managedBlock = buildManagedWorkflowBlock(workflow);
  const updated = updateManagedWorkflow(existing, managedBlock);

  if (updated !== existing) {
    await fs.outputFile(visualizeMdPath, updated);
  }

  return {
    path: visualizeMdPath,
    created: false
  };
}

function updateManagedWorkflow(existing: string, managedBlock: string): string {
  const startIndex = existing.indexOf(WORKFLOW_START_MARKER);
  const endIndex = existing.indexOf(WORKFLOW_END_MARKER);

  if (startIndex !== -1 && endIndex > startIndex) {
    const afterEnd = endIndex + WORKFLOW_END_MARKER.length;
    return `${existing.slice(0, startIndex)}${managedBlock}${existing.slice(afterEnd)}`;
  }

  const legacySection = /## Updating visual context\r?\n[\s\S]*?(?=\r?\n## Notes)/;
  if (legacySection.test(existing)) {
    return existing.replace(
      legacySection,
      `## Updating visual context\n\n${managedBlock}\n`
    );
  }

  return `${existing.trimEnd()}\n\n## Visualize workflow\n\n${managedBlock}\n`;
}
