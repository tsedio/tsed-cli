import {command, type CommandProvider, inject, ProjectPackageJson, type Task} from "@tsed/cli-core";

import type {GenerateCmdContext} from "../../interfaces/GenerateCmdContext.js";
import {CliProjectService} from "../../services/CliProjectService.js";
import {CliTemplatesService} from "../../services/CliTemplatesService.js";
import {addContextMethods} from "../../services/mappers/addContextMethods.js";
import {mapDefaultTemplateOptions} from "../../services/mappers/mapDefaultTemplateOptions.js";
import type {DefineTemplateOptions} from "../../utils/defineTemplate.js";

const searchFactory = (list: DefineTemplateOptions[]) => {
  const items = list.map((item) => ({name: item.label, value: item.id}));
  return (_: any, keyword: string) => {
    if (keyword) {
      return items.filter((item) => item.name.toLowerCase().includes(keyword.toLowerCase()));
    }

    return items;
  };
};

export class GenerateCmd implements CommandProvider {
  protected projectPackageJson = inject(ProjectPackageJson);
  protected projectService = inject(CliProjectService);
  protected templates = inject(CliTemplatesService);

  async $prompt(data: Partial<GenerateCmdContext>) {
    data = addContextMethods(data as any);
    const templates = this.templates.find();
    const templatesPrompts = await Promise.all(
      templates
        .filter((template) => template.prompts)
        .map((template) => {
          return template.prompts!(data as GenerateCmdContext);
        })
    );

    return [
      {
        type: "autocomplete",
        name: "type",
        message: "Which template you want to use?",
        default: data.type,
        when: () => templates.length > 1,
        source: searchFactory(this.templates.find(data.type))
      },
      {
        type: "input",
        name: "name",
        message: "Which name?",
        default: data.getName,
        when: !data.name
      },
      ...templatesPrompts.flat()
    ];
  }

  $mapContext(ctx: Partial<GenerateCmdContext>): GenerateCmdContext {
    return mapDefaultTemplateOptions(ctx);
  }

  $exec(ctx: GenerateCmdContext): Task[] {
    const {symbolPath, type} = ctx;

    return [
      {
        title: `Generate ${ctx.type} file to '${symbolPath}.ts'`,
        skip: !this.templates.get(type),
        task: () => this.projectService.createFromTemplate(type, ctx)
      },
      {
        title: "Transform generated files",
        task: () => this.projectService.transformFiles(ctx)
      }
    ];
  }
}

command({
  token: GenerateCmd,
  name: "generate",
  alias: "g",
  description: "Generate a new provider class",
  args: {
    type: {
      description: "Type of the provider (Injectable, Controller, Pipe, etc...)",
      type: String
    },
    name: {
      description: "Name of the class",
      type: String
    }
  },
  options: {
    "--route <route>": {
      type: String,
      description: "The route for the controller generated file"
    },
    "-d, --directory <directory>": {
      description: "Directory where the file must be generated",
      type: String
    },
    "-t, --template-type <templateType>": {
      description: "Directory where the file must be generated",
      type: String
    },
    "-m, --middleware-position <templateType>": {
      description: "Middleware position (before, after)",
      type: String
    }
  }
});
