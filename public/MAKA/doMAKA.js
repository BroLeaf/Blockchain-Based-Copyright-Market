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
            k.innerHTML = k.innerHTML + "<div style='position:absolute;left:0;top:0;width:100%;height:100%;z-index=99999;background-color:white;text-align:center;'><a download='newCard.card' href="+cardUrl+">If it didn't download the new card automatically, please download it manually!</a><br><br><br><a href='upload.html'>Creator GO!</a><br><br><br><a href='download.html'>Buyer GO!</a></div>";
        else if(condition == 2)
            k.innerHTML = k.innerHTML + "<div style='position:absolute;left:0;top:0;width:100%;height:100%;z-index=99999;background-color:white;text-align:center;'><a download='newCard.card' href="+cardUrl+">If it didn't download the new card automatically, please download it manually!</a><br><br><br><a href='finance_admin.html'>Continue</a></div>";
       else 
            k.innerHTML = k.innerHTML + "<div style='position:absolute;left:0;top:0;width:100%;height:100%;z-index=99999;background-color:white;text-align:center;'><a download='newCard.card' href="+cardUrl+">If it didn't download the new card automatically, please download it manually!</a><br><br><br><a href='Sign.html'>Continue</a></div>";
    }
    else
        k.innerHTML = k.innerHTML + "<div style='position:absolute;left:0;top:0;width:100%;height:100%;z-index=99999;background-color:white;text-align:center;'><a download='newCard.card' href="+cardUrl+">If it didn't download the new card automatically, please download it manually!</a><br><br><br><a href='Sign.html'>Continue</a></div>";
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
	
        if(form.profilePass.value === "") {
            alert("請輸入密碼！");
            return false;
        }
		
        loadCard(form.profile.files[0], form.profilePass.value).done(function(result) {
				console.log(result);
          var makaObj = new MAKA(result);
            makaObj.execute().then(function(result) {
                var newProfile = generateProfileBlob(makaObj.profile, form.profilePass.value);
                if (result == MAKA.SUCCESS) {
					var uid=JSON.stringify(makaObj.userId);
                    localStorage.setItem("userID", uid.substring(1,uid.length-1));
                    localStorage.setItem("sessionKey", JSON.stringify(Array.apply([], makaObj.sessionKey)));
                    updateUI(result, newProfile, form.validSign.value,1);
                }else{
                    updateUI(result, newProfile, form.validSign.value, 0);    
			}
		   });
        });

        return false;
    }
});
