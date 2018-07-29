/**
 * 中间件
 * @author ydr.me
 * @create 2015-10-30 14:57
 */


'use strict';

var klass = require('./class.js');
var typeis = require('./typeis.js');
var dato = require('./dato.js');
var allocation = require('./allocation.js');
var Emitter = require('events');
var howdo = require('howdo');

/*====================================
 var md = new Middleware();

 md.use(fn1);
 md.use(fn2);

 md.exec(args,..., callback);
 ====================================*/

var defaults = {
    // 是否为异步模式
    async: true,
    // 上下文
    context: null
};
var Middleware = klass.extends(Emitter).create({
    constructor: function (options) {
        this._options = dato.extend({}, defaults, options);
        this._options.context = this._options.context || this;
        this._middlewareStack = [];
    },

    /**
     * 注入中间件
     * @param callback {function} 回调
     */
    use: function (callback) {
        if (typeis.function(callback)) {
            this._middlewareStack.push(callback);
        }
    },

    /**
     * 绑定中间件上下文
     * @param context
     */
    bindContext: function (context) {
        this._options.context = context;
    },

    /**
     * 执行中间件
     * @returns {*}
     */
    exec: function (/*arguments*/) {
        if (this._options.async) {
            return this._execAsync.apply(this, arguments);
        } else {
            return this._execSync(arguments[0]);
        }
    },

    /**
     * 异步执行中间件
     * @example
     * md.exec(a, b, fn);
     * // 其中 a、b 为参数
     * // fn 为回调
     */
    _execAsync: function (/*arguments*/) {
        var the = this;
        var args = allocation.args(arguments);
        var callback = args.pop();

        howdo.each(the._middlewareStack, function (index, middleware, next) {
            if (index) {
                args.shift();
            }

            args.push(function () {
                args.pop();
                args.unshift(null);
                next.apply(global, args);
            });

            try {
                middleware.apply(the._options.context, args);
            } catch (err) {
                the.emit('error', err);
            }
        }).follow(function (err) {
            var args = allocation.args(arguments);

            args.shift();
            callback.apply(the._options.context, args);
        });

        return the;
    },

    /**
     * 同步执行中间件
     * @param arg
     * @returns {*}
     * @private
     */
    _execSync: function (arg) {
        var the = this;

        dato.each(the._middlewareStack, function (index, middleware) {
            try {
                arg = middleware.call(the._options.context, arg);
            } catch (err) {
                err.middlewareName = middleware.middlewareName || middleware.name;
                the.emit('error', err);
            }
        });

        return arg;
    }
});

Middleware.defaults = defaults;
module.exports = Middleware;
