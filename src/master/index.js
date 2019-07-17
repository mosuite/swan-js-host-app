/**
 * @file master for use swan-js, swan-js-api, swan-components
 * @author sunweinan(sunweinan@baidu.com)
 */
 /* globals _naSwan */
  /* globals swanGlobal */
import Master from '../../../swan-js/dist/box/master/index';
import swaninterface from '../../../swan-js-api/src/index';
import * as swanComponents from '../../../swan-components/dist/master-inject';
import inform from './inform';

new Log(swanGlobal ? swanGlobal : window, swaninterface, 'master');
new Master(swanGlobal ? swanGlobal : window, swaninterface, swanComponents);

if (swanGlobal) {
    swanGlobal.feMasterPreloadEnd = Date.now();
}

/**
 * 前端通知端上预加载已经完成，端上拿这个事件与pageFinished事件做对比，谁先到用谁
 */
inform();


