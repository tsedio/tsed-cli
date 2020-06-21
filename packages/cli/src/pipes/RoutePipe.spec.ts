import {RoutePipe} from "./RoutePipe";

describe("RoutePipe", () => {
  it("should return the output file", () => {
    const pipe = new RoutePipe();
    expect(pipe.transform("/test/Path-les")).toEqual("/test/path-les");
  });
});
