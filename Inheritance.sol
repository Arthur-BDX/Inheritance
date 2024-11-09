// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract InheritanceContract {
    address public owner; // Address of the creator of the contract
    address public heir; // Address of the heir
    uint public lastWithdrawalTime; // Timestamp of the last withdrawal made by the owner
    uint constant ONE_MONTH = 30 days; // Locking period

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event HeirUpdated(address indexed newHeir);
    event Withdrawal(address indexed owner, uint amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyHeir() {
        require(msg.sender == heir, "Only heir can perform this action");
        _;
    }

    constructor(address _heir) {
        owner = msg.sender;
        heir = _heir;
        lastWithdrawalTime = block.timestamp;
    }

    function withdraw(uint _amount) external onlyOwner {
        require(address(this).balance >= _amount, "Insufficient contract balance");
        
        // Transfer the specified amount to the owner
        payable(owner).transfer(_amount);
        
        // Reset the withdrawal timer
        lastWithdrawalTime = block.timestamp;
        
        emit Withdrawal(owner, _amount);
    }

    function claimOwnership() external onlyHeir {
        require(block.timestamp > lastWithdrawalTime + ONE_MONTH, "Owner is still active");
        
        // Transfer ownership to the heir
        emit OwnershipTransferred(owner, heir);
        owner = heir;
        
        // Reset last withdrawal time after ownership transfer
        lastWithdrawalTime = block.timestamp;
    }

    function setNewHeir(address _newHeir) external onlyOwner {
        heir = _newHeir;
        emit HeirUpdated(_newHeir);
    }

    // Fallback function to receive ETH
    receive() external payable {}
}
/*
Time units in Solidity are predefined keywords like seconds, minutes, hours, days, weeks, and years 
that help manage time-related functions in smart contracts.
*/