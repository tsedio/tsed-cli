import {dirname, join} from "node:path";

import {log, progress} from "@clack/prompts";
import fsExtra from "fs-extra";
import {globby} from "globby";

import {transformMarkdown} from "./markdown.js";

const {copy, ensureDir, pathExists, readFile, remove, writeFile} = fsExtra;

export async function copyDocSection({docsRoot, sourceRelative, destinationRelative, progressLabel}) {
  return copyDocsDirectory({
    docsRoot,
    sourceRelative,
    destinationRelative,
    progressLabel
  });
}

async function copyDocsDirectory({docsRoot, sourceRelative, destinationRelative, progressLabel}) {
  const sourceDir = join(docsRoot, sourceRelative);
  const destinationDir = join(docsRoot, destinationRelative);

  if (!(await pathExists(sourceDir))) {
    log.warn(`[build-llm-contents] Skip ${progressLabel.toLowerCase()}: missing ${sourceDir}`);
    return false;
  }

  await remove(destinationDir).catch(() => undefined);
  await ensureDir(destinationDir);

  const files = await globby(["**/*"], {cwd: sourceDir, dot: true, onlyFiles: true});

  if (files.length === 0) {
    log.warn(`[build-llm-contents] No files found to sync for ${progressLabel.toLowerCase()}`);
    return false;
  }

  const copyProgress = progress({style: "heavy", max: files.length, size: 40});

  copyProgress.start(`Syncing ${progressLabel}`);

  try {
    for (const relativePath of files) {
      await copyFile({
        sourceRoot: sourceDir,
        destinationRoot: destinationDir,
        relativePath,
        progressLogger: copyProgress
      });
    }
  } catch (error) {
    copyProgress.stop(`${progressLabel} failed`);
    throw error;
  }

  copyProgress.stop(`${progressLabel} updated`);
  return true;
}

async function copyFile({sourceRoot, destinationRoot, relativePath, progressLogger}) {
  const sourcePath = join(sourceRoot, relativePath);
  const destinationPath = join(destinationRoot, relativePath);

  await ensureDir(dirname(destinationPath));

  if (relativePath.endsWith(".md")) {
    const fileContent = await readFile(sourcePath, "utf8");
    const cleaned = await transformMarkdown(fileContent);
    await writeFile(destinationPath, cleaned);
    progressLogger.advance(1, `Formatted ${relativePath}`);
    return;
  }

  await copy(sourcePath, destinationPath);
  progressLogger.advance(1, `Copied ${relativePath}`);
}
