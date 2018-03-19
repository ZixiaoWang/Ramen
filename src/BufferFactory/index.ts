import { is } from '../Utils/Is';

export class BufferFactory {

    private $isProtocalSet: boolean;
    private $isSequenceSet: boolean;

    private $$writePosition: number = 0;
    private $body: DataView;
    private $protocal: number;
    private $sequence: number;
    private endian: boolean = ENDIAN.BIG;

    constructor() {
        this.$body = new DataView( new ArrayBuffer(0) );
        this.$protocal = 0;
        this.$sequence = 0;
    }

    public setEndian(endian: boolean) {
        this.endian = !! endian;
    }

    public setProtocal(protocal: number): BufferFactory {
        if(is(protocal).number()) {
            this.$protocal = protocal;
            this.$isProtocalSet = true;
            return this;
        }else{
            throw new Error('Procotol must be a long int type (4 bytes)');
        }
    }

    public setSequence(sequence: number) {
        if(is(sequence).number()) {
            this.$sequence = sequence;
            this.$isSequenceSet = true;
            return this;
        }else{
            throw new Error('Sequence must be a long int type (4 bytes)');
        }
    }

    public writeBoolean(bool: Boolean): BufferFactory {
        if(is(bool).boolean()) {
            let booleanValue = bool ? 1 : 0;
            this.$extend( EGRET_TYPE.BOOLEAN );
            this.$body.setInt8( this.$$writePosition, booleanValue );
            return this;
        } else {
            throw new Error(`${ typeof bool } cannot be taken, argument must be a boolean type value`);
        }
    }

    public writeShort(short: number): BufferFactory {
        if(is(short).int16()) {
            this.$extend( EGRET_TYPE.SHORT );
            this.$body.setInt16( this.$$writePosition, short, this.endian );
            return this;
        } else {
            throw new Error(`argument must be a short int (2 bytes)`);
        }
    }

    public writeUshort(uShort: number): BufferFactory {
        if(is(uShort).uint16()) {
            this.$extend( EGRET_TYPE.USHORT );
            this.$body.setUint16( this.$$writePosition, uShort, this.endian );
            return this;
        } else {
            throw new Error(`argument must be an unsighed short int (2 bytes)`);
        }
    }

    public writeInt(integer: number): BufferFactory {
        if(is(integer).int32()) {
            this.$extend( EGRET_TYPE.INT );
            this.$body.setInt32( this.$$writePosition, integer, this.endian );
            return this;
        } else {
            throw new Error(`argument must be a long int (4 bytes)`);
        }
    }

    public writeUint(uInteger: number): BufferFactory {
        if(is(uInteger).uint32()) {
            this.$extend( EGRET_TYPE.UINT );
            this.$body.setUint32( this.$$writePosition, uInteger, this.endian );
            return this;
        } else {
            throw new Error(`argument must be a long int (4 bytes)`);
        }
    }

    public writeFloat(float: number): BufferFactory {
        this.$extend( EGRET_TYPE.FLOAT );
        this.$body.setFloat32( this.$$writePosition, float, this.endian );
        return this;
    }

    public writeDouble(double: number) {
        this.$extend( EGRET_TYPE.DOUBLE );
        this.$body.setFloat64( this.$$writePosition, double, this.endian );
        return this;
    }

    public writeString(str: string) {
        if(is(str).string()){
            str.split('').forEach(char => {
                this.$extend( EGRET_TYPE.BYTE );
                this.$body.setInt8( this.$$writePosition, char.charCodeAt(0) );
            });
            return this;
        } else {
            throw new Error(`argument must be a string`);
        }
    }

    public writeObject(object: Object) {
        let objectInString = JSON.stringify(object);
        return this.writeString( objectInString );
    }

    public getProtocal(): number {
        return this.$protocal;
    }

    public getLength(): number {
        return this.$body.byteLength + 12;
    }

    public getSequence(): number {
         return this.$sequence;
    }

    public getBody(): DataView {
        return this.$body;
    }

    public done(): ArrayBuffer {
        let bodyInt8Array = new Int8Array( this.$body.buffer );
        let outputInt8Array = new Int8Array( this.$body.byteLength + 12 );
        outputInt8Array.set( bodyInt8Array, 12 );
        let outputDataView = new DataView( outputInt8Array.buffer );

        outputDataView.setInt32( 0, this.$protocal, this.endian );
        outputDataView.setInt32( 4, this.$body.byteLength + 12, this.endian );
        outputDataView.setInt32( 8, this.$sequence, this.endian );

        this.$body = new DataView( new ArrayBuffer(0) );
        this.$protocal = 0;
        this.$sequence = 0;
        this.$$writePosition = 0;

        return outputDataView.buffer;
    }


    /**
     * Extend buffer size, 
     * @param length {number}
     * @returns {boolean}
     */
    private $extend( length: number ): boolean {

        if( length < 0 ){
            throw new Error('Extending buffer must require a positive number or 0 as argument');
        }

        this.$$writePosition = this.$body.byteLength;

        let totalByteLength = this.$body.byteLength + length;
        let oldInt8Array = new Int8Array( this.$body.buffer );
        let newInt8Array = new Int8Array( totalByteLength );
        
        newInt8Array.set( oldInt8Array, 0 );
        this.$body = new DataView( newInt8Array.buffer );

        return true;
    }
}

export interface TypedArray extends Int8Array {}
export const ENDIAN = {
    BIG: false,
    LITTLE: true
}
export const EGRET_TYPE = {
    BOOLEAN:        1,
    BYTE:           1,
    SHORT:          2,
    USHORT:         2,
    INT:            4,
    UINT:           4,
    FLOAT:          4,
    DOUBLE:         8
}

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