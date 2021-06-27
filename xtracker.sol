pragma solidity ^0.8.0;

import "./safemath.sol";

contract xtracker{

  using SafeMath for uint256;

  event Newtransaction(uint id);

  struct transaction {
        string desc;
        uint amount;
        string tranType;
  }

    transaction[] public listTransactions;

    mapping (uint => address) public transactionsByOwner;
    mapping (address => uint) ownerTransactionsCount;
    

function recordTransaction(string memory _desc, uint _amount, string memory _tranType) public {
       listTransactions.push(transaction(_desc, _amount, _tranType));
       uint id = listTransactions.length - 1;
      transactionsByOwner[id] = msg.sender;
      ownerTransactionsCount[msg.sender] = ownerTransactionsCount[msg.sender].add(1);
      emit Newtransaction(id);
  }

function getTransactionByOwner(address _owner) external view returns(uint[] memory) {
    uint[] memory result = new uint[](ownerTransactionsCount[_owner]);
    uint counter = 0;
    for (uint i = 0; i < listTransactions.length; i++) {
      if (transactionsByOwner[i] == _owner) {
        result[counter] = i;
        counter++;
      }
    }
    return result;
  }


}