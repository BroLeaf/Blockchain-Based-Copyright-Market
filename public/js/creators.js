var currentTab, latestTHash;
var hasBlock, hasFile, hasHash;

function init() {
    currentTab = 0;
    latestTHash = undefined;
    hasBlock = hasFile = hasHash = false;
}

window.onload = function() {

    init();
    setTimeout(() => { showTab(currentTab); changeStepColor(currentTab); }, 100);

    document.getElementById('btn1').addEventListener('click', function(){
        // TODO: load gif in div1
		//document.getElementById("loadingImage").style.display="flex";
        let fileHash = document.getElementById("fileHash").value;
        if( fileHash == "") {
            alert("Please input file hash");
            return;
        } else {
            uploadFileHash();
            setTimeout(() => {
                document.getElementById("loadingImage").style.display="none";
            }, 2000);
            nextPrev(1);
        }
        
    });
    
    document.getElementById('btn2').addEventListener('click', function(){
        if(hasFile != true)
            alert('please upload file first');
        else
            nextPrev(1);
    });

    document.getElementById('btn3').addEventListener('click', function(){
        uploadFileInfo();
        nextPrev(1);
    });
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

    if(hasHash == true)
        return;

    let xhr = getXHR();
    xhr.open("POST", "/creators/fileHash", false);
    xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhr.onreadystatechange = function(obj) {
        if(xhr.readyState != 4) return;

        if(xhr.status == 200) {
            let json = xhr.responseText;
            let obj = eval('(' + json + ')');
            console.log(obj);
            latestTHash = obj.tHash;
        } else {
            alert('Error: ' + xhr.statusText + '\n Please retry.');
        }
    }
    xhr.send("fileHash="+document.getElementById("fileHash").value);
    hasHash = true;
}

function checkTHash() {
    let fileHash = document.getElementById("fileHash").value;
    if( fileHash == "") {
        alert("Please input file hash");
        return;
    }

    uploadFileHash();
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
    if(addr1=="" || addr2=="") {
        alert("Please input the receiver address.");
        return
    }

    let xhr = getXHR();
    xhr.open("POST", "/creators/contract", false);
    xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhr.onreadystatechange = function(obj) {
        if(xhr.readyState != 4) return;

        if(xhr.status == 200) {
            let json = xhr.responseText;
            let obj = eval('(' + json + ')');
            console.log(obj);
            latestTHash = obj.tHash;
        } else {
            console.log('Error: invalid address');
        }
    }
    xhr.send("addr1=" + addr1 + "&addr2=" + addr2);
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
	changeStepColor(currentTab);
}

function fixStepIndicator(n) {
    var i, x = document.getElementsByClassName("step");
    for (i = 0; i < x.length; i++) {
        x[i].className = x[i].className.replace(" active", "");
    }
    x[n].className += " active";
}

function changeStepColor(n) {
	var y = document.getElementsByClassName("creator-step");
	y[n].style.color="black";
	y[n+1].style.color="blue";
    y[n].style.borderTop="";
    y[n].style.borderBottom="";
    y[n+1].style.borderBottom="thick solid #0000FF";
	y[n+1].style.borderTop="thick solid #0000FF";
}