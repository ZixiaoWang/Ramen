"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function is(arg) {
    return {
        int8: function () {
            return (typeof arg === 'number' &&
                arg >= -127 &&
                arg <= 127);
        },
        uint8: function () {
            return (typeof arg === 'number' &&
                arg >= 0 &&
                arg <= 255);
        },
        int16: function () {
            return (typeof arg === 'number' &&
                arg >= -32768 &&
                arg <= 32767);
        },
        uint16: function () {
            return (typeof arg === 'number' &&
                arg >= 0 &&
                arg <= 65535);
        },
        int32: function () {
            return (typeof arg === 'number' &&
                arg >= -2147483648 &&
                arg <= 2147483647);
        },
        uint32: function () {
            return (typeof arg === 'number' &&
                arg >= 0 &&
                arg <= 4294967295);
        },
        number: function () {
            return typeof arg === 'number';
        },
        boolean: function () {
            return typeof arg === 'boolean';
        },
        string: function () {
            return typeof arg === 'string';
        }
    };
}
exports.is = is;
