'use strict';

const ruban = require('ruban');
const path = require('path');
const dir = path.resolve();
const masks = ['!(node_modules)/**.test.js', '*.test.js'];
ruban.glob(dir, masks.map(c => path.join(dir, c)));
