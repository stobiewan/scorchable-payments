import React, {Component} from 'react'
import PropTypes from 'prop-types'
/* import the MainScreen component drawn above in Pagedraw */
import MainScreen from '../../pagedraw/mainscreen'
import DSToken from "../../../build/contracts/DSToken.json";


var TabEnum = Object.freeze({"intro": 1, "manageDai": 2, "create": 3, "outgoing": 4, "incoming": 5});
const payeeBondAmountIndex = 3;
const isEthPaymentIndex = 7;


class PaymentCycler {
    constructor(app) {
        this.app = app;
        this.paymentsArray = [];
        this.localIndex = -1;  // the index relative to payments relevant to this account
        this.selectedIndex = -1;  // the index used in the smart contract
        this.cyclePaymentIndex = this.cyclePaymentIndex.bind(this);
        this.updateIndices = this.updateIndices.bind(this);
    }

    setRelevantPayments(paymentsArray) {
        this.paymentsArray = Array.from(paymentsArray);
        this.updateIndices();
    }

    updateIndices() {
        if (this.paymentsArray.length === 0) {
            this._invalidate()
        }
        else {
            // if payments have been removed change the index so the payment id selected is the same.
            let newLocalIndex = this.paymentsArray.indexOf(this.selectedIndex);
            if (newLocalIndex === -1) {
                // Previously selected payment is invalid or deleted, so go to the first.
                newLocalIndex = 0
            }
            this._setNewLocalIndex(newLocalIndex)
        }
    }

    cyclePaymentIndex(change) {
        if (this.paymentsArray.length === 0) {
            this._invalidate()
        }
        else {
            let newLocalIndex = this.localIndex + change;
            if (newLocalIndex < 0) {
                newLocalIndex = 0;
            }
            if (newLocalIndex >= this.paymentsArray.length) {
                newLocalIndex = this.paymentsArray.length - 1
            }
            this._setNewLocalIndex(newLocalIndex)
        }
        this.app.updatedSelection()
    }

    _invalidate() {
        this.localIndex = -1;
        this.selectedIndex = -1
    }

    _setNewLocalIndex(newIndex) {
        this.localIndex = newIndex;
        this.selectedIndex = this.paymentsArray[newIndex]
    }

    getLocalIndexString() {
        let numPayments = this.paymentsArray.length;
        if (numPayments === 0) {
            return ("No payments found for this address")
        }
        else {
            return ((this.localIndex + 1).toString() + ' / ' + numPayments.toString())
        }
    }

    // The index of the selected payment
    getSelectedPaymentIndex() {
        return this.selectedIndex
    }

}


class DrizzleApp extends Component {
    constructor(props, context) {
        super(props);
        this.relevantPaymentsKey = context.drizzle.contracts.ScorchablePayments.methods.getPaymentsForAccount.cacheCall(this.props.accounts[0]);
        this.incomingPaymentCycler = new PaymentCycler(this);
        this.outgoingPaymentCycler = new PaymentCycler(this);
        this.outgoingPaymentData = null;
        this.incomingPaymentData = null;
        this.setOutgoingPaymentData = this.setOutgoingPaymentData.bind(this);
        this.setIncomingPaymentData = this.setIncomingPaymentData.bind(this);
        this.getOutgoingPaymentData = this.getOutgoingPaymentData.bind(this);
        this.getIncomingPaymentData = this.getIncomingPaymentData.bind(this);
        this.outgoingPaymentUsesEth = this.outgoingPaymentUsesEth.bind(this);
        this.incomingPaymentEthBondSize = this.incomingPaymentEthBondSize.bind(this);
        this.getOutgoingAmountString = this.getOutgoingAmountString.bind(this);
        this.getIncomingAmountString = this.getIncomingAmountString.bind(this);
        this.state = {
            selectedTab: TabEnum.intro,
            relevantPayments: [[], []],
            currentAddress: this.props.accounts[0]
        };
    }

    componentDidMount() {
        const daiContract = new this.context.drizzle.web3.eth.Contract(DSToken, "0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359", {from: this.props.accounts[0]});
        this.context.drizzle.addContract({
            contractName: 'DSToken',
            web3Contract: daiContract,
        });
    }

    setOutgoingPaymentData(paymentData) {
        this.outgoingPaymentData = paymentData
    }

    setIncomingPaymentData(paymentData) {
        this.incomingPaymentData = paymentData
    }

    getOutgoingPaymentData() {
        return (this.outgoingPaymentData)
    }

    getIncomingPaymentData() {
        return (this.incomingPaymentData)
    }

    outgoingPaymentUsesEth() {
        if (this.outgoingPaymentData === null) {
            return false
        }
        else {
            return (this.outgoingPaymentData[isEthPaymentIndex])
        }
    }

    // returns -1 for dai payments
    incomingPaymentEthBondSize() {
        if (this.incomingPaymentData !== null) {
            if (this.incomingPaymentData[isEthPaymentIndex]) {
                return (this.incomingPaymentData[payeeBondAmountIndex])
            }
            else {
                return (-1)
            }
        }
        else {
            return (0)
        }
    }

    getOutgoingAmountString() {
        return this.outgoingPaymentUsesEth() ? "etherAmount" : "daiAmount"
    }

    getIncomingAmountString() {
        return this.incomingPaymentEthBondSize() === -1 ? "daiAmount" : "etherAmount"
    }

    render() {
        // If the cache key we received earlier isn't in the store yet; the initial value is still being fetched.
        if (!(this.relevantPaymentsKey in this.props.ScorchablePayments.getPaymentsForAccount)) {
            return (
                <span>Fetching...</span>
            )
        }

        return <MainScreen selectedTab={this.state.selectedTab}
                           setSelectedTab={(i) => this.setState({selectedTab: i})}
                           selectedAccount={this.state.currentAddress}
                           onChangeOutgoingIndex={this.outgoingPaymentCycler.cyclePaymentIndex}
                           outgoingPaymentIndex={this.outgoingPaymentCycler.getSelectedPaymentIndex()}
                           localOutgoingIndexString={this.outgoingPaymentCycler.getLocalIndexString()}
                           onChangeIncomingIndex={this.incomingPaymentCycler.cyclePaymentIndex}
                           incomingPaymentIndex={this.incomingPaymentCycler.getSelectedPaymentIndex()}
                           localIncomingIndexString={this.incomingPaymentCycler.getLocalIndexString()}
                           outgoingPaymentDataCallback={this.setOutgoingPaymentData}
                           incomingPaymentDataCallback={this.setIncomingPaymentData}
                           outgoingPaymentUsesEth={this.outgoingPaymentUsesEth}
                           incomingPaymentEthBondSize={this.incomingPaymentEthBondSize}
                           getOutgoingAmountString={this.getOutgoingAmountString}
                           getIncomingAmountString={this.getIncomingAmountString}/>;
    }

    componentDidUpdate() {
        if (this.relevantPaymentsKey in this.props.ScorchablePayments.getPaymentsForAccount) {
            let newRelevantPayments = this.props.ScorchablePayments.getPaymentsForAccount[this.relevantPaymentsKey].value;
            if (!this.paymentArraysEqual(newRelevantPayments, this.state.relevantPayments)) {
                this.outgoingPaymentCycler.setRelevantPayments(newRelevantPayments[0]);
                this.incomingPaymentCycler.setRelevantPayments(newRelevantPayments[1]);
                this.setState({relevantPayments: newRelevantPayments})
            }
        }

        if (this.state.currentAddress != this.props.accounts[0]) {
            window.location.reload()
        }
    }

    updatedSelection() {
        this.setState(this.state)
    }

    paymentArraysEqual(rp1, rp2) {
        let outgoingEqual = this.arraysEqual(rp1[0], rp2[0]);
        let incomingEqual = this.arraysEqual(rp1[1], rp2[1]);
        return (outgoingEqual && incomingEqual)
    }

    arraysEqual(arr1, arr2) {
        if (arr1.length !== arr2.length)
            return false;
        for (var i = arr1.length; i--;) {
            if (arr1[i] !== arr2[i])
                return false;
        }

        return true;
    }
}

DrizzleApp.contextTypes = {
    drizzle: PropTypes.object
};

export default DrizzleApp
