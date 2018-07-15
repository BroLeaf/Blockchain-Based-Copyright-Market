// define lengths
PFCCTR_Blocklen = 16;
PFCCTR_Keylen = 16;
var asm=require("asmcrypto.js");
var util=require('./Utility');
module.exports={

	PFCCTR_IncreaseCTR:function (ctr){
		for(var i = 0; i < PFCCTR_Blocklen; ++i){
			++ctr[i];
		}
	},

	PFCCTR_ArraysIdentical:function(a, b) {
		var i = a.length;
		if (i != b.length) return false;
		while (i--) {
			if (a[i] !== b[i]) return false;
		}
		return true;
	},

	PFCCTR_AESENC:function (data, key){
		var iv = asm.hex_to_bytes("00000000000000000000000000000000");
		return asm.AES_CBC.encrypt(data, key, false, iv);
	},

	PFCCTR_Encrypt:function (plaintext, key, iv){
    // param: in int[], in int[], inout int[]

    // preprocess the plaintext: padding
    var n_padding = (PFCCTR_Blocklen - plaintext.length % PFCCTR_Blocklen);
    var n_slices = (n_padding + plaintext.length) / PFCCTR_Blocklen;
    var padding = new Uint8Array(n_padding);
    for(var i = 0; i < n_padding; i++) padding[i] = n_padding;
    var pad_plaintext = util.UTILS_ConcatIntArray(plaintext, padding);

    // encryption
	var i = 0;
    var ciphertext = new Uint8Array(pad_plaintext.length + PFCCTR_Blocklen);
	var temp = iv.slice();
	temp = module.exports.PFCCTR_AESENC(temp, key);
    for(var j = 0; j < PFCCTR_Blocklen; ++j){
        ciphertext[i * PFCCTR_Blocklen + j] = pad_plaintext[i * PFCCTR_Blocklen + j] ^ temp[j];
    }
	module.exports.PFCCTR_IncreaseCTR(iv);

    for(i = 1; i < n_slices; ++i){
        temp = iv.slice();
        for(j = 0; j < PFCCTR_Blocklen; ++j){
            temp[j] = pad_plaintext[(i - 1) * PFCCTR_Blocklen + j] ^ temp[j];
        }
		temp = module.exports.PFCCTR_AESENC(temp, key);
        for(j = 0; j < PFCCTR_Blocklen; ++j){
            ciphertext[i * PFCCTR_Blocklen + j] = pad_plaintext[i * PFCCTR_Blocklen + j] ^ temp[j];
        }
		module.exports.PFCCTR_IncreaseCTR(iv);
    }

	i = n_slices;
	temp = iv.slice();
    for(j = 0; j < PFCCTR_Blocklen; ++j){
        temp[j] = pad_plaintext[(i - 1) * PFCCTR_Blocklen + j] ^ temp[j];
    }
	temp = module.exports.PFCCTR_AESENC(temp, key);
    for(j = 0; j < PFCCTR_Blocklen; ++j){
        ciphertext[i * PFCCTR_Blocklen + j] = temp[j];
	}
	module.exports.PFCCTR_IncreaseCTR(iv);

	return ciphertext;
},

	PFCCTR_Decrypt:function (ciphertext, key, iv){
		// param: in int[], in int[], inout int[]

		var n_slices = ciphertext.length / PFCCTR_Blocklen;

		// the 0th time
		var i = 0;
		var plaintext = new Uint8Array(ciphertext.length - PFCCTR_Blocklen);
		var temp = iv.slice();
		temp = module.exports.PFCCTR_AESENC(temp, key);
		for(var j = 0; j < PFCCTR_Blocklen; ++j){
			plaintext[i * PFCCTR_Blocklen + j] = ciphertext[i * PFCCTR_Blocklen + j] ^ temp[j];
		}
		module.exports.PFCCTR_IncreaseCTR(iv);

		// the 1~(n-2)th time
		for(i = 1; i < n_slices - 1; ++i){
			temp = iv.slice();
			for(j = 0; j < PFCCTR_Blocklen; ++j){
				temp[j] = plaintext[(i - 1) * PFCCTR_Blocklen + j] ^ temp[j];
			}
			temp = module.exports.PFCCTR_AESENC(temp, key);
			for(j = 0; j < PFCCTR_Blocklen; ++j){
				plaintext[i * PFCCTR_Blocklen + j] = ciphertext[i * PFCCTR_Blocklen + j] ^ temp[j];
			}
			module.exports.PFCCTR_IncreaseCTR(iv);
		}

		// the (n-1)th time
		i = n_slices - 1;
		temp = iv.slice();
		for(j = 0; j < PFCCTR_Blocklen; ++j){
			temp[j] = plaintext[(i - 1) * PFCCTR_Blocklen + j] ^ temp[j];
		}
		temp = module.exports.PFCCTR_AESENC(temp, key);
		for(j = 0; j < PFCCTR_Blocklen; ++j){
			if(ciphertext[i * PFCCTR_Blocklen + j] != temp[j]){
				console.log("FATAL: Integrity Check Error");
				return false;
			}
		}
		module.exports.PFCCTR_IncreaseCTR(iv);

		return plaintext.slice(0, plaintext.length - plaintext[plaintext.length - 1]);

	}
};