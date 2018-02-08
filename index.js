'use strict';

const {rojModule, defaultWindowFactory, setEngine} = require('./middlewares');
module.exports = {
    module: rojModule,
    defaultWindowFactory,
    setEngine,
};
