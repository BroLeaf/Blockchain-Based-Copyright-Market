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