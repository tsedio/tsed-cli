import {coerce} from "./coerce";

describe("coerce", () => {
  it("should coerce given value", () => {
    expect(coerce("undefined")).toBeUndefined();
    expect(coerce("null")).toBeNull();
    expect(coerce("false")).toBe(false);
    expect(coerce("true")).toBe(true);
    expect(coerce("")).toBe("");
  });
});
