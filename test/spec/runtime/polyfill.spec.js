/**
 * @file atob.spec.js
 */

import './v8-globals';
import '../../../src/runtime/polyfill/atob';
import '../../../src/runtime/polyfill/btoa';

describe('v8 polyfill', () => {
    beforeAll(()=> {
        global._naSwan.userAgent = 'swan/2.4.0 swan-baiduboxapp/11.7.0.0 baiduboxapp/11.7.0.0 (Baidu; P2 12.1)';
    })
    it('atob return expected value', done => {
        let encodedData = 'SGVsbG9Xb3JsZA==';
        let encodedData2 = 'SGVsbG9Xb3JsZA';
        expect(global.atob(encodedData)).toEqual('HelloWorld');
        expect(global.atob(encodedData2)).toEqual('HelloWorld');
        done();
    });
    it('atob throw Error', done => {
        let invalidEncodedData = 'SGVsbG9X\nb3JsZA=='
        expect(function(){global.atob(invalidEncodedData)}).toThrow(new Error('Invalid base64 data'));
        done();
    });
    it('btoa return expected value', done => {
        let data = 'HelloWorld';
        expect(global.btoa(data)).toEqual('SGVsbG9Xb3JsZA==');
        done();
    });
});
