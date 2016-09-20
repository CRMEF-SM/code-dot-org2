/** @file Utility functions for the data browser. */

import { valueOr } from '../../utils';

/**
 * @param {*} val
 * @returns {boolean} Whether the value can be cast to number without information loss.
 */
export function isNumber(val) {
  // check isNaN(str) in order to reject strings like "123abc".
  return !isNaN(val) && !isNaN(parseFloat(val));
}

/**
 * @param {*} val
 * @returns {boolean} Whether the value represents a boolean.
 */
export function isBoolean(val) {
  return (val === true || val === false || val === 'true' || val === 'false');
}

export function toBoolean(val) {
  if (val === true || val === 'true') {
    return true;
  }
  if (val === false || val === 'false') {
    return false;
  }
  throw new Error('Unable to convert to boolean');
}

/**
 * Convert a string to a boolean or number if possible.
 * @param val
 * @returns {string|number|boolean}
 */
export function castValue(val) {
  if (val === 'true' || val === true) {
    return true;
  }
  if (val === 'false' || val === false ) {
    return false;
  }
  if (isNumber(val)) {
    return parseFloat(val);
  }
  return val;
}

/**
 * Return the value as a string, or return '' if it is undefined or null.
 * @param {*} val
 * @returns {string}
 */
export function editableValue(val) {
  if (val === null || val === undefined) {
    return '';
  }
  return String(val);
}

/**
 * stringify the value, or replace it with "" if it is undefined or null.
 * @param {*} val
 * @returns {string}
 */
export function displayableValue(val) {
  if (val === null || val === undefined || val === '') {
    return '';
  }
  return JSON.stringify(val);
}
