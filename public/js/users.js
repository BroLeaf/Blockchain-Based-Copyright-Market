var latestContractAddr = undefined;

// create an XMLHttpRequest Object
function getXHR(){
    let xhr;

    if(window.XMLHttpRequest)
        xhr = new XMLHttpRequest()
    else
        xhr = new ActiveXObject("Microsoft.XMLHttp")

    return xhr;
}

function sendEth() {
    let addr = document.getElementById('contract').innerHTML;
    let xhr = getXHR();

    xhr.open("POST", "/users/receiveAddr", false);
    xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhr.send("addr=" + addr);
    
    let json = xhr.responseText;
    let obj = eval('(' + json + ')');
    console.log(obj);
}

function isSent(addr) {
    let xhr = getXHR();
    console.log('isSent: ' + addr);

    xhr.open("GET", "/users/receiveAddr?addr=" + addr, false);
    xhr.send();
    
    let json = xhr.responseText;
    console.log(json);
    if(json == 'yes')
        return true;
    else
        return false;
}