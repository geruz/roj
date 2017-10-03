'use strict';

const Module = require('module');

module.exports = (...extensions) => extensions.forEach(e => Module._extensions[e] = () => null);
