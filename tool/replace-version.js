/**
 * @file 替换package.json中对应模块的version
 * @author houyu01(houyu01@baidu.com)
 */
var fs = require('fs');
var config = require('../package.json');
var args = process.argv.splice(2);

var modulesContentPath = args[0];
var modluesContent = fs.readFileSync(modulesContentPath, 'utf-8');
const moduleList = ['swan-core', 'swan-components', 'swan-api'];
moduleList.forEach(function (module) {
    var moduleRegx = new RegExp(module + '\@(\\d+\\.\\d+\\.\\d+)');
    var moduleVersion = moduleRegx.exec(modluesContent);
    for (dep in config.dependencies) {
        if (dep.match(module) && moduleVersion) {
            config.dependencies[dep] = moduleVersion[1];
        }
    }
});

fs.writeFileSync(__dirname + '/../package.json', JSON.stringify(config, null, 4), 'utf-8');
