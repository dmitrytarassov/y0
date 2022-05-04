// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

//import "@openzeppelin/contracts/access/AccessControl.sol";

//contract y0 is AccessControl {
contract y0 {
  address public owner;

  uint public admin = 1;
  uint public reader = 2;

  mapping (address => uint) users;

  constructor() public {
    owner = msg.sender;
    users[msg.sender] = admin;
  }

  function getRole(address acc) public view returns(uint) {
    return users[acc];
  }

  function revokeRole(address acc) public payable {
    uint user = users[msg.sender];

    require(
      msg.sender == owner || user == admin,
      "You have no access to this method"
    );

    require(
      msg.sender != acc,
      "You can not set revoke your role"
    );

    require(
      owner != acc,
      "You can not set revoke owner's role"
    );

    delete users[acc];
  }

  function grantRole(address acc, uint role) public payable {
    uint user = users[msg.sender];

    require(
      msg.sender == owner || user == admin,
      "You have no access to this method"
    );

    require(
      role == admin || role == reader,
      "Unknown role"
    );

    require(
      msg.sender != acc,
      "You can not set role to yourself"
    );

    require(
      owner != acc,
      "You can not set role to owner"
    );

    users[acc] = role;
  }
}
