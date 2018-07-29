#sts 

[![NPM version](https://img.shields.io/npm/v/sts.svg?style=flat)](https://npmjs.org/package/sts)

基于 NodeJS 的静态服务器

**S**TATIC **T**RUSTED **S**ERVER => sts


# INSTALL
```
npm install sts -g
```

# USAGE

## local
```
var sts = require('sts');
// webroot: 绝对路径
// port: 端口号
// callback: 回调
sts(webroot, port, callback);
```

## global
```
sts version 输出版本号 
sts help 输出帮助信息
cd your directory
sts [port] 启动静态服务器
```


# VERSION
## v2.0.0
- 全新交互方式，支持随机端口启动
- 支持启动打开局域网 IP


## v1.x.x
- 支持文件流读取
- 启动时自动打开浏览器
- 增加了缓存304策略
- 增加了本地静态服务器
- 更新了404、500的描述
- 修复了`点文件夹`的访问BUG
- 更新了markdown文件的样式
- 增加了对markdown文件的支持，支持`.md`、`.mkd`、`.markdown`3种文件后缀
- 增加输出版本号
