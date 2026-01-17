import {injectable} from "@tsed/di";

import * as fn from "./fn/index.js";
import type {NormalizedPromptQuestion} from "./interfaces/NormalizedPromptQuestion.js";
import type {PromptQuestion} from "./interfaces/PromptQuestion.js";
import {normalizeQuestion} from "./utils/normalizeQuestion.js";
import {shouldAsk} from "./utils/shouldAsk.js";

export class PromptRunner {
  async run(questions: PromptQuestion[] | undefined, initialAnswers: Record<string, any> = {}) {
    const queue = ([] as PromptQuestion[]).concat(questions ?? []).filter(Boolean);

    const answers = {...initialAnswers};
    const collected: Record<string, any> = {};

    for (const question of queue) {
      if (!(await shouldAsk(question, answers))) {
        continue;
      }

      const normalized = await normalizeQuestion(question, answers);
      const response = await this.prompt(normalized, answers);

      answers[question.name] = response;
      collected[question.name] = response;
    }

    return collected;
  }

  protected async prompt(question: NormalizedPromptQuestion, answers: Record<string, unknown>): Promise<any> {
    const type = question.type;

    if (!fn[type]) {
      throw new Error(`Unsupported prompt type: ${type as string}`);
    }

    return fn[type](question as never, answers);
  }
}

injectable(PromptRunner);
