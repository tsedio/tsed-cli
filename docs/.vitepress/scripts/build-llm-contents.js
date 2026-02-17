import {join} from "node:path";

import {intro, log, outro, spinner} from "@clack/prompts";

import {copyFiles} from "./llm/copy-files.js";
import {buildReferenceSidebar} from "./llm/sidebar.js";

const DOCS_ROOT = join(import.meta.dirname, "..", "..");
/**
 * Each entry describes a docs directory to copy into /public/ai.
 * Markdown is normalized (remark), snippet directives are inlined,
 * and @@Symbol@@ tokens are rewritten to /ai/api links.
 */
const DOC_SECTIONS = [
  {
    source: "guide",
    destination: "public/ai/guides",
    label: "Guides"
  },
  {
    source: "introduction",
    destination: "public/ai/introduction",
    label: "Introduction"
  },
  {
    source: "api",
    destination: "public/ai/api",
    label: "API references"
  }
];

await run();

async function run() {
  intro("Building LLM references");

  try {
    for (const section of DOC_SECTIONS) {
      const completed = await copyFiles({
        cwd: DOCS_ROOT,
        src: section.source,
        dest: section.destination,
        label: section.label
      });

      if (!completed) {
        log.warn(`${section.label} copy skipped`);
      }
    }

    const sidebarStep = spinner();
    sidebarStep.start("Generating API sidebar");
    await buildReferenceSidebar(DOCS_ROOT);
    sidebarStep.stop("Sidebar generated");

    outro("LLM references ready");
  } catch (error) {
    log.error(error instanceof Error ? error.message : String(error));
    outro("LLM references build failed");
    process.exitCode = 1;
  }
}

// Orchestration only; implementation lives in ./llm/*
