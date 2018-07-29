/**
 * 定义错误
 * @author ydr.me
 * @create 2015-05-09 15:03
 * @update 2015年10月12日22:22:54
 */


'use strict';


var httpStatus = require('./http-status.js');
var allocation = require('./allocation.js');
var dato = require('./dato.js');
var typeis = require('./typeis.js');

var errorId = 0;
var configs = {
    //1001: {
    //    status: 500,
    //    type: 'mongond error',
    //    message: 'invalid mongodb id'
    //}
};


/**
 * 定义错误
 * @param errorCode {Number|String|Object} 错误序号
 * @param [errorMeta] {Object} 错误属性
 */
exports.config = function (errorCode, errorMeta) {
    var args = allocation.args(arguments);
    var errorMap = {};

    if (args.length === 2) {
        if (typeis.string(args[1])) {
            errorMeta = {
                message: args[1]
            };
        }

        errorMap[args[0]] = errorMeta;
    } else {
        errorMap = args[0];
    }

    dato.each(errorMap, function (code, meta) {
        meta.message = meta.message || httpStatus.get(meta.status || 500);
    });
    dato.extend(configs, errorMap);

    return exports;
};


/**
 * 自定义错误
 * @param code {Number|Object} 错误号
 * @param [code.code] {Number} 错误号
 * @returns {Error}
 */
exports.create = function (code) {
    if (typeis(code) === 'object') {
        code = code.code;
    }

    var meta = configs[code];

    if (!meta) {
        throw 'can not found `' + code + '` error meta';
    }

    var err = new Error(meta.message);

    try {
        Error.captureStackTrace(err, exports.create);
    } catch (err) {
        // ignore
    }

    dato.extend(err, meta);
    err.time = new Date();
    err.id = errorId++;

    return err;
};
