import {hasFeature, hasValue} from "./hasFeature.js";

describe("hasValue", () => {
  it("should return false", () => {
    expect(hasValue("featuresDb.type", "")({featuresDb: {type: "test"}})).toEqual(false);
  });
  it("should return true", () => {
    expect(hasValue("featuresDb.type", "test")({featuresDb: {type: "test"}})).toEqual(true);
  });
});

describe("hasFeature", () => {
  it("should return false", () => {
    expect(hasFeature("feat")({features: []})).toEqual(false);
  });
  it("should return true", () => {
    expect(
      hasFeature("feat")({
        features: ["feat"]
      })
    ).toEqual(true);
  });
});
