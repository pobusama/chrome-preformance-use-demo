/**
 * favicon 的解析与下载
 * @author ydr.me
 * @create 2015-04-20 23:03:36
 */

'use strict';

var urlHelper = require('url');
var howdo = require('howdo');
var path = require('path');
var fse = require('fs-extra');

var request = require('./request.js');
var dato = require('./dato.js');
var number = require('./number.js');
var klass = require('./class.js');
var typeis = require('./typeis.js');
var Emitter = require('./emitter.js');

var REG_LINK = /<link[^<>]*?>/ig;
var REG_META = /<meta[^<>]*?>/ig;
var REG_REL_ICON = /\s\bicon\b/i;
var REG_TYPE_ICON = /\s-icon\b/i;
var REG_HTTP = /^(http|ftp)s?:\/\//i;
var REG_HTTP_ROOT = /^(http|ftp)s?:\/\/[^/]+\/$/i;
var REG_URL_SUFFIX = /\/[^/]*$/;
var REG_HOSTNAME = /^((xn--)?[a-z\d-]+\.)+([a-z]{2,}|xn--[a-z\d]+)$/i;
var REG_PATH_ABSOLUTE = /^\//;
var REG_THIS_PROTOCOL = /^\/\//;
var REG_PATH_RELATIVE = /^(\.{1,2})\//;
var REG_PATH_END = /\/[^/]+?\/$/;
var REG_FAVICON_TYPE = /^image\/(vnd.microsoft.icon|x-icon|png|jpg|jpeg|gif)$/i;
var REG_BASE_64 = /^data:image.*?;base64,/i;
var REG_IMAGE_TYPE = /\.(png|jpeg|jpg|gif|ico|bmp)$/i;
var noop = function () {
    //
};
var configs = {
    // favicon 文件后缀
    extname: '.ico',
    // 默认的 favicon ico文件
    defaultFaviconFilePath: '',
    // 默认的 favicon 配置文件
    configsFilePath: '',
    // favicon 文件保存目录
    saveDirection: '',
    // 内容最小长度
    minContentLength: 21,
    // 相等 map
    equalMap: {
        '163.com': /^([^.]+\.)*163\.com$/,
        'google.com': /^([^.]+\.)*google\.com(\.[^.]+)*$/,
        'baidu.com': /^([^.]+\.)*baidu\.com$/,
        'taobao.com': /^([^.]+\.)*taobao\.com$/,
        'alipay.com': /^([^.]+\.)*alipay\.com$/,
        'tmall.com': /^([^.]+\.)*tmall\.com$/
    }
};
var defaultConfigs = {};
var Favicon = klass.extends(Emitter).create({
    constructor: function (url, isUpdate) {
        var the = this;

        try {
            fse.ensureDirSync(configs.saveDirection);
        } catch (err) {
            the.emit('error', err);
        }

        try {
            fse.ensureFileSync(configs.configsFilePath);
        } catch (err) {
            the.emit('error', err);
        }

        url = the._fixURL(url);
        the._oURL = url;
        the.url = url;
        the._hostnameList = [];
        the._isUpdate = Boolean(isUpdate);
        the.faviconURL = null;
        the.faviconFile = null;
    },


    /**
     * 修正 URL
     * @param url
     * @returns {XML|string|void|*}
     * @private
     */
    _fixURL: function (url) {
        url = url.replace(REG_THIS_PROTOCOL, '');

        if (!REG_HTTP.test(url)) {
            url = 'http://' + url;
        }

        return url;
    },


    /**
     * 获取 favicon 的信息
     * @param callback
     * @returns {Favicon}
     */
    get: function (callback) {
        var the = this;

        callback = typeis.function(callback) ? callback : noop;

        the._safeURL();

        if (!the.url) {
            setTimeout(function () {
                the.faviconFile = configs.defaultFaviconFilePath;
                the.emit('error', new Error(the._oURL + ' is error'));
                callback.call(the);
            });
            return the;
        }

        howdo
            .task(the._getFaviconFromDefaults.bind(the))
            .task(the._getFaviconFromLocal.bind(the))
            .task(the._getFaviconFromHomePage.bind(the))
            .task(the._getFaviconFromThisPage.bind(the))
            .task(the._getFaviconFromRootDirection.bind(the))
            .task(the._saveFaviconFromURL.bind(the))
            .task(the._updateCache.bind(the))
            .follow(function () {
                callback.call(the);
            });

        return the;
    },


    /**
     * 安全 URL
     * @private
     */
    _safeURL: function () {
        var the = this;

        the.url = the.url.toLowerCase();

        if (REG_THIS_PROTOCOL.test(the.url)) {
            the.url = 'http:' + the.url;
        }

        the.url = (REG_HTTP.test(the.url) ? '' : 'http://') + the.url;

        if (the.url.length < 256 && typeis.url(this.url)) {
            the._url = urlHelper.parse(the.url);

            if (!REG_HOSTNAME.test(the._url.hostname)) {
                the.url = null;
            }

            dato.each(configs.equalMap, function (equalHostname, regexp) {
                if (regexp.test(the._url.hostname)) {
                    the.url = the._url.protocol + '//' + equalHostname;
                    the._url = urlHelper.parse(the.url);
                    return false;
                }
            });

            the._hostnameList.push(the._url.hostname);
        } else {
            the.url = null;
        }
    },


    /**
     * 从默认配置中读取 favicon
     * @param next
     * @private
     */
    _getFaviconFromDefaults: function (next) {
        var the = this;

        if (the._isUpdate) {
            delete(defaultConfigs[the._url.hostname]);
            Favicon.updateDefaultConfigs();
            return next();
        }

        if (defaultConfigs[the._url.hostname]) {
            the.faviconFile = configs.defaultFaviconFilePath;
            return next();
        }

        next();
    },


    /**
     * 从本地读取 favicon
     * @param next
     * @private
     */
    _getFaviconFromLocal: function (next) {
        var the = this;
        var filePath = path.join(configs.saveDirection, the._url.hostname + configs.extname);

        if (typeis.file(filePath)) {
            if (the._isUpdate) {
                try {
                    fse.unlink(filePath);
                } catch (err) {
                    // ignore
                }
            } else {
                the.faviconFile = filePath;
            }

            return next();
        }

        next();
    },


    /**
     * 从首页面中获取 favicon
     * @param next
     * @private
     */
    _getFaviconFromHomePage: function (next) {
        var the = this;

        if (the.faviconFile || the.faviconURL) {
            return next();
        }

        the._homeURL = the._url.protocol + '//' + the._url.host;
        return the._getFaviconFromPage(the._homeURL, function (url) {
            the.faviconURL = url;
            next();
        });
    },

    /**
     * 从当前页面中获取 favicon
     * @param next
     * @private
     */
    _getFaviconFromThisPage: function (next) {
        var the = this;

        if (the.faviconFile || the.faviconURL || the._homeURL === the._oURL) {
            return next();
        }

        return the._getFaviconFromPage(the._oURL, function (url) {
            the.faviconURL = url;
            next();
        });
    },


    /**
     * 从页面上读取 favicon
     * @param url
     * @param callback
     * @returns {*}
     * @private
     */
    _getFaviconFromPage: function (url, callback) {
        var the = this;

        request.get(url, function (err, body) {
            if (err) {
                return callback();
            }

            var attrRet = the._parseFaviconURLFromBody(body);

            if (attrRet.refresh) {
                the.url = attrRet.refresh;
                the._safeURL();
                return the._getFaviconFromPage(attrRet.refresh, callback);
            }

            if (!attrRet.favicon) {
                return callback();
            }

            var url = Favicon.joinURL(this.options.url, attrRet.favicon);

            the._parseFaviconURLByHead(url, callback);
        });
    },


    /**
     * 从根目录获取 favicon
     * @param next
     * @private
     */
    _getFaviconFromRootDirection: function (next) {
        var the = this;

        if (the.faviconFile || the.faviconURL) {
            return next();
        }

        var rootDirection = the._url.protocol + '//' + the._url.host;
        var url = rootDirection + '/favicon.ico';

        the._parseFaviconURLByHead(url, function (url) {
            the.faviconURL = url;
            next();
        });
    },


    /**
     * 保存 url
     * @param next
     * @returns {*}
     * @private
     */
    _saveFaviconFromURL: function (next) {
        var the = this;

        if (the.faviconFile || !the.faviconURL) {
            return next();
        }

        // data:image/vnd.microsoft.icon;base64,....
        if (REG_BASE_64.test(the.faviconURL)) {
            var file = path.join(configs.saveDirection, the._url.hostname + configs.extname);

            try {
                fse.outputFileSync(file, the.faviconURL.replace(REG_BASE_64, ''), 'base64');
                the.faviconFile = file;
                the.faviconURL = '';
            } catch (err) {
                // ignore
                the.emit('erorr', err);
            }

            return next();
        }

        if (!REG_HTTP.test(the.faviconURL)) {
            the.faviconURL = '';
            return next();
        }

        request.down(the.faviconURL, function (err, stream, res) {
            if (err || res.statusCode !== 200) {
                the.emit('eror', new Error('download error: ' + this.options.href));
                return next();
            }


            var filePath = path.join(configs.saveDirection, the._url.hostname + configs.extname);
            var onend = function () {
                the.faviconFile = filePath;
                // 推出最后一个
                the._hostnameList.pop();
                dato.each(the._hostnameList, function (index, hostname) {
                    var copyFilePath = path.join(configs.saveDirection, hostname + configs.extname);
                    try {
                        fse.copySync(filePath, copyFilePath);
                    } catch (err) {
                        // ignore
                    }
                });
                next();
            };

            stream
                .pipe(fse.createWriteStream(filePath))
                .on('error', function () {
                    the.emit('erorr', err);
                    next();
                })
                .on('close', onend)
                .on('end', onend);
        });
    },


    /**
     * 更新缓存
     * @param next
     * @private
     */
    _updateCache: function (next) {
        var the = this;


        if (the.faviconFile) {
            return next();
        }

        defaultConfigs[the._url.hostname] = 1;
        the.faviconFile = configs.defaultFaviconFilePath;
        Favicon.updateDefaultConfigs();
        next();
    },


    /**
     * 通过 head 请求判断资源
     * @param url
     * @param callback
     * @private
     */
    _parseFaviconURLByHead: function (url, callback) {
        var the = this;

        request.head(url, function (err, headers, res) {
            var href = this.options.url;

            if (err) {
                the.emit('error', err);
                return callback(null);
            }

            var contentLength = number.parseInt(headers['content-length'], 0);
            var contentType = headers['content-type'];

            if (REG_FAVICON_TYPE.test(contentType) && res.statusCode === 200 && contentLength > configs.minContentLength) {
                return callback(href);
            }

            if (res.statusCode !== 200) {
                the.emit('error', new Error(href + ' status code is ' + res.statusCode));
            }

            if (contentLength <= configs.minContentLength) {
                the.emit('error', new Error(href + ' content-length is ' + contentLength));
            }

            return callback(null);
        });
    },


    /**
     * 获取资源里的 link 标签
     * @param body
     * @returns {Object}
     * @private
     */
    _parseFaviconURLFromBody: function (body) {
        var the = this;
        var metas = body.match(REG_META);
        var findRefreshURL = null;

        dato.each(metas, function (index, meta) {
            var httpEquiv = the._getAttr(meta, 'http-equiv');
            var content = the._getAttr(meta, 'content');
            var contentURL = (content.match(/url=(.*)/) || ['', ''])[1];

            if (httpEquiv === 'refresh' && contentURL) {
                findRefreshURL = contentURL;
                return false;
            }
        });

        if (findRefreshURL) {
            return {refresh: findRefreshURL};
        }

        var links = body.match(REG_LINK);

        if (!links) {
            return {};
        }

        var find = null;

        // 顺序查找
        dato.each(links, function (index, link) {
            var rel = the._getAttr(link, 'rel');
            var type = the._getAttr(link, 'type');
            var href = the._getAttr(link, 'href');
            //var size = the._getAttr(link, 'size');
            //var sizes = the._getAttr(link, 'sizes');

            // <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico">
            var cond1 = REG_REL_ICON.test(rel) || rel === 'icon' || REG_TYPE_ICON.test(type);
            var cond2 = REG_BASE_64.test(href) || REG_IMAGE_TYPE.test(href);

            if (cond1 && cond2) {
                find = href;
                return false;
            }
        });

        return {favicon: find};
    },


    /**
     * 获取 attr 属性值
     * @param html
     * @param attrName
     * @returns {*|string}
     * @private
     */
    _getAttr: function (html, attrName) {
        var reg = Favicon.REG_MAP[attrName] || new RegExp('\\b' + attrName + '\\s*?=\\s*?(["\'])([\\s\\S]*?)\\1', 'i');

        Favicon.REG_MAP[attrName] = reg;

        return (html.match(reg) || ['', '', ''])[2];
    }
});


Favicon.REG_MAP = {};

Favicon.config = function (options) {
    dato.extend(configs, options);
};


/**
 * 构造配置
 */
Favicon.buildDefaultConfigs = function () {
    try {
        defaultConfigs = fse.readJSONSync(configs.configsFilePath, 'utf8') || {};
    } catch (err) {
        // ignore
    }
};


/**
 * 更新配置
 */
Favicon.updateDefaultConfigs = function () {
    try {
        fse.writeJSONSync(configs.configsFilePath, defaultConfigs, {
            encoding: 'utf8'
        });
    } catch (err) {
        // ignore
    }
};


/**
 * url 合并
 * @param from
 * @param to
 * @returns {*}
 * @private
 */
Favicon.joinURL = function (from, to) {
    if (from === to) {
        to = './';
    }

    var retTo = urlHelper.parse(to);

    if (retTo.protocol && retTo.hostname) {
        return to;
    }

    var retFrom = urlHelper.parse(from);
    var domain = (retFrom.protocol || 'http:') + '//' + (retFrom.hostname || '');

    if (REG_THIS_PROTOCOL.test(to)) {
        return retFrom.protocol + to;
    }

    from = domain + (retFrom.pathname || '/').replace(REG_URL_SUFFIX, '/');

    if (!to || REG_PATH_ABSOLUTE.test(to)) {
        return domain + to;
    }

    var mathes;

    to = './' + to;

    while ((mathes = to.match(REG_PATH_RELATIVE))) {
        to = to.replace(REG_PATH_RELATIVE, '');

        if (mathes[1].length === 2) {
            from = REG_HTTP_ROOT.test(from) ? from : from.replace(REG_PATH_END, '/');
        }
    }

    return from + to;
};

module.exports = Favicon;