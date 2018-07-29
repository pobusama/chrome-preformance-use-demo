/**
 * npm 相关
 * @author ydr.me
 * @create 2015-10-29 17:44
 */


'use strict';

var request = require('./request.js');
var string = require('./string.js');

var MODULE_LATEST_URL = 'http://registry.npmjs.com/${moduleName}/latest';


/**
 * 获取模块的最新版本
 * @param moduleName {String} 模块名称
 * @param callback {Function} 回调
 */
exports.getLatestVersion = function (moduleName, callback) {
    var url = string.assign(MODULE_LATEST_URL, {
        moduleName: moduleName
    });

    request.get({
        url: url,
        timeout: -1
    }, function (err, body) {
        if (err) {
            return callback(err);
        }

        var ret = {};

        try {
            ret = JSON.parse(body);
        } catch (ex) {
            err = new Error('parse response body error');
        }

        if (err) {
            return callback(err);
        }

        if (ret.error) {
            err = new Error(ret.reason);
        }

        if (err) {
            return callback(err);
        }

        callback(null, ret.version, ret);
    });
};




