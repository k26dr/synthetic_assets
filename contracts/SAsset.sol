import './SyntheticAsset.sol';
import './SafeMath.sol';

contract SAsset is SyntheticAsset, SafeMath {

    address public oracle;
    mapping(address => uint) balances;
    mapping(address => uint) etherBalances;
    uint public price; // in wei

    uint public decimals;
    string public name;
    string public symbol;

    function SAsset(string _name, string _symbol, uint _decimals, uint _price) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        price = _price;
    }

    function buy() payable returns (bool ok) {
        uint amount = msg.value / price;
        balances[msg.sender] += amount;
        return ok;
    }

    function sell(uint amount) returns (bool ok) {
        require(balances[msg.sender] >= amount);
        balances[msg.sender] -= amount;
        uint saleTotal = amount * price;
        msg.sender.transfer(saleTotal);
    }

    function peg (uint _price) {
        price = _price;
    }

    function isSyntheticAsset() public constant returns (bool weAre) {
        return true;
    }

    function balanceOf(address _owner) constant returns (uint balance) {
        return balances[_owner];
    }

    // Fallback/Default
    function () payable {
        buy();
    }

}
