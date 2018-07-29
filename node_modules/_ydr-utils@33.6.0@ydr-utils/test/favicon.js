var Favicon = require('../libs/favicon.js');
var path = require('path');
var configs = {
    defaultFaviconFilePath: path.join(__dirname, '../f/default.png'),
    configsFilePath: path.join(__dirname, '../f/default.json'),
    saveDirection: path.join(__dirname, '../f/')
};
Favicon.config(configs);
Favicon.buildDefaultConfigs();

var u = Favicon.joinURL('baidu.com','baidu.com');
console.log(u);
return;

var url =  process.argv[2] || 'malaclc.tmall.com';
var favicon = new Favicon(url);



favicon.get(function () {
    console.log('file:', this.faviconFile);
    console.log('url:', this.faviconURL);
}).on('error', function (err) {
    console.log(err.stack);
});
