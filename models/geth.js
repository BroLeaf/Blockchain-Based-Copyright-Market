var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

function unlockAdminAccout() {
    let adminAccout = web3.eth.accounts[0];
    if(web3.personal.unlockAccount(adminAccout, "password1")) {
        console.log(`admin account is unlocked`);
    } else {
        console.log(`fail to unclock admin account`);
    }
}

function _getUserInfo(){
    let account = web3.eth.accounts[0];
    let balance = web3.fromWei(web3.eth.getBalance(web3.eth.accounts[0]),'ether');
    return {
        account: account,
        balance: balance,
    };
}

function _uploadFileHash(fileHash) {
    unlockAdminAccout();
    let adminAccount = web3.eth.accounts[0];
    let tHash;
    
    web3.eth.sendTransaction({
        from: adminAccount,
        to: adminAccount,
        value: 0,
        data: web3.toHex(fileHash),
    }, (err, Hash) => {
        if(err)
            console.log(err);
        else 
            console.log("new tHash: " + Hash);
        tHash = Hash;
    });

    return new Promise( (resolve, reject) => {
        setTimeout(function(){
            resolve(tHash);
        }, 3000);
    });

}

module.exports = {
    getUserInfo: _getUserInfo,
    uploadFileHash: _uploadFileHash,
}