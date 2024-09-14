import Inquirer from "inquirer";
export * from "./CliCore";
export * from "./decorators/index";
export * from "./interfaces/index";
export * from "./packageManagers/index";
export * from "./services/index";
export * from "./utils/index";
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
