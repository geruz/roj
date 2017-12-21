'use strict';

const path = require('path');

const natives = process.binding('natives');
const isNative = id => natives.hasOwnProperty(id);

const resolve = modulePath => {
    try {
        return {filename: require.resolve(modulePath)};
    } catch (error) {
        return {error};
    }
};

const rootDir = path.resolve();

const getInfo = (__module, id) => {
    const result = {isLocal: false};

    result.isNative = isNative(id);
    if (result.isNative) {
        Object.assign(result, resolve(id));
        return result;
    }

    let resolved = resolve(id);
    if (resolved.error) {
        const dir = path.dirname(__module.filename);
        resolved = resolve(path.resolve(dir, id));
        if (resolved.error) {
            resolved = resolve(path.resolve(rootDir, id));
        }
    }
    Object.assign(result, resolved);
    result.isLocal = resolved.filename && !resolved.filename.includes('node_modules');

    return result;
};

const listeners = [];

const proxy = function dependencyProxy (_module, id, next) {
    if (listeners.length) {
        const requiredInfo = getInfo(_module, id);
        for (const listener of listeners) {
            try {
                listener(_module, requiredInfo);
            } catch (err) {
                console.error(err);
            }
        }
    }
    return next(_module, id);
};

module.exports = {
    proxy,
    addListener: listeners.push.bind(listeners),
};
