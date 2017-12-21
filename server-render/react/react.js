'use strict';

/*eslint-disable */
const escape = require('escape-html');
const style = require('./style');

const log = console.log;

const pr = new Proxy({}, {
    get: (target, name) => {
        return pr;
    },
});


const renderElement = (el, context) => {
    if (el === true || el === false || el === null || el === undefined || el === '') {
        return;
    }
    if (el instanceof Array) {
        el.forEach(x=> renderElement(x, context));
        return;
    }
    if (el && el.toHtmlString) {
        el.toHtmlString(context);
        return;
    }
    return context.write(escape(el));
}


class Component {
    constructor (props) {
        this.props = props;
        this.refs = pr;
    }
    toHtmlString (context) {
        try {
            const element = this.render();
            renderElement(element, context);
        } catch (err) {
            log(err);
            return;
        }
    }
    setState (st) {
        this.state = st;
    }
    forceUpdate () {}
};



const hashTags = {}
const createTag = function (tag, attributes, children) {
    let fact = hashTags[tag];
    if (fact !== undefined) {
        return fact(attributes, children);
    }
    const open = `<${tag}`;
    const close = tag !== 'br' ? `</${tag}>` : '';

    fact = function (attributes, children) {
        const attrs = {str: attributes};
        return {
            attributes: attrs,
            toHtmlString: function (context) {
                let a = '';
                context.write(open)
                if (context.isRoot) {
                    context.isRoot = false;
                    context.write(' data-reactroot=""');
                }
                context.write(attrs.str);
                context.write('>');
                renderElement(children, context);
                context.write(close);
            },
        };

    };
    hashTags[tag] = fact;
    return fact(attributes, children);
};
const hashEmptyTags = {}
const createEmptyTag = function (tag, children) {
    let fact = hashEmptyTags[tag];
    if (fact !== undefined) {
        return fact(children);
    }
    const open = `<${tag}`;
    const close = tag !== 'br' ? `</${tag}>` : '';

    fact = function (children) {
        return {
            toHtmlString: function (context) {
                let a = '';
                context.write(open)
                if (context.isRoot) {
                    context.isRoot = false;
                    context.write(' data-reactroot=""');
                }
                context.write('>');
                renderElement(children, context);
                context.write(close);
            },
        };

    };
    hashEmptyTags[tag] = fact;
    return fact(children);
};

const createElement = function (Cl, props, ...children) {
    
    if (Cl instanceof Function) {

        if (Cl.defaultProps) {
            for (const key of Object.keys(Cl.defaultProps)) {
                if (props[key] === undefined) {
                    props[key] = Cl.defaultProps[key];
                }
            }
        }
        props = props || {};
        props.children = children.length === 1 ? children[0] : children;

        try {
            if (Cl.prototype) {
                const inst = new Cl(props)
                if (inst && inst.componentWillMount) {
                    inst.componentWillMount();
                }
                return inst;
            }
            return Cl(props);
        } catch (err) {
            log(err);
            return '';
        }
    }
    if (!props) {
        return createEmptyTag(Cl, children);
    }
    if (props.dangerouslySetInnerHTML) {
        const html = props.dangerouslySetInnerHTML.__html || '';
        children.unshift({
            toHtmlString: function (context) {
                context.write(html);
            },
        });
    }
    if (props.ref instanceof Function) {
        props.ref(props);
    }

    let attributes = '';
    let value = null
    for (const attr of Object.keys(props)) {
        value = props[attr];
        if (value instanceof Function) {
            continue;
        }
        if (value === null || value === undefined) {
            continue;
        } 
        switch (attr){
            case 'dangerouslySetInnerHTML':
            case 'ref':
            case 'key':
                break;
            case 'className':
                 attributes += ' class="' + value + '"';
                 break;
            case 'style':
                const style = Object.keys(value).map(x=>`${hyphenateStyleName(x)}:${value[x]}`).join(';');
                attributes += ' style="' + style + '"';
                break;
            case 'defaultValue':
            case 'value':
                if (Cl === 'select') {
                    for (const ch of children) {
                        if (!ch.attributes) {
                            break;
                        }
                        const attrStr = ch.attributes.str
                        if (attrStr.indexOf(`value="${value}"`) >=0) {
                            ch.attributes.str = attrStr + ' selected=""';
                        }
                    }
                    break;
                }
                if (value === null || value === undefined) {
                    attributes += ' value=""';
                    break
                }
                attributes += ' value="' + escape(value) + '"';
                continue;
            case 'checked':
            case 'defaultChecked':
                if (value) {
                    attributes += ' checked';
                }
                break;
            case 'disabled': 
                if (value) {
                    attributes += ' disabled';
                }
                break;
            default:
                attributes += ' ' + attr + '="' + escape(value.toString()) + '"';
                break;
        }
    }
    return createTag(Cl, attributes, children);
};
    

    
module.exports.createElement = createElement;
module.exports.Component = Component;
module.exports.PureComponent = Component;
module.exports.React = class React {};
