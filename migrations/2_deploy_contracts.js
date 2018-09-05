var fakeDai = artifacts.require("./DSToken");
var scorchablePayments = artifacts.require("./ScorchablePayments");
const oneDai = Math.pow(10, 18);

const asyncSetup = async function asyncSetup(accounts) {
    scorchablePaymentsInstance = await scorchablePayments.deployed();
    fakeDaiInstance = await fakeDai.deployed();
    await scorchablePaymentsInstance.setDaiContractAddress(fakeDaiInstance.address);
    await fakeDaiInstance.mint(1100 * oneDai, {from: accounts[0]});
    await fakeDaiInstance.push(accounts[1], 100 * oneDai, {from: accounts[0]});
    await fakeDaiInstance.push(accounts[2], 100 * oneDai, {from: accounts[0]});
    await fakeDaiInstance.push(accounts[3], 100 * oneDai, {from: accounts[0]});
}


module.exports = function (deployer, network, accounts) {
    if (network == 'development') {
        deployer.deploy(fakeDai, "FakeDai");
        deployer.deploy(scorchablePayments);
        deployer.then(async () => await asyncSetup(accounts))
    }
    else if (network == "rinkeby") {
        deployer.deploy(fakeDai, "FakeDai");
        deployer.deploy(scorchablePayments);
        deployer.then(async () => await asyncSetup())
    }
    else if (network == "live") {
        deployer.deploy(scorchablePayments);
    }
};
