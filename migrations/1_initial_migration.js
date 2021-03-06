var fs = require('fs');
var Migrations = artifacts.require("./Migrations.sol");

function cd_project_root() {
    while (!fs.existsSync('truffle.js'))
        process.chdir('..')
}

function unlock(wallet) {
    cd_project_root();
    var password = fs.readFileSync("password", "utf8")
                     .split('\n')[0];
    web3.personal.unlockAccount(wallet, password)
}

module.exports = function(deployer, network) {
    if (network == "rinkeby" || network == "mainnet")
        unlock(web3.eth.accounts[0])

    deployer.deploy(Migrations);
};
