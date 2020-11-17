export * from "@tsed/core";
export {
  Inject,
  registerProvider,
  Injectable,
  Constant,
  Value,
  Configuration,
  LocalsContainer,
  TokenProvider,
  InvokeOptions,
  Module,
  Opts,
  UseOpts,
  OverrideProvider,
  InjectorService,
  OnDestroy,
  OnInit,
  Container
} from "@tsed/di";
export * from "./commands/AddCmd";
export * from "./interfaces";
export * from "./decorators";
export * from "./services";
export * from "./utils";
export * from "./Cli";

import "./utils/patchCommander";
