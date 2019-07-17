/**
 * @file inform
 */

import * as util from '../utils';
import swaninterface from '../../../swan-js-api/src/index';
const PRELOAD_INFORM_SWITCH_NAME = 'swanswitch_inform_preload_end';
let ua = window.navigator.userAgent;
export default function () {
    let ifInformPreloadEnd = util.getABSwitchValue(PRELOAD_INFORM_SWITCH_NAME);
    if (ifInformPreloadEnd === 1) {

        if (ua.match(/Android|Baidu; P1/g)) {
            // 安卓下的情况
            window.swanPreload.onJSLoaded();
        }
        else {
            // 苹果下的情况
            swaninterface.boxjs.net.onSwanJSLoaded();
        }
    }
}