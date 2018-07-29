'use strict';

var csrf = require('../libs/csrf.js');


var token1 = csrf.create();
var token2 = csrf.create();

console.log(token1);
console.log(token2);

var b1 = csrf.validate(token1);
var b2 = csrf.validate(token2);
var b3 = csrf.validate('a9fb8e03e0338d6741d4b80c00fddffb');

console.log(b1);
console.log(b2);
console.log(b3);