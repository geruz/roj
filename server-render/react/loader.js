'use strict';

/*eslint-disable no-param-reassign */
const path = require('path');
const fs = require('fs');
const mod = require('module');
const {renderToString} = require('react-dom/server');
require('./require-proxy');
// Игнорируем серверный require ассетов
require('./require-proxy').ignoreExtensions('.scss');
class Context {
    constructor () {
        this.isRoot = true;
        this.emptyNumber = 0;
        this.output = [];
        this.write = this.write.bind(this);
    }
    write (str) {
        this.output.push(str);
    }
    build () {
        const first = this.output[0];
        if (/<[a-z]+$/.test(first)) {
            return first + this.output[1] + ' data-reactroot=""' + this.output.slice(2).join('');
        } 
        if (/<[a-z]+>/.test(first)) {
            return first.substring(0, first.length - 2) + ' data-reactroot="">' + this.output.slice(1).join('');
        }
        return this.output.join('');
    }
}


class LoadedReactComponent {
    constructor (name, func, json) {
        this.name = name;
        this.rojJson = json;
        this.func = func;
    }
    render (model) {
        const el = {};
        const res = this.func(model, el);
        return renderToString(res);
    }
}
class LoadedRojComponent {
    constructor (name, func, json) {
        this.name = name;
        this.rojJson = json;
        this.func = func;
    }
    render (model) {
        const el = {};
        const res = this.func(model, el);
        if (res) {
            const context = new Context();
            res.toHtmlString(context);
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
    load ({engine = 'roj'} = {}) {
        mod.Module._cache = {};
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
                'transform-object-rest-spread',
                'syntax-object-rest-spread',
                'transform-class-properties',
            ],
            extensions: ['.jsx', '.js'],
        });
        const json = require(this.rojJson);

        const file = require(path.join(this.dir, this.name, json.server || 'render.jsx'));
        mod._extensions = ext;
        mod.Module._nodeModulePaths = oldPaths;
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
