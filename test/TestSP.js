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

    function bigNumToDaiOrEth(bigNum) {
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
        let accountOneDai = await scorchablePaymentsInstance.getDaiBalance.call(accounts[0]);
        let accountTwoDai = await scorchablePaymentsInstance.getDaiBalance.call(accounts[1]);
        let accountThreeDai = await scorchablePaymentsInstance.getDaiBalance.call(accounts[2]);
        assert.equal(accountOneDai, 800 * oneDai);
        assert.equal(accountTwoDai, 100 * oneDai);
        assert.equal(accountThreeDai, 100 * oneDai);
    });

    it("create payments and test dai", async () => {
        var previousEthBalances = await getEthBalances();
        await scorchablePaymentsInstance.approveDai(scorchablePaymentsInstance.address, 50 * oneDai, {from: accounts[0]});
        await scorchablePaymentsInstance.approveDai(scorchablePaymentsInstance.address, 50 * oneDai, {from: accounts[1]});
        await scorchablePaymentsInstance.approveDai(scorchablePaymentsInstance.address, 50 * oneDai, {from: accounts[2]});
        await scorchablePaymentsInstance.approveDai(scorchablePaymentsInstance.address, 50 * oneDai, {from: accounts[3]});
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

        assert.equal(await scorchablePaymentsInstance.getDaiBalance.call(scorchablePaymentsInstance.address), 35 * oneDai);
        assert.equal(await scorchablePaymentsInstance.getDaiBalance.call(accounts[0]), 780 * oneDai);
        assert.equal(await scorchablePaymentsInstance.getDaiBalance.call(accounts[1]), 90 * oneDai);
        assert.equal(await scorchablePaymentsInstance.getDaiBalance.call(accounts[2]), 100 * oneDai);
        assert.equal(await scorchablePaymentsInstance.getDaiBalance.call(accounts[3]), 95 * oneDai);

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
        assert.equal(await scorchablePaymentsInstance.getDaiBalance.call(accounts[3]), 100 * oneDai);
        // eth payment to be deleted (id 9)
        await scorchablePaymentsInstance.createPayment(accounts[7], 1 * weiInEth, 0.2 * weiInEth, future, true, {from: accounts[3], value: 1 * weiInEth});
        numPayments = await scorchablePaymentsInstance.getNumPayments.call();
        assert.equal(numPayments, 8);

        let relevantPayments = await scorchablePaymentsInstance.getPaymentsForAccount.call(accounts[0]);
        let outgoingPayments = relevantPayments[0];
        let incomingPayments = relevantPayments[1];
        for (i = 0; i < outgoingPayments.length; i++) {
            outgoingPayments[i] = outgoingPayments[i].toNumber()
        }
        for (i = 0; i < incomingPayments.length; i++) {
            incomingPayments[i] = incomingPayments[i].toNumber()
        }
        assert.deepEqual(outgoingPayments, [1, 2]);
        assert.deepEqual(incomingPayments, [1, 6]);

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
        assert.equal(await scorchablePaymentsInstance.getDaiBalance.call(accounts[3]), 100 * oneDai);
        assert.equal(await scorchablePaymentsInstance.getDaiBalance.call(scorchablePaymentsInstance.address), 30 * oneDai);
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
        assert.equal(await scorchablePaymentsInstance.getDaiBalance.call(accounts[1]), 100 * oneDai);
        var newEthBalances = await getEthBalances();
        var expectedEthDeltas = [0, 0, 0, 1 * weiInEth, 0, 0, 0, 1 * weiInEth, 0, 0];
        assertDifferences(previousEthBalances, newEthBalances, expectedEthDeltas);
    });

    it("extend timers and pay bonds", async () => {
        // remaining IDs are: 1, 3, 8, 5, 6
        var previousEthBalances = await getEthBalances();
        // extend timer on 8 which was claimable and assert it is no longer claimable
        await scorchablePaymentsInstance.extendInactionTimeout(8, {from: accounts[8]});
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

        // add a top up of a dai and eth payment
        await scorchablePaymentsInstance.topUp(1, 1 * oneDai, {from: accounts[0]});
        assert.equal(await scorchablePaymentsInstance.getDaiBalance.call(accounts[0]), 779 * oneDai);
        await scorchablePaymentsInstance.topUp(8, 0.5 * weiInEth, {from: accounts[8], value: 0.5 * weiInEth});

        //pay bonds
        await scorchablePaymentsInstance.payBond(1, {from: accounts[0]});
        await scorchablePaymentsInstance.payBond(3, {from: accounts[2]});

        assert.equal(await scorchablePaymentsInstance.getDaiBalance.call(accounts[0]), 777 * oneDai);
        assert.equal(await scorchablePaymentsInstance.getDaiBalance.call(accounts[1]), 100 * oneDai);
        assert.equal(await scorchablePaymentsInstance.getDaiBalance.call(accounts[2]), 98 * oneDai);

        await scorchablePaymentsInstance.payBond(5, {from: accounts[4], value: 0.1 * weiInEth});
        await scorchablePaymentsInstance.payBond(6, {from: accounts[6], value: 0.1 * weiInEth});

        expectedError = false;
        try {
            // try to pay bond with insufficient payment
            await scorchablePaymentsInstance.payBond(8, {from: accounts[7], value: 0.05 * weiInEth});
        }
        catch (err) {
            expectedError = true;
        }
        if (!expectedError) {
            throw "claimed payment before timeout";
        }

        await scorchablePaymentsInstance.payBond(8, {from: accounts[7], value: 0.1 * weiInEth});

        var newEthBalances = await getEthBalances();
        var expectedEthDeltas = [0, 0, 0, 0, -0.1 * weiInEth, 0, -0.1 * weiInEth, -0.1 * weiInEth, -0.5 * weiInEth, 0];
        assertDifferences(previousEthBalances, newEthBalances, expectedEthDeltas);
    });

    it("return to sender", async () => {
        // remaining IDs are: 1, 3, 8, 5, 6
        var expectedError = false;
        try {
            // RTS from wrong account
            await scorchablePaymentsInstance.returnTokensToSender(8, {from: accounts[8]});
        }
        catch (err) {
            expectedError = true;
        }
        if (!expectedError) {
            throw "claimed payment before timeout";
        }
        await scorchablePaymentsInstance.returnTokensToSender(8, 0.1 * weiInEth, {from: accounts[7]});
        let payment = await scorchablePaymentsInstance.payments.call(8);
        assert(bigNumToDaiOrEth(payment[amountIndex]) == 1.5); // 1.0 start + 0.1 bond + 0.5 top up - 0.1 returned.

        expectedError = false;
        try {
            // Try to return too much
            await scorchablePaymentsInstance.returnTokensToSender(8, 1.6 * weiInEth, {from: accounts[7]});
        }
        catch (err) {
            expectedError = true;
        }
        if (!expectedError) {
            throw "claimed payment before timeout";
        }
        //return everything and ensure payment gets deleted
        await scorchablePaymentsInstance.returnTokensToSender(8, 1.5 * weiInEth, {from: accounts[7]});
        let nullPayment = await scorchablePaymentsInstance.payments.call(8);
        assert(nullPayment[payeeIndex] == 0);
        //return some dai
        await scorchablePaymentsInstance.returnTokensToSender(1, 0.1 * oneDai, {from: accounts[0]});
        let daiPayment = await scorchablePaymentsInstance.payments.call(1);
        assert(bigNumToDaiOrEth(daiPayment[amountIndex]) == 12.9);
        assert.equal(await scorchablePaymentsInstance.getDaiBalance.call(accounts[0]), 777.1 * oneDai);
    });

    it("releases", async () => {
        // remaining IDs are: 1, 3, 5, 6
        var previousEthBalances = await getEthBalances();
        var expectedError = false;
        try {
            // release from wrong account
            await scorchablePaymentsInstance.releasePayment(5, 0.1 * weiInEth, {from: accounts[3]});
        }
        catch (err) {
            expectedError = true;
        }
        if (!expectedError) {
            throw "claimed payment before timeout";
        }

        expectedError = false;
        try {
            // release too much
            await scorchablePaymentsInstance.releasePayment(5, 1.6 * weiInEth, {from: accounts[4]});
        }
        catch (err) {
            expectedError = true;
        }
        if (!expectedError) {
            throw "claimed payment before timeout";
        }

        //partial release eth
        await scorchablePaymentsInstance.releasePayment(5, 0.05 * weiInEth, {from: accounts[4]});
        let payment = await scorchablePaymentsInstance.payments.call(5);
        assert(bigNumToDaiOrEth(payment[amountIndex]) == 1.05); // 1.0 start + 0.1 bond - 0.05 released.

        var newEthBalances = await getEthBalances();
        var expectedEthDeltas = [0, 0, 0, 0, 0, 0.05 * weiInEth, 0, 0, 0, 0];
        assertDifferences(previousEthBalances, newEthBalances, expectedEthDeltas);

        //complete release eth and make sure payment is gone
        await scorchablePaymentsInstance.releasePayment(5, 1.05 * weiInEth, {from: accounts[4]});
        let nullPayment = await scorchablePaymentsInstance.payments.call(5);
        assert(nullPayment[payeeIndex] == 0);

        //partial release dai
        await scorchablePaymentsInstance.releasePayment(3, 3 * oneDai, {from: accounts[1]});
        assert.equal(await scorchablePaymentsInstance.getDaiBalance.call(accounts[2]), 101 * oneDai);
        let daiPayment = await scorchablePaymentsInstance.payments.call(3);
        assert(daiPayment[amountIndex] == 9 * oneDai);

        var newEthBalances = await getEthBalances();
        var expectedEthDeltas = [0, 0, 0, 0, 0, 1.1 * weiInEth, 0, 0, 0, 0];
        assertDifferences(previousEthBalances, newEthBalances, expectedEthDeltas);

        var numPayments = await scorchablePaymentsInstance.getNumPayments.call();
        assert.equal(numPayments, 3);
    });

    it("scorches", async () => {
        // remaining IDs are: 1, 3, 6
        var previousEthBalances = await getEthBalances();
        var glass = await scorchablePaymentsInstance.scorchAddress.call();
        var initialScorchedEth = bigNumToDaiOrEth(await web3.eth.getBalance(glass));

        // try to scorch from wrong account
        var expectedError = false;
        try {
            // scorch from wrong account
            await scorchablePaymentsInstance.releasePayment(6, 0.2 * weiInEth, {from: accounts[0]});
        }
        catch (err) {
            expectedError = true;
        }
        if (!expectedError) {
            throw "claimed payment before timeout";
        }
        // try to scorch too much
        try {
            // scorch from wrong account
            await scorchablePaymentsInstance.releasePayment(6, 1.2 * weiInEth, {from: accounts[6]});
        }
        catch (err) {
            expectedError = true;
        }
        if (!expectedError) {
            throw "claimed payment before timeout";
        }
        // partial scorch eth payment 6 which was sent by 6, amount = 1.1eth
        await scorchablePaymentsInstance.scorchPayment(6, 0.2 * weiInEth, {from: accounts[6]});
        let payment = await scorchablePaymentsInstance.payments.call(6);
        assert(bigNumToDaiOrEth(payment[amountIndex]) == 0.9); // 1.0 start + 0.1 bond - 0.2 scorched.
        // complete scorch eth payment 6 which was sent by 6
        await scorchablePaymentsInstance.scorchPayment(6, 0.9 * weiInEth, {from: accounts[6]});
        let nullPayment = await scorchablePaymentsInstance.payments.call(6);
        assert(nullPayment[payeeIndex] == 0);
        // partial scorch dai payment 3 which was sent by 1, initially has 9 dai
        await scorchablePaymentsInstance.scorchPayment(3, 2 * oneDai, {from: accounts[1]});
        let daiPayment = await scorchablePaymentsInstance.payments.call(3);
        assert(daiPayment[amountIndex] == 7 * oneDai);

        // complete scorch dai payment 3 which was sent by 1
        await scorchablePaymentsInstance.scorchPayment(3, 7 * oneDai, {from: accounts[1]});
        nullPayment = await scorchablePaymentsInstance.payments.call(3);
        assert(nullPayment[payeeIndex] == 0);

        var newEthBalances = await getEthBalances();
        var expectedEthDeltas = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        assertDifferences(previousEthBalances, newEthBalances, expectedEthDeltas);

        var numPayments = await scorchablePaymentsInstance.getNumPayments.call();
        assert.equal(numPayments, 1);

        var scorchedDai = bigNumToDaiOrEth(await scorchablePaymentsInstance.getDaiBalance.call(glass));
        var finalScorchedEth = bigNumToDaiOrEth(await web3.eth.getBalance(glass));
        assert.equal(scorchedDai, 9);
        assertClose(finalScorchedEth - initialScorchedEth, 1.1);
    });

    it("final check balances are correct", async () => {
        // remaining IDs are: 1 which should contain 12.9 dai, so contract should have 0 eth and 12.9 dai
        let daiInContract = bigNumToDaiOrEth(await scorchablePaymentsInstance.getDaiBalance.call(scorchablePaymentsInstance.address))
        assert.equal(daiInContract, 12.9);
        assertClose(bigNumToDaiOrEth(await web3.eth.getBalance(scorchablePaymentsInstance.address)), 0);
    });
});
