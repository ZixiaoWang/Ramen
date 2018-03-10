declare module 'js-crc' {
    export function crc16(arg: string | Array<any> | Uint8Array | ArrayBuffer): string;
    export function crc32(arg: string | Array<any> | Uint8Array | ArrayBuffer): string;
}