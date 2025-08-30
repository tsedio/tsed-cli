import {describe, it, expect} from "vitest";
import responseFilterTemplate from "./response-filter.template.js";

describe("responseFilterTemplate", () => {
  it("should render response filter template correctly", () => {
    const result = responseFilterTemplate.render("XmlResponse", {} as any);

    expect(result).toContain('import {ResponseFilter, ResponseFilterMethods} from "@tsed/platform-response-filter"');
    expect(result).toContain('import {BaseContext} from "@tsed/di"');
    expect(result).toContain('@ResponseFilter("text/xml")');
    expect(result).toContain("export class XmlResponse implements ResponseFilterMethods {");
    expect(result).toContain("transform(data: any, ctx: BaseContext)");
    expect(result).toContain("return jsToXML(data);");
  });
});
