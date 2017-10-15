var fs = require('fs');
const SAsset = artifacts.require('./SAsset.sol');

function cd_project_root() {
    while (!fs.existsSync('truffle.js'))
        process.chdir('..')
}

module.exports = function(callback) {
    cd_project_root();
    var password = fs.readFileSync("password", "utf8").split('\n')[0];

    var accounts = web3.eth.accounts;
    accounts.forEach(function (account) {
        web3.personal.unlockAccount(account, password);
    });

    var addresses = [
        "0xF84Dbc80e38410135C23C0d48947cE506755C4ec", // sSNAP
        "0xB0824F0d55cAf7B5f19dD08DE340703A04bACdF6", // sWEAT
        "0xE97213Ffcec4d93e171943ee57F4af5e90d6e2fe"  // sUSD
    ]

    var contracts = []
    addresses.forEach(function (address) {
        contracts.push(SAsset.at(address));
    });

    contracts.forEach(function (contract) {
        contract.sell(1e9, { from: accounts[0] });
        contract.buy({ from: accounts[1], value: 1e16 });
        contract.buy({ from: accounts[2], value: 2e16 });
        contract.buy({ from: accounts[3], value: 3e16 });
        contract.buy({ from: accounts[4], value: 4e16 });
    });

    callback();
}
