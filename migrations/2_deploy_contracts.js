var scorchablePayments = artifacts.require("./ScorchablePayments");

module.exports = function (deployer, _network, _accounts) {
    deployer.deploy(scorchablePayments);
};
