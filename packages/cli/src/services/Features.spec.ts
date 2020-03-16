import {CliTestContext} from "@tsed/cli-testing";
import {Features} from "./Features";

describe("Features", () => {
  beforeEach(CliTestContext.create);
  afterEach(CliTestContext.reset);

  it("should add a provider info", async () => {
    const features = await CliTestContext.invoke(Features, []);

    features.should.be.instanceof(Array);
  });
});
