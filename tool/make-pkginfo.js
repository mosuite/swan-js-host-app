/**
 * @file 替换pkginfo.json中的关键信息
 * @author houyu(houyu01@baidu.com)
 */
var fs = require('fs');
var path = require('path');
var pkgInfoDefaultPath = path.resolve(__dirname, './pkginfo.json')

/**
 * 替换pkgInfo.json中的version_name字段
 *
 * @param {Object} pkginfoObj pkginfo的内容对象
 * @param {Object} packageJson 工程中的package.json的内容对象
 * @return {Object} 新的pkginfo的对象
 */
function replaceVersionName(pkginfoObj, packageJson) {
    pkginfoObj['version_name'] = packageJson['version'];
    return pkginfoObj;
}

function replaceHostVersions(pkginfoObj, packageJson) {
    pkginfoObj['host_min_version'] = packageJson['host-min-version'];
    pkginfoObj['host_max_version'] = packageJson['host-max-version'];
    // pkginfoObj['core_client_map'] = packageJson['core-client-map'].map(function (oneCoreVersion) {
    //     return Object.keys(oneCoreVersion).reduce(function (coreVersionMap, versionKey) {
    //         coreVersionMap[versionKey.replace(/-/g, '_')] = oneCoreVersion[versionKey];
    //         return coreVersionMap;
    //     }, {});
    // });
    return pkginfoObj;
}

/**
 * 主要替换pkgInfo.json的逻辑
 *
 * @param {string} pkginfoOutPath 新的pkginfo产出的路径
 */
function main(pkginfoOutPath) {
    var pkgInfoJson = require(pkgInfoDefaultPath);
    var packageJson = require(path.resolve(__dirname, '../package.json'));
    pkgInfoJson = replaceVersionName(pkgInfoJson, packageJson);
    pkgInfoJson = replaceHostVersions(pkgInfoJson, packageJson);
    var pkginfoContent = JSON.stringify(pkgInfoJson);
    fs.writeFileSync(pkginfoOutPath, pkginfoContent, 'utf-8');
}

var allParams = process.argv.slice(2);
var pkginfoOutPath = allParams[0] || pkgInfoDefaultPath;

main(pkginfoOutPath);
