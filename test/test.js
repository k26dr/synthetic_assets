var fs = require('fs');
const SAsset = artifacts.require('./SAsset.sol');

function cd_project_root() {
    while (!fs.existsSync('truffle.js'))
        process.chdir('..')
}

function wait(ms) {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, ms);
    });
}

contract('SAsset', function (accounts) {
    var asset = SAsset.at(SAsset.address);

    var buyOrders = asset.buy({ from: accounts[1], value: 1e18 })
        .then(tx => asset.buy({ from: accounts[2], value: 2e18 }))
        .then(tx => asset.buy({ from: accounts[3], value: 2e17 }))
        .then(tx => asset.buy({ from: accounts[4], value: 5e18 }))
        .then(tx => asset.buy({ from: accounts[5], value: 32e16 }))

    var sellOrders = asset.sell(1e10, { from: accounts[0] });
    var round1orders = Promise.all([buyOrders, sellOrders]);

    it("should register orders", function () {
        return round1orders.then(() => asset.buySum())
            .then(sum => assert.isAtLeast(sum, 300e6))
            .then(() => asset.sellSum())
            .then(sum => assert.equal(sum, 1e10))
    });

    var round1fill = round1orders.then(() => wait(200))
                        .then(() => asset.peg(2882e6));

    it("should fill orders", function () {
        return round1fill.then(() => asset.balanceOf(accounts[1]))
            .then(bal => assert.isAtLeast(bal, 300e6))
            .then(() => asset.balanceOf(accounts[4]))
            .then(bal => assert.isAtLeast(bal, 1000e6))
    });

    var sellOrders2 = round1fill.then(() => wait(200))
        .then(() => asset.sell(200e6, { from: accounts[1] }))
        .then(tx => asset.sell(323e6, { from: accounts[2] }))
        .then(tx => asset.sell(10e6, { from: accounts[3] }))
        .then(tx => asset.sell(1034e6, { from: accounts[4] }))
        .then(tx => asset.sell(2e6, { from: accounts[5] }))

    var buyOrders2 = sellOrders2
        .then(tx => asset.buy({ from: accounts[6], value: 2e18 }))
        .then(tx => asset.buy({ from: accounts[7], value: 2e18 }))
        .then(tx => asset.buy({ from: accounts[8], value: 2e17 }))
        .then(tx => asset.buy({ from: accounts[9], value: 5e18 }))

    var round2fill = buyOrders2.then(() => asset.peg(2879e6));

    it("should update price and reset orders", function () {
        round2fill.then(tx => asset.price())
            .then(price => assert.equal(price, 2879e6))
            .then(() => asset.buySum())
            .then(sum => assert.equal(sum, 0))
            .then(() => asset.sellSum())
            .then(sum => assert.equal(sum, 0))
    });

    it("should credit sellers for sales", function () {
        return round2fill
            .then(tx => asset.etherBalanceOf(accounts[0]))
            .then(bal => assert.isAtLeast(bal, 3e18))
            .then(() => asset.etherBalanceOf(accounts[4]))
            .then(bal => assert.isAtLeast(bal, 2e18))
    });

    it("should refund buyers for unfilled orders", function () {
        return round2fill
            .then(tx => asset.etherBalanceOf(accounts[9]))
            .then(bal => assert.isAtLeast(bal, 3e18))
    });

    var withdraw = round2fill.then(tx => wait(200))
        .then(() => asset.withdraw({ from: accounts[0] }))
    
    it("should withdraw balance", function () {
        return withdraw
            .then(tx => asset.etherBalanceOf(accounts[0]))
            .then(bal => assert.equal(bal, 0));
    });

});
