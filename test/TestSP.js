const ScorchablePayments = artifacts.require("ScorchablePayments");
const DSToken = artifacts.require("DSToken");
const weiInEth = Math.pow(10, 18);
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
        // Dai payment to self with bond which can't be claimed by payee
        await scorchablePaymentsInstance.createPayment(accounts[0], 10 * oneDai,   2 * oneDai, future, false, {from: accounts[0]});
        // Dai payment with bond which can be claimed by payee
        await scorchablePaymentsInstance.createPayment(accounts[1], 10 * oneDai,   2 * oneDai, past,   false, {from: accounts[0]});
        // Dai payment with bond which can be extended then not claimed by payee
        await scorchablePaymentsInstance.createPayment(accounts[2], 10 * oneDai,   2 * oneDai, past,   false, {from: accounts[1]});
        // Dai payment which will be cancelled
        await scorchablePaymentsInstance.createPayment(accounts[9], 5 * oneDai,   2 * oneDai, future, false, {from: accounts[3]});
        // eth payment with bond that can't be claimed to release
        await scorchablePaymentsInstance.createPayment(accounts[5], 1 * weiInEth, 0.1 * weiInEth, future, true, {from: accounts[4], value: 1 * weiInEth});
        // eth payment with bond to be scorched
        await scorchablePaymentsInstance.createPayment(accounts[0], 1 * weiInEth, 0.1 * weiInEth, future, true, {from: accounts[6], value: 1 * weiInEth});
        // eth payment to be claimed
        await scorchablePaymentsInstance.createPayment(accounts[7], 1 * weiInEth,   0.1 * weiInEth, past, true,  {from: accounts[1], value: 1 * weiInEth});
        // eth payment to be extended, not claimed
        await scorchablePaymentsInstance.createPayment(accounts[7], 1 * weiInEth,   0.1 * weiInEth, past, true,  {from: accounts[8], value: 1 * weiInEth});

        var expectedError = false;
        try {
            // Dai payment which should fail with insufficient approved dai
            await scorchablePaymentsInstance.createPayment(accounts[3], 90 * oneDai,   2 * oneDai, future, false, {from: accounts[2]});
        }
        catch (err) {
            expectedError = true;
        }
        if (!expectedError) {
            throw "user stole dai";
        }

        assert.equal(await fakeDaiInstance.balanceOf.call(scorchablePaymentsInstance.address), 35 * oneDai);
        assert.equal(await fakeDaiInstance.balanceOf.call(accounts[0]), 780 * oneDai);
        assert.equal(await fakeDaiInstance.balanceOf.call(accounts[1]), 90 * oneDai);
        assert.equal(await fakeDaiInstance.balanceOf.call(accounts[2]), 100 * oneDai);
        assert.equal(await fakeDaiInstance.balanceOf.call(accounts[3]), 95 * oneDai);
        var accountFourBalance = await web3.eth.getBalance(accounts[4]);

        var numPayments = await scorchablePaymentsInstance.getNumPayments.call();
        var newNumPayments = 0
        var i;
        var existingIds = [];
        for (i = 0; i < numPayments; i++) {
            existingIds.push(await scorchablePaymentsInstance.paymentIds.call(i));
        }
        for (i = 0; i < numPayments; i++) {
            let payment = await scorchablePaymentsInstance.payments.call(existingIds[i]);
            if (payment[payeeIndex].toString() == accounts[9].toLowerCase()) {
                await scorchablePaymentsInstance.cancelPayment(existingIds[i], {from: accounts[3]});
                newNumPayments = await scorchablePaymentsInstance.getNumPayments.call();
            }
        }
        assert.equal(numPayments, 8);
        assert.equal(newNumPayments, 7);
        assert.equal(await fakeDaiInstance.balanceOf.call(accounts[3]), 100 * oneDai);
        // eth payment to be deleted
        await scorchablePaymentsInstance.createPayment(accounts[7], 1 * weiInEth, 0.2 * weiInEth, future, true, {from: accounts[3], value: 1 * weiInEth});
        numPayments = await scorchablePaymentsInstance.getNumPayments.call();
        assert.equal(numPayments, 8);

        // Make sure shuffling has worked
        existingIds = [];
        for (i = 0; i < numPayments; i++) {
            let id = await scorchablePaymentsInstance.paymentIds.call(i);
            existingIds.push(id);
        }
        for (i = 0; i < numPayments; i++) {
            let payment = await scorchablePaymentsInstance.payments.call(existingIds[i]);
            assert.isAbove(payment[payerInactionTimeoutIndex].toNumber(), 0);
        }
        assert.equal(await fakeDaiInstance.balanceOf.call(accounts[3]), 100 * oneDai);
        assert.equal(await fakeDaiInstance.balanceOf.call(scorchablePaymentsInstance.address), 30 * oneDai);
        // TODO check eth balance, assert close enough due to fees.
    });
});
