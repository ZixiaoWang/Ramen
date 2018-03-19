"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Is_1 = require("../Utils/Is");
var BufferFactory = /** @class */ (function () {
    function BufferFactory() {
        this.$$writePosition = 0;
        this.endian = exports.ENDIAN.BIG;
        this.$body = new DataView(new ArrayBuffer(0));
        this.$protocal = 0;
        this.$sequence = 0;
    }
    BufferFactory.prototype.setEndian = function (endian) {
        this.endian = !!endian;
    };
    BufferFactory.prototype.setProtocal = function (protocal) {
        if (Is_1.is(protocal).number()) {
            this.$protocal = protocal;
            this.$isProtocalSet = true;
            return this;
        }
        else {
            throw new Error('Procotol must be a long int type (4 bytes)');
        }
    };
    BufferFactory.prototype.setSequence = function (sequence) {
        if (Is_1.is(sequence).number()) {
            this.$sequence = sequence;
            this.$isSequenceSet = true;
            return this;
        }
        else {
            throw new Error('Sequence must be a long int type (4 bytes)');
        }
    };
    BufferFactory.prototype.writeBoolean = function (bool) {
        if (Is_1.is(bool).boolean()) {
            var booleanValue = bool ? 1 : 0;
            this.$extend(exports.EGRET_TYPE.BOOLEAN);
            this.$body.setInt8(this.$$writePosition, booleanValue);
            return this;
        }
        else {
            throw new Error(typeof bool + " cannot be taken, argument must be a boolean type value");
        }
    };
    BufferFactory.prototype.writeShort = function (short) {
        if (Is_1.is(short).int16()) {
            this.$extend(exports.EGRET_TYPE.SHORT);
            this.$body.setInt16(this.$$writePosition, short, this.endian);
            return this;
        }
        else {
            throw new Error("argument must be a short int (2 bytes)");
        }
    };
    BufferFactory.prototype.writeUshort = function (uShort) {
        if (Is_1.is(uShort).uint16()) {
            this.$extend(exports.EGRET_TYPE.USHORT);
            this.$body.setUint16(this.$$writePosition, uShort, this.endian);
            return this;
        }
        else {
            throw new Error("argument must be an unsighed short int (2 bytes)");
        }
    };
    BufferFactory.prototype.writeInt = function (integer) {
        if (Is_1.is(integer).int32()) {
            this.$extend(exports.EGRET_TYPE.INT);
            this.$body.setInt32(this.$$writePosition, integer, this.endian);
            return this;
        }
        else {
            throw new Error("argument must be a long int (4 bytes)");
        }
    };
    BufferFactory.prototype.writeUint = function (uInteger) {
        if (Is_1.is(uInteger).uint32()) {
            this.$extend(exports.EGRET_TYPE.UINT);
            this.$body.setUint32(this.$$writePosition, uInteger, this.endian);
            return this;
        }
        else {
            throw new Error("argument must be a long int (4 bytes)");
        }
    };
    BufferFactory.prototype.writeFloat = function (float) {
        this.$extend(exports.EGRET_TYPE.FLOAT);
        this.$body.setFloat32(this.$$writePosition, float, this.endian);
        return this;
    };
    BufferFactory.prototype.writeDouble = function (double) {
        this.$extend(exports.EGRET_TYPE.DOUBLE);
        this.$body.setFloat64(this.$$writePosition, double, this.endian);
        return this;
    };
    BufferFactory.prototype.writeString = function (str) {
        var _this = this;
        if (Is_1.is(str).string()) {
            str.split('').forEach(function (char) {
                _this.$extend(exports.EGRET_TYPE.BYTE);
                _this.$body.setInt8(_this.$$writePosition, char.charCodeAt(0));
            });
            return this;
        }
        else {
            throw new Error("argument must be a string");
        }
    };
    BufferFactory.prototype.writeObject = function (object) {
        var objectInString = JSON.stringify(object);
        return this.writeString(objectInString);
    };
    BufferFactory.prototype.getProtocal = function () {
        return this.$protocal;
    };
    BufferFactory.prototype.getLength = function () {
        return this.$body.byteLength + 12;
    };
    BufferFactory.prototype.getSequence = function () {
        return this.$sequence;
    };
    BufferFactory.prototype.getBody = function () {
        return this.$body;
    };
    BufferFactory.prototype.done = function () {
        var bodyInt8Array = new Int8Array(this.$body.buffer);
        var outputInt8Array = new Int8Array(this.$body.byteLength + 12);
        outputInt8Array.set(bodyInt8Array, 12);
        var outputDataView = new DataView(outputInt8Array.buffer);
        outputDataView.setInt32(0, this.$protocal, this.endian);
        outputDataView.setInt32(4, this.$body.byteLength + 12, this.endian);
        outputDataView.setInt32(8, this.$sequence, this.endian);
        this.$body = new DataView(new ArrayBuffer(0));
        this.$protocal = 0;
        this.$sequence = 0;
        this.$$writePosition = 0;
        return outputDataView.buffer;
    };
    /**
     * Extend buffer size,
     * @param length {number}
     * @returns {boolean}
     */
    BufferFactory.prototype.$extend = function (length) {
        if (length < 0) {
            throw new Error('Extending buffer must require a positive number or 0 as argument');
        }
        this.$$writePosition = this.$body.byteLength;
        var totalByteLength = this.$body.byteLength + length;
        var oldInt8Array = new Int8Array(this.$body.buffer);
        var newInt8Array = new Int8Array(totalByteLength);
        newInt8Array.set(oldInt8Array, 0);
        this.$body = new DataView(newInt8Array.buffer);
        return true;
    };
    return BufferFactory;
}());
exports.BufferFactory = BufferFactory;
exports.ENDIAN = {
    BIG: false,
    LITTLE: true
};
exports.EGRET_TYPE = {
    BOOLEAN: 1,
    BYTE: 1,
    SHORT: 2,
    USHORT: 2,
    INT: 4,
    UINT: 4,
    FLOAT: 4,
    DOUBLE: 8
};
/**
 * TYPE     BYTE_LENGTH
 * -------------------------
 * boolean  1
 * byte     1
 * short    2
 * ushort   2
 * int      4
 * uint     4
 * float    4
 * double   8
 */ 
