/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-09-27 15:32
 */


'use strict';

var constant = require('../libs/constant.js');

var o = constant('a', {
    b: 1
});

console.log(o.a.b);
//o.a.b= 2;
//console.log(o.a.b);
