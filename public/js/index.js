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
    let xhttp = getXhttp();

    xhttp.open("POST", "/fileHash", false);
    xhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhttp.send("fileHash=a1b2c3d4");

    let json = xhttp.responseText;
    let obj = eval('(' + json + ')');
    console.log(obj);
}

function checkTHash() {
    let xhttp = getXhttp();

    xhttp.open("POST", "/tHash", false);
    xhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhttp.send("tHash=0xb3dc9ab8780776ef406b1664c1faf08d1d5f45acffe1172be6be0a394d3de938");

    let json = xhttp.responseText;
    let obj = eval('(' + json + ')');
    console.log(obj.blockNumber);
}

function uploadFile() {
    console.log("no thing happened");
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
    // let obj = eval('(' + json + ')');
    console.log(json);
}