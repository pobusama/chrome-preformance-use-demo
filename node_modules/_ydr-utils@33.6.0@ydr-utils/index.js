/*!
 * util for ydr.me
 * @author ydr.me
 * @create 2014-11-16 16:10
 */

'use strict';

module.exports = {
    //// 阿里云 OSS 上传
    //AliOSS: require('./libs/ali-oss.js'),
    // 调用
    allocation: require('./libs/allocation.js'),
    // 调用
    cache: require('./libs/cache.js'),
    // 类
    class: require('./libs/class.js'),
    // 命令行
    command: require('./libs/command.js'),
    // 定义常量
    constant: require('./libs/constant.js'),
    // csrf
    csrf: require('./libs/csrf.js'),
    // 日期
    date: require('./libs/date.js'),
    // 数据出口
    dato: require('./libs/dato.js'),
    // 命令行日志
    debug: require('./libs/debug.js'),
    // 命令行日志
    Emitter: require('./libs/emitter.js'),
    // 加密
    encryption: require('./libs/encryption.js'),
    // 自定义错误
    error: require('./libs/error.js'),
    // favicon
    favicon: require('./libs/favicon.js'),
    // HTTP status
    httpStatus: require('./libs/http-status.js'),
    // 应用日志
    log: require('./libs/log.js'),
    // 中间件
    Middleware: require('./libs/middleware.js'),
    // MIME
    mime: require('./libs/mime.js'),
    // npm
    npm: require('./libs/npm.js'),
    // MIME
    number: require('./libs/number.js'),
    // path
    path: require('./libs/path.js'),
    // qiniu
    qiniu: require('./libs/qiniu.js'),
    // 随机数
    random: require('./libs/random.js'),
    // 请求
    request: require('./libs/request.js'),
    // 字符串
    string: require('./libs/string.js'),
    // 系统
    system: require('./libs/system.js'),
    // 模板引擎
    Template: require('./libs/template.js'),
    // 翻译
    translate: require('./libs/translate.js'),
    // 数据类型
    typeis: require('./libs/typeis.js'),
    // ua解析
    ua: require('./libs/ua.js'),
    // 数据验证
    Validation: require('./libs/validation.js'),
    // 数据类型
    xss: require('./libs/xss.js')
};

