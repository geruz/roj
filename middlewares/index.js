'use strict';

const react = require('./react');

module.exports = {
    findIn: function (...directories) {
        return react(...directories);
    },
};
