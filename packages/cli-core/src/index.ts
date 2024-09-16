import Inquirer from "inquirer";
export * from "./CliCore.js";
export * from "./decorators/index.js";
export * from "./interfaces/index.js";
export * from "./packageManagers/index.js";
export * from "./services/index.js";
export * from "./utils/index.js";
export * from "@tsed/core";
export {
  Configuration,
  Constant,
  Container,
  DITest,
  Inject,
  Injectable,
  InjectorService,
  InvokeOptions,
  LocalsContainer,
  Module,
  OnDestroy,
  OnInit,
  Opts,
  OverrideProvider,
  registerProvider,
  TokenProvider,
  UseOpts,
  Value
} from "@tsed/di";
export * from "@tsed/logger";
export * from "@tsed/normalize-path";
export {Inquirer};

import "./utils/patchCommander";
