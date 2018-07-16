var latestTHash;
var hasBlock = false;
var hasFile = true;

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
    if(fileHash == undefined) {
        alert("Please input file hash");
        return;
    }

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
    let keyword = document.getElementById("keyword").value;
    let author = document.getElementById("author").value;
    let year = document.getElementById("year").value;

    if(keyword == undefined || author == undefined || year == undefined) {
        alert("Please input file information.");
        return;
    }
    
    console.log("upload file info prepared");

    let xhttp = getXhttp();
    xhttp.open("POST", "/creators/fileInfo", false);    // TODO: figure out why ???
    xhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhttp.send("keyword=" + keyword + "&author=" + author + "&year=" + year);

    let json = xhttp.responseText;
    console.log(json);
}

function createContract() {
    let addr1 = document.getElementById("recvAddr1").value;
    let addr2 = document.getElementById("recvAddr2").value;
    if(addr1==undefined || addr2==undefined) {
        alert("Please input the receiver address.");
        return
    }

    let xhttp = getXhttp();
    xhttp.open("POST", "/contract", false);
    xhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhttp.send("addr1=" + addr1 + "&addr2=" + addr2);

    let json = xhttp.responseText;
    let obj = eval('(' + json + ')');
    console.log(obj);
}

function getContractAddr() {
    let xhttp = getXhttp();
    xhttp.open("GET", "/contract", false);
    xhttp.send();

    let json = xhttp.responseText;
    if( json.length == 0) {
        alert("It's mining ... Please retry after a few seconds");
        return;
    }
    // let obj = eval('(' + json + ')');
    console.log(json);
    alert("contract address is " + json);
}

function gotoStep2() {
    if(hasBlock == false) {
        alert("Please check tHash first");
        return;
    }

    let a = document.createElement('a');
    a.href = "#second";
    a.click();
}

function gotoStep3() {
    if(hasFile == false) {
        alert("Please upload file first");
        return;
    }

    let a = document.createElement('a');
    a.href = "#third";
    a.click();
}