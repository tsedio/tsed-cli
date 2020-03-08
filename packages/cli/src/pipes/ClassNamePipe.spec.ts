import {ClassNamePipe} from "./ClassNamePipe";

describe("ClassNamePipe", () => {
  it("should return the className", () => {
    const pipe = new ClassNamePipe();
    pipe.transform({type: "controller", name: "test"}).should.deep.eq("TestController");
    pipe.transform({type: "server", name: "server"}).should.deep.eq("Server");
  });
});
