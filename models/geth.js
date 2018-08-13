var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

var fs = require('fs');
var solc = require('solc');
var latestContractAddr;

function unlockAdminAccount() {
    let adminAccout = web3.eth.accounts[0];
    if(web3.personal.unlockAccount(adminAccout, "password1")) {
        console.log(`admin account is unlocked`);
    } else {
        console.log(`fail to unclock admin account`);
    }
}

function _getUserInfo(){
    let resp = new Array();
    for(let i=0; i<3; ++i) {
        let account = web3.eth.accounts[i];
        let balance = web3.fromWei(web3.eth.getBalance(account),'ether');
        resp.push({
            account: account,
            balance: balance
        })
    }

    return resp;
}

function _uploadFileHash(fileHash) {
    unlockAdminAccount();
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

function _checkTHash(tHash) {
    let resp = web3.eth.getTransactionReceipt(tHash);
    return resp;
}

function _createContract(addr1, addr2) {
    unlockAdminAccount();

    // compile contract
    let str = fs.readFileSync("./data/contracts/simpleContract.sol", 'utf8');
    console.log('compiling contract...');
    str = str.replace("0x123", addr1);
    str = str.replace("0x456", addr2);
    let compiledContract = solc.compile(str);
    console.log('done');
    for (let contractName in compiledContract.contracts) {
        var bytecode = compiledContract.contracts[contractName].bytecode;
        var abi = JSON.parse(compiledContract.contracts[contractName].interface);
    }

    // deploy contract
    var simpleContract = web3.eth.contract(abi);
    var simple = simpleContract.new(
        {
            from: web3.eth.accounts[0],
            data: '0x' + bytecode,
            gas: '4700000'
        }, function (e, contract) {
            // console.log(e, contract);
            if (typeof contract.address !== 'undefined') {
                console.log('Contract mined! address: ' + contract.address)
                console.log('transactionHash: ' + contract.transactionHash);
                latestContractAddr = contract.address;
            }
        }
    );

    // console.log(simple);
    return simple;
}

function _getLatestContract() {
    return latestContractAddr;
}

function _sendEth(dest) {
    unlockAdminAccount();
    let adminAccount = web3.eth.accounts[0];
    let tHash;

    web3.eth.sendTransaction({
        from: adminAccount,
        to: dest,
        value: web3.toWei(10, "ether")
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
    unlockAdminAccount: unlockAdminAccount, 
    getUserInfo: _getUserInfo,
    uploadFileHash: _uploadFileHash,
    checkTHash: _checkTHash,
    createContract: _createContract,
    getLatestContract: _getLatestContract,
    sendEth: _sendEth,
}