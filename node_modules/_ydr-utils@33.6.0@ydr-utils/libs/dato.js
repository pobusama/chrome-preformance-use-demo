/**
 * 数据遍历
 * @author ydr.me
 * 2014-09-14 17:26
 */


'use strict';

var typeis = require('./typeis.js');
var udf;
var canListTypeArr = 'array object nodelist htmlcollection arguments namednodemap'.split(' ');
var REG_BEGIN_0 = /^0+/;


/**
 * 遍历元素
 * @param {Array/Object} list  数组、可枚举对象
 * @param {Function} callback  回调，返回false时停止遍历
 * @param {*} [context] 上下文
 *
 * @example
 * // 与 jQuery.each 一样
 * // 返回 false 时将退出当前遍历
 * data.each(list, function(key, val){});
 */
exports.each = function (list, callback, context) {
    var i;
    var j;

    // 数组 或 类似数组
    if (list && typeis.number(list.length)) {
        for (i = 0, j = list.length; i < j; i++) {
            context = context || global;
            if (callback.call(context, i, list[i]) === false) {
                break;
            }
        }
    }
    // 纯对象
    else if (list !== null && list !== udf) {
        for (i in list) {
            if (list.hasOwnProperty(i)) {
                context = context || global;
                if (callback.call(context, i, list[i]) === false) {
                    break;
                }
            }
        }
    }
};


/**
 * 重复运行
 * @param count {Number} 重复次数
 * @param fn {Function} 重复方法
 */
exports.repeat = function (count, fn) {
    var i = -1;

    while (++i < count) {
        if (fn(i, count) === false) {
            break;
        }
    }
};


/**
 * 扩展静态对象
 * @param {Boolean|Object} [isExtendDeep] 是否深度扩展，可省略，默认false
 * @param {Object}  [source] 源对象
 * @param {...Object}  [target] 目标对象，可以是多个
 * @returns {*}
 *
 * @example
 * // 使用方法与 jQuery.extend 一样
 * var o1 = {a: 1};
 * var o2 = {b: 2};
 * var o3 = data.extend(true, o1, o2);
 * // => {a: 1, b: 2}
 * o1 === o3
 * // => true
 *
 * // 如果不想污染原始对象，可以传递一个空对象作为容器
 * var o1 = {a: 1};
 * var o2 = {b: 2};
 * var o3 = data.extend(true, {}, o1, o2);
 * // => {a: 1, b: 2}
 * o1 === o3
 * // => fale
 */
exports.extend = function (isExtendDeep, source, target) {
    var args = arguments;
    var firstArgIsBoolean = typeof(args[0]) === 'boolean';
    var current = firstArgIsBoolean ? 1 : 0;
    var length = args.length;
    var i;
    var obj;
    var sourceType;
    var objType;

    isExtendDeep = firstArgIsBoolean && args[0] === true;
    source = args[current++];

    for (; current < length; current++) {
        obj = args[current];
        for (i in obj) {
            if (obj.hasOwnProperty(i) && obj[i] !== undefined) {
                sourceType = typeis(source[i]);
                objType = typeis(obj[i]);

                if (objType === 'object' && isExtendDeep) {
                    source[i] = sourceType !== objType ? {} : source[i];
                    exports.extend.call(this, isExtendDeep, source[i], obj[i]);
                } else if (objType === 'array' && isExtendDeep) {
                    source[i] = sourceType !== objType ? [] : source[i];
                    exports.extend.call(this, isExtendDeep, source[i], obj[i]);
                } else {
                    source[i] = obj[i];
                }
            }
        }
    }

    return source;
};


/**
 * 萃取
 * @param data {Object} 传递的数据
 * @param keys {Array} 摘取的键数组
 * @param [filter] {Function} 过滤方法，默认取不为 undefined 键值
 * @returns {Object}
 */
exports.select = function (data, keys, filter) {
    var data2 = {};

    data = data || {};

    filter = filter || function (val) {
            return val !== udf;
        };

    keys.forEach(function (key) {
        if (filter(data[key])) {
            data2[key] = data[key];
        }
    });

    return data2;
};


/**
 * 转换对象为一个纯数组，只要对象有length属性即可
 * @param {Object} [obj] 对象
 * @param {Boolean} [isConvertWhole] 是否转换整个对象为数组中的第0个元素，当该对象无length属性时，默认false
 * @returns {Array}
 *
 * @example
 * var o = {0:"foo", 1:"bar", length: 2}
 * data.toArray(o);
 * // => ["foo", "bar"]
 *
 * var a1 = [1, 2, 3];
 * // 转换后的数组是之前的副本
 * var a2 = data.toArray(a1);
 * // => [1, 2, 3]
 * a2 === a1;
 * // => false
 */
exports.toArray = function (obj, isConvertWhole) {
    var ret = [];
    var i = 0;
    var j;
    var objType = typeis(obj);

    if (canListTypeArr.indexOf(objType) > -1 && typeis(obj.length) === 'number' && obj.length >= 0) {
        for (j = obj.length; i < j; i++) {
            ret.push(obj[i]);
        }
    } else if (obj && isConvertWhole) {
        ret.push(obj);
    }

    return ret;
};


/**
 * 对象1级比较，找出相同和不同的键
 * @param obj1 {Object|Array}
 * @param obj2 {Object|Array}
 * @returns {Object}
 *
 * @example
 * data.compare({a:1,b:2,c:3}, {a:1,d:4});
 * // =>
 * // {
     * //    same: ["a"],
     * //    only: [
     * //       ["b", "c"],
     * //       ["d"]
     * //    ],
     * //    different: ["b", "c", "d"]
     * // }
 */
exports.compare = function (obj1, obj2) {
    var obj1Type = typeis(obj1);
    var obj2Type = typeis(obj2);
    var obj1Only = [];
    var obj2Only = [];
    var same = [];

    // 类型不同
    if (obj1Type !== obj2Type) {
        return null;
    }

    // 对象
    if (obj1Type === 'object' || obj1Type === 'array') {
        exports.each(obj1, function (key, val) {
            if (obj2[key] !== val) {
                obj1Only.push(key);
            } else {
                same.push(key);
            }
        });

        exports.each(obj2, function (key, val) {
            if (obj1[key] !== val) {
                obj2Only.push(key);
            }
        });

        return {
            same: same,
            only: [
                obj1Only,
                obj2Only
            ],
            different: obj1Only.concat(obj2Only)
        };
    } else {
        return null;
    }
};


/**
 * 比较两个长整型数值
 * @param long1 {String} 长整型数值字符串1
 * @param long2 {String} 长整型数值字符串2
 * @param [operator=">"] {String} 比较操作符，默认比较 long1 > long2
 * @returns {*}
 */
exports.than = function (long1, long2, operator) {
    operator = operator || '>';
    long1 = String(long1).replace(REG_BEGIN_0, '');
    long2 = String(long2).replace(REG_BEGIN_0, '');

    // 1. 比较长度
    if (long1.length > long2.length) {
        return operator === '>';
    } else if (long1.length < long2.length) {
        return operator === '<';
    }

    var long1List = exports.humanize(long1, ',', 15).split(',');
    var long2List = exports.humanize(long2, ',', 15).split(',');

    //[
    // '123456',
    // '789012345678901',
    // '234567890123456',
    // '789012345678901',
    // '234567890123457'
    // ]

    // 2. 比较数组长度
    if (long1List.length > long2List.length) {
        return operator === '>';
    } else if (long1List.length < long2List.length) {
        return operator === '<';
    }

    // 3. 遍历比较
    var ret = false;

    exports.each(long1List, function (index, number1) {
        var number2 = long2List[index];

        if (number1 > number2) {
            ret = operator === '>';
            return false;
        } else if (number1 < number2) {
            ret = operator === '<';
            return false;
        }
    });

    return ret;
};


/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
//////////////////////////////[ ONLY NODEJS ]////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

var path = require('path');
var qs = require('querystring');
var encryption = require('./encryption.js');


/**
 * 获取 gravatar
 * @param email {String} 邮箱
 * @param [options] {Object} 配置
 * @param [options.origin="http://gravatar.duoshuo.com/avatar/"] {String} 服务器
 * @param [options.size=100] {Number} 尺寸
 * @param [options.default="retro"] {Number} 默认头像
 * @param [options.forcedefault=false] {*} 是否忽略默认头像
 * @param [options.rating=null] {*} 评级
 * @returns {string}
 */
exports.gravatar = function (email, options) {
    options = options || {};
    email = email.toLowerCase();

    if (!options.origin) {
        options.origin = 'http://cn.gravatar.com/avatar/';
    }

    options.origin += encryption.md5(email) + '?';

    if (!options.size) {
        options.size = 100;
    }

    if (!options.default) {
        //options.default = 'http://s.ydr.me/p/i/avatar.png';
        options.default = 'retro';
    }

    if (options.forcedefault) {
        options.forcedefault = 'y';
    } else {
        options.forcedefault = false;
    }

    var query = {
        s: options.size
    };

    if (options.default) {
        query.d = options.default;
    }

    if (options.forcedefault) {
        query.f = options.forcedefault;
    }

    if (options.rating) {
        query.r = options.rating;
    }

    return options.origin + qs.stringify(query);
};




