var latestContractAddr = undefined;

// create an XMLHttpRequest Object
function getXhttp(){
    let xhttp;

    if(window.XMLHttpRequest)
        xhttp = new XMLHttpRequest()
    else
        xhttp = new ActiveXObject("Microsoft.XMLHttp")

    return xhttp;
}

function sendEth() {	
    let xhttp = getXhttp();

    xhttp.open("POST", "/receiveAddr", false);
    xhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhttp.send("addr=" + latestContractAddr);
    
    let json = xhttp.responseText;
    let obj = eval('(' + json + ')');
    console.log(obj);
}