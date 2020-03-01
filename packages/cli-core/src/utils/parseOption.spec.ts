import {parseOption} from "./parseOption";

describe("parseOptions", () => {
  it("should parse string --path <path>", () => {
    parseOption("string", {type: String}).should.eq("string");
  });
  it("should parse number --count <nb>", () => {
    parseOption("9", {type: Number}).should.eq(9);
  });
  it("should parse boolean --use-db", () => {
    parseOption("", {type: Boolean}).should.eq(true);
  });
  it("should parse array --list <values-with-comma>", () => {
    parseOption("1,2,3", {
      type: Array,
      itemType: Number
    }).should.deep.eq([1, 2, 3]);
  });
});
