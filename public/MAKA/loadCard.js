function loadCard(file, password) {
    var result = [];
    var dfd = $.Deferred();

    readCard(file).done(function(content) {
        var lines = content.split("\n");

        var IDc = lines[0].substring(0, 64);
        var Kp = lines[1].substring(0, 32);
        var Ksign = lines[2].substring(0, 32);
        var TS = lines[3].substring(0, 64);
        var TK = lines[4].substring(0, 64);
        var EID = lines[6].substring(0, 64);
        var EK = lines[7].substring(0, 64);

        var hex_pw = UTILS_StringToHexString(password);
        var key = asmCrypto.SHA256.bytes(UTILS_HexStringToIntArray(IDc.concat(hex_pw)));

        result.IDc = IDc;
        result.Kp = UTILS_IntArrayToHexString(array_xor(UTILS_HexStringToIntArray(Kp),key));
        result.Ksign = UTILS_IntArrayToHexString(array_xor(UTILS_HexStringToIntArray(Ksign),key));
        result.TS = UTILS_IntArrayToHexString(array_xor(UTILS_HexStringToIntArray(TS),key));
        result.TK = UTILS_IntArrayToHexString(array_xor(UTILS_HexStringToIntArray(TK),key));
        result.EID = UTILS_IntArrayToHexString(array_xor(UTILS_HexStringToIntArray(EID),key));
        result.EK = UTILS_IntArrayToHexString(array_xor(UTILS_HexStringToIntArray(EK),key));

        dfd.resolve(result);
    });

    return dfd;
}

function generateCard(profile, password) {
    var	hex_pw = UTILS_StringToHexString(password);
    var key = asmCrypto.SHA256.bytes(UTILS_HexStringToIntArray(profile.IDc.concat(hex_pw)));

    Kp = UTILS_IntArrayToHexString(array_xor(UTILS_HexStringToIntArray(profile.Kp), key));
    Ksign = UTILS_IntArrayToHexString(array_xor(UTILS_HexStringToIntArray(profile.Ksign), key));
    TS = UTILS_IntArrayToHexString(array_xor(UTILS_HexStringToIntArray(profile.TS), key));
    TK = UTILS_IntArrayToHexString(array_xor(UTILS_HexStringToIntArray(profile.TK), key));
    EID = UTILS_IntArrayToHexString(array_xor(UTILS_HexStringToIntArray(profile.EID), key));
    EK = UTILS_IntArrayToHexString(array_xor(UTILS_HexStringToIntArray(profile.EK), key));

    return profile.IDc.concat("\n", Kp, "\n", Ksign, "\n", TS, "\n", TK, "\n\n", EID, "\n", EK, "\n");
}

function updateCard(profile, ts, tk) {
    profile.TS = ts;
    profile.TK = tk;

    return profile;
}

function readCard(file) {
    var reader = new FileReader();
    var dfd = $.Deferred();

    reader.onloadend = function(event) {
        dfd.resolve(this.result);
    }

    reader.readAsText(file);
    return dfd;
}

function array_xor(a, b){
    var len = Math.min(a.length, b.length);
    var tmp = new Array(len);
    for (var i = 0; i < len; i++) {
        tmp[i] = a[i] ^ b[i];
    }

    return tmp;
}
