/**
 * 响应类型
 * @author ydr.me
 * @create 2014-11-21 09:41
 */

'use strict';

var mimeMap = require('./../data/mime.json');

/**
 * 获取 MIME 的相应类型
 * @param extname {String} 文件扩展名，包括点
 * @param [defaultContentType] 默认响应类型
 * @returns {string} 响应类型
 *
 * @example
 * mime.get('.jpg');
 * // => "image/jpeg"
 *
 * mime.get('.what', 'what/what');
 * // => "what/what"
 */
exports.get = function (extname, defaultContentType) {
    extname = String(extname).toLowerCase();
    defaultContentType = defaultContentType || 'application/octect-stream';

    return mimeMap[extname] || defaultContentType;
};


/**
 * 设置、添加 MIME
 * @param extname {String} 文件扩展名，包括点
 * @param contentType 响应类型
 * @returns {Object} 响应类型 MAP
 */
exports.set = function (extname, contentType) {
    extname = String(extname).toLowerCase();
    contentType = String(contentType).toLowerCase();
    mimeMap[extname] = contentType;

    return mimeMap;
};



///////////////////////////////////////////////////////////////////
//console.log(exports.get('.jpg'));
//console.log(exports.set('.jpg', 'hehe/jpg'));
//console.log(exports.get('.jpg'));
