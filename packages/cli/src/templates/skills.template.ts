import {PlatformType} from "../interfaces/PlatformType.js";
import type {RenderDataContext} from "../interfaces/RenderDataContext.js";
import {defineTemplate} from "../utils/defineTemplate.js";

type SkillTemplateOptions = {
  id: string;
  name: string;
  description: string;
  llmsUrl: string;
  when: (context: Partial<RenderDataContext>) => boolean;
};

const defineSkillTemplate = ({id, name, description, llmsUrl, when}: SkillTemplateOptions) =>
  defineTemplate({
    id,
    label: `${name} skill`,
    description: `Add the ${description} documentation skill`,
    fileName: "SKILL",
    ext: "md",
    outputDir: `.agents/skills/${name}`,
    hidden: true,
    preserveCase: true,
    render(_, context) {
      if (!when(context)) {
        return;
      }

      return `---
name: "${name}"
description: "${description} documentation index — a compact overview of ${description}'s docs. Consider consulting it, e.g. when using uncommon ${description} APIs or when stuck on a ${description} problem."
---

See ${llmsUrl}
`;
    }
  });

defineSkillTemplate({
  id: "tsed-skill",
  name: "tsed",
  description: "Ts.ED",
  llmsUrl: "https://tsed.dev/llms.txt",
  when: () => true
});

defineSkillTemplate({
  id: "docker-skill",
  name: "docker",
  description: "Docker",
  llmsUrl: "https://docs.docker.com/llms.txt",
  when: () => true
});

defineSkillTemplate({
  id: "express-skill",
  name: "express",
  description: "Express.js",
  llmsUrl: "https://expressjs.com/llms.txt",
  when: ({platform}) => platform === PlatformType.EXPRESS
});

defineSkillTemplate({
  id: "fastify-skill",
  name: "fastify",
  description: "Fastify",
  llmsUrl: "https://fastify.dev/llms.txt",
  when: ({platform}) => platform === PlatformType.FASTIFY
});

defineSkillTemplate({
  id: "scalar-skill",
  name: "scalar",
  description: "Scalar",
  llmsUrl: "https://scalar.com/llms.txt",
  when: ({scalar}) => Boolean(scalar)
});

defineSkillTemplate({
  id: "prisma-skill",
  name: "prisma",
  description: "Prisma",
  llmsUrl: "https://www.prisma.io/llms.txt",
  when: ({prisma}) => Boolean(prisma)
});

defineSkillTemplate({
  id: "mongoose-skill",
  name: "mongoose",
  description: "Mongoose",
  llmsUrl: "https://mongoosejs.com/llms.txt",
  when: ({mongoose}) => Boolean(mongoose)
});

defineSkillTemplate({
  id: "typeorm-skill",
  name: "typeorm",
  description: "TypeORM",
  llmsUrl: "https://typeorm.io/llms.txt",
  when: ({typeorm}) => Boolean(typeorm)
});

defineSkillTemplate({
  id: "vitest-skill",
  name: "vitest",
  description: "Vitest",
  llmsUrl: "https://vitest.dev/llms.txt",
  when: ({vitest}) => Boolean(vitest)
});

defineSkillTemplate({
  id: "oxlint-skill",
  name: "oxlint",
  description: "Oxlint",
  llmsUrl: "https://oxc.rs/llms.txt",
  when: ({oxlint}) => Boolean(oxlint)
});

defineSkillTemplate({
  id: "prettier-skill",
  name: "prettier",
  description: "Prettier",
  llmsUrl: "https://prettier.io/llms.txt",
  when: ({prettier}) => Boolean(prettier)
});

defineSkillTemplate({
  id: "node-skill",
  name: "node",
  description: "Node.js",
  llmsUrl: "https://nodejs.org/llms.txt",
  when: ({node}) => Boolean(node)
});

defineSkillTemplate({
  id: "vite-skill",
  name: "vite",
  description: "Vite",
  llmsUrl: "https://vite.dev/llms.txt",
  when: ({vite}) => Boolean(vite)
});

defineSkillTemplate({
  id: "bun-skill",
  name: "bun",
  description: "Bun",
  llmsUrl: "https://bun.sh/llms.txt",
  when: ({bun}) => Boolean(bun)
});
