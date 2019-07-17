/**
 * @file log performance test for swan-app
 * @author lvlei(lvlei01@baidu.com)
 */

import PerformanceLog from '../../../src/log/performanceLog';
import {swaninterface} from '../../mock/swan-api';
import {randomNum} from '../../utils';

const slaveId = randomNum();

const performanceLog = new PerformanceLog(swaninterface);

describe('PerformanceLog', () => {

    it('should PerformanceLog is a class', done => {
        expect(PerformanceLog).toEqual(jasmine.any(Function));
        expect(performanceLog).toEqual(jasmine.any(Object));
        done();
    });

    it('should return an object after addPerformPanel be called', done => {
        const res = performanceLog.addPerformPanel({});
        expect(res.name).toEqual('performpanel');
        done();
    });

    it('should return an object after performPanelHelper be called', done => {
        const startTime = Date.now();
        const res = performanceLog.performPanelHelper(slaveId, startTime);

        expect(res.name).toEqual('performpanel');

        const [
            startAction,
            endAction
        ] = res.data.data;

        expect(startAction.actionName).toEqual('pageUpdateStart');
        expect(endAction.actionName).toEqual('pageUpdateEnd');
        done();
    });

    it('should call boxjs log right after sendLogMessage be called', done => {
        const cacheLogMethod = performanceLog.swaninterface.boxjs.log;

        let logParams;
        performanceLog.swaninterface.boxjs.log = params => {
            logParams = params;
        };

        const slavePerfLogList = [{
            from: 'list'
        }];
        let empty;
        performanceLog.sendLogMessage(empty, slavePerfLogList, {routeId: '1'});

        const {
            name,
            data: {
                flowId,
                data,
                ext
            }
        }  = logParams;

        expect(ext.routeId).toEqual('1');
        expect(name).toEqual('ubcFlowJar');
        expect(flowId).toEqual('670');
        expect(data[0].from).toEqual('list');

        performanceLog.swaninterface.boxjs.log = cacheLogMethod;
        done();
    });

    it('should call boxjs log right after sendFPLog be called', done => {
        const cacheLogMethod = performanceLog.swaninterface.boxjs.log;

        let logParams;
        performanceLog.swaninterface.boxjs.log = params => {
            logParams = params;
        }

        const fpdata = 'fpdata';
        performanceLog.sendFPLog(fpdata);

        const {
            name,
            data: {
                flowId,
                data
            }
        }  = logParams;

        expect(name).toEqual('ubcFlowJar');
        expect(flowId).toEqual('772');
        expect(data[0]).toEqual('fpdata');

        performanceLog.swaninterface.boxjs.log = cacheLogMethod;
        done();
    });
});