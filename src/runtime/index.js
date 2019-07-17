/**
 * @file runtime/index.js
 * @author haoran
 * @desc v8/jsc入口文件，包含端未注入的前端方法polyfill
 */

 /* globals _naSwan */

import './polyfill';

// 直接指向this会被webpack置为undefined
const swanGlobal = Function('return this')();

// 在全局命名空间中增加swanGlobal全局变量
swanGlobal.swanGlobal = swanGlobal;

// 小程序预加载开始统计打点
swanGlobal.feMasterPreloadStart = Date.now();

// 加载671错误日志监控逻辑
_naSwan.include('./monitor/index.js');

// 加载master.js
_naSwan.include('./master/index.js');

