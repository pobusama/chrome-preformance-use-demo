/**
 * ali oss
 * @author ydr.me
 * @create 2014-11-27 21:47
 */

'use strict';
//
//var path = require('path');
//var klass = require('./class.js');
//var dato = require('./dato.js');
//var typeis = require('./typeis.js');
//var request = require('./request.js');
//var mime = require('./mime.js');
//var Busboy = require('busboy');
//var crypto = require('crypto');
//var xmlParse = require('xml2js').parseString;
//var howdo = require('howdo');
//var imagesize = require('imagesize');
//var REG_META = /^x-oss-meta-/i;
//var REG_TITLE = /<title>([\s\S]*?)<\/title>/;
//var constructorDefaults = {
//    accessKeyId: '',
//    accessKeySecret: '',
//    bucket: '',
//    host: 'oss-cn-hangzhou.aliyuncs.com',
//    domain: '',
//    onbeforeput: function (streamOptions, next) {
//        next();
//    }
//};
//var putDefaults = {
//    // 缓存期限 1年
//    cacheControl: 'max-age=315360000',
//    // 不需要写 x-oss-meta- 前缀
//    meta: null
//};
//
///**
// * 实例化一个 ali oss 上传服务
// * @param options
// * @param options.accessKeyId {String}
// * @param options.accessKeySecret {String}
// * @param options.bucket {String}
// * @param [options.host] {String}
// */
//module.exports = klass.create({
//    constructor: function (options) {
//        this._options = dato.extend(true, {}, constructorDefaults, options);
//    },
//
//    /**
//     * 重新设置配置
//     * @param options
//     */
//    setOptions: function (options) {
//        var the = this;
//
//        dato.extend(the._options, options);
//
//        return the;
//    },
//
//
//    /**
//     * 中间件传输
//     * @param req
//     * @param callback
//     * @private
//     */
//    _pipe: function (req, callback) {
//        var busboy = new Busboy({
//            headers: req.headers
//        });
//        var the = this;
//
//        // handle files
//        busboy.on('file', function (fieldName, fileStream, fileName, encoding, contentType) {
//            if (!fileName) {
//                return fileStream.resume();
//            }
//
//            var extname = path.extname(fileName);
//
//            if (extname) {
//                contentType = mime.get(extname);
//            }
//
//            var options = {
//                fieldName: fieldName,
//                body: fileStream,
//                fileName: fileName,
//                encoding: encoding,
//                contentType: contentType
//            };
//
//            var next = function (err) {
//                callback(err, options, fileStream);
//            };
//
//            the._options.onbeforeput(options, next);
//        });
//
//        busboy.on('error', callback);
//
//        req.pipe(busboy);
//    },
//
//
//    /**
//     * 上传文件
//     * @param req {Object} 请求对象
//     * @param options {Object} 配置
//     * @param [options.expires=31536000000] 1年 365*24*60*60*1000，单位ms
//     * @param [options.cacheControl='public'] 缓存策略
//     * @param [options.meta=null] meta
//     * @param [options.object=null] 文件名称
//     * @param callback
//     */
//    put: function (req, options, callback) {
//        var date = new Date();
//        var the = this;
//
//        the._pipe(req, function (err, streamOptions, fileStream) {
//            if (err) {
//                return callback(err);
//            }
//
//            options = dato.extend(false, {}, putDefaults, streamOptions, options);
//            options.encoding = 'utf8';
//
//            var headers = {
//                date: date.toUTCString(),
//                'content-type': options.contentType,
//                'content-md5': '',
//                'cache-control': options.cacheControl
//            };
//
//            the._cleanMeta(options);
//            dato.each(options.meta, function (key, val) {
//                headers['x-oss-meta-' + key] = val;
//            });
//
//            options.url = the._createURL(options.object);
//            the._sign('put', options.object, headers);
//            options.headers = headers;
//
//            howdo
//                .task(function (done) {
//                    imagesize(options.body, function (err, ret) {
//                        if (err) {
//                            return done(null, {
//                                image: false
//                            });
//                        }
//
//                        done(null, {
//                            image: {
//                                type: ret.format,
//                                width: ret.width,
//                                height: ret.height
//                            }
//                        });
//                    });
//                })
//                .task(function (done) {
//                    request.put(options, function (err, body, res) {
//                        fileStream.resume();
//                        if (err) {
//                            return done(err);
//                        }
//
//                        if (res.statusCode === 200) {
//                            return done(null, {
//                                contentType: options.contentType,
//                                encoding: options.encoding,
//                                cacheControl: options.cacheControl,
//                                ourl: options.url,
//                                surl: the._options.domain ? 'http://' + the._options.domain + options.object : options.url
//                            });
//                        }
//
//                        xmlParse(body, function (err, ret) {
//                            var msg = '';
//
//                            if (err) {
//                                msg = (body.match(REG_TITLE) || ['', ''])[1];
//
//                                return done(new Error(msg || 'parse upload result error'));
//                            }
//
//                            msg = ret && ret.Error && ret.Error.Message;
//                            msg = typeis(msg) === 'array' ? msg[0] : msg;
//                            done(new Error(msg));
//                        });
//                    });
//                })
//                .together(function (err, retSize, retReq) {
//                    if (err) {
//                        return callback(err);
//                    }
//
//                    callback(err, dato.extend(retSize, retReq));
//                });
//        });
//    },
//
//
//    /**
//     * 头信息签名
//     * @param method
//     * @param object
//     * @param headers
//     * @param headers['conten-type']
//     * @param headers['conten-length']
//     * @param headers['date']
//     * @private
//     */
//    _sign: function (method, object, headers) {
//        var options = dato.extend(true, {}, this._options, {
//            method: method,
//            object: object
//        });
//        var auth = 'OSS ' + options.accessKeyId + ':';
//        var date = options.date || new Date().toUTCString();
//        var params = [
//            options.method.toUpperCase(),
//            headers['content-md5'],
//            headers['content-type'],
//            date
//        ];
//        var resource = '/' + options.bucket + options.object;
//        var ossHeaders = {};
//        var signature;
//
//        dato.each(headers, function (key, val) {
//            var lkey = key.toLowerCase().trim();
//
//            if (lkey.indexOf('x-oss-') === 0) {
//                ossHeaders[lkey] = ossHeaders[lkey] || [];
//                ossHeaders[lkey].push(val.trim());
//            }
//        });
//
//        Object.keys(ossHeaders).sort().forEach(function (key) {
//            params.push(key + ':' + ossHeaders[key].join(','));
//        });
//
//        params.push(resource);
//        signature = crypto.createHmac('sha1', options.accessKeySecret);
//        signature = signature.update(params.join('\n')).digest('base64');
//
//        return dato.extend(true, headers, {
//            Authorization: auth + signature,
//            Date: date
//        });
//    },
//
//
//    /**
//     * 清理 meta
//     * @private
//     */
//    _cleanMeta: function (options) {
//        var meta = {
//            user: 'ydr.me'
//        };
//
//        dato.each(options.meta, function (key, val) {
//            meta[key.replace(REG_META, '')] = val;
//        });
//
//        options.meta = meta;
//    },
//
//
//    /**
//     * 生成访问URL
//     * @param [object]
//     * @returns {string}
//     * @private
//     */
//    _createURL: function (object) {
//        return 'http://' + this._options.bucket + '.' + this._options.host +
//            (object ? object : '');
//    }
//});
