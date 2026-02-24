import {command, type CommandProvider, inject, ProjectPackageJson, type PromptQuestion} from "@tsed/cli-core";
import {snakeCase} from "change-case";

import {PKG} from "../../constants/index.js";
import {render} from "../../fn/render.js";
import type {RenderDataContext} from "../../interfaces/RenderDataContext.js";
import {CliTemplatesService} from "../../services/CliTemplatesService.js";
import type {DefineTemplateOptions} from "../../utils/defineTemplate.js";

export interface CreateTemplateCmdContext extends RenderDataContext {
  name: string;
  from?: string | "new";
  override?: string;
  templateId?: string;
  template?: DefineTemplateOptions;
}

export class CreateTemplateCommand implements CommandProvider {
  protected projectPackageJson = inject(ProjectPackageJson);
  protected templates = inject(CliTemplatesService);

  async $prompt(data: Partial<CreateTemplateCmdContext>) {
    return [
      {
        type: "list",
        name: "from",
        message: "Create a template from existing one?",
        default: "new",
        when: !data.from,
        choices: [
          {name: "No, create a new template", value: "new"},
          {name: "Yes, from existing template", value: "existing"}
        ]
      },
      {
        type: "autocomplete",
        name: "templateId",
        message: "Select the template to use as base",
        default: data.from,
        when: (ctx: CreateTemplateCmdContext) => {
          return ctx.from === "existing";
        },
        source: () => this.templates.find().map((item) => ({name: item.label, value: item.id}))
      },
      {
        type: "confirm",
        name: "override",
        message: "Would you like to override the selected Ts.ED default template?",
        when: (ctx: CreateTemplateCmdContext) => ctx.from !== "new",
        default: !!data.override
      },
      {
        type: "input",
        name: "name",
        message: "Which name?",
        default: data.name,
        when: !data.name
      }
    ] satisfies PromptQuestion[];
  }

  $mapContext(ctx: Partial<any>): any {
    const symbolName = snakeCase(ctx.name).replace(/_/g, "-");

    return {
      ...ctx,
      symbolPath: `./.templates/${symbolName}.template`,
      symbolPathBasename: ".",
      symbolName: symbolName,
      templateId: ctx.orverride ? ctx.templateId : symbolName,
      template: ctx.templateId && this.templates.get(ctx.templateId)
    };
  }

  $exec(ctx: CreateTemplateCmdContext & {symbolName: string; symbolPath: string}) {
    if (this.projectPackageJson.devDependencies["@tsed/cli"] === undefined) {
      this.projectPackageJson.addDevDependencies({"@tsed/cli": PKG.version});
    }

    return [
      {
        title: "Generate " + ctx.from === "new" ? `new template ${ctx.templateId}` : `template ${ctx.templateId} from ${ctx.from}`,
        task: async () => {
          await render("new-template", ctx as any);
        }
      }
    ];
  }
}

command({
  token: CreateTemplateCommand,
  name: "template",
  description: "Create a custom template that can be selected in tsed generate command",
  args: {
    name: {
      description: "Name of the class",
      type: String
    }
  },
  options: {
    "--from <from>": {
      type: String,
      description: "Select the template to use as base"
    },
    "--override": {
      type: Boolean,
      description: "Override the existing selected template"
    }
  }
});
