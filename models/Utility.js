module.exports={
	UTILS_ArrayBufferToIntArray:function (buf) {
		var uint8arr = new Uint8Array(buf);
		var arr = new Uint8Array(uint8arr.length);

		for (var i = 0; i < arr.length; ++i) {
			arr[i] = uint8arr[i];
		}

		return arr;
	},

	UTILS_WordArrayToIntArray:function (arr) {
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
	},

	UTILS_IntArrayToString:function (arr) {
		//return asm.bytes_to_string(arr, true);
		return new Buffer(arr).toString();
	},

	UTILS_IntArrayToHexString:function (arr) {
		//return asm.bytes_to_hex(arr);
		return new Buffer(arr).toString('hex');
	},

	UTILS_IntArrayToWordArray:function (arr) {
		var buf = new Uint8Array(arr.length >>> 2);

		for (var i = 0; i < arr.length; ++i) {
			var k = i >>> 2;
			buf[k] |= (arr[i] << ((3 - (i & 3)) << 3));
		}

		return buf;
	},

	UTILS_IntArrayToArrayBuffer:function (arr){
		var buf = new ArrayBuffer(arr.length);
		var bufView = new Uint8Array(buf);

		for (var i = 0; i < arr.length; ++i)
			bufView[i] = arr[i];

		return buf;
	},

	UTILS_StringToIntArray:function (str) {
		//return asm.string_to_bytes(str, true);
		return new Uint8Array(new Buffer(str,"utf8"));
	},

	UTILS_StringToHexString:function (str) {
		//return asm.bytes_to_hex(asm.string_to_bytes(str, true));
		return new Buffer(str,"utf8").toString('hex');
	},

	UTILS_HexStringToIntArray:function (str) {
		//return asm.hex_to_bytes(str);
		return new Uint8Array(new Buffer(str,"hex"));
	},

	UTILS_HexStringToWordArray:function (str) {
	//	return UTILS_IntArrayToWordArray(asm.hex_to_bytes(str));
		return UTILS_IntArrayToWordArray(module.exports.UTILS_HexStringToIntArray(str));
	},

	UTILS_ConcatIntArray:function () {
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
};