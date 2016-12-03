'use strict';

const React = require('react');
const Component = React.Component;

module.exports.Provider = class Provider extends Component {
    constructor (props, context) {
        super(props, context);
        this.store = props.store;
    }
    render () {
        return this.props.children;
    }
};

module.exports.connect = (state, dispatch) => c =>
    class Dev extends c {
        constructor (props) {
            Object.assign(props, state(props.store.getState()), dispatch(props.store));
            /* eslint-disable no-param-reassign */
            delete props.store;
            super(props);
        }
    };
