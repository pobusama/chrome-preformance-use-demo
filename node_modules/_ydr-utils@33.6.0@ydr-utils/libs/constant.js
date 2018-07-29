/**
 * 定义常量
 * @author ydr.me
 * @create 2015-09-26 16:32
 */


'use strict';

var typies = require('./typeis.js');
var dato = require('./dato.js');

module.exports = function (parent, key, val) {
    if (arguments.length === 2) {
        key = arguments[0];
        val = arguments[1];
        parent = Object.create(null);
    }

    if (typies.object(val)) {
        dato.each(val, function (_key, _val) {
            module.exports(val, _key, _val);
        });
    }

    Object.defineProperty(parent, key, {
        // 是否可被修改、不能被删除
        configurable: false,
        // 是否可被数值运算符修改
        writable: false,
        // 是否可被枚举
        enumerable: true,
        // 值
        value: val
    });

    return parent;
};

