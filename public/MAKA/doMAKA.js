MAKA.INVALID_CARD = 0x0001;
MAKA.MAKA_FAILED  = 0x0002;
MAKA.UNREGISTERED = 0x0003;
MAKA.LOGIN_FAILED = 0x0004;
MAKA.SUCCESS      = 0x0010;

function MAKA(profile) {
    this.profile = profile;

    this.userId = this.profile.IDc;
    this.userKey = UTILS_HexStringToIntArray(this.profile.Kp);

    this.sessionKey = null;
}

function newCard(cardUrl, val, condition) {
    var a = document.createElement("a");
    a.href = cardUrl;
    a.download = "newCard.card";
    a.click();
    var k = document.getElementById("forNewCard");
    if(val == "1") {
        if(condition == 1)
            k.innerHTML = k.innerHTML + "<div style='position:absolute;left:0;top:0;width:100%;height:100%;z-index=99999;background-color:white;text-align:center;'><a download='newCard.card' href="+cardUrl+">If it didn't download the new card automatically, please download it manually!</a><br><br><br><a href='upload.html'>ACS Go!</a></div>";
        else if(condition == 2)
            k.innerHTML = k.innerHTML + "<div style='position:absolute;left:0;top:0;width:100%;height:100%;z-index=99999;background-color:white;text-align:center;'><a download='newCard.card' href="+cardUrl+">If it didn't download the new card automatically, please download it manually!</a><br><br><br><a href='finance_admin.html'>Continue</a></div>";
       else 
            k.innerHTML = k.innerHTML + "<div style='position:absolute;left:0;top:0;width:100%;height:100%;z-index=99999;background-color:white;text-align:center;'><a download='newCard.card' href="+cardUrl+">If it didn't download the new card automatically, please download it manually!</a><br><br><br><a href='Sign.html'>Continue</a></div>";
    }
    else
        k.innerHTML = k.innerHTML + "<div style='position:absolute;left:0;top:0;width:100%;height:100%;z-index=99999;background-color:white;text-align:center;'><a download='newCard.card' href="+cardUrl+">If it didn't download the new card automatically, please download it manually!</a><br><br><br><a href='Sign.html'>Continue</a></div>";
}

function sendRequest2(action, body) {
    return $.ajax({
        url: action, 
        dataType : 'json',
        type: 'post',
        data: {
            data: JSON.stringify(body)
        }
    });
}

function request2(userKey, pos, condition, callback) {
    var  userRequest = {
        'condition': condition,
        'id': localStorage.getItem("userID"),
        'pos': pos,
        'userKey': userKey
    };
    //var encryptedRequest = HELPER_GenerateEncryptedRequest(userRequest, localStorage.getItem("sessionKey"));
    
    sendRequest2('signup.jsp', userRequest).done(function (data) {
            let pos = data.pos;
            if(condition == "1") {
                if(pos == "0") {
                    alert("無法辨識此帳戶，請檢查密碼或是註冊過。");
                    callback(0);
                }
                else if(pos == "1") {
                    alert("使用者登入成功！");
                    callback(1);
                }
                else if(pos == "2") {
                    alert("管理者登入成功！");
                    callback(2);
                }
                else
                    alert(pos);
            } else {
                if(pos == "0") {
                    alert("註冊失敗。");
                    callback(0);
                }
                else {
                    alert("註冊成功！\n uid 為 " + data.uId);
                    callback(1);
                }
            }
    }).fail(function() {
        alert("failed");
    });
}

MAKA.prototype = {
    execute: function() {
        this.dfd = $.Deferred();

        var makaObj = this;
	
        this._maka().then(function(result) {
            makaObj.dfd.resolve(result.message || result);
        });

        return this.dfd;
    },

    _maka: function() {
        var dfd = $.Deferred();

        var makaObj = this;
		
        ekd("/login/maka", this.profile.IDc, this.profile.TS, this.profile.TK, function(sk, ts, tk) {
            if (sk.length == 0) {
                dfd.resolve(MAKA.INVALID_CARD);
                return;
            }
            makaObj.sessionKey = UTILS_HexStringToIntArray(sk.substring(0, 32));
            makaObj.profile = updateCard(makaObj.profile, ts, tk);
            dfd.resolve(MAKA.SUCCESS);
        }, function() {
            dfd.resolve(MAKA.MAKA_FAILED);
        });

        return dfd;
    }
};

$(function () {
    updateUI = function(status, newProfile, val, condition) {
        if (status == MAKA.SUCCESS) {
            //
            // 產生新 Profile 的下載連結：
            newCard(window.URL.createObjectURL(newProfile), val, condition);
            //
            // 記得提示使用者下載新 Profile
        } else if (status == MAKA.UNREGISTERED) {
            alert("登入失敗！尚未註冊！");
            //
            // 產生新 Profile 的下載連結：
            newCard(window.URL.createObjectURL(newProfile), val, condition);
            //
            // 記得提示使用者下載新 Profile
        } else if (status == MAKA.LOGIN_FAILED) {
            alert("登入失敗！伺服器端發生錯誤！");
            //
            // 產生新 Profile 的下載連結：
            newCard(window.URL.createObjectURL(newProfile), val, condition);
            //
            // 記得提示使用者下載新 Profile
        } else if (status == MAKA.MAKA_FAILED) {
            alert("登入失敗！MAKA 過程中發生錯誤！");
            //
            // 產生新 Profile 的下載連結：
            newCard(window.URL.createObjectURL(newProfile), val, condition);
            //
            // 記得提示使用者下載新 Profile
        } else if (status == MAKA.INVALID_CARD) {
            alert("非法的 Profile Card！密碼錯誤或上次做完 MAKA 後未更新 Card！");
        }
    }

    generateProfileBlob = function(profile, password) {
        var newProfileContent = generateCard(profile, password);
        return new Blob([newProfileContent], {type: "text/plain"});
    }

    submitForm = function(form) {

        console.log("in public/js/MAKA/doMAKA.js");
	
        if(form.profilePass.value === "") {
            alert("請輸入密碼！");
            return false;
        }
		
        loadCard(form.profile.files[0], form.profilePass.value).done(function(result) {
            var makaObj = new MAKA(result);
            console.log("get result !");
		
            makaObj.execute().then(function(result) {
                var newProfile = generateProfileBlob(makaObj.profile, form.profilePass.value);
                var check_condi;
                var formUserKey;
                if(form.userKey === undefined)
                    formUserKey = 0;
                else
                    formUserKey = form.userKey.value;
                if (result == MAKA.SUCCESS) {
                    // 保存 User ID 與 Session Key
                    localStorage.setItem("userID", JSON.stringify(makaObj.userId));
                    localStorage.setItem("sessionKey", JSON.stringify(Array.apply([], makaObj.sessionKey)));
                    // request2(formUserKey, form.id.value, form.validSign.value, function(ck){
                    //   check_condi=ck;
                        updateUI(result, newProfile, form.validSign.value,1);
                    // });

                }
                else{
                    updateUI(result, newProfile, form.validSign.value, 0);    
                }
            });
        });

        return false;
    }
});
