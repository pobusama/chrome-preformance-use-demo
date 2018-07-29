/**
 * 应用日志
 * @author ydr.me
 * @create 2014-12-16 20:42:11
 */

'use strict';

var dato = require('./dato.js');
var date = require('./date.js');
var typeis = require('./typeis.js');
var fs = require('fs-extra');
var path = require('path');
var util = require('util');
var logDefaults = {
    // 运行环境，默认为开发
    env: 'pro',
    // 存放路径
    path: null,
    // YYYY年MM月DD日 HH:mm:ss.SSS 星期e a
    name: './YYYY/MM/YYYY-MM-DD',
};
// 邮件配置
var emailDefaults = {
    from: '服务器错误',
    to: '',
    subject: '服务器错误'
};
var log = function (options) {
    dato.extend(logDefaults, options);
    process.on('uncaughtException', _log);

    var fn1 = function (req, res, next) {
        _log(null, req, res, next);
    };
    var fn2 = function (err, req, res, next) {
        _log(err, req, res, next);
    };

    return [fn1, fn2];
};
var smtp;


/**
 * 接收错误
 * @param err {Object} 错误对象
 */
log.holdError = function (err) {
    if (err && err instanceof  Error && err.message) {
        _log(err);
    }
};


/**
 * 初始化邮件发送配置
 * @param options
 */
log.initEmail = function (options) {
    dato.extend(emailDefaults, options);
};


/**
 * 初始化邮件服务器配置
 * @param _smtp {Object}
 */
log.initSmtp = function (_smtp) {
    smtp = _smtp;
};


/**
 * 日志记录
 * @type {Function}
 *
 * @example
 * var app = require('express')();
 * app.use('has log middleware');
 * app.use(log);
 * app.use('no log middleware');
 */
module.exports = log;


/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////


/**
 * 日志记录
 * @param err
 * @param req
 * @param res
 * @param next
 * @private
 */
function _log(err, req, res, next) {
    var time = date.format('YYYY年MM月DD日 HH:mm:ss.SSS 星期e a');
    var request = req ? req.method + ' ' + (err ? '500' : '404') + ' ' + req.url : '';
    var ip = req ? req.headers['x-real-ip'] || req.ip : '0.0.0.0';
    var query = req ? JSON.stringify(req.query || {}, null, 4) : '';
    var body = req ? JSON.stringify(req.body || {}, null, 4) : '';
    var name = date.format(logDefaults.name);
    var suffix = err ? '-500.log' : '-404.log';
    var file = name + suffix;
    var txt =
        '##################################################################\n' +
        'time: ' + time + '\n' +
        (request ? 'request: ' + request + '\n' : '') +
        (req ? 'ua: ' + req.headers['user-agent'] + '\n' : '') +
        (req ? 'headers: ' + util.inspect(req.headers) + '\n' : '') +
        (req ? 'ip: ' + ip + '\n' : '') +
        (req ? 'query: \n' + query + '\n' : '') +
        (req ? 'body: \n' + body + '\n' : '');

    if (err) {
        txt +=
            'error: ' + err.message + '\n' +
            'stack: \n' + (err.stack || 'no stack') + '\n';
    }

    txt += '##################################################################\n';

    // 生产环境
    if (logDefaults.env.indexOf('pro') > -1) {
        if (logDefaults.path) {
            file = path.join(logDefaults.path, file);
            fs.createFile(file, function (e) {
                if (!e) {
                    fs.appendFile(file, txt + '\n', function () {
                        // ignore
                    });
                }
            });
        }
    }
    // 开发环境
    else {
        console.log(txt);
    }

    //if (smtp && smtp.sendMail) {
    //    var data = {
    //        from: emailDefaults.from,
    //        to: emailDefaults.to,
    //        subject: emailDefaults.subject + ' ' + time,
    //        html: '<pre>' + txt + '</pre>'
    //    };
    //    smtp.sendMail(data, function (err) {
    //        if (err) {
    //            console.log('邮件发送失败：');
    //            console.error(data);
    //            console.error(err.stack);
    //        }
    //    });
    //}

    if (typeis(next) === 'function') {
        next(err);
    }
}