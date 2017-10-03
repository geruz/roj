'use strict';

const fs = require('fs');


const dependents = new Map();
const watchingFiles = new Set();
const watchRoots = new Set();
const dependentRoots = new Set();


const addDependency = (from, who) => {
    const s = dependents.get(from) || new Set();
    s.add(who);
    dependents.set(from, s);
};

const removeDependency = filename => {
    const arr = dependents.get(filename);

    if (!watchRoots.has(filename)) {
        delete require.cache[filename];
        dependents.delete(filename);
    }

    if (arr) {
        arr.forEach(f => removeDependency(f));
    }
};

const addWatch = (filename, onChange) => {
    if (watchingFiles.has(filename)) {
        return;
    }
    watchingFiles.add(filename);

    const watcher = fs.watch(filename, () => {
        watchingFiles.delete(filename);
        watcher.close();
        onChange();
    });
};

const watchLocalDependency = (__module, info) => {
    if (!info.isLocal) {
        return;
    }
    if (!watchRoots.has(__module.filename) && !dependentRoots.has(__module.filename)) {
        return;
    }

    const filename = info.filename;
    dependentRoots.add(filename);
    addDependency(filename, __module.filename);
    addWatch(filename, () => {
        dependentRoots.delete(filename);
        removeDependency(filename);
        console.log(`removing from cache: ${filename}`);
    });
};

module.exports = {
    watchLocalDependency,
    addWatchRoot: watchRoots.add.bind(watchRoots),
};
