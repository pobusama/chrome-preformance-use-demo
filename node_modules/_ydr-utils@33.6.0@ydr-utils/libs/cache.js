/**
 * cache
 * @author ydr.me
 * @create 2015-05-01 20:42
 */


'use strict';

var dato = require('./dato.js');
var number = require('./number.js');
var typeis = require('./typeis.js');
var cache = Object.create(null);
var cacheLength = 0;
var configs = {
    debug: true
};
var noop = function () {
    //
};


/**
 * 配置
 * @param options
 */
exports.config = function (options) {
    dato.extend(configs, options);
};


/**
 * 设置缓存
 * @param key {String} 缓存键
 * @param val {*} 缓存值
 * @param [expires=0] {Number} 有效期，单位毫秒，默认永久有效
 * @param [isOverride=true] 是否重写，默认是
 * @param [callback=null] 过期回调
 */
exports.set = function (key, val, expires, isOverride, callback) {
    var args = [].slice.call(arguments, 2);
    var _expires = 0;
    var _isOverride = true;
    var _callback = noop;

    dato.each(args, function (index, arg) {
        switch (typeis(arg)) {
            case 'number':
                _expires = arg;
                break;

            case 'boolean':
                _isOverride = arg;
                break;

            case 'function':
                _callback = arg;
                break;
        }
    });


    var cached = cache[key];

    if (cached) {
        if (_isOverride) {
            cached.val = val;
            cached.ot++;

            if (configs.debug) {
                console.warn('[cache] ', 'override', 'set', key, 'as', val, 'in', cached.ot, 'times');
            }
        } else {
            return exports;
        }
    } else {
        cached = cache[key] = {
            // 值
            val: val,
            // 过期回调
            cbs: [],
            // override times
            ot: 0
        };

        if (configs.debug) {
            console.log('[cache] ', 'first', 'set', key, 'as', val);
        }

        cacheLength++;
    }

    if (_callback !== noop) {
        cached.cbs.push(_callback);
    }

    if (_expires) {
        clearTimeout(cache[key].timeid);
        cache[key].timeid = setTimeout(function () {
            cache[key].cbs.forEach(function (fn) {
                fn(cache[key].val);
            });
            cache[key] = null;
        }, _expires);
    }

    return cached;
};


/**
 * 读取缓存
 * @param key {String} 缓存键
 * @param [dftVal] {*} 默认值
 * @returns {*|undefined} 返回值
 */
exports.get = function (key, dftVal) {
    return cache[key] ? cache[key].val : dftVal;
};


/**
 * 删除缓存
 * @param key
 */
exports.remove = function (key) {
    var cached = cache[key];

    if (cached) {
        cacheLength--;
    }

    clearTimeout(cached.timeid);
    delete(cache[key]);
};


/**
 * 清空缓存
 */
exports.clear = function () {
    dato.each(cache, function (key) {
        exports.remove(key);
    });
};


/**
 * 缓存缓存键
 * @returns {Array}
 */
exports.keys = function () {
    return Object.keys(cache);
};


/**
 * 缓存缓存键
 * @returns {Number}
 */
exports.length = cacheLength;


/**
 * 递增值
 * @param key {String} 缓存键
 * @param num {Number} 数值
 */
exports.increase = function (key, num) {
    var cached = exports.get(key);

    num = number.parseInt(num, 1);

    if (typeis.undefined(cached)) {
        cached = num;
    } else {
        cached = number.parseInt(cached, 0) + num;
    }

    exports.set(key, cached);

    return cached;
};


