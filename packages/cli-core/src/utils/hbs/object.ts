"use strict";

import {getValue, isNumber, isObject} from "@tsed/core";
import {helpers as array} from "./array";

const hasOwn = Object.hasOwnProperty;
const util = require("handlebars-utils");
const createFrame = require("create-frame");

export const helpers: any = {};

/**
 * Extend the context with the properties of other objects.
 * A shallow merge is performed to avoid mutating the context.
 *
 * @param {Object} `objects` One or more objects to extend.
 * @return {Object}
 * @api public
 */
helpers.extend = function (/*objects*/) {
  // eslint-disable-next-line prefer-rest-params
  const args = [].slice.call(arguments);
  let opts = {};

  if (util.isOptions(args[args.length - 1])) {
    // remove handlebars options object
    opts = args.pop().hash;
    // re-add handlebars options.hash object
    args.push(opts);
  }

  const context: any = {};
  for (let i = 0; i < args.length; i++) {
    const obj = args[i];
    if (util.isObject(obj)) {
      const keys = Object.keys(obj);
      for (let j = 0; j < keys.length; j++) {
        const key = keys[j];
        context[key] = obj[key];
      }
    }
  }

  return context;
};

/**
 * Block helper that iterates over the properties of
 * an object, exposing each key and value on the context.
 *
 * @param {Object} `context`
 * @param {Object} `options`
 * @return {String}
 * @block
 * @api public
 */

helpers.forIn = function (obj: any, options: any) {
  if (!util.isOptions(options)) {
    return obj.inverse(this);
  }

  const data = createFrame(options, options.hash);
  let result = "";

  for (const key in obj) {
    data.key = key;
    result += options.fn(obj[key], {data: data});
  }
  return result;
};

/**
 * Block helper that iterates over the **own** properties of
 * an object, exposing each key and value on the context.
 *
 * @param {Object} `obj` The object to iterate over.
 * @param {Object} `options`
 * @return {String}
 * @block
 * @api public
 */

helpers.forOwn = function (obj: any, options: any) {
  if (!util.isOptions(options)) {
    return obj.inverse(this);
  }

  const data = createFrame(options, options.hash);
  let result = "";

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      data.key = key;
      result += options.fn(obj[key], {data: data});
    }
  }
  return result;
};

/**
 * Take arguments and, if they are string or number, convert them to a dot-delineated object property path.
 *
 * @param {String|Number} `prop` The property segments to assemble (can be multiple).
 * @return {String}
 * @api public
 */

helpers.toPath = function (...args: any[]) {
  const prop = [];
  for (let i = 0; i < arguments.length; i++) {
    if (typeof args[i] === "string" || typeof args[i] === "number") {
      prop.push(args[i]);
    }
  }
  return prop.join(".");
};

/**
 * Use property paths (`a.b.c`) to get a value or nested value from
 * the context. Works as a regular helper or block helper.
 *
 * @param {String} `prop` The property to get, optionally using dot notation for nested properties.
 * @param {Object} `context` The context object
 * @param {Object} `options` The handlebars options object, if used as a block helper.
 * @return {String}
 * @block
 * @api public
 */

helpers.get = function (prop: any, context: any, options: any) {
  const val = getValue(context, prop);
  if (options && options.fn) {
    return val ? options.fn(val) : options.inverse(context);
  }
  return val;
};

/**
 * Return true if `key` is an own, enumerable property
 * of the given `context` object.
 *
 * ```handlebars
 * {{hasOwn context key}}
 * ```
 *
 * @param {String} `key`
 * @param {Object} `context` The context object.
 * @return {Boolean}
 * @api public
 */

helpers.hasOwn = function (context: any, key: string) {
  return hasOwn.call(context, key);
};

/**
 * Return true if `value` is an object.
 *
 * ```handlebars
 * {{isObject "foo"}}
 * //=> false
 * ```
 * @param {String} `value`
 * @return {Boolean}
 * @api public
 */

helpers.isObject = isObject;

/**
 * Parses the given string using `JSON.parse`.
 *
 * ```handlebars
 * <!-- string: '{"foo": "bar"}' -->
 * {{JSONparse string}}
 * <!-- results in: { foo: 'bar' } -->
 * ```
 * @param {String} `string` The string to parse
 * @contributor github.com/keeganstreet
 * @block
 * @api public
 */

helpers.JSONparse = function (str: string) {
  return JSON.parse(str);
};

/**
 * Stringify an object using `JSON.stringify`.
 *
 * ```handlebars
 * <!-- object: { foo: 'bar' } -->
 * {{JSONstringify object}}
 * <!-- results in: '{"foo": "bar"}' -->
 * ```
 * @param {Object} `obj` Object to stringify
 * @return {String}
 * @api public
 */

helpers.JSONstringify = function (obj: any, indent: string | number | undefined) {
  if (!isNumber(indent)) {
    indent = 0;
  }
  return JSON.stringify(obj, null, indent);
};

/**
 * Deeply merge the properties of the given `objects` with the
 * context object.
 *
 * @param {Object} `object` The target object. Pass an empty object to shallow clone.
 * @param {Object} `objects`
 * @return {Object}
 * @api public
 */
helpers.merge = function (...args1: any) {
  // eslint-disable-next-line prefer-rest-params
  const args = [].slice.call(args1);
  let opts = {};

  if (util.isOptions(args[args.length - 1])) {
    // remove handlebars options object
    opts = args.pop().hash;
    // re-add options.hash
    args.push(opts);
  }

  return Object.assign.apply(null, args);
};

/**
 * Alias for parseJSON. this will be
 * deprecated in a future release
 */

helpers.parseJSON = helpers.JSONparse;

/**
 * Pick properties from the context object.
 *
 * @param {Array|String} `properties` One or more properties to pick.
 * @param {Object} `context`
 * @param {Object} `options` Handlebars options object.
 * @return {Object} Returns an object with the picked values. If used as a block helper, the values are passed as context to the inner block. If no values are found, the context is passed to the inverse block.
 * @block
 * @api public
 */

helpers.pick = function (props: any, context: any, options: any) {
  const keys = array.arrayify(props);
  const len = keys.length;
  let i = -1;
  let result = {};

  while (++i < len) {
    result = helpers.extend({}, result, getValue(context, keys[i]));
  }

  if (options.fn) {
    if (Object.keys(result).length) {
      return options.fn(result);
    }
    return options.inverse(context);
  }
  return result;
};

/**
 * Alias for JSONstringify. this will be
 * deprecated in a future release
 */

helpers.stringify = helpers.JSONstringify;
