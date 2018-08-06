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
    let xhr = getXHR();

    xhr.open("POST", "/users/receiveAddr", false);
    xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhr.send("addr=" + latestContractAddr);
    
    let json = xhr.responseText;
    let obj = eval('(' + json + ')');
    console.log(obj);
}