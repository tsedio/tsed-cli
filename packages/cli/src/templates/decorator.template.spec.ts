import {describe, it, expect} from "vitest";
import decoratorTemplate from "./decorator.template.js";
import type {GenerateCmdContext} from "../interfaces/GenerateCmdContext.js";

describe("decoratorTemplate", () => {
  describe("class decorator", () => {
    it("should render class decorator template correctly", () => {
      const mockContext = {
        type: "class"
      } as GenerateCmdContext;

      const result = decoratorTemplate.render("Auth", mockContext);

      expect(result).toContain("export interface AuthOptions {");
      expect(result).toContain("export function Auth(options: AuthOptions): ClassDecorator {");
      expect(result).toContain("return (target: any): any => {");
      expect(result).toContain("return class extends target {");
      expect(result).toContain("constructor(...args: any[]) {");
      expect(result).toContain("super(...args);");
    });
  });

  describe("generic decorator", () => {
    it("should render generic decorator template correctly", () => {
      const mockContext = {
        type: "generic"
      } as GenerateCmdContext;

      const result = decoratorTemplate.render("Auth", mockContext);

      expect(result).toContain('import {DecoratorTypes, UnsupportedDecoratorType, decoratorTypeOf} from "@tsed/core"');
      expect(result).toContain("export interface AuthOptions {");
      expect(result).toContain("export function Auth(options: AuthOptions): any {");
      expect(result).toContain("return (...args: DecoratorParameters): any => {");
      expect(result).toContain("switch(decoratorTypeOf(args)) {");
      expect(result).toContain("case DecoratorTypes.CLASS:");
      expect(result).toContain("case DecoratorTypes.PROP:");
      expect(result).toContain("throw new UnsupportedDecoratorType(Auth, args);");
    });
  });

  describe("method decorator", () => {
    it("should render method decorator template correctly", () => {
      const mockContext = {
        type: "method"
      } as GenerateCmdContext;

      const result = decoratorTemplate.render("Auth", mockContext);

      expect(result).toContain("export interface AuthOptions {");
      expect(result).toContain("export function Auth(options: AuthOptions): MethodDecorator {");
      expect(result).toContain(
        "return (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>): TypedPropertyDescriptor<any> | void => {"
      );
      expect(result).toContain('console.log("do something");');
      expect(result).toContain("return descriptor;");
    });
  });

  describe("default decorator", () => {
    it("should render default decorator template when type is unknown", () => {
      const mockContext = {
        type: "unknown"
      } as GenerateCmdContext;

      const result = decoratorTemplate.render("Auth", mockContext);

      expect(result).toContain("export interface AuthOptions {");
      expect(result).toContain("export function Auth(options: AuthOptions): any {");
      expect(result).toContain("return (...args: any[]): any => {");
      expect(result).toContain('console.log("do something");');
    });
  });
});
