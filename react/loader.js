'use strict';

/*eslint-disable no-param-reassign */
const path = require('path');
const fs = require('fs');
const mod = require('module');

class LoadedComponent {
    constructor (name, module) {
        this.name = name;
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
        this.path = path.join(dir, subdir, 'render.jsx');
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
                'transform-es2015-modules-commonjs'],
            extensions: ['.jsx', '.js'],
        });
        const pack = require(path.join(path.resolve(), this.path));
        mod._extensions = ext;
        mod.Module._nodeModulePaths = oldPaths;
        return new LoadedComponent(this.name, pack);
    }
}

module.exports = {
    find: dir => fs.readdirSync(dir)
          .map(subdir => new ComponentLoader(dir, subdir))
          .filter(x => fs.existsSync(x.path)),
    load: componentData => componentData.load(),
};
