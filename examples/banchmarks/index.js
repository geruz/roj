'use strict';

const loadReact = require('../../server-render/dir-loader')({engine: 'react', clearCache: true});
const loadRoj = require('../../server-render/dir-loader')({engine: 'roj', clearCache: true});
const rojComponents = loadRoj(`${__dirname}/components`);
const reactComponents = loadReact(`${__dirname}/components`);
const Benchmark = require('benchmark');
const suite = new Benchmark.Suite();
const colors = require('colors/safe');

const printName = name => {
    const l = 50;
    const spaces = (l - name.length - 4) / 2;
    console.log('*'.repeat(l));
    console.log(
        '*'.repeat(2)
        + ' '.repeat(Math.floor(spaces))
        + colors.green(name)
        + ' '.repeat(Math.ceil(spaces))
        + '*'.repeat(2));
    console.log('*'.repeat(l));
};
const printDelta = (rojStr, reactStr) => {
    let equalPart = '';
    let i = 0;
    for (; i < rojStr.length; i++) {
        if (rojStr[i] === reactStr[i]) {
            equalPart += rojStr[i];
        } else {
            break;
        }
    }
    console.log(colors.green('roj:  '), equalPart + colors.red(rojStr.substring(i)));
    console.log(colors.green('react:'), equalPart + colors.red(reactStr.substring(i)));
}

const equalRender = name => {
    const rojStr = rojComponents[name].render();
    const reactStr = reactComponents[name].render();
    if (rojStr !== reactStr) {
        for (let a = 0; a < rojStr.length; a += 50) {
            if (rojStr.substring(a, a + 50) !== reactStr.substring(a, a + 50)) {
                printName(name)
                printDelta(rojStr.substring(a - 20, a + 50), reactStr.substring(a - 20, a + 50))
                return;
            }
        }
    }
}
Object.keys(reactComponents).forEach(name => equalRender(name));


const tests = components => Object.keys(components).map(key => () => components[key].render());
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
