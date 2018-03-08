# BufferFactory

### Description
**Author**: Jacky Wang  
**Date**:   2018-02-27  

用於模擬服務器端傳回的二進制數據  
字節數超過兩個字節時，默認用小段字節序（Little Endian）寫入  
數據結構  
```
[ [Procotol] [Length] [Sequence] [BODY] ]
```
### Example
```javascript
    var bufferFactory = new BufferFactory();
    var buffer = bufferFactory
                    .setProtocal(0x21004)
                    .setSequence(100)
                    .writeInt(134)
                    .writeBoolean(true)
                    .writeString("Hello World")
                    .done();
    var int8Array = new Int8Array(buffer).toString();

    // [0,2,16,4,0,0,0,28,0,0,0,100,0,0,0,-122,1,72,101,108,108,111,32,87,111,114,108,100]
```


### APIs
* [setProtocol( protocol: int32 )](#setProtocal)
* [setSequence( sequence: int32 )](#setSequence)
* [setEndian( endian: boolean )](#setEndian)
* [writeBoolean( bool: boolean )](#writeBoolean)
* [writeShort( val: int16 )](#writeShort)
* [writeUshort( val: uint16 )](#writeUshort)
* [writeInt( val: int32 )](#writeInt)
* [writeUint( val: uint32 )](#writeUint)
* [writeFloat( val: float32 )](#writeFloat)
* [writeDouble( val: float64 )](#writeDouble)
* [writeString( str: string )](#writeString)
* [writeObject( object: Object )](#writeObject)
* [getProtocal()](#getProtocal)
* [getLength()](#getLength)
* [getSequence()](#getSequence)
* [getBody()](#getBody)
* [done()](#done)

### TODO
<small>_Please add todo here_</small>