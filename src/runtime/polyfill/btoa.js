/**
 * @file runtime/popyfill/btoa.js
 * @author haoran
 * @desc btoa方法polyfill
 */

/* globals _naSwan */

const swanGlobal = Function('return this')();

swanGlobal.btoa = _naSwan.btoa = function btoa(input) {
    let keys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let keysRe = new RegExp('[^' + keys + ']');
    let output = [];
    let buffer;
    let chrs;
    let index = 0;
    let length = input.length;

    while (index < length) {
        chrs = [input.charCodeAt(index++), input.charCodeAt(index++), input.charCodeAt(index++)];

        buffer = (chrs[0] << 16) + ((chrs[1] || 0) << 8) + (chrs[2] || 0);

        output.push(
            keys.charAt((buffer & (63 << 18)) >> 18),
            keys.charAt((buffer & (63 << 12)) >> 12),
            keys.charAt(isNaN(chrs[1]) ? 64 : (buffer & (63 << 6)) >> 6),
            keys.charAt(isNaN(chrs[2]) ? 64 : (buffer & 63))
        );
    }

    return output.join('');
};