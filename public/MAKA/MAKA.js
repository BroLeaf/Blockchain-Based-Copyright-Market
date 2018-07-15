function ekd(makaURL, IDc, TSc, TKc, CALLBACK, FAIL_CALLBACK){
	
	var send_idc=IDc;
    IDc = UTILS_HexStringToIntArray(IDc);
    TSc = UTILS_HexStringToIntArray(TSc);
    TKc = UTILS_HexStringToIntArray(TKc);
    var Nc = EKD_Random_int_array(32);
    var Nx = EKD_array_xor(TKc, Nc);
    var conc = UTILS_ConcatIntArray(IDc, TKc, Nc, TSc);
    var AIDc = asmCrypto.SHA256.hex(conc);

    $.post(makaURL, {"aidc": AIDc, "nx": UTILS_IntArrayToHexString(Nx), "tsc": UTILS_IntArrayToHexString(TSc),"idc":send_idc}, function(data, status){
        var obj = JSON.parse(data);
        var IDs = UTILS_HexStringToIntArray(obj.IDs);
        var Nx2 = UTILS_HexStringToIntArray(obj.Nx);
        var TS  = UTILS_HexStringToIntArray(obj.TS);
        var V4  = UTILS_HexStringToIntArray(obj.V4);
        var V42 = asmCrypto.SHA256.bytes(UTILS_ConcatIntArray(Nx2, Nc, TS, TKc, IDs));

        if(PFCCTR_ArraysIdentical(V4,V42) == false){
            CALLBACK([], [], []);
            return;
        }

        var SK      = EKD_array_xor(Nx2, asmCrypto.SHA256.bytes(UTILS_ConcatIntArray(TKc, IDc, TSc)));
        var TSc_new = EKD_array_xor(TS,  asmCrypto.SHA256.bytes(UTILS_ConcatIntArray(TKc, IDc, Nc)));
        var TKc_new =                    asmCrypto.SHA256.bytes(UTILS_ConcatIntArray(TKc, IDc, TSc_new));

        CALLBACK(UTILS_IntArrayToHexString(SK), UTILS_IntArrayToHexString(TSc_new), UTILS_IntArrayToHexString(TKc_new));

    }).fail(function() {
        if (arguments.length >= 6) {
            FAIL_CALLBACK();
        }
    });

}

function EKD_array_xor(a, b){
    var tmp = new Uint8Array(32);
    for (var i = 0; i < 32; ++i) {
        tmp[i] = a[i] ^ b[i];
    }
    return tmp;
}

function EKD_Random_int_array(length){
    var tmp = new Uint8Array(length);
    for (var i = 0; i < length; ++i) {
        tmp[i] = EKD_Random_byte();
    }
    return tmp;
}

function EKD_Random_byte(){
    return Math.floor(Math.random()*256);
}
