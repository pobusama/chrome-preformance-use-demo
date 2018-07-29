/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-09 15:11
 */


'use strict';

var error = require('../libs/error.js');

var err = error.create(401);

console.log(err.status);
console.log(err.type);
console.log(err.message);
console.log(err.stack);

