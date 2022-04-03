export const helpers: any = {};
helpers.switch = function (value: any, options: any) {
  this.switch_value = value;
  return options.fn(this);
};

helpers.case = function (value: any, options: any) {
  if (value == this.switch_value) {
    return options.fn(this);
  }
};
