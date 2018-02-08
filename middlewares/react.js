'use strict';

const loader = require('../server-render/dir-loader');

/*eslint-disable no-param-reassign */
let defWindowFactory = (req, res) => ({});
const defaultWindowFactory = f => {
    defWindowFactory = f;
};
let engine = 'react';
const setEngine = e => {
    if (e !== 'react' && e !== 'roj') {
        throw new Error(`not a valid engine: ${e}. Please select from 'roj' or 'react' `)
    }
    engine = e;
};

const rojModule = (name, {windowFactory = defWindowFactory} = {}) => {
    const rojComponents = loader({engine, module: name});
    return (...directories) => {
        const hash = rojComponents(...directories);
        const create = function (req, res) {
            const idCounters = {};
            const nextId = id => {
                idCounters[id] = (idCounters[id] || 0) + 1;
                return `roj:${id}_${idCounters[id]}`;
            };
            const render = name => data => {
                const pr = global.window;
                const id = nextId(name);
                try {
                    global.window = windowFactory(req, res);
                    return hash[name].render(data, id);
                } finally {
                    global.window = pr;
                }
            };
            const decorRender = name => [name, render(name), hash[name].model];
            return Object.keys(hash).map(decorRender);
        };
        const mddl = function (req, res, next) {
            const roj = Object.assign({}, res.locals.roj || {});
            create(req, res).forEach(([name, f]) => roj[name] = f);
            res.locals.roj = roj;
            next();
        };
        mddl.list = res => create(res).map(([name, f, model = {}]) => ({name, f, model}));
        return mddl;
    };
};
module.exports = {
    rojModule,
    defaultWindowFactory,
    setEngine,
};
