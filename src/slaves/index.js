/**
 * @file slave for use swan-js, swan-js-api, swan-components
 * @author sunweinan(sunweinan@baidu.com)
 */
import Slave from '../../../swan-js/dist/box/slaves/index';
import swaninterface from '../../../swan-js-api/src/index';
import * as swanComponents from '../../../swan-components';
import inform from './inform';
new Log(window, swaninterface, 'slave');
new Slave(window, swaninterface, swanComponents);

/**
 * 前端通知端上预加载已经完成，端上拿这个事件与pageFinished事件做对比，谁先到用谁
 */
inform();

