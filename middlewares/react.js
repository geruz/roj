'use strict';

const loader = require('../react/loader');
const fs = require('fs');
/*eslint-disable no-param-reassign */
let defWindowFactory = (req, res) => ({});

const defaultWindowFactory = f => {
    defWindowFactory = f;
};
const empty = () => '';
const createModule = (module, windowFactory = defWindowFactory) => (...directories) => {
    const hash = {};
    for (const dir of directories) {
        if (!fs.existsSync(dir)) {
            console.warn(`Roj ignore: directory ${dir} not exist`);
            continue;
        }
        const components = loader.find(dir);
        for (const comp of components) {
            const component = loader.load(comp);
            const getForServer = component.rojJson.enableServer ? (model, id) => {
                const html = component.render(model);
                return `<div id='${id}'>${html}</div>`;
            } : empty;
            const getForClient = component.rojJson.enableClient ? (model, id) => {
                const json = JSON.stringify(model);
                const client = `window.${module}['${component.name}'](${json},
                    document.getElementById('${id}'))`;
                return global.window.wrapClientScript
                    ? global.window.wrapClientScript(client)
                    : `<script>${client}</script>`;
            } : empty;
            hash[component.name] = (model, id) => {
                const client = getForClient(model, id);
                const server = getForServer(model, id);
                return `${server}${client}`;
            };
            hash[component.name].model = component.model;
        }
    }
    const create = function (req, res) {
        const idCounters = {};
        const nextId = id => {
            idCounters[id] = (idCounters[id] || 0) + 1;
            return `roj:${id}_${idCounters[id]}`;
        }
        const render = name => data => {
            const pr = global.window;
            const id = nextId(name);
            try {
                global.window = windowFactory(req, res);
                return hash[name](data, id);
            } finally {
                global.window = pr;
            }
        }
        const decorRender = name => [name, render(name), hash[name].model]
        return Object.keys(hash).map(decorRender);
    };
    const mddl = function (req, res, next) {
        const roj = Object.assign({}, res.locals.roj || {})
        create(req, res).forEach(([name, f])=>roj[name] = f)
        res.locals.roj = roj;
        next();
    };
    mddl.list = res => create(res).map(([name, f, model = {}])=>({name, f, model}))
    return mddl;
};
module.exports = {
    createModule,
    defaultWindowFactory,
}