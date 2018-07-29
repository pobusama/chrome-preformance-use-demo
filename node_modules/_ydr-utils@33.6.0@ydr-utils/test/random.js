/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-21 21:17
 */


'use strict';

var random = require('../libs/random.js');
//var map = {};

//for (var i = 1; i < 100000; i++) {
//    var r = random.string(6, 'a0A');
//
//    if (map[r]) {
//        console.log('has repeat', r, i);
//        process.exit();
//    }
//
//    map[r] = 1;
//}
//
//
//console.log('no repeat');

var i = 300;
while (i--){
    console.log(random.guid());
}


