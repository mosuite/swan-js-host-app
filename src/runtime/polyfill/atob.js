/**
 * @file runtime/popyfill/atob.js
 * @author haoran
 * @desc atob方法polyfill
 */


/* globals _naSwan */
const swanGlobal = Function('return this')();

swanGlobal.atob = _naSwan.atob = function atob(input) {

    let keys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let keysRe = new RegExp('[^' + keys + ']');
    let output = [];
    let buffer;
    let bufferB;
    let chrs;
    let index = 0;
    let indexB;
    let length = input.length;

    if ((keysRe.test(input)) || (/=/.test(input) && (/=[^=]/.test(input) || /={3}/.test(input)))) {
        throw new Error('Invalid base64 data');
    }

    if (length % 4 > 0) {
        input += Array(4 - length % 4 + 1).join('=');
        length = input.length;
    }

    while (index < length) {
        for (bufferB = [], indexB = index; index < indexB + 4;) {
            bufferB.push(keys.indexOf(input.charAt(index++)));
        }

        buffer = (bufferB[0] << 18) + (bufferB[1] << 12) + ((bufferB[2] & 63) << 6) + (bufferB[3] & 63);

        let chrs1 = (buffer & (255 << 16)) >> 16;
        let chrs2 = bufferB[2] === 64 ? -1 : (buffer & (255 << 8)) >> 8;
        let chrs3 = bufferB[3] === 64 ? -1 : buffer & 255;

        chrs = [chrs1, chrs2, chrs3];

        for (indexB = 0; indexB < 3; ++indexB) {
            if (chrs[indexB] >= 0 || indexB === 0) {
                output.push(String.fromCharCode(chrs[indexB]));
            }
        }
    }

    return output.join('');
};