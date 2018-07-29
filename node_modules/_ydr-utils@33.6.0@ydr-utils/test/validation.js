/**
 * 文件描述
 * @author ydr.me
 * @create 2015-11-14 12:00
 */


'use strict';

var assert = require('assert');

var Validation = require('../libs/validation.js');

describe('libs/validation.js', function () {
    var v = new Validation();

    v.setAlias({
        name: '名字',
        age: '年龄',
        url: 'URL 地址',
        email: '邮箱',
        select: '数组'
    });
    v.addRule('name', 'trim', true);
    v.addRule('name', 'required', true);
    v.addRule('name', 'minLength', 4);
    v.addRule('name', 'maxLength', 8);
    v.addRule('age', 'min', 18);
    v.addRule('age', 'max', 30);
    v.addRule('url', 'type', 'url');
    v.addRule('email', 'type', 'email');
    v.addRule('select', 'least', 2);
    v.addRule('select', 'most', 3);

    it('e', function (done) {
        var data = {
            name: '呵呵呵呵',
            age: 22,
            url: 'http://abc.com/',
            email: '1@1.cc',
            select: [
                '1', '2', '3'
            ],
            visible: true
        };
        v.validateAll(data, function (err, path) {
            if (err) {
                console.log('验证错误：', '【' + path + '】', err.message);
            }

            console.log(arguments);
            assert.equal(!!err, false);
            done();
        });
    });
});


