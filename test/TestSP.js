const ScorchablePayments = artifacts.require("ScorchablePayments");
const DSToken = artifacts.require("DSToken");
const oneDai = Math.pow(10, 18);
const floatingError = Math.pow(10, 12);  // EVM uint256 can't be converted into js numbers without precision loss.
const payerIndex = 0;
const payeeIndex = 1;
const amountIndex = 2;
const payeeBondAmountIndex = 3;
const payerInactionTimeoutIndex = 4;
const listIndexIndex = 5;
const payeeBondPaidIndex = 6;
const isEthPaymentIndex = 7;


contract('Payments test', async (accounts) => {

    var scorchablePaymentsInstance;
    var fakeDaiInstance;
    var d = new Date();
    var now = d.getTime();
    var past = now - 100000;
    var future = now + 100000;

    function bigNumToDai(bigNum) {
        return bigNum.toNumber() / oneDai;
    }

    it("check fake Dai has been setup", async () => {
        scorchablePaymentsInstance = await ScorchablePayments.deployed();
        fakeDaiInstance = await DSToken.deployed();
        let accountOneDai = await fakeDaiInstance.balanceOf.call(accounts[0]);
        let accountTwoDai = await fakeDaiInstance.balanceOf.call(accounts[1]);
        let accountThreeDai = await fakeDaiInstance.balanceOf.call(accounts[2]);
        assert.equal(accountOneDai, 800 * oneDai);
        assert.equal(accountTwoDai, 100 * oneDai);
        assert.equal(accountThreeDai, 100 * oneDai);
    });

    it("create payments and test dai", async () => {
        await fakeDaiInstance.approve(scorchablePaymentsInstance.address, 50 * oneDai, {from: accounts[0]});
        await fakeDaiInstance.approve(scorchablePaymentsInstance.address, 50 * oneDai, {from: accounts[1]});
        await fakeDaiInstance.approve(scorchablePaymentsInstance.address, 50 * oneDai, {from: accounts[2]});
        await fakeDaiInstance.approve(scorchablePaymentsInstance.address, 50 * oneDai, {from: accounts[3]});
        await scorchablePaymentsInstance.createPayment(accounts[0], 10 * oneDai,    2 * oneDai, past,   false, {from: accounts[0]});
        await scorchablePaymentsInstance.createPayment(accounts[1], 10 * oneDai,    2 * oneDai, past,   false, {from: accounts[0]});
        await scorchablePaymentsInstance.createPayment(accounts[5], 10 * oneDai,    0,          past,   false, {from: accounts[1]});
        await scorchablePaymentsInstance.createPayment(accounts[3], 10 * oneDai,    2 * oneDai, future, false, {from: accounts[2]});
        await scorchablePaymentsInstance.createPayment(accounts[1], 10000 * oneDai, 2 * oneDai, future, false, {from: accounts[3]});
        await scorchablePaymentsInstance.createPayment(accounts[0], 10 * oneEth,    2 * oneEth, future, true,  {from: accounts[4]});

// TODO all below
        assert.equal(await fakeDaiInstance.balanceOf.call(scorchablePaymentsInstance.address), 60 * oneDai);
        assert.equal(await fakeDaiInstance.balanceOf.call(accounts[0]), 770 * oneDai);
        assert.equal(await fakeDaiInstance.balanceOf.call(accounts[1]), 80 * oneDai);
        assert.equal(await fakeDaiInstance.balanceOf.call(accounts[2]), 90 * oneDai);

        var numPayments = await scorchablePaymentsInstance.getNumPayments.call();
        var i;
        var existingIds = [];
        for (i = 0; i < numPayments; i++) {
            existingIds.push(await scorchablePaymentsInstance.paymentIds.call(i));
        }
        for (i = 0; i < numPayments; i++) {
            let payment = await scorchablePaymentsInstance.payments.call(existingIds[i]);
            if (payment[paymentMakerIndex].toString() == accounts[1].toLowerCase()) {
                await scorchablePaymentsInstance.deletePayment(existingIds[i], {from: accounts[1]});
                let newNumPayments = await scorchablePaymentsInstance.getNumPayments.call();
            }
        }
        numPayments = await scorchablePaymentsInstance.getNumPayments.call();
        assert.equal(numPayments, 4);
        await scorchablePaymentsInstance.createPayment();
        numPayments = await scorchablePaymentsInstance.getNumPayments.call();
        assert.equal(numPayments, 5);

        // Make sure shuffling has worked
        existingIds = [];
        for (i = 0; i < numPayments; i++) {
            let id = await scorchablePaymentsInstance.paymentIds.call(i);
            existingIds.push(id);
        }
        for (i = 0; i < numPayments; i++) {
            let payment = await scorchablePaymentsInstance.payments.call(existingIds[i]);
            assert.isAbove(payment[paymentDaiIndex].toNumber(), 0);
        }
        assert.equal(await fakeDaiInstance.balanceOf.call(scorchablePaymentsInstance.address), 50 * oneDai);
        assert.equal(await fakeDaiInstance.balanceOf.call(accounts[0]), 770 * oneDai);
        assert.equal(await fakeDaiInstance.balanceOf.call(accounts[1]), 100 * oneDai);
        assert.equal(await fakeDaiInstance.balanceOf.call(accounts[2]), 80 * oneDai);
    });