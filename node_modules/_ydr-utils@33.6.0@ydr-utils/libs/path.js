/**
 * path
 * @author ydr.me
 * @create 2015-09-01 19:36
 */


'use strict';

var path = require('path');
var glob = require('glob');

var dato = require('./dato.js');
var typeis = require('./typeis.js');
var allocation = require('./allocation.js');

//path.__defineGetter__      path.__defineSetter__      path.__lookupGetter__      path.__lookupSetter__      path.__proto__             path.constructor
//path.hasOwnProperty        path.isPrototypeOf         path.propertyIsEnumerable  path.toLocaleString        path.toString              path.valueOf
//path._makeLong             path.basename              path.delimiter             path.dirname               path.extname               path.format
//path.isAbsolute            path.join                  path.normalize             path.parse                 path.posix                 path.relative
//path.resolve               path.sep                   path.win32
var extendList = [
    'basename',
    'delimiter',
    'dirname',
    'extname',
    'format',
    'isAbsolute',
    //'join',
    'normalize',
    'parse',
    'posix',
    //'relative',
    'resolve',
    'sep'
];

dato.each(extendList, function (index, pro) {
    /**
     * @name exports
     * @property basename {Function}
     * @property delimiter {Function}
     * @property dirname {Function}
     * @property extname {Function}
     * @property format {Function}
     * @property isAbsolute {Function}
     * @property normalize {Function}
     * @property parse {Function}
     * @property posix {Function}
     * @property sep {Function}
     */
    exports[pro] = path[pro];
});


var REG_PATH = path.sep === '/' ? /\\/g : /\//g;
var REG_WIN_PATH = /\\/g;

/**
 * 转换为系统路径
 * @param p {String} 路径
 * @returns {string}
 */
exports.toSystem = function (p) {
    return String(p).replace(REG_PATH, path.sep);
};


/**
 * 转换为 URI 路径
 * @param p {String} 路径
 * @returns {string}
 */
exports.toURI = function (p) {
    return String(p).replace(REG_WIN_PATH, '/');
};


/**
 * 路径合并
 * @param from {String} 路径
 * @param to {String} 路径
 * @returns {string}
 */
exports.join = function (from, to/*arguments*/) {
    var args = allocation.args(arguments);

    return exports.toURI(path.join.apply(path, args));
};


/**
 * 路径相对
 * @param from {String} 路径
 * @param to {String} 路径
 * @returns {string}
 */
exports.relative = function (from, to/*arguments*/) {
    var args = allocation.args(arguments);

    return exports.toURI(path.relative.apply(path, args));
};


var globDefaults = {
    glob: [],
    srcDirname: __dirname,
    globOptions: {
        dot: false,
        nodir: true
    },
    progress: null
};
/**
 * glob 分析
 * @param globArray {String|Array} 规则字符串或数组
 * @param options {Object} 配置
 * @param options.srcDirname {String} 原始目录
 * @param options.globOptions {Object} glob 配置
 * @param options.progress {Function} 过程回调
 * @returns {Array}
 */
exports.glob = function (globArray, options) {
    var files = [];
    var map = {};

    options = dato.extend(true, {}, globDefaults, options);
    globArray = typeis.array(globArray) ? globArray : [globArray];

    dato.each(globArray, function (indexGlob, p) {
        var p2 = typeis.array(p) ? p : [p];

        dato.each(p2, function (index, p3) {
            var p4 = path.join(options.srcDirname, p3);
            var _files = glob.sync(p4, options.globOptions);
            var _files2 = [];

            dato.each(_files, function (index, file) {
                if (!map[file]) {
                    map[file] = true;
                    _files2.push(file);
                }
            });

            if (typeis.function(options.progress)) {
                dato.each(_files2, function (indexFile, file) {
                    options.progress(indexGlob, indexFile, file);
                });
            }

            files = files.concat(_files2);
        });
    });

    return files;
};

