import {parseOption} from "./parseOption";

describe("parseOptions", () => {
  it("should parse string --path <path>", () => {
    expect(parseOption("string", {type: String})).toEqual("string");
  });
  it("should parse number --count <nb>", () => {
    expect(parseOption("9", {type: Number})).toEqual(9);
  });
  it("should parse boolean --use-db", () => {
    expect(parseOption("", {type: Boolean})).toEqual(true);
  });
  it("should parse array --list <values-with-comma>", () => {
    const result = parseOption("1,2,3", {
      type: Array,
      itemType: Number
    });
    expect(result).toEqual([1, 2, 3]);
  });
});
