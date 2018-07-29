'use strict';

var path = require('path');
var file = path.join(__dirname, './im.jpg');
var encryption = require('../').encryption;
var dato = require('../').dato;
//
console.log(encryption.md5());
//console.log(encryption.sha1('123', 'abc'));
//
//var r = encryption.encode('123', 'abc');
//
//console.log(r);
//console.log(encryption.decode(r, 'abc'));

//var p1 = encryption.password('123');
//var p2 = encryption.password('123');
//
//console.log(p1);
//console.log(p2);
//console.log(encryption.password('123', p1));
//console.log(encryption.password('1234', p2));

