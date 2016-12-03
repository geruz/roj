'use strict';

const loader = require('../react/loader');
/*eslint-disable no-param-reassign */

module.exports = function (...directories) {
    const hash = {};
    for (const dir of directories) {
        const components = loader.find(dir);
        for (const comp of components) {
            const component = loader.load(comp);
            hash[component.name] = model => component.render(model);
        }
    }
    return function (req, res, next) {
        res.locals.components = Object.assign(res.locals.components || {}, hash);
        next();
    };
};
