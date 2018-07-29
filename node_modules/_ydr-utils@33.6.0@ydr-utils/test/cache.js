/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-01 21:15
 */


'use strict';

var cache = require('../libs/cache.js');
cache.set('a', 1, 1000, function(){
    console.log('timeout');
});

console.log(cache.get('a'));

cache.increase('a', 2);
console.log(cache.get('a'));

cache.remove('a');
console.log(cache.get('a'));

cache.clear('a');
console.log(cache.get('a'));

setTimeout(function () {
    console.log(cache.get('a'));
}, 1000);
