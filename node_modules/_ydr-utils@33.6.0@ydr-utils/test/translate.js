/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-04-09 20:28
 */


var translate = require('../').translate;

translate('你好', function (err, word) {
    console.log(err);
    console.log(word);
});
