/**
 * 文件描述
 * @author ydr.me
 * @create 2015-04-20 21:11
 */


'use strict';

var dato = require('./dato.js');
var number = require('./number.js');
var encryption = require('./encryption.js');
var configs = {
    // 加密字符串
    key: '123123',
    // 有效期：1小时
    expires: 3600000
};


/**
 * 配置
 * @param options
 */
exports.config = function (options) {
    dato.extend(configs, options);
};


/**
 * 生成 csrf 令牌
 * @returns {String}
 */
exports.create = function () {
    return encryption.encode(String(Date.now()), configs.key);
};


/**
 * csrf 验证
 * @param entry
 * @returns {boolean}
 */
exports.validate = function (entry) {
    var time = encryption.decode(entry, configs.key);

    time = number.parseInt(time, 0);

    return time + configs.expires >= Date.now();
};