'use strict';

import React, {Component} from 'react';


const Table  = () => <table>
  <thead>
    <tr>
      <th rowSpan="2" htmlFor='aa'>Name</th>
      <th rowspan="2">ID</th>
      <th colspan="2">Membership Dates</th>
      <th rowspan="2">Balance</th>
    </tr>
    <tr>
      <th>Joined</th>
      <th>Canceled</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="rowgroup">Margaret Nguyen</th>
      <td>427311</td>
      <td><time datetime="2010-06-03">June 3, 2010</time></td>
      <td>n/a</td>
      <td>0.00</td>
    </tr>
    <tr>
      <th scope="rowgroup">Edvard Galinski</th>
      <td>533175</td>
      <td><time datetime="2011-01013">January 13, 2011</time></td>
      <td><time datetime="2017-04008">April 8, 2017</time></td>
      <td>37.00</td>
    </tr>
    <tr>
      <th scope="rowgroup">Hoshi Nakamura</th>
      <td>601942</td>
      <td><time datetime="2012-07-23">July 23, 2012</time></td>
      <td>n/a</td>
      <td>15.00</td>
    </tr>
  </tbody>
</table>

module.exports = init => <Table/>;
