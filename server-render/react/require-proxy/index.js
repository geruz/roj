'use strict';

const {addProxy} = require('./intercept-require');
const {proxy: dependencyProxy, addListener} = require('./dependency-proxy');
const {watchLocalDependency, addWatchRoot} = require('./local-dependencies');
const ignoreExtensions = require('./ignore-extensions');

if (process.env.NODE_ENV !== 'production') {
    addProxy(dependencyProxy);
}
addListener(watchLocalDependency);

const watchDependencies = filename => {
    addWatchRoot(filename);
};

module.exports = {
    watchDependencies,
    ignoreExtensions,
};
