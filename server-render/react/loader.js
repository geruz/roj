'use strict';

/*eslint-disable no-param-reassign */
const path = require('path');
const fs = require('fs');
const mod = require('module');
let getRenderToString = () => {
    const {renderToString} = require('react-dom/server');
    getRenderToString = () => renderToString;
    return renderToString;
}

const toHtmlString = Symbol.for('toHtmlString');
const {ignoreExtensions, watchDependencies} = require('./require-proxy');

// Игнорируем серверный require ассетов
ignoreExtensions('.scss', '.css');

if (process.env.NODE_ENV !== 'production') {
    watchDependencies(__filename);
}

class Context {
    constructor () {
        this.output = [];
        this.write = this.write.bind(this);
    }
    write (str) {
        this.output.push(str);
    }
    build () {
        const first = this.output[0];
        if (/<[a-z0-9]+$/.test(first)) {
            return first + this.output[1] + ' data-reactroot=""' + this.output.slice(2).join('');
        }
        if (/<[a-z]+>/.test(first)) {
            return first.substring(0, first.length - 1) + ' data-reactroot="">' + this.output.slice(1).join('');
        }
        return this.output.join('');
    }
}


class LoadedReactComponent {
    constructor (name, comp, json) {
        this.name = name;
        this.rojJson = json;
        this.comp = comp;
    }
    render (model) {
        const el = {};
        const res = this.comp(model, el);
        return getRenderToString()(res);
    }
}
class LoadedRojComponent {
    constructor (name, comp, json) {
        this.name = name;
        this.rojJson = json;
        this.comp = comp;
    }
    render (model) {
        const el = {};
        const res = this.comp(model, el);
        if (res) {
            const context = new Context();
            res[toHtmlString](context);
            return context.build('');
        }
        if (el.src !== undefined) {
            return el.src;
        }
        return res;
    }
}

/*eslint-disable global-require*/
class ComponentLoader {
    constructor (dir, subdir) {
        this.dir = dir;
        this.rojJson = path.join(dir, subdir, 'roj.json');
        this.name = subdir;
    }
    static localRequire (oldPaths) {
        return function (from) {
            const paths = oldPaths.call(this, from);
            paths.unshift(__dirname);
            return paths;
        };
    }
    load ({engine = 'roj', clearCache = false} = {}) {
        const cache = mod.Module._cache;
        if (clearCache){
            mod.Module._cache = {};
        }
        const oldPaths = mod.Module._nodeModulePaths;
        if (engine === 'roj') {
            mod.Module._nodeModulePaths = ComponentLoader.localRequire(oldPaths);
        }
        const ext = mod._extensions;
        require('babel-core/register')({
            presets: ['react'],
            plugins: ['transform-react-jsx',
                'transform-decorators-legacy',
                'transform-es2015-modules-commonjs',
                'transform-class-properties',
                'transform-object-rest-spread',
            ],
            extensions: ['.jsx', '.js'],
        });
        const json = require(this.rojJson);

        const file = require(path.join(this.dir, this.name, json.server || 'render.jsx')).default;
        mod._extensions = ext;
        mod.Module._nodeModulePaths = oldPaths;
        mod.Module._cache = cache;

        if (engine === 'roj') {
            return new LoadedRojComponent(this.name, file, json);
        }
        return new LoadedReactComponent(this.name, file, json);
    }
}

module.exports = {
    findIn: dir => fs.readdirSync(dir)
          .map(subdir => new ComponentLoader(dir, subdir))
          .filter(x => fs.existsSync(x.rojJson)),
    load: (componentData, param) => componentData.load(param),
};
