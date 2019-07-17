/**
 * @file runtime/popyfill/console.js
 * @author haoran
 * @desc 常用/端未注入的console方法polyfill，暂时全部指向console.log
 */

/* globals _naSwan */

const swanGlobal = Function('return this')();

swanGlobal.console = _naSwan.console;

const log = swanGlobal.console.log;

['dir', 'dirxml', 'table',
'trace', 'group', 'groupCollapsed',
'groupEnd', 'clear', 'count',
'countReset', 'assert', 'profile',
'profileEnd', 'timeStamp', 'context',
'memory'].forEach(prop => {
    swanGlobal.console[prop] = log;
});