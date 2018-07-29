/**
 * 命令行执行器
 * @author ydr.me
 * @create 2015-10-29 15:29
 */


'use strict';

var dato = require('./dato.js');
var allocation = require('./allocation.js');
var typeis = require('./typeis.js');
var path = require('./path.js');

var REG_LONG_ARG = /^--/;
var REG_SHORT_ARG = /^-/;
var NODE_EXEC_PATH = process.execPath;
var CWD = process.cwd();

// 别名配置
var aliasConfigs = {};

// 参数类型
var typeConfigs = {};

// 命令函数 map
var commanFunctionMap = {};

// 无法识别的命令回调
var elseFunction = function () {
    // noop
};


/**
 * 设置、获取命令行参数别名
 * @returns {*}
 */
exports.alias = function () {
    return allocation.getset({
        get: function (key) {
            return aliasConfigs[key];
        },
        set: function (key, val) {
            aliasConfigs[key] = val;
        }
    }, arguments);
};


/**
 * 设置、获取参数类型
 * @returns {*}
 */
exports.type = function () {
    return allocation.getset({
        get: function (key) {
            return typeConfigs[key];
        },
        set: function (key, val) {
            typeConfigs[key] = val;
        }
    }, arguments);
};


/**
 * 解析命令行参数
 * @param argv
 * @returns {{node: String, cwd: String, input: string, command: String, args: {}}}
 */
exports.parse = function (argv) {
    var result = {
        node: argv.shift(),
        cwd: argv.shift(),
        input: argv.join(' '),
        command: null,
        args: {},
        names: []
    };
    var lastArg = null;
    var nameMap = {};

    dato.each(argv, function (index, arg) {
        arg = arg.trim();

        if (!arg) {
            return;
        }

        var relArg = null;

        // --
        if (REG_LONG_ARG.test(arg)) {
            relArg = arg.slice(2);

            if (typeConfigs[relArg] !== Boolean) {
                lastArg = relArg;
            }

            relArg = aliasConfigs[relArg] || relArg;
            result.args[relArg] = true;
        }
        // -
        else if (REG_SHORT_ARG.test(arg)) {
            relArg = arg.slice(1);

            dato.repeat(relArg.length, function (index) {
                var shortArg = relArg[index];
                var longArg = aliasConfigs[shortArg] || shortArg;

                if (typeConfigs[longArg] !== Boolean) {
                    lastArg = longArg;
                }

                result.args[longArg] = true;
            });
        }
        // arg
        else if (lastArg) {
            relArg = aliasConfigs[lastArg] || lastArg;
            result.args[relArg] = arg;
            lastArg = null;
        }
        // command
        else if (!result.command) {
            result.command = arg;
        }
        // name
        else if (!nameMap[arg]) {
            nameMap[arg] = true;
            result.names.push(arg);
        }
    });

    if (!exports.exec(result.command, result.args, result.names, result)) {
        elseFunction.call(result, result.command, result.args, result.names);
    }

    return result;
};


/**
 * 匹配命令
 * @param command {String} 命令
 * @param callback {Function} 回调
 * @returns {Object}
 */
exports.if = function (command, callback) {
    if (typeis.function(callback)) {
        commanFunctionMap[command] = callback;
    }

    return exports;
};


/**
 * 未匹配的命令
 * @param callback {Function} 回调
 * @returns {Object}
 */
exports.else = function (callback) {
    if (typeis.function(callback)) {
        elseFunction = callback;
    }

    return exports;
};


/**
 * 手动执行某条命令
 * @param command {String} 命令名称
 * @param [args] {Object} 参数
 * @param [names] {Object} 参数
 * @param [context] {Object} 上下文
 * @return {Object}
 */
exports.exec = function (command, args, names, context) {
    if (command && commanFunctionMap[command]) {
        args = args || {};
        context = context || {
                node: NODE_EXEC_PATH,
                cwd: CWD,
                command: command,
                args: args,
                names: names
            };
        commanFunctionMap[command].call(context, args, names);
        return true;
    }

    return false;
};


/**
 * 解析 原始目录
 * @param args {Object} 参数
 * @param [dirnameKey] {String} 目录键名
 * @returns {string}
 */
exports.dirname = function (args, dirnameKey) {
    dirnameKey = dirnameKey || 'dirname';

    var CWD = process.cwd();
    var srcDirname = '';

    if (args.dirname) {
        if (path.isAbsolute(args[dirnameKey])) {
            srcDirname = args[dirnameKey];
        } else {
            srcDirname = path.join(CWD, args[dirnameKey]);
        }
    } else {
        srcDirname = CWD;
    }

    return srcDirname;
};
