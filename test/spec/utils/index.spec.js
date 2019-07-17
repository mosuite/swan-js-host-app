/**
 * @file util test case
 */

import {uniqArray, getABSwitchValue} from '../../../src/utils';

describe('utils', () => {

    beforeAll(function () {
        window._envVariables = {};
        window._envVariables.abTestSwitch = {
            'swanswitch_test': 1
        };
    });

    afterAll(function () {
        window._envVariables = {};
    });

    it('uniqArray', done => {
        const originArray = [1, 1, 2, 3, 4, 5, 5];

        const res = uniqArray(originArray);

        expect(res.length).toEqual(5);
        expect(res[1]).toEqual(2);
        expect(res[4]).toEqual(5);
        done();
    });

    it('getABTestValue', done => {
        let value = getABSwitchValue('swanswitch_test');
        expect(value).toEqual(1);
        done();
    });


    it('getABTestValue error in webview', done => {
        window._envVariables = {};
        let value = getABSwitchValue('swanswitch_test');
        expect(value).toEqual(undefined);
        done();
    });
});

describe('utils in v8 environment', () => {
    beforeAll(function () {
        window.swanGlobal = {};
        window._naSwan = {};
        window._naSwan.env = {};
        window._naSwan.env.config = {};
        window._naSwan.env.config.abTestSwitch = {
            'swanswitch_test': 1
        };
    });

    afterAll(function () {
        window._naSwan = {};
        window.swanGlobal = undefined;
    });

    it('getABTestValue in v8', done => {
        let value = getABSwitchValue('swanswitch_test');
        expect(value).toEqual(1);
        done();
    });

    it('getABTestValue error in v8', done => {
        window._naSwan.env.config.abTestSwitch = undefined;
        let value = getABSwitchValue('swanswitch_test');
        window._naSwan.env.config.abTestSwitch = {
            'swanswitch_test': 1
        };
        expect(value).toEqual(undefined);
        done();
    });
});
