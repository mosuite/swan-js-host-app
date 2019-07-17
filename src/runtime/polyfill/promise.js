/**
 * @file runtime/popyfill/promise.js
 * @author haoran
 * @desc jsc/v8中Promise polyfill，主要用于解决iOS 9之前的版本Promise运行不符合预期问题
 */

/* globals _naSwan */

const swanGlobal = Function('return this')();

if (_naSwan.userAgent.match(/\(Baidu; P2\s+([\d.]+)\)/g) && parseFloat(RegExp.$1) <= 9
|| !('Promise' in swanGlobal)) {
    delete swanGlobal.Promise;
    _naSwan.include('./promise-polyfill/index.js');
}