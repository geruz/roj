'use strict';

const uppercasePattern = /[A-Z]/g;
const msPattern = /^ms-/;
const cache = {};

const hyphenateStyleName = string =>
    string in cache
    ? cache[string]
    : cache[string] = string
      .replace(uppercasePattern, '-$&')
      .toLowerCase()
      .replace(msPattern, '-ms-');


module.exports = hyphenateStyleName;
