'use strict';

const loader = require('./react/loader');
const fs = require('fs');

const createRenderFunction = component => {
    const {rojJson} = component;
    const getForServer = (model, {id, rootTag, wrapServer}) => {
        const html = component.render(model);
        return wrapServer
            ? wrapServer(html)
            : `<${rootTag} id='${id}'>${html}</${rootTag}>`;
    };
    const getForClient = (model, {id, wrapClient}) => {
        const json = JSON.stringify(model);
        const client = `window['${module}']['${component.name}'](${json},
            document.getElementById('${id}'))`;
        return wrapClient
            ? wrapClient(client)
            : `<script>${client}</script>`;
    };
    const defConfig = {
        enableServer: rojJson.enableServer,
        enableClient: rojJson.enableClient,
        id: component.name,
        rootTag: rojJson.rojJson || 'div',
    }
    return (data, params = {}) => {
        const p = Object.assign({}, params, defConfig);
        const client = p.enableClient ? getForClient(data, p) : '';
        const server = p.enableServer ? getForServer(data, p) : '';
        return `${server}${client}`;
    };
}
const existDir = dir => {
    if (!fs.existsSync(dir)) {
        console.warn(`Roj ignore: directory ${dir} not exist`);
        return false;
    }
    return true;
} 

const loadFrom = params => function (...directories) {
    const allComponents = [].concat(...directories.filter(existDir).map(loader.findIn));
    return allComponents.map(c => loader.load(c, params))
        .map(c => ({
            name: c.name,
            model: c.model,
            render: createRenderFunction(c),
        }))
        .reduce((s, comp) => Object.assign(s, {[comp.name]: comp}), {});
};

module.exports = loadFrom;