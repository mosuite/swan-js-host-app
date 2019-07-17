/**
 * @file mock swan-js-api
 * @author lvlei(lvlei03@baidu.com)
 */

import {noop} from '../../utils';

export const swan = {
    getNetworkType(networkType = 'wifi') {
        return obj => {
            obj.success && obj.success({
                networkType
            });
        };
    },

    loadSubPackage(params) {
        window.loadSubPackageParams = params;
    },

    createCanvasContext(...args) {
        return args;
    },

    navigateTo(params) {
        return params.url.cb();
    },
    redirectTo(params) {
        return params.url.cb();
    },
    switchTab(params) {
        return params.url.cb();
    },
    reLaunch(params) {
        return params.url.cb();
    },
    navigateBack(params) {
        return params;
    },
    openShare(params) {
        return params;
    }
};

export const swaninterface = {
	handlerQueue: [],
	loadJsQueue: {},
	boxjs:{
		data:{
			get({name}) {
                if (name === 'swan-appInfoSync') {
                    return {
                        appid: '123456',
                        cuid: 'thisiscuidmocker',
                        scene: 'mockscene',
                        query: 'from=mock',
                        path: 'mockpath',
                        shareTicket: 'mockshareticket',
                        srcAppId: 'mockSrcAppId',
                        referrerInfo: 'mockReferrerInfo'
                    }
                }
			}
        },
        device: {
            systemInfo({type}) {
                if (type === 'sync') {
                    return {
                        SDKVersion: '1.2.0'
                    }
                }
            }
        },
		log(params) {
            return params;
        },
        platform: {
            versionCompare: noop,
            boxVersion: noop
        },
        extend(obj) {
            Object.assign(swaninterface, obj);
        },
        sendAndStopRecordingBootstrapLog() {}
	},
	swan:{
        request: noop,
        login(params) {
            return params;
        },
        createSelectorQuery(){
            return {
                in: ()=>{return {}}
            };
        },
        createIntersectionObserver(){
            return {};
        },
        getSystemInfoSync() {
            return {
                SDKVersion: '3.10.1',
                model: 'M623c',
                system: 'iOS',
                version: '11.3.6.0'
            }
        }
    },
	communicator: {
		fireMessage: noop
	},
	bind(type, cb) {
        document.addEventListener(type, cb, false);
        return this;
    },
    unbind(type, cb) {
        document.removeEventListener(type, cb, false);
        return this;
    },
    loadJs(params) {
        params.success && params.success();
        return Promise.resolve('loadJs')
    },
	invoke(type, ...args) {
        return this[type] && this[type](...args);
    },
    navigateTo(params) {
        const cbParams = {
            wvID: '233'
        };
        if (params.root) {
            cbParams.root = 'assets';
        }
        params.success && params.success(cbParams);
        params.complete && params.complete();
    },
    navigateBack(params) {
        return new Promise((resolve, reject) => {
            params.thenable ? resolve() : reject();
        });
    },
    switchTab(params = {}) {
        params.success && params.success({});
        return Promise.resolve({});
    },
    reLaunch(params) {
        const cbParams = {
            wvID: '234'
        };
        if (params.hasRoot) {
            cbParams.root = 'assets';
        }
        if (params.status === 'success') {
            params.success && params.success({
                ...cbParams,
                resVal: 'success'
            });
        } else {
            params.fail && params.fail(cbParams);
        }
        params.complete && params.complete(cbParams);
    },
    redirectTo(params) {
        const cbParams = {
            wvID: '235'
        };
        if (params.hasRoot) {
            cbParams.root = 'assets';
        }
        if (params.status === 'success') {
            params.success && params.success({
                ...cbParams,
                resVal: 'success'
            });
        } else {
            params.fail && params.fail(cbParams);
        }
        params.complete && params.complete(cbParams);
    },
    onRoute(cb) {
        cb({
            routeType: 'init',
            fromId: 0,
            toId: 1,
            toPage: '/mock/one',
            toTabIndex: 1
        });
    },
	adaptMaster: noop,
	bindSlaveLoadedEvents: noop,
    getAppConfig: noop,
	init: noop,
    postMessage(slaveId, message) {
        if (slaveId === 'master') {
            return false;
        } else {
            return '123';
        }
    },
    onMessage(cb) {
        cb({
            type: 'slavePageComponentAttached'
        });
        return this;
    }
};