// define lengths
PFCCTR_Blocklen = 16;
PFCCTR_Keylen = 16;

function PFCCTR_IncreaseCTR(ctr){
	for(var i = 0; i < PFCCTR_Blocklen; ++i){
		++ctr[i];
	}
}

function PFCCTR_ArraysIdentical(a, b) {
    var i = a.length;
    if (i != b.length) return false;
    while (i--) {
        if (a[i] !== b[i]) return false;
    }
    return true;
};

function PFCCTR_AESENC(data, key){
	var iv = asmCrypto.hex_to_bytes("00000000000000000000000000000000");
	return asmCrypto.AES_CBC.encrypt(data, key, false, iv);
}

function PFCCTR_Encrypt(plaintext, key, iv){
    // param: in int[], in int[], inout int[]

    // preprocess the plaintext: padding
    var n_padding = (PFCCTR_Blocklen - plaintext.length % PFCCTR_Blocklen);
    var n_slices = (n_padding + plaintext.length) / PFCCTR_Blocklen;
    var padding = new Uint8Array(n_padding);
    for(var i = 0; i < n_padding; i++) padding[i] = n_padding;
    var pad_plaintext = UTILS_ConcatIntArray(plaintext, padding);

    // encryption
	var i = 0;
    var ciphertext = new Uint8Array(pad_plaintext.length + PFCCTR_Blocklen);
	var temp = iv.slice();
	temp = PFCCTR_AESENC(temp, key);
    for(var j = 0; j < PFCCTR_Blocklen; ++j){
        ciphertext[i * PFCCTR_Blocklen + j] = pad_plaintext[i * PFCCTR_Blocklen + j] ^ temp[j];
    }
	PFCCTR_IncreaseCTR(iv);

    for(i = 1; i < n_slices; ++i){
        temp = iv.slice();
        for(j = 0; j < PFCCTR_Blocklen; ++j){
            temp[j] = pad_plaintext[(i - 1) * PFCCTR_Blocklen + j] ^ temp[j];
        }
		temp = PFCCTR_AESENC(temp, key);
        for(j = 0; j < PFCCTR_Blocklen; ++j){
            ciphertext[i * PFCCTR_Blocklen + j] = pad_plaintext[i * PFCCTR_Blocklen + j] ^ temp[j];
        }
		PFCCTR_IncreaseCTR(iv);
    }

	i = n_slices;
	temp = iv.slice();
    for(j = 0; j < PFCCTR_Blocklen; ++j){
        temp[j] = pad_plaintext[(i - 1) * PFCCTR_Blocklen + j] ^ temp[j];
    }
	temp = PFCCTR_AESENC(temp, key);
    for(j = 0; j < PFCCTR_Blocklen; ++j){
        ciphertext[i * PFCCTR_Blocklen + j] = temp[j];
	}
	PFCCTR_IncreaseCTR(iv);

	return ciphertext;
}

function PFCCTR_Decrypt(ciphertext, key, iv){
    // param: in int[], in int[], inout int[]

    var n_slices = ciphertext.length / PFCCTR_Blocklen;

	// the 0th time
	var i = 0;
    var plaintext = new Uint8Array(ciphertext.length - PFCCTR_Blocklen);
	var temp = iv.slice();
	temp = PFCCTR_AESENC(temp, key);
    for(var j = 0; j < PFCCTR_Blocklen; ++j){
        plaintext[i * PFCCTR_Blocklen + j] = ciphertext[i * PFCCTR_Blocklen + j] ^ temp[j];
    }
	PFCCTR_IncreaseCTR(iv);

	// the 1~(n-2)th time
    for(i = 1; i < n_slices - 1; ++i){
        temp = iv.slice();
        for(j = 0; j < PFCCTR_Blocklen; ++j){
            temp[j] = plaintext[(i - 1) * PFCCTR_Blocklen + j] ^ temp[j];
        }
		temp = PFCCTR_AESENC(temp, key);
        for(j = 0; j < PFCCTR_Blocklen; ++j){
            plaintext[i * PFCCTR_Blocklen + j] = ciphertext[i * PFCCTR_Blocklen + j] ^ temp[j];
        }
		PFCCTR_IncreaseCTR(iv);
    }

	// the (n-1)th time
	i = n_slices - 1;
	temp = iv.slice();
    for(j = 0; j < PFCCTR_Blocklen; ++j){
        temp[j] = plaintext[(i - 1) * PFCCTR_Blocklen + j] ^ temp[j];
    }
	temp = PFCCTR_AESENC(temp, key);
    for(j = 0; j < PFCCTR_Blocklen; ++j){
        if(ciphertext[i * PFCCTR_Blocklen + j] != temp[j]){
			console.log("FATAL: Integrity Check Error");
            return false;
		}
	}
	PFCCTR_IncreaseCTR(iv);

	return plaintext.slice(0, plaintext.length - plaintext[plaintext.length - 1]);

}
