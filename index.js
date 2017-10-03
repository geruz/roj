'use strict';

const {createModule, defaultWindowFactory} = require('./middlewares');
module.exports = {
    module: createModule,
    defaultWindowFactory,
};