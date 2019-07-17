/**
 * @file utils
 * @author yangyang55(yangyang55@baidu.com)
 */

 /**
 * 数组去重
 *
 * @param {Array} originArray -去重的数组
 * @return {Array} temp -去重后的数组
 */
export const uniqArray = originArray => {
    let temp = [];
    let l = originArray.length;
    for (let i = 0; i < l; i++) {
        for (let j = i + 1; j < l; j++) {
            if (originArray[i] === originArray[j]) {
                i++;
                j = i;
            }
        }
        temp.push(originArray[i]);
    }
    return temp;
};

/* global _naSwan swanGLobal */
// 获取实验AB实验开关的值，开关值由端上传入
export const getABSwitchValue = name => {
    // V8与jsc环境
    if (typeof swanGlobal !== 'undefined'
        && _naSwan.env
        && _naSwan.env.config
        && _naSwan.env.config.abTestSwitch) {
        return _naSwan.env.config.abTestSwitch[name];
    }
    // webview上绑定之后的逻辑
    else if (window._envVariables
        && window._envVariables.abTestSwitch) {
        return window._envVariables.abTestSwitch[name];
    }
};