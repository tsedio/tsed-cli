import {describe, it, expect} from "vitest";
import prismaServiceTemplate from "./prisma.service.template.js";

describe("prismaServiceTemplate", () => {
  it("should render prisma service template correctly", () => {
    const result = prismaServiceTemplate.render("Prisma", {} as any);

    expect(result).toContain('import { Injectable, OnInit, OnDestroy } from "@tsed/di"');
    expect(result).toContain('import { PrismaClient } from "@prisma/client"');
    expect(result).toContain("@Injectable()");
    expect(result).toContain("export class Prisma extends PrismaClient implements OnInit, OnDestroy {");
    expect(result).toContain("async $onInit()");
    expect(result).toContain("await this.$connect();");
    expect(result).toContain("async $onDestroy()");
    expect(result).toContain("await this.$disconnect();");
  });
});
