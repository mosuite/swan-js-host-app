/**
 * @file runtime/popyfill/image.js
 * @author haoran
 * @desc 在jsc/v8中实现Image类，用于用空图片发送统计需求
 */

/* globals _naSwan */

const swanGlobal = Function('return this')();

class Image {

    /**
     * constructor
     * @param {number} width 图片宽度
     * @param {number} height 图片高度
    */
    constructor(width, height) {
        this.__requested = false;
        this.width = width;
        this.height = height;
    }

    /**
     * set src属性时发送request get请求
     * @param {string} url 图片请求url
     */
    set src(url) {
        if (this.__requested) {
            return false;
        }
        this.__requested = true;
        swanGlobal['_bdbox_js_xxxx'] = function () {};
        let scheme = `baiduboxapp://swanAPI/request?params={"url":"${encodeURIComponent(url)}","method":"GET","data":{},"dataType":"json","cb":"_bdbox_js_xxxx"}&callback=_bdbox_js_xxxx&upgrade=0&oauthType=swan`;
        let os = _naSwan.userAgent.match(/Baidu; P2/) ? 'iOS' : 'Android';
        if (os === 'Android') {
            _naSwan.Bdbox_android_jsbridge.dispatch(scheme);
        } else if (_naSwan.BBAMNPJSBridge) {
            _naSwan.BBAMNPJSBridge.postMessage(scheme);
        } else {
            _naSwan.bridge.postMessage(scheme);
        }
    }
}

swanGlobal.Image = Image;