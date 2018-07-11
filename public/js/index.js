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