'use strict';

const Module = require('module');

const originalRequire = Module.prototype.require;
const contextlessRequire = (_module, id) => originalRequire.call(_module, id);

let wrappedRequire = contextlessRequire;

const proxies = [];

const addProxy = proxy => {
    proxies.push(proxy);

    wrappedRequire = proxies.reduce(
        (next, proxy) => (_module, id) => proxy(_module, id, next),
        contextlessRequire);
};

const InterceptedRequire = function () {
    return function interceptedRequire (id) {
        return wrappedRequire(this, id);
    };
};
InterceptedRequire.prototype = require;
Module.prototype.require = new InterceptedRequire();

module.exports = {addProxy, originalRequire};
