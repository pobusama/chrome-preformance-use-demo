/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-03 00:14
 */


'use strict';

var fs = require('fs');
var path = require('path');
var template = fs.readFileSync(path.join(__dirname, './template.md'), 'utf8');
var Template = require('../libs/template.js');
var tpl = new Template(template);
var html = tpl.render({
    user: '丑陋大葱么'
});

console.log(html);
