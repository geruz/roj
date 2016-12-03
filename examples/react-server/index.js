'use strict';

const components = require('../../middlewares').findIn('./components');

const express = require('express');
const app = express();

app.use(components);
app.get('/', function (req, res) {
    res.send(res.locals.components.graph({}));
});

app.listen(3000);
