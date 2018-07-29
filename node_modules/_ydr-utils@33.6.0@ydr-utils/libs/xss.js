/**
 * xss 安全【非常重要】
 * @author ydr.me
 * @create 2014-11-22 23:11
 */

'use strict';

var marked = require('marked');
var random = require('./random.js');
var typeis = require('./typeis.js');
var dato = require('./dato.js');
var string = require('./string.js');
var encryption = require('./encryption.js');
var url = require('url');
var REG_DOUBLE = /^\/\//;
var REG_POINT = /\./g;
var REG_LT = /</g;
var REG_GT = />/g;
var REG_SHAP = /^#/;
//var REG_NOT_WORD = /[^\w]/g;
//var RGE_FIRST = /^-/;
var REG_TOC = /^#heading(-\d-\d+-.*)$/;
// 空白
//var REG_SPACE = /[\x00-\x20\x7F-\xA0\u1680\u180E\u2000-\u200B\u2028\u2029\u202F\u205F\u3000\uFEFF\t\v]{1,}/g;
var REG_BREAK_LINE = /\r/g;
var REG_BREAK_LINE_SAFE = /\n+/g;
var REG_LONG_BREAK_LINE = /\n{3,}/g;
// 自动关闭标签是安全的，如 br、hr、img 等
//var REG_CLOSE_TAGNAME = /(?!```)<([a-z\d]+)\b[\s\S]*?>([\s\S]*?)<\/\1>(?!```)/ig;
// @link marked
var REG_PRE1 = /^`{3,}.*$\n((^.*$\n)*?)^`{3,}.*$/mg;
var REG_PRE2 = /(^ {4}.*$)+\n/mg;
var REG_PRE_TAG = /<pre\b[^>]*?>[\s\S]*?<\/pre>/ig;
var REG_CODE_TAG = /<code\b[^>]*?>[\s\S]*?<\/code>/ig;
var REG_CODE = /(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/g;
var REG_HEADING = /^(#{1,6})(.*)$/mg;
var REG_STRONG = /\b__([\s\S]+?)__(?!_)|\*\*([\s\S]+?)\*\*(?!\*)/mg;
var REG_EM = /^\b_((?:__|[\s\S])+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/mg;
var REG_BLOCKQUOTE = /^( *>[^\n]*)+/mg;
var REG_LINK1 = /<(http|ftp).*?>/ig;
// ![]()
var REG_IMAGE = /!\[.*?][\[\(].*[\]\)]/g;
// [][] []()
var REG_LINK2 = /\[(.*?)][\[\(].*?[\]\)]/g;
var REG_TAG = /<(\/?[a-z][a-z\d]*[\s\S]*?)>/gi;
//var REG_BLOKQUOTE = /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/g;
var REG_PATH = /^((http|ftp)s?:|\/|\.{1,2})/i;
var REG_SIZE = /(?:\s+?=\s*?(\d+)(?:[x*×](\d+))?)?$/i;
var ENCODE_LIST = [{
    f: />/g,
    t: '&gt;'
}, {
    f: /</g,
    t: 'lgt;'
}];
// 影响页面的危险标签
//var dangerTagNameList = 'script iframe frameset body head html link base style'.split(' ');
var tableClassName = 'table table-radius table-bordered table-hover';

// 信任的安全域名，其他域名都加上 nofollow
var SAFE_HOSTS = [
    '*.FrontEndDev.org',
    'FrontEndDev.org',
    '*.ydr.me',
    'ydr.me',
    '*.qianduanblog.com',
    'qianduanblog.com',
    '*.front-end.io',
    'front-end.io'
];
var REG_URL_SUFFIX = /[?#].*$/;
var REG_URL_PROTOCOL = /^https?:/i;
var REG_JSBIN = /^http:\/\/jsbin\.com\/[^/]+/i;
var REG_JSFIDDLE = /^https?:\/\/jsfiddle\.net\/[^/]+/i;
var REG_JSDM = /^http:\/\/jsdm\.com\/[^/]+\/[^/]+\/[^/]+/i;
var REG_CODEPEN = /^https?:\/\/codepen\.io\/([^/]+)\/[^/]+\/([^/]+)/i;
var REG_AT_TEXT = /(.?)@([a-z\d_.-]+)\b/ig;
var REG_AT_LINK = /\[@[^]]+]\([^)]+\)/;
var REG_AT_LINK_TEXT = /^@[a-z\d_.-]+$/i;

//var filterDefaults = {
//    /**
//     * link 配置
//     * 1、无域地址都在当前窗口打开
//     * 2、符合 hosts 内的域名都在当前窗口打开
//     * 3、其他都在新窗口打开
//     * 4、不合法的URL直接返回空
//     */
//    link: {
//        /**
//         * 不需要新窗口打开的域名
//         * @type Array
//         */
//        hosts: ['*.FrontEndDev.org', '*.ydr.me', '*.qianduanblog.com'],
//        filter: function (href, title, text) {
//            return _buildLink(href, title, text, true, false);
//        }
//    }
//};
//var sanitizeHtml = require('sanitize-html');
//var sanitizeOptions = {
//    allowedTags: [
//        // inline
//        'b', 'i', 'em', 'strong', 'a', 'img', 'code', 'del',
//        // block
//        'p', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'hr',
//        // list
//        'ol', 'ul', 'li',
//        // table
//        'table', 'thead', 'tbody', 'tr', 'th', 'td', 'caption',
//        // iframe
//        'iframe'
//    ],
//    allowedAttributes: {
//        a: ['href', 'target', 'class', 'id'],
//        img: ['src', 'title', 'alt', 'class'],
//        h1: ['id', 'class'],
//        h2: ['id', 'class'],
//        h3: ['id', 'class'],
//        h4: ['id', 'class'],
//        h5: ['id', 'class'],
//        h6: ['id', 'class'],
//        table: ['class']
//    }
//};


var configs = {
    atLink: '/developer/${at}/',
    atClass: 'at'
};

/**
 * 配置
 * @param config
 */
exports.config = function (config) {
    dato.extend(configs, config);
};


/**
 * markdown 语法安全过滤，虽然 markdown 支持兼容 HTML 标签，但为了安全考虑，
 * 这里必须去掉相当一部分的标签
 * @param source {String} 原始内容
 * @returns {String} 过滤后的内容
 */
exports.mdSafe = function (source) {
    var preMap = {};
    var minHeadering = 0;

    // ```
    source = source.replace(REG_PRE1, function ($0) {
        var key = _generatorKey();

        preMap[key] = $0;

        return key;
    });

    // \s\s\s\s
    source = source.replace(REG_PRE2, function ($0) {
        var key = _generatorKey();

        preMap[key] = $0;

        return key;
    });

    // ``
    source = source.replace(REG_CODE, function ($0) {
        var key = _generatorKey();

        preMap[key] = $0;

        return key;
    });

    // <http...>
    source = source.replace(REG_LINK1, function ($0) {
        var key = _generatorKey();

        preMap[key] = $0;

        return key;
    });

    // ![..](http://...)
    source = source.replace(REG_IMAGE, function ($0) {
        var key = _generatorKey();

        preMap[key] = $0;

        return key;
    });


    // <>
    source = source.replace(REG_TAG, function ($0, $1) {
        return '&lt;' + $1 + '&gt;';
    });


    // fix heading
    source = source.replace(REG_HEADING, function ($0, $1, $2) {
        minHeadering = !minHeadering || minHeadering > $1.length ? $1.length : minHeadering;

        return $0;
    });


    if (minHeadering && minHeadering > 1) {
        var detaHeading = minHeadering - 1;

        source = source.replace(REG_HEADING, function ($0, $1, $2) {
            return $1.slice(detaHeading) + $2;
        });
    }


    // back
    dato.each(preMap, function (key, val) {
        source = source.replace(key, val);
    });

    source = source
        .replace(REG_BREAK_LINE, '\n')
        .replace(REG_LONG_BREAK_LINE, '\n\n\n');

    return source;
};


/**
 * table of content
 * @param source {String} 原始内容
 * @returns {string}
 */
exports.mdTOC = function (source) {
    var tokens = marked.lexer(source);
    var toc = '\n\n';
    var index = 0;

    tokens.forEach(function (token) {
        if (token.type !== 'heading') {
            return;
        }

        var text = token.text;

        // remove image
        text = text.replace(REG_IMAGE, '')
            // clean link
            .replace(REG_LINK2, '$1');

        var depth = new Array((token.depth - 1) * 4 + 1).join(' ');
        //var id = encryption.md5(exports.mdRender(text).replace(REG_TAG_P, '').trim());

        toc += depth + '- [' + text + '](#heading-' + token.depth + '-' + (index++) + ')\n';
    });

    return toc + '\n\n';
};


/**
 * 生成
 * @param source
 * @param [maxLength=140]
 * @returns {string}
 */
exports.mdIntroduction = function (source, maxLength) {
    maxLength = maxLength || 140;

    var lines = source
        .replace(REG_PRE1, '')
        .replace(REG_PRE2, '')
        .replace(REG_IMAGE, '')
        .replace(REG_LINK1, '')
        .replace(REG_LINK2, '$1')
        .replace(REG_BLOCKQUOTE, ' ')
        .split(/\n{2,}/g);

    var length = 0;
    var ret = '';

    dato.each(lines, function (index, line) {
        var chunk = line.replace(REG_BREAK_LINE_SAFE, ' ');

        ret += chunk;
        length += chunk.length;

        if (length >= maxLength) {
            return false;
        }
    });

    return ret;
};


/**
 * markdown 内容渲染成 HTML 内容
 * @param source {String} 原始 markdown 内容
 * @param [options] {Object} 配置
 * @returns {{html: String, atList: Array}}
 */
exports.mdRender = function (source, options) {
    var markedRender = new marked.Renderer();
    var defaults = {
        // 是否提取链接的 favicon
        favicon: true,
        // 是否解析 at
        at: true,
        // 是否 heading 加上链接
        headingLink: false,
        headingClass: 'heading'
    };

    options = dato.extend(defaults, options);

    var preMap = {};
    var atList = [];

    if (options.at) {
        // ```
        source = source.replace(REG_PRE1, function ($0) {
            var key = _generatorKey();

            preMap[key] = $0;

            return key;
        });

        // \s\s\s\s
        source = source.replace(REG_PRE2, function ($0) {
            var key = _generatorKey();

            preMap[key] = $0;

            return key;
        });

        // ``
        source = source.replace(REG_CODE, function ($0) {
            var key = _generatorKey();

            preMap[key] = $0;

            return key;
        });

        // <http>
        source = source.replace(REG_LINK1, function ($0) {
            var key = _generatorKey();

            preMap[key] = $0;

            return key;
        });

        // [...](http://...)
        source = source.replace(REG_LINK2, function ($0) {
            var key = _generatorKey();

            preMap[key] = $0;

            return key;
        });

        // @someone
        source = source.replace(REG_AT_TEXT, function ($0, $1, $2) {
            if ($1 === '\\') {
                return '@' + $2;
            }

            var name = $2;
            var link = string.assign(configs.atLink, {
                at: name
            });

            atList.push(name);

            return $1 + '[@' + name + '](' + link + ')';
        });

        // back
        dato.each(preMap, function (key, val) {
            source = source.replace(key, val);
        });
    }

    // 定义 A 链接的 target
    markedRender.link = function (href, title, text) {
        if (REG_SHAP.test(href)) {
            return _buildLink(href, title, text, false, !options.favicon);
        }

        var fixHref = REG_DOUBLE.test(href) ? 'http:' + href : href;
        var parse = url.parse(fixHref);
        var host = parse.host;
        var inHost = false;

        // 非 PATH
        if (!REG_PATH.test(href)) {
            return '';
        }

        if (!host) {
            return _buildLink(href, title, text, false, !options.favicon);
        }

        dato.each(SAFE_HOSTS, function (index, item) {
            if (string.glob(host, item, true)) {
                inHost = true;
                return false;
            }
        });

        // 指定域内的 NO _blank
        if (inHost) {
            return _buildLink(href, title, text, false, !options.favicon);
        }

        if (REG_JSBIN.test(href)) {
            return _buildJSBin(href);
        }

        if (REG_JSFIDDLE.test(href)) {
            return _buildJsfiddle(href);
        }

        if (REG_JSDM.test(href)) {
            return _buildJSDM(href);
        }

        if (REG_CODEPEN.test(href)) {
            return _buildCodePen(href);
        }

        // 其他的使用传入对象处理
        return _buildLink(href, title, text, true, !options.favicon);
    };


    var index = 0;


    // heading
    markedRender.heading = function (text, level) {
        //var href = encryption.md5(text.trim());

        var id = 'heading-' + level + '-' + index;
        var html = '<h' + level + ' id="' + id + '" class="' + options.headingClass + '">';

        html += options.headingLink ? '<a href="#' + id + '">' : '';
        html += text;
        html += options.headingLink ? '</a>' : '';
        html += '</h' + level + '>';

        index++;

        return html;
    };


    // ![](1.png =200x100)
    markedRender.image = function (src, title, text) {
        src = src || '';

        var matches = src.match(REG_SIZE);
        var width = null;
        var height = null;

        if (matches) {
            width = matches[1];
            height = matches[2];
            src = src.replace(REG_SIZE, '');
        }

        return '<img' +
            (typeis.null(title) || typeis.undefined(title) ? '' : ' title="' + title + '"') +
            (typeis.null(text) || typeis.undefined(text) ? '' : ' alt="' + text + '"') +
            (typeis.null(src) || typeis.undefined(src) ? '' : ' src="' + src + '"' ) +
            (typeis.null(width) || typeis.undefined(width) ? '' : ' width="' + width + '"') +
            (typeis.null(height) || typeis.undefined(height) ? '' : ' height="' + height + '"' ) +
            '>';
    };


    // 表格
    //markedRender.table = function (thead, tbody) {
    //    return '<table class="' + tableClassName + '"><thead>' + thead + '</thead><tbody>' + tbody + '</tbody></table>';
    //};


    marked.setOptions({renderer: markedRender});
    source = marked(source);
    //source = sanitizeHtml(source, sanitizeOptions);

    return {
        html: source,
        atList: atList
    };
};


/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////


/**
 * 生成链接
 * @param href
 * @param title
 * @param text
 * @param isBlank
 * @param isNoFavicon
 * @returns {string}
 * @private
 */
function _buildLink(href, title, text, isBlank, isNoFavicon) {
    text = text.trim();

    var isAt = false;

    if (REG_AT_LINK_TEXT.test(text)) {
        isNoFavicon = isAt = true;
    }

    return '<a href="' + href + '"' +
        (isAt ? ' class="' + configs.atClass + '"' : '') +
            //(REG_TOC.test(href) ? ' id="toc' + href.replace(REG_TOC, '$1') + '"' : '') +
        (isBlank ? ' target="_blank" rel="nofollow"' : '') +
        (title ? ' ' + title : '') +
        '>' +
        (isNoFavicon ? '' : '<img src="http://f.ydr.me/' + href + '" class="favicon" width="16" height="16" alt="f">') +
        (text || href) + '</a>';
}


/**
 * jsbin 在线代码演示平台
 * @param href
 * @private
 */
var REG_JSBIN_EDIT = /\/edit\/?$/i;
var REG_JSBIN_EMBED = /\/embed\/?$/i;
function _buildJSBin(href) {
    // href: http://jsbin.com/pufoxinejo/1/
    // <iframe src="http://jsbin.com/pufoxinejo/1/embed?html,css,js,output"
    // style="border: 1px solid rgb(170, 170, 170); width: 100%; min-height: 300px; height: 38px;"></iframe>

    // http://jsbin.com/pufoxinejo/1/edit

    href = href
        .replace(REG_URL_SUFFIX, '')
        .replace(REG_JSBIN_EDIT, '/')
        .replace(REG_JSBIN_EMBED, '/');

    if (href.slice(-1) !== '/') {
        href += '/';
    }

    return '<iframe src="' + href + 'embed?output" class="codedemo-jsbin"></iframe>';
}


/**
 * jsfiddle 在线代码演示平台
 * @param href
 * @private
 */
var REG_JSFIDDLE_EMBED = /\/embedded\/?$/i;
var REG_JSFIDDLE_RESULT = /\/result$\/?$/i;
function _buildJsfiddle(href) {
    // https://jsfiddle.net/rwtud3nw/
    // <iframe width="100%" height="300" src="//jsfiddle.net/rwtud3nw/embedded/"
    // allowfullscreen="allowfullscreen" frameborder="0"></iframe>

    href = href
        .replace(REG_URL_SUFFIX, '')
        .replace(REG_JSFIDDLE_RESULT, '/')
        .replace(REG_JSFIDDLE_EMBED, '/');

    if (href.slice(-1) !== '/') {
        href += '/';
    }

    var hrefClean = href.replace(REG_URL_PROTOCOL, '');

    return '<iframe src="' + hrefClean + 'embedded/result,js,html,css/" allowfullscreen="allowfullscreen" class="codedemo-jsfiddle"></iframe>';
}


/**
 * jsdm 在线代码演示平台
 * @param href
 * @private
 */
var REG_JSDM_ID = /\/([^/]+)\/paint\/([^/]+)/i;
function _buildJSDM(href) {
    // http://jsdm.com/jsw/paint/9WfZX
    // http://jsdm.com/anon/embed/0bM5i?height=500&theme-id=0&slug-hash=0bM5i&default-tab=result
    var matches = (href.match(REG_JSDM_ID) || ['', '', '']);
    var user = matches[1];
    var id = matches[2];

    if (!user || !id) {
        return '';
    }

    return '<iframe src="http://jsdm.com/' + user + '/embed/' + id + '' +
        '?height=350&theme-id=0&default-tab=result&slug-hash=' + id + '" ' +
        'class="codedemo-jsdm"></iframe>';
}


/**
 * code pen 在线代码演示平台
 * @param href
 * @returns {string}
 * @private
 */
function _buildCodePen(href) {
    var matches = href.match(REG_CODEPEN) || ['', '', ''];
    var user = matches[1];
    var id = matches[2];

    if (!user || !id) {
        return '';
    }

    // http://codepen.io/ClearDesign/pen/oXeBOp
    // http://codepen.io/ClearDesign/full/oXeBOp
    // //codepen.io/ClearDesign/embed/oXeBOp?
    // height=350&theme-id=15483&slug-hash=oXeBOp
    // &default-tab=result&user=ClearDesign

    return '<iframe src="//codepen.io/' + user + '/embed/' + id +
        '?height=350&theme-id=0&slug-hash=' + id + '&default-tab=result&user=' + user + '" class="codedemo-codepen"></iframe>';
}


/**
 * 生成唯一随机字符串
 * @returns {string}
 * @private
 */
function _generatorKey() {
    return 'œ' + random.string(10, 'aA0') + random.guid() + Date.now() + 'œ';
}
