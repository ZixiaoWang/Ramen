export function is(arg: any) {

    return {

        int8(): boolean {
            return (
                typeof arg === 'number' &&
                arg >= -127 &&
                arg <= 127
            );
        },
        uint8(): boolean {
            return (
                typeof arg === 'number' &&
                arg >= 0 &&
                arg <= 255
            );
        },
        int16(): boolean {
            return (
                typeof arg === 'number' &&
                arg >= -32768 &&
                arg <= 32767
            );
        },
        uint16(): boolean {
            return (
                typeof arg === 'number' &&
                arg >= 0 &&
                arg <= 65535
            );
        },
        int32(): boolean {
            return (
                typeof arg === 'number' &&
                arg >= -2147483648 &&
                arg <= 2147483647
            );
        },
        uint32(): boolean {
            return (
                typeof arg === 'number' &&
                arg >= 0 &&
                arg <= 4294967295
            );
        },

        number(): boolean {
            return typeof arg === 'number';
        },
        boolean(): boolean {
            return typeof arg === 'boolean';
        },
        string(): boolean {
            return typeof arg === 'string';
        }
    }
}