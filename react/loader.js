'use strict';

/*eslint-disable no-param-reassign */
const path = require('path');
const fs = require('fs');
const mod = require('module');

require('./require-proxy');
// Игнорируем серверный require ассетов
require('./require-proxy').ignoreExtensions('.scss');

class LoadedComponent {
    constructor (name, module, json) {
        this.name = name;
        this.rojJson = json;
        this.module = module;
    }
    render (model) {
        const el = {};
        this.module(model, el);
        return el.src;
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
    load () {
        const oldPaths = mod.Module._nodeModulePaths;
        mod.Module._nodeModulePaths = ComponentLoader.localRequire(oldPaths);
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

        const pack = require(path.join(this.dir, this.name, json.server || 'render.jsx'));
        mod._extensions = ext;
        mod.Module._nodeModulePaths = oldPaths;
        return new LoadedComponent(this.name, pack, json);
    }
}

module.exports = {
    find: dir => fs.readdirSync(dir)
          .map(subdir => new ComponentLoader(dir, subdir))
          .filter(x => fs.existsSync(x.rojJson)),
    load: componentData => componentData.load(),
};
