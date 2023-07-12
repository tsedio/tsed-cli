import {helpers} from "./switch";

describe("switch", () => {
  it("should use switch statement", () => {
    const options = {
      fn: jest.fn()
    };
    const ctx = {};

    helpers.switch.call(ctx, 1, options);

    expect(options.fn).toHaveBeenCalled();
    expect(ctx).toEqual({switch_value: 1});
  });

  it("should use case statement", () => {
    const options = {
      fn: jest.fn()
    };
    const ctx = {switch_value: 1};

    helpers.case.call(ctx, 1, options);

    expect(options.fn).toHaveBeenCalled();
  });

  it("should use case statement (false)", () => {
    const options = {
      fn: jest.fn()
    };
    const ctx = {switch_value: 0};

    helpers.case.call(ctx, 1, options);

    expect(options.fn).not.toHaveBeenCalled();
  });
});
