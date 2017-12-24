'use strict';

import React, {Component} from 'react';


class Prop extends Component {
    constructor (props) {
        super(props);
        this.number = 1;
    }
    print = ()=> {
        return this.number
    }
    render(){
        const {index} = this.props;
        const print = this.print;
        return  <h1 width='20px'>{print()} {index}</h1>;
    }
} 
module.exports = () => {
    const obj = {index: 12};
    return <Prop {...obj}/>;
}
