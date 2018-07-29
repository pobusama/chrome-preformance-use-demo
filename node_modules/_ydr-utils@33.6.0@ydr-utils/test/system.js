/**
 * 文件描述
 * @author ydr.me
 * @create 2015-11-28 11:09
 */


'use strict';

var system = require('../libs/system.js');

system.remoteIP(function (err, ip) {
    console.log(ip);
});

var info = system.info();

console.log(info);
