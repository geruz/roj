'use strict';

const loadReact = require('../../server-render/dir-loader')({engine: 'react'});
const loadRoj = require('../../server-render/dir-loader')({engine: 'roj'});
const rojComponents = loadRoj(`${__dirname}/components`);
const reactComponents = loadReact(`${__dirname}/components`);
const Benchmark = require('benchmark');
const suite = new Benchmark.Suite();

const tests = components => Object.keys(components)
  .map(key => () => components[key].render({count: 1000}));
// add tests
const rojStr = rojComponents['array'].render({count: 1});
const reactStr = reactComponents['array'].render({count: 1});

if (rojStr !== reactStr) {
    console.log('roj:\n', rojStr);
    console.log('\n\n');
    console.log('react:\n', reactStr);
}
suite.add('React Render', () => {
  tests(reactComponents).forEach(t => t());
})
.add('Roj Render', () => {
    tests(rojComponents).forEach(t => t());
})

// add listeners
.on('cycle', event => {
    console.log(String(event.target));
})
.on('complete', function () {
    console.log(`Fastest is ${this.filter('fastest').map('name')}`);
})
// run async
.run({'async': true});