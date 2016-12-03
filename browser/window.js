'use strict';

module.export = class Window {
    addEventListener () { }

    getComputedStyle () {
        return '';
    }
    get innerWidth () {
        return 1024;
    }
    get innerHeight () {
        return 768;
    }
    get __isServer () {
        return true;
    }
    static create (additional) {
        return Object.assign(new Window(), additional);
    }
};
