pragma solidity ^0.4.0;

contract Receiver {

    address constant public clientA = 0x123;
    address constant public clientB = 0x456;

    
    // fallback payable
    function () payable public {
        
        require(msg.sender.balance >= msg.value);
        require(msg.sender.balance >= 10000);

        clientA.transfer(msg.value / 2);
        clientB.transfer(msg.value / 2);
    }
}