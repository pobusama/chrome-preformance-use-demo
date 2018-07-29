/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-22 14:38
 */


'use strict';

var debug = require('../libs/debug.js');

console.log();
console.log();
console.log();

var options = {
    eventLength: 50
};
debug.error('error', '春风吹北风吹春风吹北风吹春风吹北风吹 hello world!\n' +
    '春风吹北风吹春风吹北风吹春风吹北风吹 hello world!\n' +
    '春风吹北风吹春风吹北风吹春风吹北风吹 hello world!', options);
debug.primary('primaryprimaryprimaryprimary', '春风吹北风吹春风吹北风吹春风吹北风吹 hello world!\n' +
    '春风吹北风吹春风吹北风吹春风吹北风吹 hello world!\n' +
    '春风吹北风吹春风吹北风吹春风吹北风吹 hello world!', options);
debug.warn('warn', '春风吹北风吹春风吹北风吹春风吹北风吹 hello world!', options);
debug.success('success', '春风吹北风吹春风吹北风吹春风吹北风吹 hello world!', options);
debug.normal('normal', '春风吹北风吹春风吹北风吹春风吹北风吹 hello world!', options);
debug.ignore('ignore', '春风吹北风吹春风吹北风吹春风吹北风吹 hello world!', options);

