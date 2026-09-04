// @ts-ignore
import {CliPlatformTest} from "@tsed/cli-testing";

import {CliTemplatesService} from "../../services/CliTemplatesService.js";

describe("skills templates", () => {
  beforeEach(async () => {
    await import("../../templates/skills.template.js");
    return CliPlatformTest.create();
  });

  afterEach(() => CliPlatformTest.reset());

  it("renders a skill only when its feature is selected", async () => {
    const templates = await CliPlatformTest.invoke(CliTemplatesService);
    const prisma = templates.get("prisma-skill")!;

    expect(prisma.render("", {prisma: true} as any)).toContain("See https://www.prisma.io/llms.txt");
    expect(prisma.render("", {prisma: false} as any)).toBeUndefined();
  });

  it("renders the framework skill for the selected platform only", async () => {
    const templates = await CliPlatformTest.invoke(CliTemplatesService);
    const fastify = templates.get("fastify-skill")!;

    expect(fastify.render("", {platform: "fastify"} as any)).toContain('name: "fastify"');
    expect(fastify.render("", {platform: "express"} as any)).toBeUndefined();
  });

  it("uses the default llms.txt skill description", async () => {
    const templates = await CliPlatformTest.invoke(CliTemplatesService);
    const docker = templates.get("docker-skill")!;

    expect(docker.render("", {} as any)).toContain(
      "Docker documentation index — a compact overview of Docker's docs. Consider consulting it, e.g. when using uncommon Docker APIs or when stuck on a Docker problem."
    );
  });
});
