import {defineTemplate} from "../utils/defineTemplate.js";

export default defineTemplate({
  id: "prisma.service",
  label: "Prisma Service",
  description: "Generate a service based on PrismaClient with $onInit/$onDestroy hooks to manage the database connection.",
  fileName: "prisma.service",
  outputDir: "{{srcDir}}/services",

  render(symbolName: string) {
    return `import { Injectable, OnInit, OnDestroy } from "@tsed/di";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class ${symbolName} extends PrismaClient implements OnInit, OnDestroy {
  async $onInit() {
    await this.$connect();
  }

  async $onDestroy() {
    await this.$disconnect();
  }
}
`;
  }
});
