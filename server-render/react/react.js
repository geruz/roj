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

const spaces = /[ ]+/;
const renderElement = function (el, context) {
    if (el === true || el === false || el === null || el === undefined || el === '') {
        return;
    }
    if (el instanceof Array) {
        for(let i = 0; i < el.length; i++) {
            const e = el[i]
            if (typeof e === 'string' &&  spaces.test(e)) {
                if (el[i - 1]) {
                    context.write(`<!-- -->`)
                }
                context.write(e)
                if (el[i + 1]) {
                    context.write(`<!-- -->`)
                }
                continue;
            }
            renderElement(e, context)
        }
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
const createTag = function (tag, attributes, children) {
    const attr = {str: attributes};
    return {
        attributes: attr,
        toHtmlString: function (context) {
            const output = context.output
            if (children.length == 0) {
                switch (tag){
                    case 'input':
                    case 'img': 
                    output.push(`<${tag}${attr.str}/>`)
                    return;
                }
            }
            output.push(`<${tag}`)
            output.push(attr.str);
            output.push('>');
            renderElement(children, context);
            output.push(`</${tag}>`);
            
        },
    };
};
const createEmptyTag = function (tag, children) {
    return {
        toHtmlString: function (context) {
            const output = context.output;
            if (children.length == 0) {
                output.push(`<${tag}/>`)
            }else{
                const output = context.output
                output.push(`<${tag}>`)
                renderElement(children, context);
                output.push(`</${tag}>`);
            }
        },
    };
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
    if (props === null) {
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
    let attributes = '';
    for (const attr of Object.keys(props)) {
        let value = props[attr];
        if (value instanceof Function) {
            if (attr === 'ref') {
                props.ref(props);
            }
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
                const style = Object.keys(value).map(function(x) {`${hyphenateStyleName(x)}:${value[x]}`}).join(';');
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
                            ch.attributes.str = ' selected=""'+ attrStr;
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
    if (attributes === '') {
        return createEmptyTag(Cl, children);
    }
    return createTag(Cl, attributes, children);
};
    

    
module.exports.createElement = createElement;
module.exports.Component = Component;
module.exports.PureComponent = Component;
module.exports.React = class React {};
