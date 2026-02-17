import {join} from "node:path";

import {intro, log, outro, spinner} from "@clack/prompts";

import {buildReferenceSidebar} from "./llm/sidebar.js";
import {syncAiReferences} from "./llm/sync-ai-references.js";

const DOCS_ROOT = join(import.meta.dirname, "..", "..");

await run();

async function run() {
  intro("Building LLM references");

  try {
    const sidebarStep = spinner();
    sidebarStep.start("Generating API sidebar");
    await buildReferenceSidebar(DOCS_ROOT);
    sidebarStep.stop("Sidebar generated");

    const synced = await syncAiReferences(DOCS_ROOT);
    if (!synced) {
      log.warn("AI references skipped");
    }

    outro("LLM references ready");
  } catch (error) {
    log.error(error instanceof Error ? error.message : String(error));
    outro("LLM references build failed");
    process.exitCode = 1;
  }
}

// Orchestration only; implementation lives in ./llm/*
