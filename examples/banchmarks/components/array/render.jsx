'use strict';

import React, {Component} from 'react';


class BB extends Component {
    render(){
        return  <h1 width='20px'>11</h1>;
    }
} 
const html="<a href='aaa'>aa</a>"
const Statistics  = ({count = 100}) => <div a="2">
    <input value={null}/>
    <input value={undefined}/>
    <input value={1}/>
    <input type='checkbox' checked />
    <input type='checkbox' checked={true} />
    <input value={1} disabled/>
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
    <span className="3"> {"3"}    {"3"} </span>
    <span className="3"> {3}    {true} </span>
    <span className="3"> {3}    {true}  {2} </span>
    <span className="3"> {3}    {true}  {false}   {2}  </span>
    <span dangerouslySetInnerHTML= {{__html: html}} />
    <textarea value= {html} />
    <textarea defaultValue= {html} />
    
</div>
module.exports = init => <Statistics count={init.count}/>;
