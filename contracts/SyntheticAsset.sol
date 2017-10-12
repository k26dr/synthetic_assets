// Synthetic Asset interface

contract SyntheticAsset {
  uint public totalSupply;

  function balanceOf(address who) constant returns (uint);
  function isSynethicAsset() constant returns (bool weAre);

  function sell(uint amount) returns (bool ok);
  function buy() payable returns (bool ok);
  function peg(uint _price);
  function burn(uint amount);

  event Purchase(address indexed from, address indexed to, uint value);
  event Sale(address indexed from, address indexed to, uint value);
}
