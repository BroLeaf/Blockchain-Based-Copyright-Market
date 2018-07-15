// 常用函數，可以獨立成一個 JS 或是併入 Utility 中
function HELPER_DecryptString(input, key) {
    return UTILS_IntArrayToString(
        PFCCTR_Decrypt(UTILS_HexStringToIntArray(input), key, key.slice()));
}

// 常用函數，可以獨立成一個 JS 或是併入 Utility 中
function HELPER_GenerateEncryptedRequest(object, key) {
    return UTILS_IntArrayToHexString(
        PFCCTR_Encrypt(UTILS_StringToIntArray(JSON.stringify(object)), key, key.slice()));
}

function example() {
    var postData = {
        field1: data1,
        field2: data2
    };

    var encryptedRequest = HELPER_GenerateEncryptedRequest(postData, sessionKey);

    $.ajax({
        url: "usage.jsp",
        type: "post",
        data: {
            data: encryptedRequest
        },
        success: function(data) {
            var json = $.parseJSON(HELPER_DecryptString(data.trim(), sessionKey));

            // do something...
        }
    });
}
