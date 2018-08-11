var latestTHash;
var hasBlock = false;
var hasFile = true;
var currentTab = 0;

window.onload = function() {

    document.getElementById("fileHash").addEventListener("keydown", (e) => {
        if(e.keyCode == 13) {
            uploadFileHash();
        }
    });

    document.getElementById("filesubmit").addEventListener("click", () => {
        uploadfile();
        hasFile=true;
        uploadFileHash();
    })

    let _ = setTimeout(function() {
        showTab(currentTab); // Display the crurrent tab
    }, 100);
}

// create an XMLHttpRequest Object
function getXHR(){
    let xhr;

    if(window.XMLHttpRequest)
        xhr = new XMLHttpRequest()
    else
        xhr = new ActiveXObject("Microsoft.XMLHttp")

    return xhr;
}

// get userInfo of geth
function getUserInfo() {
    let xhr = getXHR();
    xhr.open("GET", "/creators/userInfo", false);
    xhr.send();

    let json = xhr.responseText;
    let obj = eval('(' + json + ')');
    console.log(obj);
}

function uploadFileHash() {
    let fileHash = document.getElementById("fileHash").value;
    if(fileHash == undefined) {
        alert("Please input file hash");
        return;
    }

    let xhr = getXHR();
    xhr.open("POST", "/creators/fileHash", false);
    xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhr.send("fileHash="+fileHash);

    let json = xhr.responseText;
    let obj = eval('(' + json + ')');
    // console.log(obj);
    latestTHash = obj.tHash;
}

function checkTHash() {
    if(latestTHash == undefined)
        return;

    let xhr = getXHR();
    xhr.open("POST", "/creators/tHash", false);
    xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhr.send("tHash="+latestTHash);

    let json = xhr.responseText;
    if( json.length == 0) {
        alert("It's mining ... Please retry after a few seconds");
        return;
    }

    let obj = eval('(' + json + ')');
    if( obj.blockNumber != undefined) {
        alert("It's mined !!! block Number is " + obj.blockNumber);
        hasBlock = true;
    }
}

function uploadFileInfo() {
    let type = document.getElementById("type").value;
    let auth = document.getElementById("auth").value;
    let year = document.getElementById("year").value;
    // TODO: let ID = uploadDB.getID(); 

    if(type == undefined) type = "none";
    if(auth == undefined) auth = "none";
    if(year == undefined) year = "none";
    
    let xhr = getXHR();
    xhr.open("POST", "/creators/fileInfo", false);
    xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhr.send("type=" + type + "&auth=" + auth + "&year=" + year);

    let json = xhr.responseText;
    console.log(json);
}

function createContract() {
    let addr1 = document.getElementById("recvAddr1").value;
    let addr2 = document.getElementById("recvAddr2").value;
    if(addr1==undefined || addr2==undefined) {
        alert("Please input the receiver address.");
        return
    }

    let xhr = getXHR();
    xhr.open("POST", "/creators/contract", false);
    xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhr.send("addr1=" + addr1 + "&addr2=" + addr2);

    let json = xhr.responseText;
    let obj = eval('(' + json + ')');
    console.log(obj);
}

function getContractAddr() {
    let xhr = getXHR();
    xhr.open("GET", "/creators/contract", false);
    xhr.send();

    let json = xhr.responseText;
    if( json.length == 0) {
        alert("It's mining ... Please retry after a few seconds");
        return;
    }
    // let obj = eval('(' + json + ')');
    console.log(json);
    alert("contract address is " + json);
}

function showTab(n) {
    var x = document.getElementsByClassName("tab");
    x[n].style.display = "block";
    fixStepIndicator(n)
}

function nextPrev(n) {
    var x = document.getElementsByClassName("tab");
    x[currentTab].style.display = "none";
    currentTab = currentTab + n;
    if (currentTab >= x.length) {
        alert("Finish !");
        let a = document.createElement('a');
        a.href = "/";
        a.click();
    }
    showTab(currentTab);
}

function fixStepIndicator(n) {
    var i, x = document.getElementsByClassName("step");
    for (i = 0; i < x.length; i++) {
        x[i].className = x[i].className.replace(" active", "");
    }
    x[n].className += " active";
}