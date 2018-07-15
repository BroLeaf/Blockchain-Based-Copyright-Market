// TODO: replace local variable: latestContractAddr to db.query
var latestContractAddr;
var latestTHash;
var hasBlock = false;

// create an XMLHttpRequest Object
function getXhttp(){
    let xhttp;

    if(window.XMLHttpRequest)
        xhttp = new XMLHttpRequest()
    else
        xhttp = new ActiveXObject("Microsoft.XMLHttp")

    return xhttp;
}

// get userInfo of geth
function getUserInfo() {
    let xhttp = getXhttp();
    xhttp.open("GET", "/userInfo", false);
    xhttp.send();

    let json = xhttp.responseText;
    let obj = eval('(' + json + ')');
    console.log(obj);
}

function uploadFileHash() {
    let fileHash = document.getElementById("fileHash").value;
    console.log("fileHash=" + fileHash);
    let xhttp = getXhttp();

    xhttp.open("POST", "/fileHash", false);
    xhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhttp.send("fileHash="+fileHash);

    let json = xhttp.responseText;
    let obj = eval('(' + json + ')');
    console.log(obj);
    latestTHash = obj.tHash;
}

function checkTHash() {
    if(latestTHash == undefined)
        return;

    let xhttp = getXhttp();

    xhttp.open("POST", "/tHash", false);
    xhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhttp.send("tHash="+latestTHash);

    let json = xhttp.responseText;
    if( json.length == 0) {
        alert("It's mining ... please retry after a few seconds");
        return;
    }

    let obj = eval('(' + json + ')');
    if( obj.blockNumber != undefined) {
        alert("It's mined !!! block Number is " + obj.blockNumber);
        hasBlock = true;
    }
}

function gotoStep2() {
    if(hasBlock == false) {
        alert("please check tHash first");
        return;
    }

    let a = document.createElement('a');
    a.href = "#second";
    a.click();
}

function createContract() {
    let xhttp = getXhttp();

    xhttp.open("POST", "/contract", false);
    xhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhttp.send("addr1=0x135&addr2=0x246");

    let json = xhttp.responseText;
    let obj = eval('(' + json + ')');
    console.log(obj.blockNumber);
}

function getLatestContract() {
    let xhttp = getXhttp();
    xhttp.open("GET", "/contract", false);
    xhttp.send();

    let json = xhttp.responseText;
    latestContractAddr = json;
    // let obj = eval('(' + json + ')');
    console.log(json);
}