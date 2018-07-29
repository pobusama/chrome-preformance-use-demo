/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-20 21:25
 */


'use strict';

var qiniu = require('../libs/qiniu.js');


qiniu.config({
    access_key: '-',
    secret_key: '-',
    bucket: 'fed-community',
    host: 'https://dn-fed.qbox.me/@/'
});

var kat = qiniu.generateKeyAndToken({
    dirname: '/res/'
});
console.log(kat);
