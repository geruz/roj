'use strict';

import React, {Component} from 'react';


class BB extends Component {
    render(){
        return  <h1 width='20px'>11</h1>;
    }
} 
const Statistics  = ({count = 100}) => <div a="2">
    <input value={null}/>
    <input value={undefined}/>
    <input value={1}/>
    <BB />
    <BB />
    <BB />
    <BB />
    <span>2</span>
    <span className="3">{"3"}</span>
    <span>2</span>
    <span className="3"> {"3"}</span>
    <span>2</span>
    <span className="3"> {"3"} </span>
    <span>2</span>
    <span className="3"> {"3"} 	 {"3"}</span>
    <span>2</span>
    <span className="3"> {"3"}    {"3"} </span>
    <select value="1">
        <option value="1" />
        <option value="2" />
        <option value="3" />
        <option value="4" />
    </select>
    <span s={2} />
    <texarea width={200} />
    <texarea width={200}> aa</texarea>
    <img src='google.com' />
</div>
module.exports = init => <Statistics count={init.count}/>;
