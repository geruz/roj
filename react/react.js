'use strict';

/*eslint-disable */
const escape = require('escape-html');
const log = console.log;

const pr = new Proxy({}, {
    get: (target, name) => {
        return pr;
    },
});

const renderedToHtmlString = (c, context) => {
    if (c && c.toHtmlString) {
        return c.toHtmlString(context);
    }
    return c === true || c === false || c === null || c === undefined || c === '' ? '' : escape(c);
}

class Component {
    constructor (props) {
        this.props = props;
        this.refs = pr;
    }
    toHtmlString (context) {
        try {
            const c = this.render();
            if (c === null || c === '') {
                return `<!-- react-empty: ${context.emptyNumber} -->`;
            }
            if (c instanceof Array) {
                return c.map(x => renderedToHtmlString(x, context)).join('');
            }
            context.emptyNumber++;

            return renderedToHtmlString(c, context);
        } catch (err) {
            log(err);
            return '';
        }
    }
    setState (st) {
        this.state = st;
    }
};

const hashTags = {}
const createTag = function (tag, attributes, children) {
    let fact = hashTags[tag];
    if (fact !== undefined) {
        return fact(attributes, children);
    }
    const open = `<${tag} `;
    const close = `</${tag}>`;

    fact = function (attributes, children) {
        return {
            toHtmlString: function (context) {
                let a = '';
                if (context.isRoot) {
                    context.isRoot = false;
                    a = 'data-reactroot="" ';
                }
                a = attributes !== null ? a + attributes.join(' ') : a
                const c = children !== null
                    ? children.map(x => renderedToHtmlString(x, context)).join('')
                    : '';
                context.emptyNumber++;
                return open + a + '>' + c + close;
            },
        };

    };
    hashTags[tag] = fact;
    return fact(attributes, children);
};

const createElement = function (Cl, props) {
    let children = null;
    if (props && props.dangerouslySetInnerHTML) {
        children = [];
        const html = props.dangerouslySetInnerHTML.__html || '';
        children.push({
            toHtmlString: function () {
                return html;
            },
        });
    }

    if (arguments.length > 2) {
        children = children || [];
        for (let i = 2; i < arguments.length; i++) {
            const ch = arguments[i];
            if (ch instanceof Array) {
                children.push(...ch);
            } else {
                children.push(ch);
            }
        }
    }

    if (typeof Cl === 'function') {
        props = props || {}
        props.children = children || [];
        try {
            const inst = Cl.prototype ? new Cl(props) : Cl(props);
            if (inst && inst.componentWillMount) {
                inst.componentWillMount();
            }
            return inst;
        } catch (err) {
            log(err);
            return '';
        }
    }

    let attributes = null;
    if (props) {
        if (props.ref instanceof Function) {
            props.ref(props)
        }

        for (const attr of Object.keys(props)) {
            if (attr === 'dangerouslySetInnerHTML' || attr === 'ref') {
                continue;
            }

            let value = props[attr];
            if (value instanceof Function) {
                continue;
            }
            if ((attr === 'value' || attr === 'defaultValue') && (value === null || value === undefined)) {
                value = '';
            }
            if (value === null || value === undefined) {
                continue;
            }

            attributes = attributes === null ? [] : attributes;
            if (attr === 'className') {
                attributes.push('class="' + value + '"');
                continue;
            }
            if (attr === 'checked') {
                if (props.checked) {
                    attributes.push('checked');
                }
                continue;
            }
            if (attr === 'defaultValue') {
                attributes.push('value="' + value + '"');
                continue;
            }

            attributes.push(attr + '="' + value + '"');
        }
    }
    return createTag(Cl, attributes, children);
};
module.exports.createElement = createElement;
module.exports.Component = Component;
module.exports.React = class React {
    static createFactory (Cl) {
        return data =>
            ({
                render: () => createElement(Cl, data).render().toHtmlString({emptyNumber: 0}),
            });
    }
};
