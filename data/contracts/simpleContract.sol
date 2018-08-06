pragma solidity ^0.4.0;

contract Receiver {

    address constant public clientA = 0x123;
    address constant public clientB = 0x456;

    // construtor 
    function Receiver() public {
        
    }
    
    // send
    function payMe() payable public {
        clientA.call.value(1000).gas(20317)();
        clientB.call.value(1000).gas(20317)();
    }
    
    // fallback payable
    function () payable public {
        if(msg.value < 10000)
            throw;
        payMe();
        // address(this).transfer(msg.value);
        // msg.sender.transfer(msg.value);
        // balances[msg.sender] -= msg.value;
        // balances[this] += msg.value;
    }

    // get balances
    function balanceOf(address _owner) public constant returns (uint256) {
        return _owner.balance;
    }
    
    function balanceOfContract() public constant returns (uint256) {
        return address(this).balance;
    }
}