/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-09-01 19:38
 */


'use strict';

var path = require('../libs/path.js');

describe('libs/path', function () {
    console.log(path.join('\\a\\b', '../d/f'));
    console.log(path.relative('\\a\\b', '../d/f'));
    console.log(path.sep);

    it('glob', function () {
        var files = path.glob([
            '*.js',
            '*.js'
        ], {
            srcDirname: __dirname
        });

        console.log(files);
    });
});


