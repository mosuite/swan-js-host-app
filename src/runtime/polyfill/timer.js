/**
 * @file runtime/popyfill/timer.js
 * @author haoran
 * @desc jsc/v8中timer方法polyfill，包含setTimeout、setInterval、requestAnimationFrame
 */

/* globals _naSwan */

const swanGlobal = Function('return this')();

swanGlobal.setTimeout = (function () {
    let innerTimeout  = swanGlobal.setTimeout || _naSwan.setTimeout;
    return (...args) => {
        if (args.length <= 2) {
            return innerTimeout(...args);
        } else {
            let cb = args[0];
            let delay = args[1];
            let rest = args.slice(2);
            return innerTimeout(cb.bind(this, ...rest), delay);
        }
    };
})();

swanGlobal.clearTimeout = swanGlobal.clearTimeout || _naSwan.clearTimeout;

swanGlobal.setInterval = (function () {
    let innerInterval  = swanGlobal.setInterval || _naSwan.setInterval;
    return (...args) => {
        if (args.length <= 2) {
            return innerInterval(...args);
        } else {
            let cb = args[0];
            let delay = args[1];
            let rest = args.slice(2);
            return innerInterval(cb.bind(this, ...rest), delay);
        }
    };
})();

swanGlobal.clearInterval = swanGlobal.clearInterval || _naSwan.clearInterval;

let lastTime = 0;

swanGlobal.requestAnimationFrame = function (callback) {
    let currTime = new Date().getTime();
    let timeToCall = Math.max(0, 16 - (currTime - lastTime));
    let id = setTimeout(function () {
        callback(currTime + timeToCall);
    }, timeToCall);
    lastTime = currTime + timeToCall;
    return id;
};

swanGlobal.cancelAnimationFrame = function (id) {
    clearTimeout(id);
};
