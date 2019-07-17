import Statistics from '../../../src/log/statistics';
import {swaninterface} from '../../mock/swan-api';
import {catchTips} from '../../utils';

const statistics = new Statistics(swaninterface);

describe('Statistics', () => {
    it('should Statistics is a function', done => {
        expect(Statistics).toEqual(jasmine.any(Function));
        expect(statistics).toEqual(jasmine.any(Object));
        done();
    });

    describe('customComponentStatistics', () => {

        it('should call boxjs log after while this is customponent size statistics', done => {
            const cacheLogMethod = statistics.swaninterface.boxjs.log;
            const cacheDataMethod = statistics.swaninterface.boxjs.data;
            const cacheDeviceMethod = statistics.swaninterface.boxjs.device;

            let logParams;
            statistics.swaninterface.boxjs.log = params => {
                logParams =  params;
            };
            statistics.swaninterface.boxjs.data = {
                get: ()=>'11'
            };
            statistics.swaninterface.boxjs.device = {
                systemInfo: ()=>'11'
            }
            const pagesQueue = {
                pages: 'pages'
            };
            const virtualComponentFactory = {
                virtualClassInfo: {
                    'pages/index': {}
                }
            };
            const params = {
                customComponentsSizeInfo: {
                    index: '16k'
                }
            };
    
            statistics.customComponentStatistics(
                pagesQueue,
                virtualComponentFactory,
                params
            );
            const {
                name,
                data: {
                    actionId,
                    value
                }
            }  = logParams;

            expect(name).toEqual('ubcReport');
            expect(actionId).toEqual(875);
            expect(value.from).toEqual('swan');
            expect(value.type).toEqual('customsize');
            expect(value.ext.customComponentsSizeInfo.index).toEqual('16k');
            statistics.customComponentStatistics(
                {},
                virtualComponentFactory,
                params
            );
            console.log(logParams)
            statistics.swaninterface.boxjs.log = cacheLogMethod;
            statistics.swaninterface.boxjs.data = cacheDataMethod;
            statistics.swaninterface.boxjs.device = cacheDeviceMethod;
            done();
        });

        it('should call boxjs log after while this is statistics for page using customcomponent', done => {
            const cacheLogMethod = statistics.swaninterface.boxjs.log;

            let logParams;
            statistics.swaninterface.boxjs.log = params => {
                logParams =  params;
            }

            const pagesQueue = {
                pages1: {
                    usingComponents: ['custom']
                },
                pages2: {
                    usingComponents: []
                }
            };

            const virtualComponentFactory = {
                virtualClassInfo: {
                    'custom': {
                        componentProto: {
                            usingComponents: ['custom1']
                        }
                    },
                    'custom1': {
                        componentProto: {
                            usingComponents: []
                        }
                    }
                }
            };
    
            statistics.customComponentStatistics(
                pagesQueue,
                virtualComponentFactory
            );

            const {
                name,
                data: {
                    actionId,
                    value
                }
            }  = logParams;

            expect(name).toEqual('ubcReport');
            expect(actionId).toEqual(875);
            expect(value.from).toEqual('swan');
            expect(value.type).toEqual('');
            expect(value.ext.allPagesNum).toEqual(2);

            statistics.swaninterface.boxjs.log = cacheLogMethod;
            done();
        });

        it('should be caught when some error happened', done => {
            const cacheLogMethod = statistics.swaninterface.boxjs.log;

            statistics.swaninterface.boxjs.log = 'mockerr';

            const pagesQueue = {
                pages1: {
                    usingComponents: ['custom']
                },
                pages2: {
                    usingComponents: []
                }
            };

            const virtualComponentFactory = {
                virtualClassInfo: {
                    'custom': {
                        componentProto: {
                            usingComponents: ['custom1']
                        }
                    },
                    'custom1': {
                        componentProto: {
                            usingComponents: []
                        }
                    }
                }
            };

            catchTips();
    
            const res = statistics.customComponentStatistics(
                pagesQueue,
                virtualComponentFactory
            );

            expect(res).toBeUndefined();

            statistics.swaninterface.boxjs.log = cacheLogMethod;
            done();
        });
    });

    it('should call boxjs log after sendStageMessage be called', done => {
        const cacheLogMethod = statistics.swaninterface.boxjs.log;
        let stageMessageParams;

        statistics.swaninterface.boxjs.log = params => {
            stageMessageParams = params;
        };

        const stageLogList = [{
            actionId: 'masterPreloadEnd',
            timestamp: Date.now()
        }];
        statistics.sendStageMessage(stageLogList);

        const {
            name,
            data: {
                flowId,
                data
            }
        }  = stageMessageParams;

        expect(name).toEqual('ubcFlowJar');
        expect(flowId).toEqual('671');
        expect(data[0].flowId).toEqual(stageLogList[0].masterPreloadEnd);
        expect(data[0].timestamp).toEqual(stageLogList[0].timestamp);

        statistics.swaninterface.boxjs.log = cacheLogMethod;
        done();
    });

});