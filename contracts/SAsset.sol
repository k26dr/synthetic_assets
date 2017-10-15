pragma solidity ^0.4.15;

contract SAsset {
    address public oracle;
    uint public totalSupply; // in ppm-USD (1e-6 USD)
    uint public price; // in ppm-USD (1e-6 USD)

    mapping(address => uint) balances;
    mapping(address => uint) etherBalances;

    string public name;
    string public symbol;

    struct Order {
        address user;
        uint amount; // of asset
    }

    Order[] buyOrders;
    Order[] sellOrders;
    uint buySum;
    uint sellSum;

    //mapping(uint => Order[]) orders;
    //mapping(uint => uint) ordersSum;


    enum OrderType { Buy, Sell }
    event Fill(OrderType orderType, address user, uint amount);

    function SAsset(string _name, string _symbol, uint _price, uint _totalSupply, address _oracle) {
        name = _name;
        symbol = _symbol;
        price = _price;
        oracle = _oracle;
        totalSupply = _totalSupply;
        balances[msg.sender] = _totalSupply;
    }

    function buy() payable returns (bool ok) {
        uint amount = msg.value * 1e6 / price;
        Order memory order = Order(msg.sender, amount);
        buyOrders.push(order);
        buySum += amount;
        return true;
    }

    function sell(uint amount) returns (bool ok) {
        require(balances[msg.sender] >= amount);
        Order memory order = Order(msg.sender, amount);
        sellOrders.push(order);
        sellSum += amount;
        return true;
    }

    function peg (uint _price) {
        fillOrders();
        price = _price;
    }

    function fillOrders () {
        uint total;
        if (buySum > sellSum)
            total = sellSum;
        else
            total = buySum;

        // fill buys
        uint counter = 0;
        uint i=0;
        while (counter < total) {
            Order memory order = buyOrders[i];

            // adjust balances
            uint amount;
            if (counter + order.amount > total) {
                amount = total -  counter;

                // issue refunds for outstanding orders
                uint remainingAmount = order.amount - amount;
                uint refund = remainingAmount * price / 1e6;
                etherBalances[order.user] += refund;
            }
            else
                amount = order.amount;
            balances[order.user] += amount;
            Fill(OrderType.Buy, order.user, amount);

            counter += amount;
            i++;
        }

        // fill sells
        counter = 0;
        i = 0;
        while (counter < total) {
            order = sellOrders[i];

            // adjust balances
            if (counter + order.amount > total)
                amount = total - counter;
            else
                amount = order.amount;
            balances[order.user] -= amount;
            Fill(OrderType.Sell, order.user, amount);

            // credit account
            uint saleEther = amount * price / 1e6;
            etherBalances[order.user] += saleEther;
            
            counter += amount;
            i++;
        }

        // reset order totals and orders
        delete buyOrders;
        delete sellOrders;
        buySum = 0;
        sellSum = 0;
    }

    function balanceOf(address _owner) constant returns (uint balance) {
        return balances[_owner];
    }

    function etherBalanceOf(address _owner) constant returns (uint balance) {
        return etherBalances[_owner];
    }

    // Fallback/Default
    function () payable {
        buy();
    }

}
