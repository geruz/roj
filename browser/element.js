'use strict';

module.exports = class Elements {
    constructor () {
        this.hash = {};
    }
    nextId (namespace) {
        if (!this.hash[namespace]) {
            this.hash[namespace] = {
                number: 0,
            };
        }
        return `${namespace}_${this.hash[namespace].number++}`;
    }
};
