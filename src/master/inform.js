/**
 * @file inform
 */

/* globals swanGlobal _naSwan */

import * as util from '../utils';
import swaninterface from '../../../swan-js-api/src/index';
let ua = (swanGlobal ? swanGlobal : window).navigator.userAgent;
const PRELOAD_INFORM_SWITCH_NAME = 'swanswitch_inform_preload_end';

export default function () {

    let ifInformPreloadEnd = util.getABSwitchValue(PRELOAD_INFORM_SWITCH_NAME);

    if (ifInformPreloadEnd === 1) {
        let preloadResult = null;

        if (ua.match(/Android|Baidu; P1/g)) {
            // 安卓下的情况
            swanGlobal && (preloadResult = _naSwan.swanPreload.onJSLoaded());
            !swanGlobal && (preloadResult = window.swanPreload.onJSLoaded());
        }
        else {
            // 苹果下的情况
            swanGlobal && (preloadResult = _naSwan.swanPreload.onJSLoaded());
            !swanGlobal && swaninterface.boxjs.net.onSwanJSLoaded();
        }
    }
}