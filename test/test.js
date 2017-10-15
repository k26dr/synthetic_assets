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

    var sellOrders = asset.sell(10e18, { from: accounts[0] });
    var round1 = Promise.all([buyOrders, sellOrders]);

    it("should register orders", function () {
        return round1.then(() => asset.buySum())
            .then(sum => assert.isAtLeast(sum, 300e6))
            .then(() => asset.sellSum())
            .then(sum => assert.isAtLeast(sum, 300e6))
    });

    //var sellOrders = asset.sell(12e16, { from: accounts[1] })
    //    .then(tx => asset.sell(12e17, { from: accounts[2] }))
    //    .then(tx => asset.sell(1e18, { from: accounts[3] }))
    //    .then(tx => asset.sell(2e18, { from: accounts[4] }))
    //    .then(tx => asset.sell(124e16, { from: accounts[5] }))



});
