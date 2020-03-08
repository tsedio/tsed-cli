import {ClassNamePipe} from "./ClassNamePipe";
import {OutputFilePathPipe} from "./OutputFilePathPipe";

describe("OutputFilePathPipeOutputFilePathPipe", () => {
  it("should return the outputfile", () => {
    const pipe = new OutputFilePathPipe(new ClassNamePipe());
    pipe.transform({type: "controller", name: "test"}).should.deep.eq("controllers/TestController");
    pipe.transform({type: "server", name: "server"}).should.deep.eq("Server");
  });
});
