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
    var now = d.getTime() / 1000; // now is seconds since epoch
    var past = now - 1000;
    var future = now + 1000;
    var numAccounts = 10;

    function bigNumToDai(bigNum) {
        return bigNum.toNumber() / oneDai;
    }

    function assertClose(value, target) {
        assert.isAbove(value, target - 0.05 * weiInEth)
        assert.isBelow(value, target + 0.05 * weiInEth)
    }

    async function getEthBalances() {
        var balances = [];
        for (i = 0; i < numAccounts; i++) {
            let balance = await web3.eth.getBalance(accounts[i]);
            balances.push(balance);
        }
        return balances;
    }

    function assertDifferences(previousBalances, newBalances, targetDeltas) {
        for (i = 0; i < numAccounts; i++) {
            assertClose(newBalances[i] - previousBalances[i], targetDeltas[i]);
        }
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
        var previousEthBalances = await getEthBalances();
        await fakeDaiInstance.approve(scorchablePaymentsInstance.address, 50 * oneDai, {from: accounts[0]});
        await fakeDaiInstance.approve(scorchablePaymentsInstance.address, 50 * oneDai, {from: accounts[1]});
        await fakeDaiInstance.approve(scorchablePaymentsInstance.address, 50 * oneDai, {from: accounts[2]});
        await fakeDaiInstance.approve(scorchablePaymentsInstance.address, 50 * oneDai, {from: accounts[3]});
        // Dai payment to self with bond which can't be claimed by payee (id 1)
        await scorchablePaymentsInstance.createPayment(accounts[0], 10 * oneDai,   2 * oneDai, future, false, {from: accounts[0]});
        // Dai payment with bond which can be claimed by payee (id 2)
        await scorchablePaymentsInstance.createPayment(accounts[1], 10 * oneDai,   2 * oneDai, past,   false, {from: accounts[0]});
        // Dai payment with bond which can be extended then not claimed by payee (id 3)
        await scorchablePaymentsInstance.createPayment(accounts[2], 10 * oneDai,   2 * oneDai, past,   false, {from: accounts[1]});
        // Dai payment which will be cancelled (id 4)
        await scorchablePaymentsInstance.createPayment(accounts[9], 5 * oneDai,   2 * oneDai, future, false, {from: accounts[3]});
        // eth payment with bond that can't be claimed to release (id 5)
        await scorchablePaymentsInstance.createPayment(accounts[5], 1 * weiInEth, 0.1 * weiInEth, future, true, {from: accounts[4], value: 1 * weiInEth});
        // eth payment with bond to be scorched (id 6)
        await scorchablePaymentsInstance.createPayment(accounts[0], 1 * weiInEth, 0.1 * weiInEth, future, true, {from: accounts[6], value: 1 * weiInEth});
        // eth payment to be claimed (id 7)
        await scorchablePaymentsInstance.createPayment(accounts[7], 1 * weiInEth,   0.1 * weiInEth, past, true,  {from: accounts[1], value: 1 * weiInEth});
        // eth payment to be extended, not claimed (id 8)
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

        var newEthBalances = await getEthBalances();
        var expectedEthDeltas = [0, -1 * weiInEth, 0, 0, -1 * weiInEth, 0, -1 * weiInEth, 0, -1 * weiInEth, 0];
        assertDifferences(previousEthBalances, newEthBalances, expectedEthDeltas);

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
        // eth payment to be deleted (id 9)
        await scorchablePaymentsInstance.createPayment(accounts[7], 1 * weiInEth, 0.2 * weiInEth, future, true, {from: accounts[3], value: 1 * weiInEth});
        numPayments = await scorchablePaymentsInstance.getNumPayments.call();
        assert.equal(numPayments, 8);

        // Make sure shuffling has worked after canceled payment
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
    });

    it("invalid cancels and claims", async () => {
        var expectedError = false;
        try {
            // Attempt by payee to claim payment that hasn't timed out which should raise exception
            await scorchablePaymentsInstance.claimTimedOutPayment(5, {from: accounts[5]});
        }
        catch (err) {
            expectedError = true;
        }
        if (!expectedError) {
            throw "claimed payment before timeout";
        }

        expectedError = false;
        try {
            // Try to cancel payment from wrong account
            await scorchablePaymentsInstance.cancelPayment(3, {from: accounts[2]});
        }
        catch (err) {
            expectedError = true;
        }
        if (!expectedError) {
            throw "payment cancelled from wrong account";
        }
    });

    it("cancels and claims", async () => {
        var previousEthBalances = await getEthBalances();
        await scorchablePaymentsInstance.claimTimedOutPayment(2, {from: accounts[1]});  // dai payment with id 2
        await scorchablePaymentsInstance.claimTimedOutPayment(7, {from: accounts[7]});  // 7 should gain 1 eth
        await scorchablePaymentsInstance.cancelPayment(9, {from: accounts[3]});
        assert.equal(await fakeDaiInstance.balanceOf.call(accounts[1]), 100 * oneDai);
        var newEthBalances = await getEthBalances();
        var expectedEthDeltas = [0, 0, 0, 1 * weiInEth, 0, 0, 0, 1 * weiInEth, 0, 0];
        assertDifferences(previousEthBalances, newEthBalances, expectedEthDeltas);
    });

    it("extend timers and pay bonds", async () => {
//        remaining IDs are: 1, 2, 3, 8, 5, 6, 7
    });
});
