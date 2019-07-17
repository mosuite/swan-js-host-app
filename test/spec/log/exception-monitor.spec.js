import ExceptionMonitor from '../../../src/log/exception-monitor';
import {swaninterface} from '../../mock/swan-api';
import {catchTips} from '../../utils';

const exceptionMonitor = new ExceptionMonitor(swaninterface);

describe('ExceptionMonitor', () => {
    beforeEach(() => {
        // 每次处理之后都将当前收到的events清空
        ExceptionMonitor.currentEvents.forEach(stage => {
            stage = [];
        });
    });

    it('should ExceptionMonitor is a class', done => {
        expect(ExceptionMonitor).toEqual(jasmine.any(Function));
        expect(exceptionMonitor).toEqual(jasmine.any(Object));
        done();
    });

    describe('can exceptionMonitor collect events after collectEvents be called', () => {

        it('should test stage does not exist in targetEvents', done => {
            exceptionMonitor.collectEvents(1, '');
            const currentEvent = ExceptionMonitor.currentEvents[1];
            expect(currentEvent[0]).toBeUndefined();
            done();
        });

        it('should test stage is abnormal', done => {
            const eventName = 'masterPreloadStart';
            exceptionMonitor.collectEvents(1, eventName);
            const currentEvent = ExceptionMonitor.currentEvents[1];

            expect(currentEvent[0]).toEqual('masterPreloadStart');
            done();
        });

        it('should test stage is normal', done => {
            ExceptionMonitor.targetEvents[1].forEach(eventName => {
                exceptionMonitor.collectEvents(1, eventName);
            });
            const currentEvent = ExceptionMonitor.currentEvents[1];

            expect(currentEvent[0]).toEqual('masterPreloadStart');
            done();
        });

    });

    describe('stage isValid check', () => {
        it('should return true while the stage is valid', done => {
            const stage = 2;
            ExceptionMonitor.targetEvents[stage].forEach(eventName => {
                exceptionMonitor.collectEvents(stage, eventName);
            });
            const isValid = exceptionMonitor.isValid(stage);

            expect(isValid).toEqual(true);
            done();
        });

        it('should return true while the stage is invalid', done => {
            const stage = 2;
            ExceptionMonitor.currentEvents[stage].pop();
            const isValid = exceptionMonitor.isValid(stage);

            expect(isValid).toEqual(false);
            done();
        });
    });

    it('can find the stage lost event', done => {
        const stage = 2;
        ExceptionMonitor.targetEvents[stage].forEach(eventName => {
            exceptionMonitor.collectEvents(stage, eventName);
        });
        const exceptionEvents = ExceptionMonitor.currentEvents[stage].splice(-2);
        const targetEvents = ExceptionMonitor.targetEvents;
        const currentEvents = ExceptionMonitor.currentEvents;
        const losts = exceptionMonitor.getLost(stage, targetEvents, currentEvents);

        expect(losts.length).toEqual(2);
        losts.forEach((lost, i) => {
            expect(lost.stage).toEqual(exceptionEvents[i]);
        });
        done();
    });

    it('can find the stage rest event', done => {
        const stage = 2;
        ExceptionMonitor.targetEvents[stage].forEach(eventName => {
            exceptionMonitor.collectEvents(stage, eventName);
        });
        ExceptionMonitor.currentEvents[stage].splice(2);
        const targetEvents = ExceptionMonitor.targetEvents;
        const currentEvents = ExceptionMonitor.currentEvents;
        const rests = exceptionMonitor.getRest(stage, targetEvents, currentEvents);

        expect(rests.length).toEqual(2);
        rests.forEach((res, i) => {
            expect(res).toEqual(`${stage}_${i}`);
        });
        done();
    });

    describe('delayToSendExceptionStage', () => {

        it('can delay to send exception stage if never sent', done => {
            const stage = 2;
            const res = exceptionMonitor.delayToSendExceptionStage(stage, 0);

            expect(res).toBeUndefined();
            done();
        });

        it('can not send exception stage if sent', done => {
            const stage = 2;
            const res = exceptionMonitor.delayToSendExceptionStage(stage, 0);

            expect(res).toBeUndefined();
            done();
        });
    });

    describe('setUserTrack', () => {
        it('can set user track while setUserTrack be called', done => {
            const path = '/page/index';
            exceptionMonitor.setUserTrack(path);

            expect(ExceptionMonitor.userTrack[0]).toEqual(path);
            done();
        });

        it('can reset user top track path while paths more than or equal 10', done => {
            const path = '/page/more/than/10';
            const traces = new Array(10).join(0).split('');
            traces.forEach(() => {
                exceptionMonitor.setUserTrack('path');
            });
            exceptionMonitor.setUserTrack(path);

            expect(ExceptionMonitor.userTrack.pop()).toEqual(path);
            done();
        });
    });
 
    describe('getAppInfo', () => {

        it('should return empty object while the method be called return false', done => {
            const cacheMethod = exceptionMonitor.swaninterface.boxjs.data.get;
            exceptionMonitor.swaninterface.boxjs.data.get = () => {
                return false;
            };
            const res = exceptionMonitor.getAppInfo();
            const {
                cuid,
                appid
            } = res;
    
            expect(cuid).toBeUndefined();
            expect(appid).toBeUndefined();
    
            exceptionMonitor.swaninterface.boxjs.data.get = cacheMethod;
            done();
        });

        it('should return correct object while the method be called right', done => {
            const res = exceptionMonitor.getAppInfo();
            const {
                cuid,
                appid
            } = res;
    
            expect(cuid).toEqual('thisiscuidmocker');
            expect(appid).toEqual('123456');
            done();
        });
    });

    describe('extendExtInfo', () => {

        it('should return extendExt info after extendExtInfo be called', done => {
            const extInfo = exceptionMonitor.extendExtInfo();
            const {
                systemInfo,
                appInfo
            } = extInfo;
    
            expect(systemInfo.model).toEqual('M623c');
            expect(appInfo.cuid).toEqual('thisiscuidmocker');
            done();
        });

        it('should be caught while some error happened', done => {
            exceptionMonitor.getSystemInfo = '';

            catchTips();
            const extInfo = exceptionMonitor.extendExtInfo();
    
            expect(extInfo.a).toBeUndefined();
            done();
        });
    });
    
    describe('send', () => {

        it('should call log function after send function be called', done => {
            const cacheLogMethod = exceptionMonitor.swaninterface.boxjs.log;

            let status = 0;
            exceptionMonitor.swaninterface.boxjs.log = () => {
                status++;
            };
            exceptionMonitor.send(1, 'masterBeforeReady');

            expect(status).toEqual(2);

            exceptionMonitor.swaninterface.boxjs.log = cacheLogMethod;
            done();
        });

        it('should be caught when some error happened', done => {
            exceptionMonitor.extendExtInfo = 'mockerr';
            const res = exceptionMonitor.send(1, 'masterBeforeReady');

            expect(res).toBeUndefined();
            done();
        });
    });
});