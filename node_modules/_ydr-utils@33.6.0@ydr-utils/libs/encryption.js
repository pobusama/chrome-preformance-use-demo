/**
 * 加密
 * @author ydr.me
 * @create 2014-11-17 11:18
 */

'use strict';

var path = require('path');
var fs = require('fs');
var crypto = require('crypto');
var random = require('./random.js');
var typeis = require('./typeis.js');


/**
 * 字符串的 MD5 计算
 * @param data {*} 待计算的数据
 * @returns {string}
 *
 * @example
 * crypto.md5('123');
 * // => "202cb962ac59075b964b07152d234b70"
 */
exports.md5 = function (data) {
    if (typeis.undefined(data) || typeis.null(data)) {
        data = '';
    } else if (typeis.boolean(data) || typeis.number(data)) {
        data = String(data);
    }

    try {
        return crypto.createHash('md5').update(data).digest('hex');
    } catch (err) {
        return '';
    }
};


/**
 * 字符串 sha1 加密
 * @param data {*} 实体
 * @param [secret] {*} 密钥，可选
 * @returns {*}
 */
exports.sha1 = function (data, secret) {
    if (arguments.length === 2) {
        try {
            return crypto.createHmac('sha1', String(secret)).update(String(data)).digest('hex');
        } catch (err) {
            return '';
        }
    } else {
        try {
            return crypto.createHash('sha1').update(String(data)).digest('hex');
        } catch (err) {
            return err.message;
        }
    }
};


/**
 * 文件内容的 etag 计算
 * @param file {String} 文件绝对路径
 * @param [callback] {Function} 读取文件流进行MD5计算
 * @returns {string}
 */
exports.etag = function (file, callback) {
    var md5;
    var stream;
    var data;

    if (typeis(callback) === 'function') {
        md5 = crypto.createHash('md5');
        stream = fs.ReadStream(file);
        stream.on('data', function (d) {
            md5.update(d);
        });
        stream.on('end', function () {
            var d = md5.digest('hex');

            callback(null, d);
        });
        stream.on('error', callback);
    } else {
        try {
            data = fs.readFileSync(file);
        } catch (err) {
            data = '';
        }

        return exports.md5(data);
    }
};


/**
 * 文件最后修改时间的 md5 计算
 * @param file {String} 文件绝对路径
 * @returns {string} md5 值
 */
exports.lastModified = function (file) {
    var stats;
    var ret;

    try {
        stats = fs.statSync(file);
    } catch (err) {
        stats = null;
    }

    ret = stats ? String(new Date(stats.mtime).getTime()) : '0';

    return exports.md5(ret);
};


/**
 * 编码
 * @param data {String} 原始数据
 * @param secret {String} 密钥
 * @returns {String}
 */
exports.encode = function (data, secret) {
    var cipher = crypto.createCipher('aes192', String(secret));

    try {
        return cipher.update(String(data), 'utf8', 'hex') + cipher.final('hex');
    } catch (err) {
        return '';
    }
};


/**
 * 解码
 * @param data {String} 编码后的数据
 * @param secret {String} 密钥
 * @returns {String}
 */
exports.decode = function (data, secret) {
    var decipher = crypto.createDecipher('aes192', String(secret));

    try {
        return decipher.update(String(data), 'hex', 'utf8') + decipher.final('utf8');
    } catch (err) {
        return '';
    }
};


/**
 * 密码签名与验证
 * @param originalPassword {String} 原始密码
 * @param [signPassword] {String} 签名后的密码： 8（密钥） + 32（密匙） = 40位
 * @return {String|Boolean}
 */
exports.password = function (originalPassword, signPassword) {
    var key = '';
    var cnt = '';
    var entryption = function (key, cnt) {
        // 轮次 sha1
        key = exports.sha1(key, cnt);
        cnt = exports.sha1(cnt, key);
        // md5 加密
        return exports.md5(key + cnt);
    };

    // 密码验证
    if (arguments.length === 2) {
        key = signPassword.slice(0, 8);
        cnt = signPassword.slice(8);

        return entryption(key, originalPassword) === cnt;
    }
    // 密码签名
    else {
        key = random.string(8, '~@#$%^&*()_+{}[]=-<>?/,.|:;');

        return key + entryption(key, originalPassword);
    }
};


///////////////////////////////////////////////////////////////////////////
//var str = '123';
//console.log(exports.md5(str));

//var file = path.join(__dirname, '../index.js');
//var d = exports.etag(file);
//console.log(d);
//
//exports.etag(file, function (err, md5) {
//    console.log(err);
//    console.log(md5);
//});

//var a = '123';
//var k = '456';
//var e = exports.encode(a, k);
//console.log(e);
//var d = exports.decode(e, k);
//console.log(d);
//console.log(exports.sha1(a));
//console.log(exports.sha1(a, k));
//var p1 = '123';
//var cp1 = exports.password(p1);
//var cp2 = exports.password(p1);
//console.log('原始密码：', p1);
//console.log('密码签名1：', cp1);
//console.log('密码签名2：', cp2);
//console.log(cp);
//console.log(p2);

//console.log('系统纳秒1：', random.guid());
//console.log('系统纳秒2：', random.guid());
