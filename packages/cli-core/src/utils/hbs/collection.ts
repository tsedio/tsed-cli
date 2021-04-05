"use strict";

const util = require("handlebars-utils");
import {helpers as object} from "./object";
import {helpers as array} from "./array";

const forEach = array.forEach;
const forOwn = object.forOwn;
export const helpers: any = {};

/**
 * Inline, subexpression, or block helper that returns true (or the block)
 * if the given collection is empty, or false (or the inverse block, if
 * supplied) if the colleciton is not empty.
 *
 * ```handlebars
 * <!-- array: [] -->
 * {{#isEmpty array}}AAA{{else}}BBB{{/isEmpty}}
 * <!-- results in: 'AAA' -->
 *
 * <!-- array: [] -->
 * {{isEmpty array}}
 * <!-- results in: true -->
 * ```
 * @param {Object} `collection`
 * @param {Object} `options`
 * @return {String}
 * @block
 * @api public
 */

helpers.isEmpty = function (collection: any, options: any) {
  if (!util.isOptions(options)) {
    options = collection;
    return util.fn(true, this, options);
  }

  if (Array.isArray(collection) && !collection.length) {
    return util.fn(true, this, options);
  }

  const keys = Object.keys(collection);
  const isEmpty = typeof collection === "object" && !keys.length;
  return util.value(isEmpty, this, options);
};

/**
 * Block helper that iterates over an array or object. If
 * an array is given, `.forEach` is called, or if an object
 * is given, `.forOwn` is called, otherwise the inverse block
 * is returned.
 *
 * @param {Object|Array} `collection` The collection to iterate over
 * @param {Object} `options`
 * @return {String}
 * @block
 * @api public
 */

helpers.iterate = function (collection: any, options: any) {
  if (Array.isArray(collection)) {
    return forEach.apply(null, [collection, options]);
  }
  if (util.isObject(collection)) {
    return forOwn.apply(null, [collection, options]);
  }
  return options.inverse(this);
};
