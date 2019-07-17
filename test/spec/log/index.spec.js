/**
 * @file log index test for swan-app
 * @author lvlei(lvlei01@baidu.com)
 */

import Log from '../../../src/log/index';
import {swaninterface} from '../../mock/swan-api';
import EventsEmitter from '@baidu/events-emitter';
import {randomNum, catchTips} from '../../utils';
import {dispatchEvent} from '../../mock/swan-na';

const global = window;

const currentTimestamp = Date.now();
const pageSlaveId = randomNum();

global.swanEvents = global.swanEvents || new EventsEmitter();

const log = new Log(global, swaninterface, 'master');

// pageInfo字段会在slave接受pageReady字段时被创建
window.pageInfo = {};

log.global.masterManager = {
    pageLifeCycleEventEmitter: new EventsEmitter(),
    appLifeCycleEventEmitter: new EventsEmitter(),
    swanEventsCommunicator: new EventsEmitter()
};

describe('Log', () => {
    it('should Log is a class', done => {
        expect(Log).toEqual(jasmine.any(Function));
        expect(log).toEqual(jasmine.any(Object));
        done();
    });

    describe('registerLog', () => {
        let reportMtjMiniSDK;
        let executeExceptionMointor;
        let executePerformPanel;
        let executeStageEvent;

        beforeEach(() => {
            reportMtjMiniSDK = log.reportMtjMiniSDK;
            executeExceptionMointor = log.executeExceptionMointor;
            executePerformPanel = log.executePerformPanel;
            executeStageEvent = log.executeStageEvent;
        });

        afterEach(() => {
            log.reportMtjMiniSDK = reportMtjMiniSDK;
            log.executeExceptionMointor = executeExceptionMointor;
            log.executePerformPanel = executePerformPanel;
            log.executeStageEvent = executeStageEvent;
        });

        it('registerLog', done => {
            const logCbPool = {
                reportMtjMiniSDKParams: null,
                executeExceptionMointorParams: null,
                executePerformPanelParams: null,
                executeStageEventParams: null
            };

            log.reportMtjMiniSDK = (eventName, data) => {
                logCbPool.reportMtjMiniSDKParams = {
                    eventName,
                    data
                };
            };
            log.executeExceptionMointor = (eventName, data) => {
                logCbPool.executeExceptionMointorParams = {
                    eventName,
                    data
                };
            };
            log.executePerformPanel = (eventName, data) => {
                logCbPool.executePerformPanelParams = {
                    eventName,
                    data
                };
            };
            log.executeStageEvent = (role, eventName, data) => {
                logCbPool.executeStageEventParams = {
                    role,
                    eventName,
                    data
                };
            };

            const role = 'master';
            log.registerLog(role);

            log.swanEvents.fireMessage({
                type: 'TraceEvents',
                params: {
                    eventName: 'mocktest',
                    data: 'swan-test'
                }
            });

            expect(logCbPool.reportMtjMiniSDKParams.eventName).toEqual('mocktest');
            expect(logCbPool.reportMtjMiniSDKParams.data).toEqual('swan-test');

            expect(logCbPool.executeExceptionMointorParams.eventName).toEqual('mocktest');
            expect(logCbPool.executeExceptionMointorParams.data).toEqual('swan-test');

            expect(logCbPool.executePerformPanelParams.eventName).toEqual('mocktest');
            expect(logCbPool.executePerformPanelParams.data).toEqual('swan-test');

            expect(logCbPool.executeStageEventParams.role).toEqual('master');
            expect(logCbPool.executeStageEventParams.eventName).toEqual('mocktest');
            expect(logCbPool.executeStageEventParams.data).toEqual('swan-test');

            done();
        });

        it('should be caught while TraceEvents cb params does not includes param', done => {
            const role = 'master';
            log.registerLog(role);

            const res = log.swanEvents.fireMessage({
                type: 'TraceEvents'
            });

            expect(res).toEqual(jasmine.any(Object));
            done();
        });

        it('should eventName be set to empty while it is undefined', done => {
            let reportMtjMiniSDKParams = null;

            log.reportMtjMiniSDK = (eventName, data) => {
                reportMtjMiniSDKParams = {
                    eventName,
                    data
                };
            };

            const role = 'master';
            log.registerLog(role);

            log.swanEvents.fireMessage({
                type: 'TraceEvents',
                params: {
                    data: 'swan-test'
                }
            });

            expect(reportMtjMiniSDKParams.eventName).toEqual('');
            expect(reportMtjMiniSDKParams.data).toEqual('swan-test');
            done();
        });
    });

    describe('executeStageEvent', () => {

        it('should execute master while the role is master', done => {
            const cacheMaster = log.master;

            let masterParmas;
            log.master = (eventName, data) => {
                masterParmas = {
                    eventName,
                    data
                };
            };

            const role = 'master';
            const eventName = 'masterPreloadEnd';
            const data = 'mockdata';
            log.executeStageEvent(role, eventName, data);

            expect(masterParmas.eventName).toEqual(eventName);
            expect(masterParmas.data).toEqual(data);

            log.master = cacheMaster;
            done();
        });

        it('should execute slave while the role is slave', done => {
            const cacheSlave = log.slave;

            let slaveParmas;
            log.slave = (eventName, data) => {
                slaveParmas = {
                    eventName,
                    data
                };
            };

            const role = 'slave';
            const eventName = 'slavePreloadEnd';
            const data = 'mockdata';
            log.executeStageEvent(role, eventName, data);

            expect(slaveParmas.eventName).toEqual(eventName);
            expect(slaveParmas.data).toEqual(data);

            log.slave = cacheSlave;
            done();
        });
    });

    describe('reportMtjMiniSDK', () => {

        it('should initProductLogEvents while the event is masterPreloadContextDecorated', done => {
            const eventName = 'masterPreloadContextDecorated';
            const res = log.reportMtjMiniSDK(eventName);

            expect(res).toBeUndefined();
            done();
        });

        it('should do nothing while the event is not masterPreloadContextDecorated', done => {
            const eventName = 'masterActiveCreatePageFlowStart';
            const res = log.reportMtjMiniSDK(eventName);

            expect(res).toBeUndefined();
            done();
        });
    });

    describe('executeExceptionMointor', () => {

        it('can set user track while the stage is masterActiveCreatePageFlowStart', done => {
            const cacheMthod = log.exceptionMonitor.setUserTrack;
            let paramsPool;
            log.exceptionMonitor.setUserTrack = params => {
                paramsPool = params;
            };

            const eventName = 'masterActiveCreatePageFlowStart';
            const data = {
                uri: '/page/one'
            };

            log.executeExceptionMointor(eventName, data);

            expect(paramsPool).toEqual(data.uri);

            log.exceptionMonitor.setUserTrack = cacheMthod;
            done();
        });

        const itCb = (stage, index) => {
            return done => {
                const cacheMthod = log.exceptionMonitor.delayToSendExceptionStage;
                let paramsPool;
                log.exceptionMonitor.delayToSendExceptionStage = params => {
                    paramsPool = params;
                };

                if (stage === 'slaveActiveStart') {
                    log.global.pageRender = () => {
                    };
                }

                const eventName = stage;
                const data = 'mock';

                log.executeExceptionMointor(eventName, data);

                expect(paramsPool).toEqual(index + 1);

                log.exceptionMonitor.delayToSendExceptionStage = cacheMthod;
                done();
            };
        };

        [
            'masterPreloadStart',
            'slavePreloadStart',
            'masterActiveStart',
            'slaveActiveStart'
        ].forEach((stage, index) => {
            const stageName = stage.replace('Start', '');
            it(`can upload first ${stageName} stage exception while the stage belongs ${stageName}`, itCb(stage, index));
        });
    });

    describe('executePerformPanel', () => {
        it('should be caught while showPerformancePanel is not undefined', done => {
            window.showPerformancePanel = 'false';

            const eventName = 'slaveActiveRenderEnd';
            const data = 'mock';

            const res = log.executePerformPanel(eventName, data);
            expect(res).toBeUndefined();
            done();
        });

        it('should performPanelHelper be called while the event is slaveActiveRenderEnd', done => {
            window.showPerformancePanel = 'true';

            let performPanelHelperParams;
            log.performanceLog.performPanelHelper = (...params) => {
                performPanelHelperParams = params;
            };

            const eventName = 'slaveActiveRenderEnd';
            const data = {
                slaveId: pageSlaveId
            };

            log.global.pageInitRenderStart = currentTimestamp;
            log.executePerformPanel(eventName, data);

            const [slaveId, pageInitRenderStart, actionName] = performPanelHelperParams;

            expect(slaveId).toEqual(pageSlaveId);
            expect(pageInitRenderStart).toEqual(currentTimestamp);
            expect(actionName).toEqual('pageInitRender');
            done();
        });

        window.showPerformancePanel = 'true';

        [
            'pageSwitchStart',
            'pageSwitchEnd'
        ].forEach(eventName => {
            it('should addPerformPanel be called while the event is pageSwitchStart or pageSwitchStart', done => {
                const cacheMethod = log.global.masterManager.perfAudit;
                log.global.masterManager.perfAudit = {};

                const data = {
                    slaveId: pageSlaveId
                };

                const res = log.executePerformPanel(eventName, data);

                expect(res).toBeUndefined();

                log.global.masterManager.perfAudit = cacheMethod;
                done();
            });
        });

        it('should performPanelHelper be called while the event is pageDataUpdate', done => {
            window.showPerformancePanel = 'true';

            let performPanelHelperParams;
            log.performanceLog.performPanelHelper = (...params) => {
                performPanelHelperParams = params;
            };

            const eventName = 'pageDataUpdate';
            const data = {
                slaveId: pageSlaveId,
                timestamp: currentTimestamp
            };
            log.executePerformPanel(eventName, data);

            const [slaveId, timestamp] = performPanelHelperParams;

            expect(slaveId).toEqual(pageSlaveId);
            expect(timestamp).toEqual(data.timestamp);
            done();
        });

        it('should console error while the event does not belong to the performPanelEvents', done => {
            const cacheMethod = log.global.masterManager.perfAudit;
            log.global.masterManager.perfAudit = undefined;

            const data = {
                slaveId: pageSlaveId
            };

            const eventName = 'pageSwitchStart';
            const res = log.executePerformPanel(eventName, data);

            catchTips();
            expect(res).toBeUndefined();

            log.global.masterManager.perfAudit = cacheMethod;
            done();
        });
    });

    describe('master', () => {

        afterAll(() => {
            window._swanTraceList = [];
        });

        log.global.masterManager.perfAudit = {};
        log.global.masterManager.pagesQueue = {
            page1: {}
        };
        log.global.masterManager.virtualComponentFactory = () => {
        };

        let perfListLen = 0;
        let stageListLen = 0;
        const stageList = window._swanTraceList;

        it('should add perf log after masterPreloadEnd be called', done => {

            log.master('masterPreloadEnd');
            perfListLen++;
            stageListLen++;

            expect(Log.perfLogList.__list.length).toEqual(perfListLen);
            expect(stageList.length).toEqual(stageListLen);
            done();
        });

        it('should add perf log after masterLogicStart be called', done => {

            log.master('masterLogicStart');
            perfListLen++;

            expect(Log.perfLogList.__list.length).toEqual(perfListLen);
            done();
        });

        it('should add perf after masterActiveStart be called', done => {

            log.master('masterActiveStart');

            perfListLen++;

            expect(log.global.masterManager.perfAudit['fe_master_dispatch_start']).toEqual(jasmine.any(Number));
            expect(log.global.masterManager.perfAudit.fe_master_dispatch_start).toEqual(jasmine.any(Number));
            done();
        });

        it('should add perf and store stage log after masterActiveAppJsLoaded be called', done => {

            log.master('masterActiveAppJsLoaded');

            perfListLen++;
            stageListLen++;

            expect(Log.perfLogList.__list.length).toEqual(perfListLen);
            expect(stageList.length).toEqual(stageListLen);
            done();
        });

        it('should add perf and store stage log after masterActiveSendInitdataEnd be called', done => {

            log.master('masterActiveSendInitdataEnd');

            perfListLen++;
            stageListLen++;

            expect(Log.perfLogList.__list.length).toEqual(perfListLen);
            expect(stageList.length).toEqual(stageListLen);
            done();
        });

        it('should add perf and store stage log after masterOnAppLaunchHookStart be called', done => {

            log.master('masterOnAppLaunchHookStart');

            perfListLen++;
            stageListLen++;

            expect(Log.perfLogList.__list.length).toEqual(perfListLen);
            expect(stageList.length).toEqual(stageListLen);
            done();
        });

        it('should add perf and store stage log after masterOnAppLaunchHookEnd be called', done => {

            log.master('masterOnAppLaunchHookEnd');

            perfListLen++;
            stageListLen++;

            expect(Log.perfLogList.__list.length).toEqual(perfListLen);
            expect(stageList.length).toEqual(stageListLen);
            done();
        });

        it('should add perf and store stage log after masterPageOnLoadHookStart be called', done => {

            log.master('masterPageOnLoadHookStart');

            perfListLen++;
            stageListLen++;

            expect(Log.perfLogList.__list.length).toEqual(perfListLen);
            expect(stageList.length).toEqual(stageListLen);
            done();
        });

        it('should add perf and store stage log after masterPageOnLoadHookEnd be called', done => {

            log.master('masterPageOnLoadHookEnd');

            perfListLen++;
            stageListLen++;

            expect(Log.perfLogList.__list.length).toEqual(perfListLen);
            expect(stageList.length).toEqual(stageListLen);
            done();
        });

        it('should add perf and store stage log after masterActiveInitAction be called', done => {

            log.master('masterActiveInitAction');

            perfListLen++;
            stageListLen++;

            expect(Log.perfLogList.__list.length).toEqual(perfListLen);
            expect(stageList.length).toEqual(stageListLen);
            done();
        });

        describe('masterFePageShow', () => {
            it('should add perf and send msg after masterFePageShow be called', done => {

                log.master('masterFePageShow');

                perfListLen++;

                expect(Log.perfLogList.__list.length).toEqual(perfListLen);
                expect(Log.logOnNewScheme).toEqual(false);

                done();
            });

        });

        it('should clear performace log and change logOnNewScheme status after masterOnNewScheme be called', done => {

            log.master('masterOnNewScheme');

            // clearLog -> add
            perfListLen = 1;

            expect(Log.perfLogList.__list.length).toEqual(perfListLen);
            expect(Log.logOnNewScheme).toEqual(true);
            done();
        });

        it('should be caught while some error happened', done => {
            const cacheMtehod = log.statistics.customComponentStatistics;

            log.statistics.customComponentStatistics = undefined;

            catchTips();
            const res = log.master('customComponentStatistics');

            expect(res).toBeUndefined();

            log.statistics.customComponentStatistics = cacheMtehod;
            done();
        });
    });

    describe('slave', () => {

        let stageList;
        beforeAll(() => {
            Log.perfLogList.__list = [];
            stageList = window._swanTraceList;
        });

        let perfListLen = 0;
        let stageListLen = 0;

        it('should store stage info after slavePreloadEnd be called', done => {

            log.slave('slavePreloadEnd', {
                eventId: 'swan'
            });
            stageListLen++;

            expect(stageList.length).toEqual(stageListLen);
            done();
        });
        
        it('should add perf and store stage info after slaveActiveJsParsed be called', done => {

            log.slave('slaveActiveJsParsed', {
                eventId: 'swan'
            });
            perfListLen++;
            stageListLen++;

            expect(perfListLen).toEqual(perfListLen);
            expect(stageList.length).toEqual(stageListLen);
            done();
        });

        it('should add perf and store stage info after slaveActiveStart be called', done => {

            log.slave('slaveActiveStart', {
                eventId: 'swan',
                pageInitRenderStart: currentTimestamp
            });
            perfListLen++;
            stageListLen++;

            expect(log.global.pageInitRenderStart).toEqual(currentTimestamp);
            expect(perfListLen).toEqual(perfListLen);
            expect(stageList.length).toEqual(stageListLen);
            done();
        });

        it('should add perf and store stage info after slaveActivePageLoadStart be called', done => {

            log.slave('slaveActivePageLoadStart', {
                eventId: 'swan'
            });
            perfListLen = perfListLen + 3;
            stageListLen++;

            expect(perfListLen).toEqual(perfListLen);
            expect(stageList.length).toEqual(stageListLen);
            done();
        });

        it('should add perf and store stage info after slaveActiveSwanJsLoadStart be called', done => {

            log.slave('slaveActiveSwanJsLoadStart', {
                eventId: 'swan'
            });
            perfListLen++;
            stageListLen++;

            expect(perfListLen).toEqual(perfListLen);
            expect(stageList.length).toEqual(stageListLen);
            done();
        });

        it('should add perf and store stage info after slaveActiveCssLoaded be called', done => {

            log.slave('slaveActiveCssLoaded', {
                eventId: 'swan'
            });
            perfListLen++;
            stageListLen++;

            expect(perfListLen).toEqual(perfListLen);
            expect(stageList.length).toEqual(stageListLen);
            done();
        });

        it('should add perf info after slaveActiveAppCssLoaded be called', done => {

            log.slave('slaveActiveAppCssLoaded', {
                eventId: 'swan'
            });
            perfListLen++;
            stageListLen++;

            expect(perfListLen).toEqual(perfListLen);
            expect(stageList.length).toEqual(stageListLen);
            done();
        });

        it('should add perf info after slaveActivePageCssLoaded be called', done => {

            log.slave('slaveActivePageCssLoaded', {
                eventId: 'swan'
            });
            perfListLen++;
            stageListLen++;

            expect(perfListLen).toEqual(perfListLen);
            expect(stageList.length).toEqual(stageListLen);
            done();
        });

        it('should add perf info after slaveActiveSwanJsLoaded be called', done => {

            log.slave('slaveActiveSwanJsLoaded', {
                eventId: 'swan'
            });
            perfListLen++;
            stageListLen++;

            expect(perfListLen).toEqual(perfListLen);
            expect(stageList.length).toEqual(stageListLen);
            done();
        });

        it('should add perf and store stage info after slaveActiveRealGetData be called', done => {

            log.slave('slaveActiveRealGetData', {
                eventId: 'swan'
            });
            perfListLen++;
            stageListLen++;

            expect(perfListLen).toEqual(perfListLen);
            expect(stageList.length).toEqual(stageListLen);
            done();
        });

        it('should add perf and store stage info after slaveActiveNoticeMasterSlaveloaded be called', done => {

            log.slave('slaveActiveNoticeMasterSlaveloaded', {
                eventId: 'swan'
            });
            perfListLen++;
            stageListLen++;

            expect(perfListLen).toEqual(perfListLen);
            expect(stageList.length).toEqual(stageListLen);
            done();
        });

        it('should add perf and store stage info after slaveActiveReceiveInitData be called', done => {

            log.slave('slaveActiveReceiveInitData', {
                eventId: 'swan'
            });
            perfListLen++;
            stageListLen++;

            expect(perfListLen).toEqual(perfListLen);
            expect(stageList.length).toEqual(stageListLen);
            done();
        });

        it('should add perf and store stage info after slaveActiveRenderStart be called', done => {

            log.slave('slaveActiveRenderStart', {
                eventId: 'swan'
            });
            perfListLen++;
            stageListLen++;

            expect(perfListLen).toEqual(perfListLen);
            expect(stageList.length).toEqual(stageListLen);
            done();
        });

        describe('slaveFeFirstPaint', () => {
            beforeEach(() => {
                log.__fmpSend = false;
                log.__fpSend = false;
            });

            it('should reset fpSend flag while it does not exist and eventId is not nreach', done => {
                const cacheMethod = log.sendDataToMaster;

                Log.perfLogList.__list = [{
                    actionId: 'test-first-paint',
                    timestamp: currentTimestamp
                }];

                let senderPool;
                log.sendDataToMaster = (type, params) => {
                    senderPool = {
                        type,
                        params
                    };
                };

                log.__fpSend = false;

                log.slave('slaveFeFirstPaint', {
                    eventId: 'swan'
                });

                log.slave('slaveActiveFeFirstMeaningfulPaint', {
                    eventId: 'swan'
                });

                expect(log.__fpSend).toEqual(true);
                expect(log.__fmpSend).toEqual(true);

                const {
                    actionId,
                    timestamp
                } = senderPool.params.perfLogList[0];

                expect(actionId).toEqual('test-first-paint');
                expect(timestamp).toEqual(currentTimestamp);

                log.sendDataToMaster = cacheMethod;
                done();
            });

            it('should do nothing while it has sent fmp', done => {
                Log.perfLogList.__list = [];
                log.__fmpSend = true;
                log.slave('slaveActiveFeFirstMeaningfulPaint', {
                    eventId: 'swan'
                });
                expect(log.__fmpSend).toEqual(true);
                expect(Log.perfLogList.__list.length).toEqual(0);
                done();
            });

            it('should reset reportFPData flag while it does not exist', done => {
                Log.perfLogList.__list = [];

                log.__fpSend = true;
                log.reportFPData = false;

                log.slave('slaveFeFirstPaint', {
                    eventId: 'swan'
                });

                expect(log.reportFPData).toEqual(true);
                done();
            });

            it('should do nothing while fmp has been sent', done => {

                log.__fmpSend = true;

                log.slave('slaveFeFirstMeaningfulPaint', {
                    eventId: 'swan'
                });

                expect(Log.perfLogList.__list.length).toEqual(0);
                log.__fmpSend = false;
                done();
            });

            it('should save log with a new scheme', done => {
                Log.logMessageSended = true;
                Log.logOnNewScheme = true;

                Log.perfLogList.add('test-new-scheme');

                expect(Log.perfLogList.__list.length).toEqual(1);
                Log.logOnNewScheme = false;
                Log.logMessageSended = false;
                done();
            });

            it('should send data to master immediately while ua match none', done => {
                const cacheMethod = log.sendDataToMaster;

                Log.perfLogList.__list = [{
                    actionId: 'test-stage',
                    timestamp: currentTimestamp
                }];

                let senderPool;
                log.sendDataToMaster = (type, params) => {
                    senderPool = {
                        type,
                        params
                    };
                };
                const eventName = 'slaveActiveRenderEnd';

                log.slave(eventName, {
                    eventId: 'swan'
                });

                expect(senderPool.type).toEqual('sendLogMessage');

                const {
                    actionId,
                    timestamp
                } = senderPool.params.perfLogList[0];

                expect(actionId).toEqual('test-stage');
                expect(timestamp).toEqual(currentTimestamp);

                log.sendDataToMaster = cacheMethod;
                done();
            });

            it('should change __fpSend and __fmpSend while ua match correctly', done => {
                Log.perfLogList.__list = [];
                Object.defineProperty(log.global.navigator, 'userAgent', {
                    value: 'Android|Baidu; P1',
                    configurable: true,
                    writable: true
                });

                window._envVariables = {};
                window._envVariables.abTestSwitch = {
                    swanswitch_fcp_timeout: 0
                };

                const eventName = 'slaveActiveRenderEnd';

                log.slave(eventName, {
                    eventId: 'swan'
                });

                expect(Log.perfLogList.__list.length).toEqual(3);
                expect(log.__fpSend).toEqual(false);
                expect(log.__fmpSend).toEqual(false);

                // 此处延时用处理于框架中的setTimeout
                setTimeout(() => {
                    expect(log.__fpSend).toEqual(true);
                    expect(log.__fmpSend).toEqual(true);
                    done();
                }, 4000);
            });

            it('should change __fmpSend while ua match correctly and timeout is 5000ms', done => {
                Log.perfLogList.__list = [];
                Object.defineProperty(log.global.navigator, 'userAgent', {
                    value: 'Android|Baidu; P1',
                    configurable: true,
                    writable: true
                });

                window._envVariables = {};
                window._envVariables.abTestSwitch = {
                    swanswitch_fcp_timeout: 1
                };

                const eventName = 'slaveActiveRenderEnd';

                log.slave(eventName, {
                    eventId: 'swan'
                });

                expect(Log.perfLogList.__list.length).toEqual(3);

                // 此处延时用处理于框架中的setTimeout
                setTimeout(() => {
                    expect(log.__fmpSend).toEqual(false);
                    setTimeout(() => {
                        expect(log.__fmpSend).toEqual(true);
                        done();
                    }, 4000);
                }, 2000);
            });

            it('should not change __fpSend while ua match correctly and fmpSend is true', done => {
                Log.perfLogList.__list = [];
                Object.defineProperty(log.global.navigator, 'userAgent', {
                    value: 'Android|Baidu; P1',
                    configurable: true,
                    writable: true
                });

                const eventName = 'slaveActiveRenderEnd';

                log.__fmpSend = true;

                log.slave(eventName, {
                    eventId: 'swan'
                });

                // 此处延时用处理于框架中的setTimeout
                setTimeout(() => {
                    expect(Log.perfLogList.__list.length).toEqual(3);
                    expect(log.__fmpSend).toEqual(true);
                    expect(log.__fpSend).toEqual(false);
                    done();
                }, 3200);
            });

        });

        it('should report to master that slave has webview component', done => {
            let ele = document.createElement('swan-web-view');
            document.body.appendChild(ele);
            const cacheMethod = log.swaninterface.invoke;

            log.swaninterface.invoke = (type, slaveId, params) => {
                expect(type).toEqual('postMessage');
                expect(slaveId).toEqual('master');
                expect(params.type).toEqual('sendLogMessage');
                expect(params.value.hasWebView).toEqual(1);
            };

            const type = 'sendLogMessage';

            log.sendDataToMaster(type, {});

            log.swaninterface.invoke = cacheMethod;
            ele.remove();
            done();
        });

        it('slaveFeFirstPaint', done => {
            Log.perfLogList.__list = [];
            log.__fpSend = true;
            log.reportFPData = true;

            const eventName = 'slaveFeFirstPaint';

            log.slave(eventName, {
                eventId: 'swan'
            });

            expect(Log.perfLogList.__list.length).toEqual(0);
            done();
        });

        it('should be caught while some error happened', done => {
            const cacheMtehod = log.statistics.customComponentStatistics;

            log.statistics.customComponentStatistics = undefined;

            catchTips();
            const res = log.slave('customComponentStatistics');

            expect(res).toBeUndefined();

            log.statistics.customComponentStatistics = cacheMtehod;
            done();
        });
    });

    describe('logEventsSpecialListener', () => {
        describe('master', () => {
            const role = 'master';

            it('should be caught while return parameter is empty', done => {
                const cacheMethod = log.swaninterface.invoke;
                log.swaninterface.invoke = (type, cb) => {
                    if (type === 'onMessage') {
                        cb();
                    }

                };

                const res = log.logEventsSpecialListener(role);

                expect(res).toBeUndefined();

                log.swaninterface.invoke = cacheMethod;
                done();
            });

            it('should reset logMessageSended while return parameter type is sendLogMessage and sended', done => {
                const cacheMethod = log.swaninterface.invoke;
                log.swaninterface.invoke = (type, cb) => {
                    if (type === 'onMessage') {
                        cb({
                            type: 'sendLogMessage',
                            value: {
                                perfLogList: [{
                                    actionId: 'other',
                                    timestamp: currentTimestamp
                                }, {
                                    actionId: 'slave_first_rendered',
                                    timestamp: currentTimestamp
                                }]
                            }
                        });
                    }

                };

                Log.logOnNewScheme = false;
                log.logEventsSpecialListener(role);

                expect(Log.logMessageSended).toEqual(true);

                log.swaninterface.invoke = cacheMethod;
                done();
            });

            it('should reset logOnNewScheme while a new scheme comes', done => {
                const cacheMethod = log.swaninterface.invoke;
                log.swaninterface.invoke = (type, cb) => {
                    if (type === 'onMessage') {
                        cb({
                            type: 'sendLogMessage',
                            value: {
                                perfLogList: [{
                                    actionId: 'other',
                                    timestamp: currentTimestamp
                                }, {
                                    actionId: 'slave_first_rendered',
                                    timestamp: currentTimestamp
                                }]
                            }
                        });
                    }

                };

                Log.logOnNewScheme = true;
                log.logEventsSpecialListener(role);

                expect(Log.logOnNewScheme).toEqual(false);

                log.swaninterface.invoke = cacheMethod;
                done();
            });

            it('should reset logMessageSended routeId while is has routeId from slave', done => {
                const cacheMethod = log.swaninterface.invoke;
                log.swaninterface.invoke = (type, cb) => {
                    if (type === 'onMessage') {
                        cb({
                            type: 'sendLogMessage',
                            value: {
                                perfLogList: [{
                                    actionId: 'other',
                                    timestamp: currentTimestamp
                                }, {
                                    actionId: 'slave_first_rendered',
                                    timestamp: currentTimestamp
                                }],
                                routeId: '1'
                            }
                        });
                    }

                };

                Log.logOnNewScheme = false;
                log.logEventsSpecialListener(role);

                expect(Log.logMessageSended).toEqual(true);

                log.swaninterface.invoke = cacheMethod;
                done();
            });

            it('should not add preload log while is has routeId from slave and logOnNewScheme is true', done => {
                const cacheMethod = log.swaninterface.invoke;
                log.swaninterface.invoke = (type, cb) => {
                    if (type === 'onMessage') {
                        cb({
                            type: 'sendLogMessage',
                            value: {
                                perfLogList: [{
                                    actionId: 'other',
                                    timestamp: currentTimestamp
                                }, {
                                    actionId: 'slave_first_rendered',
                                    timestamp: currentTimestamp
                                }],
                                routeId: '1'
                            }
                        });
                    }

                };

                Log.logOnNewScheme = true;
                Log.perfLogList.__list = [];
                log.logEventsSpecialListener(role);

                expect(Log.logOnNewScheme).toEqual(false);
                expect(Log.perfLogList.__list.length).toEqual(2);

                log.swaninterface.invoke = cacheMethod;
                done();
            });

            it('should reset logMessageSended while return parameter type is sendLogMessage and never send', done => {
                const cacheMethod = log.swaninterface.invoke;

                log.swaninterface.invoke = (type, cb) => {
                    if (type === 'onMessage') {
                        cb({
                            type: 'sendLogMessage',
                            value: {
                                perfLogList: [{
                                    actionId: 'other',
                                    timestamp: currentTimestamp
                                }, {
                                    actionId: 'slave_first_rendered',
                                    timestamp: currentTimestamp
                                }]
                            }
                        });
                    }

                };

                Log.logMessageSended = true;
                Log.logOnNewScheme = false;
                log.logEventsSpecialListener(role);

                expect(Log.logMessageSended).toEqual(true);

                log.swaninterface.invoke = cacheMethod;
                done();
            });
        });

        describe('slave', () => {
            beforeEach(() => {
                Log.perfLogList.__list.length = [];
            });

            const role = 'slave';

            it('should add perfLogList while the dispatchEvent message is initData', done => {

                log.logEventsSpecialListener(role);

                dispatchEvent(document, 'message', {
                    message: 'initData'
                });
                done();
            });

            it('should add perfLogList while the dispatchEvent message is not initData', done => {
                log.logEventsSpecialListener(role);

                dispatchEvent(document, 'message', {
                    message: 'other-stage'
                });
                done();
            });

            it('should add perfLogList while the dispatchEvent message is not initData and _naSwan is document', done => {
                window.swanGlobal = true;
                window._naSwan = document; // only use this test
                log.logEventsSpecialListener(role);

                dispatchEvent(document, 'message', {
                    message: 'other-stage'
                });
                done();
            });
        });

        it('sendDataToMaster', done => {
            const cacheMethod = log.swaninterface.invoke;

            log.swaninterface.invoke = (type, slaveId, params) => {
                expect(type).toEqual('postMessage');
                expect(slaveId).toEqual('master');
                expect(params.type).toEqual('sendLogMessage');
                expect(params.value.from).toEqual('slave');
            };

            const type = 'sendLogMessage';

            log.sendDataToMaster(type, {
                from: 'slave'
            });

            log.swaninterface.invoke = cacheMethod;
            done();
        });

        describe('performance Log', () => {
            it('should add action will be caught while log was not sent and log was repeat', done => {

                Log.perfLogList.__list = [{
                    actionId: 'test log was repeat',
                    timestamp: currentTimestamp
                }];

                Log.logMessageSended = false;

                Log.perfLogList.add('test log was repeat');

                expect(Log.perfLogList.__list.length).toEqual(1);

                done();
            });
        });
    });
});
