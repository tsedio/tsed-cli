import {getValue, isArray, isNumber, isObject, isString} from "@tsed/core";
// @ts-ignore
import createFrame from "create-frame";
// @ts-ignore
import util from "handlebars-utils";

export const helpers: any = {};

/**
 * Returns all of the items in an array after the specified index.
 * Opposite of [before](#before).
 *
 * ```handlebars
 * <!-- array: ['a', 'b', 'c'] -->
 * {{after array 1}}
 * <!-- results in: '["c"]' -->
 * ```
 * @param {Array} `array` Collection
 * @param {Number} `n` Starting index (number of items to exclude)
 * @return {Array} Array exluding `n` items.
 * @api public
 */

helpers.after = function (array: string | any[], n: any) {
  if (util.isUndefined(array)) return "";
  return array.slice(n);
};

/**
 * Cast the given `value` to an array.
 *
 * ```handlebars
 * {{arrayify "foo"}}
 * <!-- results in: [ "foo" ] -->
 * ```
 * @param {any} `value`
 * @return {Array}
 * @api public
 */

helpers.arrayify = function (value: any) {
  return value ? (isArray(value) ? value : [value]) : [];
};

/**
 * Return all of the items in the collection before the specified
 * count. Opposite of [after](#after).
 *
 * ```handlebars
 * <!-- array: ['a', 'b', 'c'] -->
 * {{before array 2}}
 * <!-- results in: '["a", "b"]' -->
 * ```
 * @param {Array} `array`
 * @param {Number} `n`
 * @return {Array} Array excluding items after the given number.
 * @api public
 */

helpers.before = function (array: string | any[], n: number) {
  if (util.isUndefined(array)) return "";
  return array.slice(0, -n);
};

/**
 * ```handlebars
 * <!-- array: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] -->
 * {{#eachIndex array}}
 *   {{item}} is {{index}}
 * {{/eachIndex}}
 * ```
 * @param {Array} `array`
 * @param {Object} `options`
 * @return {String}
 * @block
 * @api public
 */

helpers.eachIndex = function (array: string | any[], options: {fn: (arg0: {item: any; index: number}) => string}) {
  let result = "";
  for (let i = 0; i < array.length; i++) {
    result += options.fn({item: array[i], index: i});
  }
  return result;
};

/**
 * Block helper that filters the given array and renders the block for values that
 * evaluate to `true`, otherwise the inverse block is returned.
 *
 * ```handlebars
 * <!-- array: ['a', 'b', 'c'] -->
 * {{#filter array "foo"}}AAA{{else}}BBB{{/filter}}
 * <!-- results in: 'BBB' -->
 * ```
 * @param {Array} `array`
 * @param {any} `value`
 * @param {Object} `options`
 * @return {String}
 * @block
 * @api public
 */

helpers.filter = function (
  array: any[],
  value: any,
  options: {hash: {property: any; prop: any}; fn: (arg0: any) => string; inverse: (arg0: any) => any}
) {
  let content = "";
  let results = [];

  // filter on a specific property
  const prop = options.hash && (options.hash.property || options.hash.prop);
  if (prop) {
    results = array.filter(function (val) {
      return value === getValue(val, prop);
    });
  } else {
    // filter on a string value
    results = array.filter(function (v) {
      return value === v;
    });
  }

  if (results && results.length > 0) {
    for (let i = 0; i < results.length; i++) {
      content += options.fn(results[i]);
    }
    return content;
  }
  return options.inverse(this);
};

/**
 * Returns the first item, or first `n` items of an array.
 *
 * ```handlebars
 * {{first "['a', 'b', 'c', 'd', 'e']" 2}}
 * <!-- results in: '["a", "b"]' -->
 * ```
 * @param {Array} `array`
 * @param {Number} `n` Number of items to return, starting at `0`.
 * @return {Array}
 * @api public
 */

helpers.first = function (array: string | any[], n: any) {
  if (array === undefined) return "";
  if (!isNumber(n)) {
    return array[0];
  }
  return array.slice(0, n);
};

/**
 * Iterates over each item in an array and exposes the current item
 * in the array as context to the inner block. In addition to
 * the current array item, the helper exposes the following variables
 * to the inner block:
 *
 * - `index`
 * - `total`
 * - `isFirst`
 * - `isLast`
 *
 * Also, `@index` is exposed as a private variable, and additional
 * private variables may be defined as hash arguments.
 *
 * ```handlebars
 * <!-- accounts = [
 *   {'name': 'John', 'email': 'john@example.com'},
 *   {'name': 'Malcolm', 'email': 'malcolm@example.com'},
 *   {'name': 'David', 'email': 'david@example.com'}
 * ] -->
 *
 * {{#forEach accounts}}
 *   <a href="mailto:{{ email }}" title="Send an email to {{ name }}">
 *     {{ name }}
 *   </a>{{#unless isLast}}, {{/unless}}
 * {{/forEach}}
 * ```
 * @source <http://stackoverflow.com/questions/13861007>
 * @param {Array} `array`
 * @return {String}
 * @block
 * @api public
 */

helpers.forEach = function (array: string | any[], options: any) {
  const data = createFrame(options, options.hash);
  const len = array.length;
  let buffer = "";
  let i = -1;

  while (++i < len) {
    const item = array[i];
    data.index = i;
    item.index = i + 1;
    item.total = len;
    item.isFirst = i === 0;
    item.isLast = i === len - 1;
    buffer += options.fn(item, {data: data});
  }
  return buffer;
};

/**
 * Block helper that renders the block if an array has the
 * given `value`. Optionally specify an inverse block to render
 * when the array does not have the given value.
 *
 * ```handlebars
 * <!-- array: ['a', 'b', 'c'] -->
 * {{#inArray array "d"}}
 *   foo
 * {{else}}
 *   bar
 * {{/inArray}}
 * <!-- results in: 'bar' -->
 * ```
 * @param {Array} `array`
 * @param {any} `value`
 * @param {Object} `options`
 * @return {String}
 * @block
 * @api public
 */

helpers.inArray = function (array: any[], value: any, options: any) {
  return util.value(util.indexOf(array, value) > -1, this, options);
};

/**
 * Returns true if `value` is an es5 array.
 *
 * ```handlebars
 * {{isArray "abc"}}
 * <!-- results in: false -->
 *
 * <!-- array: [1, 2, 3] -->
 * {{isArray array}}
 * <!-- results in: true -->
 * ```
 * @param {any} `value` The value to test.
 * @return {Boolean}
 * @api public
 */

helpers.isArray = function (value: any) {
  return Array.isArray(value);
};

/**
 * Returns the item from `array` at index `idx`.
 *
 * ```handlebars
 * <!-- array: ['a', 'b', 'c'] -->
 * {{itemAt array 1}}
 * <!-- results in: 'b' -->
 * ```
 * @param {Array} `array`
 * @param {Number} `idx`
 * @return {any} `value`
 * @block
 * @api public
 */

helpers.itemAt = function (array: string | any[], idx: number) {
  array = util.result(array);
  if (isArray(array)) {
    idx = isNumber(idx) ? +idx : 0;
    if (idx < 0) {
      return array[array.length + idx];
    }
    if (idx < array.length) {
      return array[idx];
    }
  }
};

/**
 * Join all elements of array into a string, optionally using a
 * given separator.
 *
 * ```handlebars
 * <!-- array: ['a', 'b', 'c'] -->
 * {{join array}}
 * <!-- results in: 'a, b, c' -->
 *
 * {{join array '-'}}
 * <!-- results in: 'a-b-c' -->
 * ```
 * @param {Array} `array`
 * @param {String} `separator` The separator to use. Defaults to `, `.
 * @return {String}
 * @api public
 */

helpers.join = function (array: string | any[], separator: string | undefined) {
  if (isString(array)) return array;
  if (!isArray(array)) return "";
  separator = util.isString(separator) ? separator : ", ";
  return array.join(separator);
};

/**
 * Returns true if the the length of the given `value` is equal
 * to the given `length`. Can be used as a block or inline helper.
 *
 * @param {Array|String} `value`
 * @param {Number} `length`
 * @param {Object} `options`
 * @return {String}
 * @block
 * @api public
 */

helpers.equalsLength = function (value: string | any[], length: number, options: any) {
  if (util.isOptions(length)) {
    options = length;
    length = 0;
  }

  let len = 0;
  if (typeof value === "string" || Array.isArray(value)) {
    len = value.length;
  }

  return util.value(len === length, this, options);
};

/**
 * Returns the last item, or last `n` items of an array or string.
 * Opposite of [first](#first).
 *
 * ```handlebars
 * <!-- var value = ['a', 'b', 'c', 'd', 'e'] -->
 *
 * {{last value}}
 * <!-- results in: ['e'] -->
 *
 * {{last value 2}}
 * <!-- results in: ['d', 'e'] -->
 *
 * {{last value 3}}
 * <!-- results in: ['c', 'd', 'e'] -->
 * ```
 * @param {Array|String} `value` Array or string.
 * @param {Number} `n` Number of items to return from the end of the array.
 * @return {Array}
 * @api public
 */

helpers.last = function (value: string | any[], n: number) {
  if (!isArray(value) && typeof value !== "string") {
    return "";
  }
  if (!isNumber(n)) {
    return value[value.length - 1];
  }
  return value.slice(-Math.abs(n));
};

/**
 * Returns the length of the given string or array.
 *
 * ```handlebars
 * {{length '["a", "b", "c"]'}}
 * <!-- results in: 3 -->
 *
 * <!-- results in: myArray = ['a', 'b', 'c', 'd', 'e']; -->
 * {{length myArray}}
 * <!-- results in: 5 -->
 *
 * <!-- results in: myObject = {'a': 'a', 'b': 'b'}; -->
 * {{length myObject}}
 * <!-- results in: 2 -->
 * ```
 * @param {Array|Object|String} `value`
 * @return {Number} The length of the value.
 * @api public
 */

helpers.length = function (value: string | any[]) {
  if (isObject(value) && !util.isOptions(value)) {
    value = Object.keys(value);
  }
  if (typeof value === "string" || Array.isArray(value)) {
    return value.length;
  }
  return 0;
};

/**
 * Returns a new array, created by calling `function` on each
 * element of the given `array`. For example,
 *
 * ```handlebars
 * <!-- array: ['a', 'b', 'c'], and "double" is a
 * fictitious function that duplicates letters -->
 * {{map array double}}
 * <!-- results in: '["aa", "bb", "cc"]' -->
 * ```
 *
 * @param {Array} `array`
 * @param {Function} `fn`
 * @return {String}
 * @api public
 */

helpers.map = function (array: string | any[], iter: (arg0: any, arg1: number, arg2: any[]) => any) {
  if (!Array.isArray(array)) return "";
  const len = array.length;
  const res = new Array(len);
  let i = -1;

  if (typeof iter !== "function") {
    return array;
  }

  while (++i < len) {
    res[i] = iter(array[i], i, array);
  }
  return res;
};

/**
 * Map over the given object or array or objects and create an array of values
 * from the given `prop`. Dot-notation may be used (as a string) to get
 * nested properties.
 *
 * ```handlebars
 * // {{pluck items "data.title"}}
 * <!-- results in: '["aa", "bb", "cc"]' -->
 * ```
 * @param {Array|Object} `collection`
 * @param {Function} `prop`
 * @return {String}
 * @api public
 */

helpers.pluck = function (arr: string | any[], prop: any) {
  if (util.isUndefined(arr)) return "";
  const res = [];
  for (let i = 0; i < arr.length; i++) {
    const val = getValue(arr[i], prop);
    if (typeof val !== "undefined") {
      res.push(val);
    }
  }
  return res;
};

/**
 * Reverse the elements in an array, or the characters in a string.
 *
 * ```handlebars
 * <!-- value: 'abcd' -->
 * {{reverse value}}
 * <!-- results in: 'dcba' -->
 * <!-- value: ['a', 'b', 'c', 'd'] -->
 * {{reverse value}}
 * <!-- results in: ['d', 'c', 'b', 'a'] -->
 * ```
 * @param {Array|String} `value`
 * @return {Array|String} Returns the reversed string or array.
 * @api public
 */

helpers.reverse = function (val: string | []) {
  if (Array.isArray(val)) {
    val.reverse();
    return val;
  }
  if (val && isString(val)) {
    return val.split("").reverse().join("");
  }
};

/**
 * Block helper that returns the block if the callback returns true
 * for some value in the given array.
 *
 * ```handlebars
 * <!-- array: [1, 'b', 3] -->
 * {{#some array isString}}
 *   Render me if the array has a string.
 * {{else}}
 *   Render me if it doesn't.
 * {{/some}}
 * <!-- results in: 'Render me if the array has a string.' -->
 * ```
 * @param {Array} `array`
 * @param {Function} `iter` Iteratee
 * @param {Options} Handlebars provided options object
 * @return {String}
 * @block
 * @api public
 */

helpers.some = function (array: string | any[], iter: (arg0: any, arg1: number, arg2: any[]) => any, options: any) {
  if (Array.isArray(array)) {
    for (let i = 0; i < array.length; i++) {
      if (iter(array[i], i, array)) {
        return options.fn(this);
      }
    }
  }
  return options.inverse(this);
};

/**
 * Sort the given `array`. If an array of objects is passed,
 * you may optionally pass a `key` to sort on as the second
 * argument. You may alternatively pass a sorting function as
 * the second argument.
 *
 * ```handlebars
 * <!-- array: ['b', 'a', 'c'] -->
 * {{sort array}}
 * <!-- results in: '["a", "b", "c"]' -->
 * ```
 *
 * @param {Array} `array` the array to sort.
 * @param {String|Function} `key` The object key to sort by, or sorting function.
 * @api public
 */

helpers.sort = function (array: any[], options: any) {
  if (!Array.isArray(array)) return "";
  if (getValue(options, "hash.reverse")) {
    return array.sort().reverse();
  }
  return array.sort();
};

/**
 * Block helper that return an array with all duplicate
 * values removed. Best used along with a [each](#each) helper.
 *
 * ```handlebars
 * <!-- array: ['a', 'a', 'c', 'b', 'e', 'e'] -->
 * {{#each (unique array)}}{{.}}{{/each}}
 * <!-- results in: 'acbe' -->
 * ```
 * @param {Array} `array`
 * @param {Object} `options`
 * @return {Array}
 * @api public
 */

helpers.unique = function (array: any[]) {
  if (util.isUndefined(array)) return "";

  return array.filter(function (item, index, arr) {
    return arr.indexOf(item) === index;
  });
};
