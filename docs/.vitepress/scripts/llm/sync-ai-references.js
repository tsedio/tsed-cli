import {dirname, join} from "node:path";

import {log, progress} from "@clack/prompts";
import fsExtra from "fs-extra";
import {globby} from "globby";

import {transformMarkdown} from "./markdown.js";

const {copy, ensureDir, pathExists, readFile, remove, writeFile} = fsExtra;

export async function syncAiReferences(docsRoot) {
  const apiSourceDir = join(docsRoot, "api");
  const aiReferencesDir = join(docsRoot, "public/ai/references");
  const aiReferencesApiDir = join(aiReferencesDir, "api");

  if (!(await pathExists(apiSourceDir))) {
    log.warn(`[build-llm-contents] Skip AI references sync: missing ${apiSourceDir}`);
    return false;
  }

  await ensureDir(aiReferencesDir);
  await remove(aiReferencesApiDir);
  await ensureDir(aiReferencesApiDir);

  const files = await globby(["**/*"], {cwd: apiSourceDir, dot: true, onlyFiles: true});

  if (files.length === 0) {
    log.warn("[build-llm-contents] No API markdown files found to sync");
    return false;
  }

  const copyProgress = progress({
    style: "block",
    max: files.length,
    size: 40
  });

  copyProgress.start("Syncing AI reference markdown");

  try {
    for (const relativePath of files) {
      await copyFile(apiSourceDir, aiReferencesApiDir, relativePath, copyProgress);
    }
  } catch (error) {
    copyProgress.stop("AI references failed");
    throw error;
  }

  copyProgress.stop("AI references updated");
  return true;
}

async function copyFile(sourceRoot, destinationRoot, relativePath, progressLogger) {
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
