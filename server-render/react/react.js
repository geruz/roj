'use strict';

/*eslint-disable */
const escape = require('./escape');
//const escape = require('escape-html');
const style = require('./style');

const log = console.log;

const pr = new Proxy({}, {
    get: (target, name) => {
        return pr;
    },
});
const toHtmlString = Symbol.for('toHtmlString');
const spaces = /[ ]+/;
const renderElement = function (el, context) {

    if (el instanceof Object) {
        if (el[toHtmlString]) {
            el[toHtmlString](context);
            return;
        }
        const output = context.output
        if (el instanceof Array) {
            for(let i = 0; i < el.length; i++) {
                const e = el[i]
                if (typeof e === 'string' &&  spaces.test(e)) {
                    if (i > 0 && output[output.length -1] != '<!-- -->') {
                        output.push(`<!-- -->`)
                    }
                    output.push(e)
                    if (el[i + 1]) {
                        output.push(`<!-- -->`)
                    }
                    continue;
                }
                renderElement(e, context)
            }
        }
        return;
    }

    if (el === true || el === false || el === null || el === undefined || el === '') {
        return;
    }
    if (typeof el === 'string'){
        context.output.push(escape(el));
        return
    }
    context.output.push(el.toString());
}

class Component {
    constructor (props) {
        this.props = props;
        this.refs = pr;
    }
    [toHtmlString] (context) {
        try {
            const element = this.render();
            renderElement(element, context);
        } catch (err) {
            log(err);
            return;
        }
    }
    setState (st) {
        this.state = Object.assign(this.state, st);
    }
    forceUpdate () {}
};
class Tag {
    constructor(tag, attributes, children){
        this.tag = tag;
        this.attributes = attributes;
        this.children = children;
    }
    [toHtmlString](context) {
        const output = context.output;
        const {tag, children, attributes} = this;
        
        if (children.length === 0) {
            switch (tag){
                case 'area':
                case 'base':
                case 'br':
                case 'col':
                case 'embed':
                case 'hr':
                case 'img':
                case 'input':
                case 'keygen':
                case 'link':
                case 'meta':
                case 'param':
                case 'source':
                case 'track':
                case 'wbr':
                output.push(`<${tag}${attributes}/>`)
                return;
            }
        }
        output.push(`<${tag}`, attributes, '>')
        renderElement(children, context);
        output.push(`</${tag}>`);
    }
}
class EmptyTag {
    constructor(tag, children) {
        this.children = children;
        this.tag = tag;
    }
    [toHtmlString](context) {
        const output = context.output;
        const {tag, children} = this;
        if (children.length === 0) {
            output.push(`<${tag}/>`)
        }else{
            output.push(`<${tag}>`)
            renderElement(children, context);
            output.push(`</${tag}>`);
        }
    }
}

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
                const inst = new Cl(props);
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
        return new EmptyTag(Cl, children);
    }
    if (props.dangerouslySetInnerHTML) {
        const html = props.dangerouslySetInnerHTML.__html || '';
        children.unshift({
            [toHtmlString]: function (context) {
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
                const style = []
                for (const x of Object.keys(value)){
                    style.push(`${hyphenateStyleName(x)}:${value[x]}`)
                }
                attributes += ' style="' + style.join(';') + '"';
                break;
            case 'defaultValue':
            case 'value':
                if (Cl === 'select') {
                    for (const ch of children) {
                        if (!ch.attributes) {
                            break;
                        }
                        const attrStr = ch.attributes
                        if (attrStr.indexOf(`value="${value}"`) >=0) {
                            ch.attributes = ' selected=""'+ attrStr;
                        }
                    }
                    break;
                }
                if (Cl === 'textarea'){
                    children.unshift(escape(value));
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
                    attributes += ' checked=""';
                }
                break;
            case 'disabled': 
                if (value) {
                    attributes += ' disabled=""';
                }
                break;
            default:
                attributes += ' ' + attr + '="' + escape(value.toString()) + '"';
                break;
        }
    }
    if (attributes === '') {
        return new EmptyTag(Cl, children);
    }
    return new Tag(Cl, attributes, children);
};
    

    
module.exports.createElement = createElement;
module.exports.Component = Component;
module.exports.PureComponent = Component;
module.exports.React = class React {};
