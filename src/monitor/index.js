/**
 * @file swan's monitor.js
 * @author lijiahui(lijiahui02@baidu.com)
 */

/* globals _naSwan isMaster */
var isV8 = typeof swanGlobal === 'undefined' ? false : true;

// js超时上报设定(即前端白屏)
var JS_RENDER_TIMEOUT = 3000;

// 671稳定性打点逻辑
(function (global) {
    // 获取宿主操作系统版本
    var os = navigator.userAgent.match(/(Android);?[\s/]+([\d.]+)?|Baidu; P1/) ? 'Android' : 'iOS';

    global['_bdbox_js_xxxx'] = function () {};

    var iOSMethod = function (scheme) {
        // 增加bridge兼容 没有BBAMNPJSBridge的时候用bridge
        if (isV8 && _naSwan && _naSwan.BBAMNPJSBridge) {
            _naSwan.BBAMNPJSBridge.postMessage(scheme);
        }
        else if (isV8) {
            _naSwan.bridge.postMessage(scheme);
        }
        else if (global.webkit
            && global.webkit.messageHandlers
            && global.webkit.messageHandlers.BBAMNPJSBridge
        ) {
            global.webkit.messageHandlers.BBAMNPJSBridge.postMessage(scheme);
        }
        else {
            global.webkit.messageHandlers.bridge.postMessage(scheme);
        }
    };

    // 不依赖框架的上报方式归类
    var reporter = {
        // iOS上报方法
        iOS: function (params) {
            var scheme = global._envVariables.scheme
                + '://utils?action=ubcReport&params='
                + encodeURIComponent(JSON.stringify(params))
                + '&func=_bdbox_js_xxxx&minver=7.3.0.0';
            iOSMethod(scheme);
        },
        // ios开源上报
        iosOpen: function (params) {
            let scheme = global._envVariables.scheme
                + '://swanAPI/openStatisticEvent?params='
                + encodeURIComponent(JSON.stringify(params));
            iOSMethod(scheme);
        },

        // Android上报方法
        android: function (params) {
            var bdboxAndroidUtils = global.Bdbox_android_utils;
            try {
                if (isV8) {
                    return _naSwan.Bdbox_android_utils.ubcEvent(JSON.stringify(params));
                } else if (bdboxAndroidUtils && bdboxAndroidUtils.ubcEvent) {
                    return bdboxAndroidUtils.ubcEvent.apply(bdboxAndroidUtils, [JSON.stringify(params)]);
                } else {
                    return global.prompt('BdboxApp:' + JSON.stringify({
                        obj: 'Bdbox_android_utils',
                        func: 'ubcEvent',
                        args: [JSON.stringify(params)]
                    }));
                }
            } catch (e) {
                return {};
            }
        },
        // Android开源上报
        androidOpen: function (params) {
            let scheme = global._envVariables.scheme
                + '://swanAPI/openStatisticEvent?params='
                + encodeURIComponent(JSON.stringify(params))
                + '&callback=_bdbox_js_xxxx';

            let androidJsBridge = window.Bdbox_android_jsbridge || _naSwan.Bdbox_android_jsbridge;

            try {
                if (androidJsBridge && androidJsBridge.dispatch) {
                    androidJsBridge.dispatch(scheme);
                }
            } catch (e) {
                return {};
            }
        },
        // ubc流式点上报
        androidUbcFlow: function (scheme) {
            var androidJsBridge = global.Bdbox_android_jsbridge || _naSwan.Bdbox_android_jsbridge;

            if (androidJsBridge && androidJsBridge.dispatch) {
                androidJsBridge.dispatch(scheme);
            } else {
                var re = global.prompt('BdboxApp:' + JSON.stringify({
                    obj: 'Bdbox_android_jsbridge',
                    func: 'dispatch',
                    args: [scheme]
                }));
                return re;
            }
        }
    };

    // ubc流式上报
    var ubcFlow = function (params) {
        var scheme = global._envVariables.scheme
                + '://swanAPI/ubcFlowJar?params='
                + encodeURIComponent(JSON.stringify(params))
                + '&callback=_bdbox_js_xxxx';

        if (os === 'Android') {
            reporter.androidUbcFlow(scheme);
        } else {
            iOSMethod(scheme);
        }
    };

    var swanInvokeLogMonitor = (function () {
        var sendLog = false;
        var errorList = [];
        return {
            log: function () {
                if (!sendLog) {
                    sendLog = true;
                    var newestError = errorList.pop() || {
                        eventId: 'nreach',
                        errorType: 'swan_error',
                        timeStamp: Date.now() + ''
                    };
                    ubcFlow('Android', {
                        flowId: 772,
                        data: [newestError]
                    });
                }
            },
            add: function (type) {
                errorList.push({
                    eventId: 'nreach',
                    errorType: type || 'swan_error',
                    timeStamp: Date.now() + ''
                });
            }
        };
    })();

    // 671对于错误的统计上报
    var globalSwan = isV8 ? _naSwan : global;
    globalSwan.addEventListener('error', function (e) {
        try {
            // v8/jsc 错误信息解析
            var message = e.message || '';
            var messageDeconstruct = message.split('\n');
            e.msg = messageDeconstruct.shift() || '';
            e.trace = messageDeconstruct.join('\n') || '';
            var errorTrace = e.trace || ''; // v8 error trace
            var errorMsg = e.msg || ''; // v8 error message
            var errorFilename = ''; // 报错文件名，从trace中反解
            var errorLine = 0; // 报错行数，从trace中反解
            var errorCol = 0; // 报错列数，从trace中反解
            var errorType = e.msg.split(':')[0] || ''; // 错误类型，从msg中反解
            var topTraceMsg = e.trace.split('\n')[1] || '';
            var topTraceMsgMatch = topTraceMsg.match(/\((.*)\)|@(.*)$/);
            if (topTraceMsgMatch && topTraceMsgMatch.length >= 2) {
                var matchList = (topTraceMsgMatch[1] || topTraceMsgMatch[2]).split(':');
                errorFilename = matchList[0] || '';
                errorLine = matchList[1] || 0;
                errorCol = matchList[2] || 0;
            }

            // 上传的参数
            var params = {
                actionId: '671',
                value: ''
            };

            // 开源参数
            var logParams = {
                groupId: '6',
                bizId: '18',
                swanType: 'swan',
                eventName: 'js_error',
                smartAppId: global.monitorAppid || '',
                swanCoreVersion: global.swanVersion || '',
                content: '',
                propagation: ''
            };

            // 对错误开源系统的区分 Android（2006）  iOS（1006）
            var xcxErrorType = '';
            if (os === 'Android') {
                params['min_v'] = '44303744';
                xcxErrorType += '2006';
            } else {
                params['context'] = {};
                xcxErrorType += '1006';
            }

            // 对错误来源的区分 true（框架）  false（业务）
            var errorFile = e.filename || errorFilename || '';
            if (errorFile === '' || errorFile.indexOf('./index.js') >= 0) {
                xcxErrorType += '0022';
            } else {
                xcxErrorType += '0023';
            }

            // 错误收集
            if (os === 'Android') {
                if (xcxErrorType.indexOf('0022') >= 0) {
                    swanInvokeLogMonitor.add('swan_error');
                } else {
                    swanInvokeLogMonitor.add('develop_error');
                }
            }

            params['value'] = {
                from: 'swan',
                type: xcxErrorType,
                page: 'js_error',
                value: '',
                source: 'h5',
                ext: {
                    appid: global.monitorAppid || '',
                    info: {
                        from: global.isMaster ? 'master' : 'slave',
                        swan: global.swanVersion || '',
                        appVersion: global.appVersion || '',
                        url: e.filename || errorFilename || '',
                        message: e.msg || e.message || '',
                        line: e.lineno || errorLine || 0,
                        col: e.colno || errorCol || 0,
                        stack: e.error && e.error.stack || e.trace || '',
                        time: e.timeStamp || Date.now() || '',
                        type: e.type || errorType || ''
                    }
                }
            };
            logParams['content'] = {
                'errcode': xcxErrorType,
                'ext': {
                    'info': {
                        from: isMaster ? 'master' : 'slave',
                        url: e.filename || errorFilename || '',
                        message: e.msg || e.message || '',
                        line: e.lineno || errorLine || 0,
                        col: e.colno || errorCol || 0,
                        stack: e.error && e.error.stack || e.trace || '',
                        time: e.timeStamp || Date.now() || '',
                        type: e.type || errorType || ''
                    }
                }
            };
            logParams['propagation'] = {
                'source': 'h5'
            };

            var jsTraceErrorUbcParams = {
                actionId: 'js_error',
                timeStamp: Date.now() + '',
                errorInfo: params.value.ext.info
            };

            // 将错误信息推入错误存储队列
            addErrorToStorer(jsTraceErrorUbcParams);

            if (os === 'Android') {
                reporter.android(params);
                reporter.androidOpen(logParams);
            } else {
                reporter.iOS(params);
                reporter.iosOpen(logParams);
            }

        } catch (e) {
            console.error(e);
        }
    });

    var globalDocument = isV8 ? _naSwan : document;

    // 收集所有报错信息
    var swanErrorList = [];

    var addErrorToStorer = function (errInfo) {
        swanErrorList.push(errInfo);
    };

    // NA检测到白屏, 通知前端将收集到的trace + error信息进行上报
    globalDocument.addEventListener('CollectTraceError', e => {
        var data = {
            type: 'feTraceError',
            trace: global._swanTraceList.pop() || {},
            error: swanErrorList.pop() || {}
        };

        // 白屏时, 将收集到的信息发给客户端
        ubcFlow({
            flowId: '671',
            data: [data]
        });
    });

    // 671对于白屏的统计上报
    globalDocument.addEventListener('AppReady', function (e) {
        var appConfig = e.appConfig;
        if (typeof appConfig === 'object') {
            global.appVersion = appConfig.version;
        } else if (appConfig !== undefined) {
            try {
                appConfig = JSON.parse(appConfig);
                global.appVersion = appConfig.version;
            } catch (e) {
                global.appVersion = '';
            }
        } else {
            global.appVersion = '';
        }
        setTimeout(function () {
            var endtime = global.rainMonitorEndtime;
            if (!endtime) {
                var params = {
                    actionId: '671',
                    value: ''
                };
                var logParams = {
                    groupId: '6',
                    bizId: '17',
                    swanType: 'swan',
                    eventName: 'jsRenderTimeOut',
                    smartAppId: global.monitorAppid || '',
                    swanCoreVersion: global.swanVersion || '',
                    content: '',
                    propagation: ''
                };
                var errorType = '';
                if (os === 'Android') {
                    params['min_v'] = '44303744';
                    errorType += '20060019';
                } else {
                    params['context'] = {};
                    errorType += '10060019';
                }
                params['value'] = {
                    from: 'swan',
                    type: errorType,
                    page: 'jsRenderTimeOut',
                    value: '',
                    source: 'h5',
                    ext: {
                        appid: global.monitorAppid || '',
                        info: {
                            from: 'master',
                            swan: global.swanVersion || '',
                            appVersion: global.appVersion || '',
                            url: '',
                            message: 'swan h5 blank page',
                            line: 0,
                            col: 0,
                            stack: '',
                            type: 'blanPageError'
                        }
                    }
                };
                logParams['content'] = {
                    'errcode': errorType,
                    'ext': {
                        'info': {
                            from: 'master',
                            url: '',
                            message: 'swan h5 blank page',
                            line: 0,
                            col: 0,
                            stack: '',
                            type: 'blanPageError'
                        }
                    }
                };
                logParams['propagation'] = {
                    'source': 'h5'
                };
                if (os === 'Android') {
                    reporter.android(params);
                    reporter.androidOpen(logParams);
                    swanInvokeLogMonitor.log();
                } else {
                    reporter.iOS(params);
                    reporter.iosOpen(logParams);
                }
            }
        }, JS_RENDER_TIMEOUT);
    });
})(window);