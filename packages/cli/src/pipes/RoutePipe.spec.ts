import {RoutePipe} from "./RoutePipe.js";

describe("RoutePipe", () => {
  it("should return the output file", () => {
    const pipe = new RoutePipe();
    expect(pipe.transform("/test/Path-les")).toEqual("/test/path-les");
    expect(pipe.transform("/users/User")).toEqual("/users");
    expect(pipe.transform("/users/Users")).toEqual("/users");
  });
});
