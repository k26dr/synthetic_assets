var fs = require('fs');
const SAsset = artifacts.require('./SAsset.sol');

var account = web3.eth.accounts[0];
var oracle = "0x58E813a165687301E76606Cf912fA4d0bdcc6727";

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

module.exports = function (deployer, network) {
    cd_project_root();

    if (network == "rinkeby" || network == "mainnet")
        unlock(account);

    deployer.deploy([
        [SAsset, "Synthetic SNAP", "sSNAP", 49401197604, 1e12, oracle],
        [SAsset, "Synthetic S&P 500", "sSPY", 763323353293, 1e12, oracle],
        [SAsset, "Synthetic Facebook", "sFB", 520179640718, 1e12, oracle],
        [SAsset, "Synthetic Wheat", "sWEAT", 19401197604, 1e12, oracle],
    ]);
    deployer.deploy(SAsset, "Synthetic US Dollar", "sUSD", 2994011976, 1e12, oracle);
}

