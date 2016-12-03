'use strict';

module.exports = class Document {
    getElementById () {
        return this;
    }
    addEventListener () {

    }
    getElementsByClassName () {
        return [{
            addEventListener: () => {},
            offsetWidth: 0,
        }];
    }
};
