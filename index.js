'use strict';

const {rojModule, defaultWindowFactory, defaultDocumentFactory, setEngine} = require('./middlewares');
module.exports = {
    module: rojModule,
    defaultWindowFactory,
    defaultDocumentFactory,
    setEngine,
};
