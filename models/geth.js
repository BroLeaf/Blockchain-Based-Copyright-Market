var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

function _getUserInfo(){
    let account = web3.eth.accounts[0];
    let balance = web3.fromWei(web3.eth.getBalance(web3.eth.accounts[0]),'ether');
    return {
        account: account,
        balance: balance,
    };
}

module.exports = {
    getUserInfo: _getUserInfo,
}