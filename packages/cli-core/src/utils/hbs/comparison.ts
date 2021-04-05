"use strict";

import {isNumber} from "@tsed/core";

const util = require("handlebars-utils");
export const helpers: any = {};

const contains = (val: any, obj: any, start?: number) => {
  if (val == null || obj == null || !isNumber(val.length)) {
    return false;
  }
  return val.indexOf(obj, start) !== -1;
};
/**
 * Helper that renders the block if **both** of the given values
 * are truthy. If an inverse block is specified it will be rendered
 * when falsy. Works as a block helper, inline helper or
 * subexpression.
 *
 * ```handlebars
 * <!-- {great: true, magnificent: true} -->
 * {{#and great magnificent}}A{{else}}B{{/and}}
 * <!-- results in: 'A' -->
 * ```
 * @param {any} `a`
 * @param {any} `b`
 * @param {Object} `options` Handlebars provided options object
 * @return {String}
 * @block
 * @api public
 */

helpers.and = (...args: any[]) => {
  const len = args.length - 1;
  const options = args[len];
  let val = true;

  for (let i = 0; i < len; i++) {
    if (!args[i]) {
      val = false;
      break;
    }
  }

  return util.value(val, this, options);
};

/**
 * Render a block when a comparison of the first and third
 * arguments returns true. The second argument is
 * the [arithemetic operator][operators] to use. You may also
 * optionally specify an inverse block to render when falsy.
 *
 * @param `a`
 * @param `operator` The operator to use. Operators must be enclosed in quotes: `">"`, `"="`, `"<="`, and so on.
 * @param `b`
 * @param {Object} `options` Handlebars provided options object
 * @return {String} Block, or if specified the inverse block is rendered if falsey.
 * @block
 * @api public
 */

helpers.compare = function (a: any, operator: any, b: any, options: any) {
  /*eslint eqeqeq: 0*/

  if (arguments.length < 4) {
    throw new Error("handlebars Helper {{compare}} expects 4 arguments");
  }

  let result;
  switch (operator) {
    case "==":
      result = a == b;
      break;
    case "===":
      result = a === b;
      break;
    case "!=":
      result = a != b;
      break;
    case "!==":
      result = a !== b;
      break;
    case "<":
      result = a < b;
      break;
    case ">":
      result = a > b;
      break;
    case "<=":
      result = a <= b;
      break;
    case ">=":
      result = a >= b;
      break;
    case "typeof":
      result = typeof a === b;
      break;
    default: {
      throw new Error("helper {{compare}}: invalid operator: `" + operator + "`");
    }
  }

  return util.value(result, this, options);
};

/**
 * Block helper that renders the block if `collection` has the
 * given `value`, using strict equality (`===`) for comparison,
 * otherwise the inverse block is rendered (if specified). If a
 * `startIndex` is specified and is negative, it is used as the
 * offset from the end of the collection.
 *
 * ```handlebars
 * <!-- array = ['a', 'b', 'c'] -->
 * {{#contains array "d"}}
 *   This will not be rendered.
 * {{else}}
 *   This will be rendered.
 * {{/contains}}
 * ```
 * @param {Array|Object|String} `collection` The collection to iterate over.
 * @param {any} `value` The value to check for.
 * @param {Number} `[startIndex=0]` Optionally define the starting index.
 * @param {Object} `options` Handlebars provided options object.
 * @block
 * @api public
 */

helpers.contains = function (collection: any, value: any, startIndex: number | undefined, options: any) {
  if (typeof startIndex === "object") {
    options = startIndex;
    startIndex = undefined;
  }
  const val = contains(collection, value, startIndex);
  return util.value(val, this, options);
};

/**
 * Returns the first value that is not undefined, otherwise the "default" value is returned.
 *
 * @param {any} `value`
 * @param {any} `defaultValue`
 * @return {String}
 * @alias .or
 * @api public
 */

helpers.default = (...args: any[]) => {
  for (let i = 0; i < args.length - 1; i++) {
    if (args[i] != null) return args[i];
  }
  return "";
};

/**
 * Block helper that renders a block if `a` is **equal to** `b`.
 * If an inverse block is specified it will be rendered when falsy.
 * You may optionally use the `compare=""` hash argument for the
 * second value.
 *
 * @param {String} `a`
 * @param {String} `b`
 * @param {Object} `options` Handlebars provided options object
 * @return {String} Block, or inverse block if specified and falsey.
 * @alias is
 * @block
 * @api public
 */

helpers.eq = function (a: any, b: any, options: any) {
  if (arguments.length === 2) {
    options = b;
    b = options.hash.compare;
  }
  return util.value(a === b, this, options);
};

/**
 * Block helper that renders a block if `a` is **greater than** `b`.
 *
 * If an inverse block is specified it will be rendered when falsy.
 * You may optionally use the `compare=""` hash argument for the
 * second value.
 *
 * @param {String} `a`
 * @param {String} `b`
 * @param {Object} `options` Handlebars provided options object
 * @return {String} Block, or inverse block if specified and falsey.
 * @block
 * @api public
 */

helpers.gt = function (a: any, b: any, options: any) {
  if (arguments.length === 2) {
    options = b;
    b = options.hash.compare;
  }
  return util.value(a > b, this, options);
};

/**
 * Block helper that renders a block if `a` is **greater than or
 * equal to** `b`.
 *
 * If an inverse block is specified it will be rendered when falsy.
 * You may optionally use the `compare=""` hash argument for the
 * second value.
 *
 * @param {String} `a`
 * @param {String} `b`
 * @param {Object} `options` Handlebars provided options object
 * @return {String} Block, or inverse block if specified and falsey.
 * @block
 * @api public
 */

helpers.gte = function (a: any, b: any, options: any) {
  if (arguments.length === 2) {
    options = b;
    b = options.hash.compare;
  }
  return util.value(a >= b, this, options);
};

/**
 * Block helper that renders a block if `a` is **equal to** `b`.
 * If an inverse block is specified it will be rendered when falsy.
 * Similar to [eq](#eq) but does not do strict equality.
 *
 * @param {any} `a`
 * @param {any} `b`
 * @param {Object} `options` Handlebars provided options object
 * @return {String}
 * @block
 * @api public
 */
helpers.is = function (a: any, b: any, options: any) {
  if (arguments.length === 2) {
    options = b;
    b = options.hash.compare;
  }
  return util.value(a == b, this, options);
};

/**
 * Block helper that renders a block if `a` is **not equal to** `b`.
 * If an inverse block is specified it will be rendered when falsy.
 * Similar to [unlessEq](#unlesseq) but does not use strict equality for
 * comparisons.
 *
 * @param {String} `a`
 * @param {String} `b`
 * @param {Object} `options` Handlebars provided options object
 * @return {String}
 * @block
 * @api public
 */

helpers.isnt = function (a: any, b: any, options: any) {
  if (arguments.length === 2) {
    options = b;
    b = options.hash.compare;
  }
  return util.value(a != b, this, options);
};

/**
 * Block helper that renders a block if `a` is **less than** `b`.
 *
 * If an inverse block is specified it will be rendered when falsy.
 * You may optionally use the `compare=""` hash argument for the
 * second value.
 *
 * @param {Object} `context`
 * @param {Object} `options` Handlebars provided options object
 * @return {String} Block, or inverse block if specified and falsey.
 * @block
 * @api public
 */

helpers.lt = function (a: any, b: any, options: any) {
  if (arguments.length === 2) {
    options = b;
    b = options.hash.compare;
  }
  return util.value(a < b, this, options);
};

/**
 * Block helper that renders a block if `a` is **less than or
 * equal to** `b`.
 *
 * If an inverse block is specified it will be rendered when falsy.
 * You may optionally use the `compare=""` hash argument for the
 * second value.
 *
 * @param {Sring} `a`
 * @param {Sring} `b`
 * @param {Object} `options` Handlebars provided options object
 * @return {String} Block, or inverse block if specified and falsey.
 * @block
 * @api public
 */

helpers.lte = function (a: any, b: any, options: any) {
  if (arguments.length === 2) {
    options = b;
    b = options.hash.compare;
  }
  return util.value(a <= b, this, options);
};

/**
 * Block helper that renders a block if **neither of** the given values
 * are truthy. If an inverse block is specified it will be rendered
 * when falsy.
 *
 * @param {any} `a`
 * @param {any} `b`
 * @param `options` Handlebars options object
 * @return {String} Block, or inverse block if specified and falsey.
 * @block
 * @api public
 */

helpers.neither = function (a: any, b: any, options: any) {
  return util.value(!a && !b, this, options);
};

/**
 * Returns true if `val` is falsey. Works as a block or inline helper.
 *
 * @param {String} `val`
 * @param {Object} `options` Handlebars provided options object
 * @return {String}
 * @block
 * @api public
 */

helpers.not = function (val: any, options: any) {
  return util.value(!val, this, options);
};

/**
 * Block helper that renders a block if **any of** the given values
 * is truthy. If an inverse block is specified it will be rendered
 * when falsy.
 *
 * ```handlebars
 * {{#or a b c}}
 *   If any value is true this will be rendered.
 * {{/or}}
 * ```
 *
 * @param {...any} `arguments` Variable number of arguments
 * @param {Object} `options` Handlebars options object
 * @return {String} Block, or inverse block if specified and falsey.
 * @block
 * @api public
 */

helpers.or = function (...args: any[]) {
  const len = args.length - 1;
  const options = args[len];
  let val = false;

  for (let i = 0; i < len; i++) {
    if (args[i]) {
      val = true;
      break;
    }
  }
  return util.value(val, this, options);
};

/**
 * Block helper that always renders the inverse block **unless `a` is
 * is equal to `b`**.
 *
 * @param {String} `a`
 * @param {String} `b`
 * @param {Object} `options` Handlebars provided options object
 * @return {String} Inverse block by default, or block if falsey.
 * @block
 * @api public
 */

helpers.unlessEq = function (a: any, b: any, options: any) {
  if (util.isOptions(b)) {
    options = b;
    b = options.hash.compare;
  }
  return util.value(a !== b, this, options);
};

/**
 * Block helper that always renders the inverse block **unless `a` is
 * is greater than `b`**.
 *
 * @param {Object} `a` The default value
 * @param {Object} `b` The value to compare
 * @param {Object} `options` Handlebars provided options object
 * @return {String} Inverse block by default, or block if falsey.
 * @block
 * @api public
 */

helpers.unlessGt = function (a: any, b: any, options: any) {
  if (util.isOptions(b)) {
    options = b;
    b = options.hash.compare;
  }
  return util.value(a <= b, this, options);
};

/**
 * Block helper that always renders the inverse block **unless `a` is
 * is less than `b`**.
 *
 * @param {Object} `a` The default value
 * @param {Object} `b` The value to compare
 * @param {Object} `options` Handlebars provided options object
 * @return {String} Block, or inverse block if specified and falsey.
 * @block
 * @api public
 */

helpers.unlessLt = function (a: any, b: any, options: any) {
  if (util.isOptions(b)) {
    options = b;
    b = options.hash.compare;
  }
  return util.value(a >= b, this, options);
};

/**
 * Block helper that always renders the inverse block **unless `a` is
 * is greater than or equal to `b`**.
 *
 * @param {any} `a`
 * @param {any} `b`
 * @param {Object} `options` Handlebars provided options object
 * @return {String} Block, or inverse block if specified and falsey.
 * @block
 * @api public
 */

helpers.unlessGteq = function (a: any, b: any, options: any) {
  if (util.isOptions(b)) {
    options = b;
    b = options.hash.compare;
  }
  return util.value(a < b, this, options);
};

/**
 * Block helper that always renders the inverse block **unless `a` is
 * is less than or equal to `b`**.
 *
 * @param {any} `a`
 * @param {any} `b`
 * @param {Object} `options` Handlebars provided options object
 * @return {String} Block, or inverse block if specified and falsey.
 * @block
 * @api public
 */

helpers.unlessLteq = function (a: any, b: any, options: any) {
  if (util.isOptions(b)) {
    options = b;
    b = options.hash.compare;
  }
  return util.value(a > b, this, options);
};
