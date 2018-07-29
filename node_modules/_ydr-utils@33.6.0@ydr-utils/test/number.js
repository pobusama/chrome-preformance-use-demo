/**
 * 文件描述
 * @author ydr.me
 * @create 2015-11-22 16:02
 */


'use strict';

var number = require('../libs/number.js');

var number62 = number.to62(1000000);
var number10 = number.from62(number62);

console.log(number62);
console.log(number10);

