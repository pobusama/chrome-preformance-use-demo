/**
 * translate
 * @author ydr.me
 * @create 2014-12-16 21:46
 * @modify 2015年04月09日20:30:21
 */

'use strict';

// http://fanyi.youdao.com/openapi?path=data-mode
// 有道翻译API申请成功
// API key：537362269
// keyfrom：FrontEndDev
// 创建时间：2015-04-09
// 网站名称：FrontEndDev
// 网站地址：http://FrontEndDev.org

var qs = require('querystring');
var dato = require('./dato.js');
var typeis = require('./typeis.js');
var request = require('./request.js');
// 只允许：英文、数字、下划线、短横线
var REG_RP = /[^\w-]/g;
var REG_LP = /-+/g;
var REG_LR = /^-+|-+$/g;
var url = 'http://fanyi.youdao.com/openapi.do?';
var query = {
    keyfrom: 'FrontEndDev',
    key: '537362269',
    type: 'data',
    doctype: 'json',
    version: '1.1',
    q: ''
};
var errMap = {
    '-1': '无翻译结果',
    20: '要翻译的文本过长',
    30: '无法进行有效的翻译',
    40: '不支持的语言类型',
    50: '无效的key',
    60: '无词典结果，仅在获取词典结果生效'
};


/**
 * 翻译
 * @param word {String} 翻译词
 * @param callback {Function} 翻译回调
 */
module.exports = function (word, callback) {
    query.q = String(word);
    request.get({
        url: url + qs.stringify(query)
    }, function (err, body) {
        if (err) {
            return callback(err);
        }

        var json = null;

        try {
            json = JSON.parse(body);
        } catch (err) {
            json = {errorCode: -1};
        }

        if (json.errorCode === undefined) {
            json.errorCode = -1;
        }

        if (!json.translation || !json.translation.length) {
            json.errorCode = -1;
        }

        if (errMap[json.errorCode]) {
            err = new Error(errMap[json.errorCode]);
            return callback(err);
        }

        json.translation = typeis(json.translation) === 'array' ? json.translation : [json.translation];
        json.translation = json.translation[0];

        var word2 = String(json.translation);

        word2 = module.exports.setFilter(word2);
        callback(err, word2);
    });

};


/**
 * 设置参数
 * @param options
 */
module.exports.setOptions = function (options) {
    dato.extend(query, options);
};


/**
 * 翻译后的结果过滤
 * @param word
 * @returns {string}
 */
module.exports.setFilter = function (word) {
    return word
        .toLowerCase()
        .trim()
        .replace(REG_RP, '-')
        .replace(REG_LP, '-')
        .replace(REG_LR, '');
};

