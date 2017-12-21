'use strict';

import React, {Component} from 'react';


const BB = ({count}) => <h1 width='20px'>
    {count}
    <span>2</span>
    <span className="3">3</span>
</h1>
const  Statistics  = ({count = 100}) => <div>
    <BB count={2}/>
</div>
module.exports = init => <Statistics count={init.count}/>;
