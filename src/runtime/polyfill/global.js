/**
 * @file runtime/popyfill/global.js
 * @author haoran
 * @desc jsc/v8中一些需要挂载的全部变量集合，包含全局window、global、basePath、_envVariables、isMaster、navigator
 */


/* globals _naSwan V8RUNTIMESWANVERION */

const swanGlobal = Function('return this')();


swanGlobal.window = swanGlobal;
swanGlobal.global = swanGlobal;

swanGlobal.navigator = {
    userAgent: _naSwan.userAgent
};

swanGlobal.addEventListener = _naSwan.addEventListener.bind(_naSwan);

swanGlobal.isMaster = true;

// 统一处理env环境变量
try {
    swanGlobal._envVariables = Object.assign({scheme: 'baiduboxapp'}, JSON.parse(_naSwan.getEnvVariables()));
} catch (ex) {
    swanGlobal._envVariables = {scheme: 'baiduboxapp'};
}

swanGlobal.basePath = _naSwan.env.basePath;
swanGlobal.swanVersion = V8RUNTIMESWANVERION;
