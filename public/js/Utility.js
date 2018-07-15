function UTILS_ArrayBufferToIntArray(buf) {
    var uint8arr = new Uint8Array(buf);
    var arr = new Uint8Array(uint8arr.length);

    for (var i = 0; i < arr.length; ++i) {
        arr[i] = uint8arr[i];
    }

    return arr;
}

function UTILS_WordArrayToIntArray(arr) {
    var buf = new Uint8Array(arr.length << 2);

    for (var i = 0, k = 0; i < arr.length; i++) {
        var mask = 0xff000000;
        var offset = 24;

        while(mask != 0) {
            buf[k++] = (arr[i] & mask) >>> offset;
            mask >>>= 8;
            offset -= 8;
        }
    }

    return buf;
}

function UTILS_IntArrayToString(arr) {
    return asmCrypto.bytes_to_string(arr, true);
}

function UTILS_IntArrayToHexString(arr) {
    return asmCrypto.bytes_to_hex(arr);
}

function UTILS_IntArrayToWordArray(arr) {
    var buf = new Uint8Array(arr.length >>> 2);

    for (var i = 0; i < arr.length; ++i) {
        var k = i >>> 2;
        buf[k] |= (arr[i] << ((3 - (i & 3)) << 3));
    }

    return buf;
}

function UTILS_IntArrayToArrayBuffer(arr) {
    var buf = new ArrayBuffer(arr.length);
    var bufView = new Uint8Array(buf);

    for (var i = 0; i < arr.length; ++i)
        bufView[i] = arr[i];

    return buf;
}

function UTILS_StringToIntArray(str) {
    return asmCrypto.string_to_bytes(str, true);
}

function UTILS_StringToHexString(str) {
    return asmCrypto.bytes_to_hex(asmCrypto.string_to_bytes(str, true));
}

function UTILS_HexStringToIntArray(str) {
    return asmCrypto.hex_to_bytes(str);
}

function UTILS_HexStringToWordArray(str) {
    return UTILS_IntArrayToWordArray(asmCrypto.hex_to_bytes(str));
}

function UTILS_ConcatIntArray() {
    var total = 0;
    for (var i = 0; i < arguments.length; ++i) {
        total += arguments[i].length;
    }

    var buf = new Uint8Array(total);
    for (var i = arguments.length - 1; i >= 0; --i) {
        buf.set(arguments[i], total -= arguments[i].length);
    }

    return buf;
}
