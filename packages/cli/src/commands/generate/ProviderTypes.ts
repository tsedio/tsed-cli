export const PROVIDER_TYPES = [
  {
    name: "Controller",
    value: "controller",
    model: "{{symbolName}}.controller"
  },
  {
    name: "Middleware",
    value: "middleware",
    model: "{{symbolName}}.middleware"
  },
  {
    name: "Service",
    value: "service",
    baseDir: "services",
    model: "{{symbolName}}.service"
  },
  {
    name: "Model",
    value: "model",
    model: "{{symbolName}}.model"
  },
  {
    name: "Interface",
    value: "interface",
    model: "{{symbolName}}.interface?"
  },
  {
    name: "Decorator",
    value: "decorator",
    model: "{{symbolName}}.decorator?"
  },
  {
    name: "Module",
    value: "module",
    model: "{{symbolName}}.module"
  },
  {
    name: "Pipe",
    value: "pipe",
    baseDir: "pipes",
    model: "{{symbolName}}.pipe"
  },
  {
    name: "Interceptor",
    value: "interceptor",
    baseDir: "interceptors",
    model: "{{symbolName}}.interceptor"
  },
  {
    name: "Async Factory",
    value: "async.factory",
    baseDir: "services",
    model: "{{symbolName}}.factory?"
  },
  {
    name: "Factory",
    value: "factory",
    baseDir: "services",
    model: "{{symbolName}}.factory?"
  },
  {
    name: "Value",
    value: "value",
    baseDir: "services",
    model: "{{symbolName}}.value?"
  },
  {
    name: "Server",
    value: "server",
    model: "{{symbolName}}.server"
  },
  {
    name: "Exception Filter",
    value: "exception-filter",
    baseDir: "filters",
    model: "{{symbolName}}.exception-filter"
  },
  {
    name: "Response Filter",
    value: "response-filter",
    baseDir: "filters",
    model: "{{symbolName}}.response-filter"
  },
  {
    name: "Command",
    value: "command",
    baseDir: "bin",
    model: "{{symbolName}}.command"
  },
  {
    name: "Prisma Service",
    value: "prisma.service",
    baseDir: "services",
    model: "{{symbolName}}.service"
  },
  {
    name: "Repository",
    value: "repository",
    baseDir: "services",
    model: "{{symbolName}}.repository"
  }
];
